//! Provider configuration models for translation services.

use serde::{Serialize, Deserialize};

/// Configuration for the Ollama provider.
/// Stores information needed to connect to an Ollama instance.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct ProviderConfig {
    /// The endpoint URL for the Ollama API.
    pub endpoint: String,
    /// The model to use for translation.
    pub model: String,
}

impl Default for ProviderConfig {
    fn default() -> Self {
        Self {
            endpoint: "http://localhost:11434".to_string(),
            model: "mistral".to_string(),
        }
    }
}

impl ProviderConfig {
    /// Creates a new ProviderConfig with default values.
    pub fn new() -> Self {
        Self::default()
    }
    
    /// Creates a new ProviderConfig with custom endpoint and model.
    pub fn with_endpoint(endpoint: String, model: String) -> Self {
        Self {
            endpoint,
            model,
        }
    }
    
    /// Validates that the configuration contains a non-empty endpoint and model.
    pub fn is_valid(&self) -> bool {
        !self.endpoint.is_empty() && !self.model.is_empty()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_default_config() {
        let config = ProviderConfig::default();
        assert_eq!(config.endpoint, "http://localhost:11434");
        assert_eq!(config.model, "mistral");
    }
    
    #[test]
    fn test_custom_config() {
        let config = ProviderConfig::with_endpoint(
            "http://custom-endpoint:11434".to_string(),
            "llama2".to_string()
        );
        assert_eq!(config.endpoint, "http://custom-endpoint:11434");
        assert_eq!(config.model, "llama2");
    }
    
    #[test]
    fn test_validity() {
        let valid = ProviderConfig::with_endpoint(
            "http://localhost:11434".to_string(),
            "mistral".to_string()
        );
        assert!(valid.is_valid());
        
        let invalid_endpoint = ProviderConfig::with_endpoint(
            "".to_string(),
            "mistral".to_string()
        );
        assert!(!invalid_endpoint.is_valid());
        
        let invalid_model = ProviderConfig::with_endpoint(
            "http://localhost:11434".to_string(),
            "".to_string()
        );
        assert!(!invalid_model.is_valid());
    }
    
    #[test]
    fn test_serde_roundtrip() {
        let config = ProviderConfig::with_endpoint(
            "http://custom-endpoint:11434".to_string(),
            "llama2".to_string()
        );
        let json = serde_json::to_string(&config).unwrap();
        let deserialized: ProviderConfig = serde_json::from_str(&json).unwrap();
        assert_eq!(config, deserialized);
    }
}
