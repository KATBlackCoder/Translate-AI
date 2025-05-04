use url::Url;
use serde::{Deserialize, Serialize};

/// Provider configuration validation error
#[derive(Debug, Serialize)]
pub enum ProviderValidationError {
    /// Missing required field
    MissingField(String),
    /// Invalid URL format
    InvalidUrl(String),
    /// Invalid model name
    InvalidModel(String),
}

/// Ollama provider configuration
#[derive(Debug, Serialize, Deserialize)]
pub struct OllamaProviderConfig {
    /// Endpoint URL for the Ollama API
    pub endpoint_url: String,
    /// Model name to use for translation
    pub model_name: String,
}

/// Validates Ollama provider configuration
///
/// # Arguments
/// * `config` - The Ollama provider configuration to validate
///
/// # Returns
/// * `Ok(())` if the configuration is valid
/// * `Err(ProviderValidationError)` if validation fails
pub fn validate_ollama_config(config: &OllamaProviderConfig) -> Result<(), ProviderValidationError> {
    // Check for required fields
    if config.endpoint_url.trim().is_empty() {
        return Err(ProviderValidationError::MissingField("endpoint_url".to_string()));
    }
    
    if config.model_name.trim().is_empty() {
        return Err(ProviderValidationError::MissingField("model_name".to_string()));
    }
    
    // Validate URL format
    match Url::parse(&config.endpoint_url) {
        Ok(_) => (),
        Err(e) => return Err(ProviderValidationError::InvalidUrl(e.to_string())),
    }
    
    // Validate model name (basic validation - no special characters)
    // This could be enhanced with more specific Ollama model validation
    if !config.model_name.chars().all(|c| c.is_alphanumeric() || c == '-' || c == '_' || c == ':') {
        return Err(ProviderValidationError::InvalidModel(
            "Model name contains invalid characters".to_string(),
        ));
    }
    
    Ok(())
}

/// Generic provider configuration
#[derive(Debug, Serialize, Deserialize)]
pub enum ProviderConfig {
    /// Ollama provider
    Ollama(OllamaProviderConfig),
}

/// Validates a generic provider configuration
///
/// # Arguments
/// * `config` - The provider configuration to validate
///
/// # Returns
/// * `Ok(())` if the configuration is valid
/// * `Err(ProviderValidationError)` if validation fails
pub fn validate_provider_config(config: &ProviderConfig) -> Result<(), ProviderValidationError> {
    match config {
        ProviderConfig::Ollama(ollama_config) => validate_ollama_config(ollama_config),
    }
}
