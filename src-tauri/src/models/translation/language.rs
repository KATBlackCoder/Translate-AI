//! Language definitions for translation features.

use serde::{Serialize, Deserialize};
use std::fmt;

/// Represents the supported languages for translation.
/// MVP supports Japanese (source) to English/French (target).
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum Language {
    /// Japanese language
    Japanese,
    /// English language
    English,
    /// French language
    French,
}

impl Language {
    /// Returns the ISO 639-1 code for the language.
    pub fn code(&self) -> &'static str {
        match self {
            Language::Japanese => "ja",
            Language::English => "en",
            Language::French => "fr",
        }
    }
    
    /// Returns a human-readable name for the language.
    pub fn name(&self) -> &'static str {
        match self {
            Language::Japanese => "Japanese",
            Language::English => "English",
            Language::French => "French",
        }
    }
    
    /// Returns all supported languages.
    pub fn all() -> Vec<Language> {
        vec![Language::Japanese, Language::English, Language::French]
    }
    
    /// Returns all supported target languages (languages that can be translated to).
    pub fn target_languages() -> Vec<Language> {
        vec![Language::English, Language::French]
    }
    
    /// Returns true if this language can be used as a source language.
    pub fn is_supported_source(&self) -> bool {
        matches!(self, Language::Japanese)
    }
    
    /// Returns true if this language can be used as a target language.
    pub fn is_supported_target(&self) -> bool {
        matches!(self, Language::English | Language::French)
    }
}

impl fmt::Display for Language {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.name())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_language_code() {
        assert_eq!(Language::Japanese.code(), "ja");
        assert_eq!(Language::English.code(), "en");
        assert_eq!(Language::French.code(), "fr");
    }
    
    #[test]
    fn test_language_name() {
        assert_eq!(Language::Japanese.name(), "Japanese");
        assert_eq!(Language::English.name(), "English");
        assert_eq!(Language::French.name(), "French");
    }
    
    #[test]
    fn test_supported_source() {
        assert!(Language::Japanese.is_supported_source());
        assert!(!Language::English.is_supported_source());
        assert!(!Language::French.is_supported_source());
    }
    
    #[test]
    fn test_supported_target() {
        assert!(!Language::Japanese.is_supported_target());
        assert!(Language::English.is_supported_target());
        assert!(Language::French.is_supported_target());
    }
    
    #[test]
    fn test_serde_roundtrip() {
        let lang = Language::Japanese;
        let json = serde_json::to_string(&lang).unwrap();
        let deserialized: Language = serde_json::from_str(&json).unwrap();
        assert_eq!(lang, deserialized);
    }
}
