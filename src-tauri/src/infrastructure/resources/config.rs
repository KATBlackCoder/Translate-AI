//! Loads application configuration from file and/or environment variables.
//!
//! Supports config.json (JSON) and .env/environment variables.
//!
//! NOTE: `.env`/dotenvy loading is for development and advanced users only.
//! End-users should use `config.json` or the app's UI for configuration.
//!
//! # Config file location
//!
//! - **Development:** Place `config.json` in your project root (where you run the app).
//! - **Production:** Place `config.json` next to the app executable (portable mode),
//!   or in a platform-specific config directory:
//!   - Windows: `%APPDATA%/<YourAppName>/config.json`
//!   - macOS: `~/Library/Application Support/<YourAppName>/config.json`
//!   - Linux: `~/.config/<YourAppName>/config.json`
//!
//! For future: use the `dirs` or `directories` crate to auto-detect the best config path.
//!
//! # .env file location
//!
//! - Place your `.env` file in the project root (where `Cargo.toml` and `src-tauri/` live) for development.
//! - This is the default location loaded by `dotenvy`.
//! - No need to ship `.env` to end-users—use it for dev, CI, or power users only.

use serde::Deserialize;
use std::env;
use std::fs;
use std::path::Path;
use thiserror::Error;

/// Application configuration (API keys, language, etc.)
#[derive(Debug, Clone, Deserialize, PartialEq)]
pub struct Config {
    /// Ollama API key (optional)
    pub ollama_api_key: Option<String>,
    /// Default source language
    pub source_lang: String,
    /// Default target language
    pub target_lang: String,
}

/// Errors that can occur during config loading.
#[derive(Debug, Error)]
pub enum ConfigError {
    #[error("Config file not found: {0}")]
    NotFound(String),
    #[error("Config parse error: {0}")]
    Parse(String),
    #[error("Missing required config: {0}")]
    Missing(String),
    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),
    #[error("JSON error: {0}")]
    Json(#[from] serde_json::Error),
}

/// Loads config from config.json or environment variables.
///
/// # Arguments
/// * `path` - Path to config.json (optional)
///
/// # Errors
/// Returns ConfigError if config is missing or invalid.
pub fn load_config(path: Option<&Path>) -> Result<Config, ConfigError> {
    // Try file first
    if let Some(path) = path {
        if path.exists() {
            let data = fs::read_to_string(path)?;
            let cfg: Config = serde_json::from_str(&data)?;
            return Ok(cfg);
        }
    }
    // Fallback to env
    dotenvy::dotenv().ok();
    let ollama_api_key = env::var("OLLAMA_API_KEY").ok();
    let source_lang = env::var("SOURCE_LANG").map_err(|_| ConfigError::Missing("SOURCE_LANG".into()))?;
    let target_lang = env::var("TARGET_LANG").map_err(|_| ConfigError::Missing("TARGET_LANG".into()))?;
    Ok(Config {
        ollama_api_key,
        source_lang,
        target_lang,
    })
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::env;
    use tempfile::tempdir;
    use std::fs::File;
    use std::io::Write;

    #[test]
    fn test_load_config_from_file() {
        let dir = tempdir().unwrap();
        let file_path = dir.path().join("config.json");
        let json = r#"{
            "ollama_api_key": "testkey",
            "source_lang": "en",
            "target_lang": "es"
        }"#;
        let mut file = File::create(&file_path).unwrap();
        write!(file, "{}", json).unwrap();
        let cfg = load_config(Some(&file_path)).unwrap();
        assert_eq!(cfg.ollama_api_key, Some("testkey".into()));
        assert_eq!(cfg.source_lang, "en");
        assert_eq!(cfg.target_lang, "es");
    }

    #[test]
    fn test_load_config_from_env() {
        env::set_var("SOURCE_LANG", "fr");
        env::set_var("TARGET_LANG", "de");
        env::remove_var("OLLAMA_API_KEY");
        let cfg = load_config(None).unwrap();
        assert_eq!(cfg.ollama_api_key, None);
        assert_eq!(cfg.source_lang, "fr");
        assert_eq!(cfg.target_lang, "de");
    }

    #[test]
    fn test_load_config_missing_required() {
        env::remove_var("SOURCE_LANG");
        env::remove_var("TARGET_LANG");
        let err = load_config(None).unwrap_err();
        matches!(err, ConfigError::Missing(_));
    }

    #[test]
    fn test_load_config_malformed_file() {
        let dir = tempdir().unwrap();
        let file_path = dir.path().join("config.json");
        let mut file = File::create(&file_path).unwrap();
        write!(file, "not json").unwrap();
        let err = load_config(Some(&file_path)).unwrap_err();
        matches!(err, ConfigError::Json(_));
    }
}
