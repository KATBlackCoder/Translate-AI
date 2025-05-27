use serde::Serialize;
use std::fmt;

#[derive(Debug, Serialize)]
pub enum CoreError {
    JsonParse(String),
    JsonSerialize(String),
    Io(String),
    Zip(String),
    Unimplemented(String),
    Config(String),
    Database(String),
    Custom(String),
}

impl fmt::Display for CoreError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            CoreError::JsonParse(s) => write!(f, "JSON Parse Error: {}", s),
            CoreError::JsonSerialize(s) => write!(f, "JSON Serialization Error: {}", s),
            CoreError::Io(s) => write!(f, "IO Error: {}", s),
            CoreError::Zip(s) => write!(f, "ZIP Error: {}", s),
            CoreError::Unimplemented(s) => write!(f, "Feature not implemented: {}", s),
            CoreError::Config(s) => write!(f, "Configuration Error: {}", s),
            CoreError::Database(s) => write!(f, "Database Error: {}", s),
            CoreError::Custom(s) => write!(f, "Error: {}", s),
        }
    }
}

// Allow converting from std::io::Error for convenience
impl From<std::io::Error> for CoreError {
    fn from(err: std::io::Error) -> Self {
        CoreError::Io(err.to_string())
    }
}

// Allow converting from serde_json::Error for convenience
impl From<serde_json::Error> for CoreError {
    fn from(err: serde_json::Error) -> Self {
        // Differentiate between parse and serialize if possible, or use a generic JSON error
        CoreError::JsonParse(err.to_string()) // Or JsonSerialize depending on context
    }
}

// Allow converting from zip::result::ZipError for convenience
impl From<zip::result::ZipError> for CoreError {
    fn from(err: zip::result::ZipError) -> Self {
        CoreError::Zip(err.to_string())
    }
} 