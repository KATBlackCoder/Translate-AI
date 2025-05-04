use async_trait::async_trait;
use crate::domain::game::rpgmv::data::actors::{TranslatableField, Translation, FieldType};
use crate::models::translation::language::Language;

/// Errors that can occur during translation provider operations.
#[derive(Debug, thiserror::Error)]
pub enum ProviderError {
    /// The provider failed to translate the text.
    #[error("Translation failed: {0}")]
    TranslationFailed(String),
    /// The provider is unavailable or misconfigured.
    #[error("Provider unavailable: {0}")]
    Unavailable(String),
    /// Any other error.
    #[error("Other error: {0}")]
    Other(String),
}

/// Trait for translation providers.
#[async_trait]
pub trait TranslationProvider: Send + Sync {
    /// Translates a batch of fields, using field types to select appropriate prompts.
    ///
    /// # Arguments
    /// * `fields` - The fields to translate
    /// * `from` - Source language
    /// * `to` - Target language
    ///
    /// # Returns
    /// A list of translations with the same IDs as the input fields
    ///
    /// # Errors
    /// Returns `ProviderError` if translation fails or provider is unavailable.
    async fn translate_fields(
        &self,
        fields: &[TranslatableField],
        from: Language,
        to: Language,
    ) -> Result<Vec<Translation>, ProviderError>;

    /// Translates a single string from one language to another.
    ///
    /// # Arguments
    /// * `text` - The text to translate
    /// * `field_type` - The type of field being translated (for prompt selection)
    /// * `from` - Source language
    /// * `to` - Target language
    ///
    /// # Errors
    /// Returns `ProviderError` if translation fails or provider is unavailable.
    async fn translate(
        &self,
        text: &str,
        field_type: FieldType,
        from: Language,
        to: Language,
    ) -> Result<String, ProviderError>;
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::sync::Arc;

    struct MockProvider;
    #[async_trait]
    impl TranslationProvider for MockProvider {
        async fn translate_fields(
            &self,
            fields: &[TranslatableField],
            from: Language,
            to: Language,
        ) -> Result<Vec<Translation>, ProviderError> {
            if from == Language::Japanese && to == Language::English {
                let mut translations = Vec::new();
                for field in fields {
                    translations.push(Translation {
                        id: field.id.clone(),
                        text: format!("[EN] {}", field.text),
                    });
                }
                Ok(translations)
            } else {
                Err(ProviderError::Unavailable("unsupported language pair".into()))
            }
        }

        async fn translate(
            &self,
            text: &str,
            field_type: FieldType,
            from: Language,
            to: Language,
        ) -> Result<String, ProviderError> {
            if from == Language::Japanese && to == Language::English {
                // In a real implementation, we'd use field_type to select a prompt
                let prefix = match field_type {
                    FieldType::Name => "[NAME]",
                    FieldType::Nickname => "[NICK]",
                    FieldType::Profile => "[PROF]",
                    FieldType::Note => "[NOTE]",
                };
                Ok(format!("{} [EN] {}", prefix, text))
            } else {
                Err(ProviderError::Unavailable("unsupported language pair".into()))
            }
        }
    }

    #[tokio::test]
    async fn test_translate_success() {
        let provider = MockProvider;
        let result = provider.translate("こんにちは", FieldType::Name, Language::Japanese, Language::English).await;
        assert_eq!(result.unwrap(), "[NAME] [EN] こんにちは");
    }

    #[tokio::test]
    async fn test_translate_fields_success() {
        let provider = MockProvider;
        let fields = vec![
            TranslatableField {
                id: "test1".to_string(),
                text: "こんにちは".to_string(),
                field_type: FieldType::Name,
            },
            TranslatableField {
                id: "test2".to_string(),
                text: "さようなら".to_string(),
                field_type: FieldType::Profile,
            },
        ];
        
        let result = provider.translate_fields(&fields, Language::Japanese, Language::English).await;
        let translations = result.unwrap();
        
        assert_eq!(translations.len(), 2);
        assert_eq!(translations[0].id, "test1");
        assert_eq!(translations[0].text, "[EN] こんにちは");
        assert_eq!(translations[1].id, "test2");
        assert_eq!(translations[1].text, "[EN] さようなら");
    }

    #[tokio::test]
    async fn test_translate_error() {
        let provider = MockProvider;
        let result = provider.translate("hello", FieldType::Name, Language::English, Language::French).await;
        assert!(matches!(result, Err(ProviderError::Unavailable(_))));
    }
}
