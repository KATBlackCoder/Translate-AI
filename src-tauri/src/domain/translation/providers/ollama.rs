//! Implementation of the TranslationProvider trait for the Ollama API.

use super::base::{ProviderError, TranslationProvider};
use crate::domain::game::rpgmv::data::actors::{FieldType, TranslatableField, Translation};
use crate::infrastructure::api::ollama::client::{OllamaClient, OllamaClientError};
use crate::infrastructure::resources::prompt::load_prompt_template;
use crate::models::translation::language::Language;
use async_trait::async_trait;
use log::{debug, error, warn};

/// Ollama translation provider.
/// Wraps the infrastructure OllamaClient and adds domain logic for prompt handling.
#[derive(Clone)] // Clone is useful if the provider needs to be shared
pub struct OllamaProvider {
    /// The configured Ollama client from the infrastructure layer.
    client: OllamaClient,
    /// The specific Ollama model name to use for translations (e.g., "mistral").
    model_name: String,
}

impl OllamaProvider {
    /// Creates a new OllamaProvider.
    ///
    /// # Arguments
    /// * `client` - An instance of `OllamaClient` configured for the target Ollama API.
    /// * `model_name` - The name of the Ollama model to use for generation.
    pub fn new(client: OllamaClient, model_name: String) -> Self {
        Self { client, model_name }
    }

    /// Helper function to get the prompt template key from FieldType.
    fn get_prompt_key(field_type: FieldType) -> &'static str {
        match field_type {
            FieldType::Name => "name",
            FieldType::Nickname => "nickname",
            FieldType::Profile => "profile",
            FieldType::Note => "note",
        }
    }

    /// Formats the prompt template with the necessary information.
    /// Simple placeholder replacement for now.
    fn format_prompt(
        template: &str,
        text: &str,
        source_lang: &str,
        target_lang: &str,
    ) -> String {
        template
            .replace("{source_lang}", source_lang)
            .replace("{target_lang}", target_lang)
            .replace("{text}", text)
    }
}

#[async_trait]
impl TranslationProvider for OllamaProvider {
    /// Translates a single string using the configured Ollama model and appropriate prompt.
    async fn translate(
        &self,
        text: &str,
        field_type: FieldType,
        from: Language,
        to: Language,
    ) -> Result<String, ProviderError> {
        if text.is_empty() {
            debug!("Input text is empty, returning empty string.");
            return Ok("".to_string());
        }
        if from == to {
            debug!("Source and target languages are the same, returning original text.");
            return Ok(text.to_string());
        }

        let prompt_key = Self::get_prompt_key(field_type);
        let template = load_prompt_template(prompt_key);

        if template.is_empty() {
            warn!("Prompt template for '{}' not found or empty.", prompt_key);
            // Fallback or return error? Let's return an error for now.
            return Err(ProviderError::Other(format!(
                "Prompt template '{}' missing",
                prompt_key
            )));
        }

        // TODO: Use a more robust templating engine if needed later.
        let final_prompt = Self::format_prompt(
            template,
            text,
            from.code(),
            to.code(),
        );

        debug!("Calling Ollama model '{}' with prompt: {}", self.model_name, final_prompt);

        // Call the infrastructure client
        match self
            .client
            .generate(&self.model_name, &final_prompt, None) // No system prompt for now
            .await
        {
            Ok(response) => {
                debug!("Received successful response from Ollama.");
                // TODO: Add basic post-processing? (trimming, etc.)
                Ok(response.response)
            }
            Err(e) => {
                error!("Ollama client failed: {}", e);
                // Map infrastructure error to domain error
                match e {
                    OllamaClientError::Http(inner) => {
                        Err(ProviderError::Unavailable(format!("HTTP error: {}", inner)))
                    }
                    OllamaClientError::UrlParse(inner) => Err(ProviderError::Other(format!(
                        "Internal URL configuration error: {}",
                        inner
                    ))),
                    OllamaClientError::Api { status, message } => Err(
                        ProviderError::TranslationFailed(format!(
                            "API error ({}): {}",
                            status, message
                        )),
                    ),
                }
            }
        }
    }

