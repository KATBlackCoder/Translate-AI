use serde::{Serialize, Deserialize};

/// Unique identifier for a content item.
///
/// Note: The current validation only allows non-empty, alphanumeric, or underscore strings (e.g., "abc123", "A_B_c_1_2_3").
/// If you want to support UUIDs (e.g., "550e8400-e29b-41d4-a716-446655440000"), composite keys (e.g., "actor_1:en"),
/// or file-based IDs (e.g., "actors/1") in the future, you should relax the validation logic.
/// For example, to allow UUIDs, permit dashes; for more flexibility, allow any non-empty string.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct ContentId(pub String);

impl ContentId {
    /// Checks if the content ID is valid (non-empty, alphanumeric or underscore).
    pub fn is_valid(&self) -> bool {
        !self.0.is_empty() && self.0.chars().all(|c| c.is_ascii_alphanumeric() || c == '_')
    }
}

/// Supported content types for translation (dialogue, menu, system, etc.).
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum ContentType {
    /// Dialogue text (e.g., character speech)
    Dialogue,
    /// Menu text (e.g., UI labels)
    Menu,
    /// System messages
    System,
    /// Character or object name
    Name,
    /// Description text
    Description,
    /// Any other content type, specified as a string
    Other(String),
}

/// Language code (ISO 639-1, e.g., "en", "ja").
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct LanguageCode(pub String);

impl LanguageCode {
    /// Checks if the language code is valid (2 lowercase ASCII letters).
    pub fn is_valid(&self) -> bool {
        self.0.len() == 2 && self.0.chars().all(|c| c.is_ascii_lowercase())
    }
}

/// Metadata for a content item, such as source file and tags.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct ContentMetadata {
    /// Optional source file path
    pub source_file: Option<String>,
    /// Optional line number in the source file
    pub line_number: Option<u32>,
    /// Tags for categorization or filtering
    pub tags: Vec<String>,
}

/// Status of a content item in the translation workflow.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum ContentStatus {
    /// Not yet translated
    Untranslated,
    /// Successfully translated
    Translated,
    /// Reviewed and approved
    Reviewed,
    /// Error occurred, with message
    Error(String),
}

/// Generic translatable content, including original and translated text.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct TextContent {
    /// Unique identifier for this content
    pub id: ContentId,
    /// The type of content (dialogue, menu, etc.)
    pub content_type: ContentType,
    /// The original text
    pub original: String,
    /// The translated text, if available
    pub translation: Option<String>,
    /// The language code of the content
    pub language: LanguageCode,
    /// Optional metadata (source file, tags, etc.)
    pub metadata: Option<ContentMetadata>,
    /// Current status in the translation workflow
    pub status: ContentStatus,
}

impl TextContent {
    /// Validates the TextContent instance.
    /// Checks that id and language are valid, and original is non-empty.
    pub fn is_valid(&self) -> bool {
        self.id.is_valid()
            && self.language.is_valid()
            && !self.original.trim().is_empty()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_content_id_valid() {
        assert!(ContentId("abc123".to_string()).is_valid());
        assert!(ContentId("A_B_c_1_2_3".to_string()).is_valid());
        assert!(!ContentId("".to_string()).is_valid());
        assert!(!ContentId("bad id!".to_string()).is_valid());
    }

    #[test]
    fn test_language_code_valid() {
        assert!(LanguageCode("en".to_string()).is_valid());
        assert!(LanguageCode("ja".to_string()).is_valid());
        assert!(!LanguageCode("EN".to_string()).is_valid());
        assert!(!LanguageCode("eng".to_string()).is_valid());
        assert!(!LanguageCode("e1".to_string()).is_valid());
    }

    #[test]
    fn test_text_content_valid() {
        let valid = TextContent {
            id: ContentId("actor_1_name".to_string()),
            content_type: ContentType::Dialogue,
            original: "Hello".to_string(),
            translation: None,
            language: LanguageCode("en".to_string()),
            metadata: None,
            status: ContentStatus::Untranslated,
        };
        assert!(valid.is_valid());

        let invalid_id = TextContent { id: ContentId("".to_string()), ..valid.clone() };
        assert!(!invalid_id.is_valid());

        let invalid_lang = TextContent { language: LanguageCode("eng".to_string()), ..valid.clone() };
        assert!(!invalid_lang.is_valid());

        let empty_original = TextContent { original: "   ".to_string(), ..valid.clone() };
        assert!(!empty_original.is_valid());
    }
}