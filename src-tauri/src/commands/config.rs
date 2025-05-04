use crate::application::settings::provider_service::{ProviderConfig, ProviderValidationError};

/// Validates provider configuration
///
/// This command allows the frontend to validate provider configuration
/// before storing it using the Tauri Store plugin.
///
/// # Arguments
/// * `config` - The provider configuration to validate
///
/// # Returns
/// * `Ok(())` if the configuration is valid
/// * `Err(String)` with validation error message if invalid
#[tauri::command]
pub async fn validate_provider_config(config: ProviderConfig) -> Result<(), String> {
    match crate::application::settings::provider_service::validate_provider_config(&config) {
        Ok(()) => Ok(()),
        Err(e) => match e {
            ProviderValidationError::MissingField(field) => {
                Err(format!("Missing required field: {}", field))
            }
            ProviderValidationError::InvalidUrl(err) => {
                Err(format!("Invalid URL: {}", err))
            }
            ProviderValidationError::InvalidModel(err) => {
                Err(format!("Invalid model name: {}", err))
            }
        },
    }
}

/// Default provider config for Ollama
///
/// Provides sensible defaults for Ollama configuration.
///
/// # Returns
/// * Default Ollama provider configuration
#[tauri::command]
pub fn get_default_provider_config() -> ProviderConfig {
    ProviderConfig::Ollama(
        crate::application::settings::provider_service::OllamaProviderConfig {
            endpoint_url: "http://localhost:11434".to_string(),
            model_name: "mistral".to_string(),
        },
    )
}