    /// Translates a batch of fields by calling `translate` for each field sequentially.
    /// Note: This is not optimized for batching at the API level yet.
    async fn translate_fields(
        &self,
        fields: &[TranslatableField],
        from: Language,
        to: Language,
    ) -> Result<Vec<Translation>, ProviderError> {
        let mut translations = Vec::with_capacity(fields.len());
        for field in fields {
            debug!("Translating field ID: {}", field.id);
            match self
                .translate(&field.text, field.field_type, from, to)
                .await
            {
                Ok(translated_text) => {
                    translations.push(Translation {
                        id: field.id.clone(),
                        text: translated_text,
                    });
                }
                Err(e) => {
                    // If one field fails, should the whole batch fail?
                    // For now, let's propagate the first error encountered.
                    error!(
                        "Failed to translate field ID {}: {}. Aborting batch.",
                        field.id, e
                    );
                    return Err(e);
                    // Alternatively, collect errors per field, or return partial results.
                }
            }
        }
        Ok(translations)
    }
}


// --- Integration Tests ---
// These tests require a running Ollama instance accessible at OLLAMA_BASE_URL (default: http://localhost:11434)
// and a model named TEST_OLLAMA_MODEL (default: "mistral") available.
// They also rely on the prompt templates existing in resources/prompts/.
// Run with: cargo test -- --ignored domain::translation::providers::ollama::tests
#[cfg(test)]
mod tests {
    use super::*;
    use crate::infrastructure::api::ollama::client::OllamaConfig;
    use std::env;
    use tokio;

    fn setup_test_provider() -> OllamaProvider {
        let base_url = env::var("OLLAMA_BASE_URL").unwrap_or_else(|_| "http://localhost:11434".to_string());
        let model_name = env::var("TEST_OLLAMA_MODEL").unwrap_or_else(|_| "mistral".to_string());
        println!("Testing against Ollama URL: {} with model: {}", base_url, model_name);

        let config = OllamaConfig {
            base_url,
            timeout_secs: 120, // Generous timeout for integration tests
        };
        let client = OllamaClient::new(config).expect("Failed to create OllamaClient");
        OllamaProvider::new(client, model_name)
    }

    #[tokio::test]
    #[ignore]
    async fn test_translate_name_success() {
        let provider = setup_test_provider();
        // Assuming 'name.txt' prompt asks for a simple translation
        let result = provider
            .translate("ハロルド", FieldType::Name, Language::Japanese, Language::English)
            .await;
        println!("Translate name result: {:?}", result);
        assert!(result.is_ok());
        // We can't easily assert the exact translation, but check it's not empty
        assert!(!result.unwrap().is_empty());
    }

    #[tokio::test]
    #[ignore]
    async fn test_translate_profile_success() {
        let provider = setup_test_provider();
        // Assuming 'profile.txt' asks for translation
        let result = provider
            .translate("光の戦士。", FieldType::Profile, Language::Japanese, Language::English)
            .await;
         println!("Translate profile result: {:?}", result);
        assert!(result.is_ok());
        assert!(!result.unwrap().is_empty());
    }

     #[tokio::test]
     #[ignore]
     async fn test_translate_empty_string() {
         let provider = setup_test_provider();
         let result = provider
             .translate("", FieldType::Name, Language::Japanese, Language::English)
             .await;
         assert!(result.is_ok());
         assert_eq!(result.unwrap(), "");
     }

     #[tokio::test]
     #[ignore]
     async fn test_translate_same_language() {
         let provider = setup_test_provider();
         let result = provider
             .translate("Hello", FieldType::Name, Language::English, Language::English)
             .await;
         assert!(result.is_ok());
         assert_eq!(result.unwrap(), "Hello");
     }

    #[tokio::test]
    #[ignore]
    async fn test_translate_fields_basic() {
        let provider = setup_test_provider();
        let fields = vec![
            TranslatableField {
                id: "actor1.name".to_string(),
                text: "ハロルド".to_string(),
                field_type: FieldType::Name,
            },
            TranslatableField {
                id: "actor1.profile".to_string(),
                text: "光の戦士。".to_string(),
                field_type: FieldType::Profile,
            },
        ];

        let result = provider
            .translate_fields(&fields, Language::Japanese, Language::English)
            .await;

        println!("Translate fields result: {:?}", result);
        assert!(result.is_ok());
        let translations = result.unwrap();
        assert_eq!(translations.len(), 2);
        assert_eq!(translations[0].id, "actor1.name");
        assert!(!translations[0].text.is_empty());
        assert_eq!(translations[1].id, "actor1.profile");
         assert!(!translations[1].text.is_empty());
    }

    // Test for API error (e.g., model not found) would require client changes
    // or more complex setup, potentially better tested at the client level.
}
