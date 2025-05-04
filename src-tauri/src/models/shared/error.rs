//! Shared model-level errors for validation and data issues.

use serde::{Serialize, Deserialize};

/// Error type for model validation and data issues.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum ModelError {
    /// A required field is missing.
    MissingField { field: String },
    /// A field has an invalid value, with a reason.
    InvalidField { field: String, reason: String },
    /// The data structure is inconsistent or corrupt.
    InconsistentData { reason: String },
    /// Generic error with a message.
    Other { message: String },
}

impl std::fmt::Display for ModelError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            ModelError::MissingField { field } => write!(f, "Missing required field: {}", field),
            ModelError::InvalidField { field, reason } => write!(f, "Invalid value for '{}': {}", field, reason),
            ModelError::InconsistentData { reason } => write!(f, "Inconsistent data: {}", reason),
            ModelError::Other { message } => write!(f, "{}", message),
        }
    }
}

impl std::error::Error for ModelError {}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_display_missing_field() {
        let err = ModelError::MissingField { field: "name".to_string() };
        assert_eq!(format!("{}", err), "Missing required field: name");
    }

    #[test]
    fn test_display_invalid_field() {
        let err = ModelError::InvalidField { field: "age".to_string(), reason: "negative".to_string() };
        assert_eq!(format!("{}", err), "Invalid value for 'age': negative");
    }

    #[test]
    fn test_display_inconsistent_data() {
        let err = ModelError::InconsistentData { reason: "mismatch".to_string() };
        assert_eq!(format!("{}", err), "Inconsistent data: mismatch");
    }

    #[test]
    fn test_display_other() {
        let err = ModelError::Other { message: "something went wrong".to_string() };
        assert_eq!(format!("{}", err), "something went wrong");
    }

    #[test]
    fn test_serde_roundtrip() {
        let err = ModelError::InvalidField { field: "age".to_string(), reason: "negative".to_string() };
        let json = serde_json::to_string(&err).unwrap();
        let de: ModelError = serde_json::from_str(&json).unwrap();
        assert_eq!(err, de);
    }
}