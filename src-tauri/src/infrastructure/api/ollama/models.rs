//!
//! Defines the data structures for interacting with the Ollama API,
//! specifically for the `/api/generate` endpoint.

use serde::{Deserialize, Serialize};

/// Represents the request body sent to the Ollama `/api/generate` endpoint.
#[derive(Serialize, Debug, Clone)]
pub struct GenerateRequest<'a> {
    /// The model name (e.g., "mistral"). Required.
    pub model: &'a str,
    /// The prompt to generate a response for. Required.
    pub prompt: &'a str,
    /// The system prompt (optional).
    #[serde(skip_serializing_if = "Option::is_none")]
    pub system: Option<&'a str>,
    /// The full prompt template (overrides `prompt`, optional).
    #[serde(skip_serializing_if = "Option::is_none")]
    pub template: Option<&'a str>,
    /// Controls response format (e.g., "json", optional).
    #[serde(skip_serializing_if = "Option::is_none")]
    pub format: Option<&'a str>,
    /// Whether to stream the response. Set to `false` for a single complete response. Required.
    pub stream: bool,
    // Options like temperature, top_p, etc. could be added here if needed
    // pub options: Option<HashMap<String, f32>>,
}

/// Represents the response body received from the Ollama `/api/generate` endpoint
/// when `stream` is set to `false`.
#[derive(Deserialize, Debug, Clone)]
pub struct GenerateResponse {
    /// The model used for the generation.
    pub model: String,
    /// Timestamp of creation.
    pub created_at: String, // Consider using a DateTime type if parsing is needed
    /// The generated response content (the translation).
    pub response: String,
    /// Indicates completion.
    pub done: bool,

    // Optional context field (rarely needed for simple generation)
    // pub context: Option<Vec<i64>>,

    // Optional performance metrics
    #[serde(default)]
    pub total_duration: Option<u64>,
    #[serde(default)]
    pub load_duration: Option<u64>,
    #[serde(default)]
    pub prompt_eval_count: Option<u32>,
    #[serde(default)]
    pub prompt_eval_duration: Option<u64>,
    #[serde(default)]
    pub eval_count: Option<u32>,
    #[serde(default)]
    pub eval_duration: Option<u64>,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_serialize_generate_request() {
        let req = GenerateRequest {
            model: "mistral",
            prompt: "Translate hello",
            system: Some("You are a translator."),
            template: None,
            format: None,
            stream: false,
        };
        let json = serde_json::to_string(&req).unwrap();
        assert!(json.contains("\"model\":\"mistral\""));
        assert!(json.contains("\"prompt\":\"Translate hello\""));
        assert!(json.contains("\"system\":\"You are a translator.\""));
        assert!(json.contains("\"stream\":false"));
        assert!(!json.contains("template"));
        assert!(!json.contains("format"));
    }

    #[test]
    fn test_deserialize_generate_response() {
        let json = r#"{
            "model":"mistral",
            "created_at":"2023-12-12T14:00:00Z",
            "response":"Bonjour",
            "done":true,
            "total_duration": 5000000000
        }"#;
        let resp: GenerateResponse = serde_json::from_str(json).unwrap();
        assert_eq!(resp.model, "mistral");
        assert_eq!(resp.response, "Bonjour");
        assert!(resp.done);
        assert_eq!(resp.total_duration, Some(5000000000));
        assert!(resp.load_duration.is_none()); // Example of optional field
    }

     #[test]
    fn test_deserialize_minimal_generate_response() {
        // Test case where optional fields are missing
        let json = r#"{
            "model":"mistral",
            "created_at":"2023-12-12T14:00:00Z",
            "response":"Bonjour",
            "done":true
        }"#;
        let resp: GenerateResponse = serde_json::from_str(json).unwrap();
        assert_eq!(resp.model, "mistral");
        assert_eq!(resp.response, "Bonjour");
        assert!(resp.done);
        assert!(resp.total_duration.is_none()); 
    }
}
