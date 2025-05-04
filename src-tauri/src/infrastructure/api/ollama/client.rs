//! Ollama API client for generation requests.
//!
//! Handles async HTTP requests to the Ollama /api/generate endpoint.

// Use models from the sibling models.rs file
use super::models::{GenerateRequest, GenerateResponse};
use log::{error, info, warn}; // Use log crate
use reqwest::{Client, StatusCode};
use std::time::Duration;
use thiserror::Error;
use url::Url; // Use url crate for joining paths

/// Errors that can occur when using OllamaClient.
#[derive(Debug, Error)]
pub enum OllamaClientError {
    #[error("HTTP request error: {0}")]
    Http(#[from] reqwest::Error),
    #[error("URL parsing error: {0}")]
    UrlParse(#[from] url::ParseError),
    #[error("API error: {status} - {message}")]
    Api { status: StatusCode, message: String },
    // Timeout is implicitly handled by reqwest::Error::is_timeout() if needed
}

/// Ollama API client configuration.
#[derive(Debug, Clone)]
pub struct OllamaConfig {
    pub base_url: String,
    // api_key removed, assuming local instance doesn't need it
    pub timeout_secs: u64,
}

/// Ollama API client for generation.
#[derive(Debug, Clone)]
pub struct OllamaClient {
    client: Client,
    config: OllamaConfig,
}

impl OllamaClient {
    /// Create a new OllamaClient with the given config.
    pub fn new(config: OllamaConfig) -> Result<Self, reqwest::Error> {
        let client = Client::builder()
            .timeout(Duration::from_secs(config.timeout_secs))
            .build()?; // Propagate potential client build error
        Ok(Self { client, config })
    }

    /// Generate text using the Ollama /api/generate endpoint (non-streaming).
    ///
    /// # Arguments
    /// * `model` - The name of the model to use (e.g., "mistral").
    /// * `prompt` - The prompt text.
    /// * `system` - Optional system prompt.
    ///
    /// # Errors
    /// Returns OllamaClientError on failure.
    pub async fn generate(
        &self,
        model: &str,
        prompt: &str,
        system: Option<&str>,
        // Add other GenerateRequest fields as needed (e.g., format, template)
    ) -> Result<GenerateResponse, OllamaClientError> {
        // Construct the full URL safely
        let base = Url::parse(&self.config.base_url)?;
        let url = base.join("/api/generate")?; // Use join for correctness

        info!("Sending generation request to Ollama URL: {}", url);

        let request_payload = GenerateRequest {
            model,
            prompt,
            system,
            stream: false, // Ensure we get a single response
            template: None, // Add if needed
            format: None,   // Add if needed
        };

        let request = self.client.post(url).json(&request_payload);

        let response = request.send().await?;

        let status = response.status();
        if status.is_success() {
            // Deserialize the successful response
            match response.json::<GenerateResponse>().await {
                Ok(gen_response) => {
                    info!("Successfully received generation response from Ollama.");
                    Ok(gen_response)
                }
                Err(e) => {
                    // Handle JSON deserialization errors specifically
                    error!("Failed to deserialize Ollama success response: {}", e);
                    Err(OllamaClientError::Http(e)) // Reuse Http error or add specific Json variant
                }
            }
        } else {
            // Handle API errors (non-2xx status codes)
            let error_body = response
                .text()
                .await
                .unwrap_or_else(|e| format!("Failed to read error body: {}", e));
            error!(
                "Ollama API request failed with status {}: {}",
                status, error_body
            );
            Err(OllamaClientError::Api {
                status,
                message: error_body,
            })
        }
    }
}


// --- Integration Tests ---
// These tests require a running Ollama instance accessible at OLLAMA_BASE_URL (default: http://localhost:11434)
// and a model named TEST_OLLAMA_MODEL (default: "mistral") available.
// Run with: cargo test -- --ignored
#[cfg(test)]
mod tests {
    use super::*;
    use std::env;
    use tokio;

    fn get_test_config() -> OllamaConfig {
        let base_url = env::var("OLLAMA_BASE_URL").unwrap_or_else(|_| "http://localhost:11434".to_string());
        OllamaConfig {
            base_url,
            timeout_secs: 60, // Increase timeout for potentially slow model loading/generation
        }
    }

     fn get_test_model() -> String {
         env::var("TEST_OLLAMA_MODEL").unwrap_or_else(|_| "mistral".to_string()) // Default to mistral, user can override
     }

    #[tokio::test]
    #[ignore] // Ignored by default, requires running Ollama instance
    async fn test_generate_success() {
        let config = get_test_config();
        let model_name = get_test_model();
        println!("Testing against Ollama URL: {} with model: {}", config.base_url, model_name);

        let client = OllamaClient::new(config).expect("Failed to create client");

        let prompt = "Why is the sky blue?";
        let result = client.generate(&model_name, prompt, None).await;

        println!("Ollama generate result: {:?}", result);

        assert!(result.is_ok(), "Expected successful generation");
        let response = result.unwrap();
        assert!(!response.response.is_empty(), "Response should not be empty");
        assert!(response.done, "Response should be marked as done");
        assert_eq!(response.model, model_name, "Model name in response should match request");
    }

    #[tokio::test]
    #[ignore] // Ignored by default, requires running Ollama instance
    async fn test_generate_error_model_not_found() {
         let config = get_test_config();
         let non_existent_model = "this_model_does_not_exist_hopefully_42";
         println!("Testing model not found against Ollama URL: {}", config.base_url);

         let client = OllamaClient::new(config).expect("Failed to create client");
         let prompt = "Test prompt";
         let result = client.generate(non_existent_model, prompt, None).await;

         println!("Ollama generate error result: {:?}", result);

         assert!(result.is_err(), "Expected an error");
         match result.err().unwrap() {
             OllamaClientError::Api { status, message } => {
                 // Ollama typically returns 404 Not Found for missing models
                 assert_eq!(status, StatusCode::NOT_FOUND, "Expected HTTP 404 status");
                 assert!(message.contains("model 'this_model_does_not_exist_hopefully_42' not found"), "Error message should indicate model not found");
             }
             _ => panic!("Expected OllamaClientError::Api"),
         }
    }
}
