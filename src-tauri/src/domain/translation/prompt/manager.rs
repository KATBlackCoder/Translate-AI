//! Prompt management logic for translation.
//!
//! This module provides functions to select and format appropriate prompts
//! for translation based on field types.

use crate::domain::game::rpgmv::data::actors::FieldType;
use crate::models::translation::language::Language;
use thiserror::Error;

/// Errors that can occur during prompt management.
#[derive(Debug, Error)]
pub enum PromptError {
    /// No prompt template exists for the specified field type.
    #[error("No prompt template for field type: {0:?}")]
    NoPromptForFieldType(FieldType),
    
    /// The prompt template contains invalid format.
    #[error("Invalid prompt format: {0}")]
    InvalidFormat(String),
    
    /// Error loading prompt templates.
    #[error("Error loading prompt templates: {0}")]
    LoadError(String),
}

/// A prompt template with variables that can be filled in.
///
/// This type is designed to be reusable across all file types and game engines.
/// As we expand beyond Actors.json, new templates will be added for other field types.
#[derive(Debug, Clone)]
pub struct PromptTemplate {
    /// The template text with placeholders for variables
    pub template: String,
    /// The field type this prompt is for
    pub field_type: FieldType,
}

/// The prompt manager responsible for selecting and formatting prompts.
///
/// This is a core shared component that will be used across all translation workflows.
/// It's designed to be extended as we add support for more file types and field types.
/// In the future, we'll load templates from external files in resources/prompts/.
///
/// NOTE: Current implementation uses simple text prompts suitable for Ollama.
/// In the future, this will be adapted for different AI providers:
/// - OpenAI requires structured formats with developer/user/assistant messages
/// - Other providers may have their own specific prompt structures
/// 
/// The manager will need to generate provider-specific prompt formats while
/// maintaining the same core content and instructions.
#[derive(Debug)]
pub struct PromptManager {
    /// Collection of available prompt templates
    templates: Vec<PromptTemplate>,
}

impl PromptManager {
    /// Creates a new PromptManager with default templates.
    ///
    /// For the MVP, templates are hardcoded. Later, they will be loaded from files.
    pub fn new() -> Self {
        let mut templates = Vec::new();
        
        // Default templates for each field type
        templates.push(PromptTemplate {
            field_type: FieldType::Name,
            template: String::from(
                "Translate the following character name from {source_lang} to {target_lang}. \
                Preserve the character's personality and cultural nuances when possible. \
                Keep names short and memorable. If the name has a meaning, try to preserve it. \
                Character name: {text}"
            ),
        });
        
        templates.push(PromptTemplate {
            field_type: FieldType::Nickname,
            template: String::from(
                "Translate the following character nickname/title from {source_lang} to {target_lang}. \
                Preserve honorifics and cultural context appropriately. \
                Character nickname: {text}"
            ),
        });
        
        templates.push(PromptTemplate {
            field_type: FieldType::Profile,
            template: String::from(
                "Translate the following character profile/description from {source_lang} to {target_lang}. \
                Maintain the tone, style, and character personality. \
                Preserve any formatting or special syntax. \
                Character profile: {text}"
            ),
        });
        
        templates.push(PromptTemplate {
            field_type: FieldType::Note,
            template: String::from(
                "Translate the following developer note from {source_lang} to {target_lang}. \
                Preserve all technical terms and any code-like syntax exactly as they appear. \
                This is a developer note that may contain special instructions: {text}"
            ),
        });
        
        Self { templates }
    }
    
    /// Selects a prompt template for the given field type.
    ///
    /// # Arguments
    /// * `field_type` - The type of field to get a prompt for
    ///
    /// # Returns
    /// The prompt template for the field type
    ///
    /// # Errors
    /// Returns `PromptError::NoPromptForFieldType` if no template exists for the field type
    pub fn get_template_for_field_type(&self, field_type: &FieldType) -> Result<&PromptTemplate, PromptError> {
        self.templates
            .iter()
            .find(|t| t.field_type == *field_type)
            .ok_or_else(|| PromptError::NoPromptForFieldType(field_type.clone()))
    }
    
    /// Formats a prompt with the given variables.
    ///
    /// # Arguments
    /// * `field_type` - The type of field to create a prompt for
    /// * `text` - The text to translate
    /// * `source_lang` - The source language
    /// * `target_lang` - The target language
    ///
    /// # Returns
    /// The formatted prompt string
    ///
    /// # Errors
    /// Returns a `PromptError` if the template cannot be found or the format is invalid
    pub fn format_prompt(
        &self,
        field_type: &FieldType,
        text: &str,
        source_lang: Language,
        target_lang: Language,
    ) -> Result<String, PromptError> {
        let template = self.get_template_for_field_type(field_type)?;
        
        // Format the template with variables
        let source_lang_name = source_lang.to_string();
        let target_lang_name = target_lang.to_string();
        
        let formatted = template.template
            .replace("{source_lang}", &source_lang_name)
            .replace("{target_lang}", &target_lang_name)
            .replace("{text}", text);
            
        Ok(formatted)
    }
}

impl Default for PromptManager {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_get_template_for_field_type() {
        let manager = PromptManager::new();
        
        // Test all field types have templates
        assert!(manager.get_template_for_field_type(&FieldType::Name).is_ok());
        assert!(manager.get_template_for_field_type(&FieldType::Nickname).is_ok());
        assert!(manager.get_template_for_field_type(&FieldType::Profile).is_ok());
        assert!(manager.get_template_for_field_type(&FieldType::Note).is_ok());
    }
    
    #[test]
    fn test_format_prompt() {
        let manager = PromptManager::new();
        
        let prompt = manager.format_prompt(
            &FieldType::Name,
            "山田太郎",
            Language::Japanese,
            Language::English,
        ).unwrap();
        
        // Verify all variables were replaced
        assert!(prompt.contains("Japanese"));
        assert!(prompt.contains("English"));
        assert!(prompt.contains("山田太郎"));
        assert!(!prompt.contains("{source_lang}"));
        assert!(!prompt.contains("{target_lang}"));
        assert!(!prompt.contains("{text}"));
    }
    
    #[test]
    fn test_format_prompt_different_field_types() {
        let manager = PromptManager::new();
        
        // Test name prompt
        let name_prompt = manager.format_prompt(
            &FieldType::Name,
            "山田太郎",
            Language::Japanese,
            Language::English,
        ).unwrap();
        
        // Test profile prompt
        let profile_prompt = manager.format_prompt(
            &FieldType::Profile,
            "A brave warrior from the east.",
            Language::English,
            Language::French,
        ).unwrap();
        
        // Verify different prompts were used
        assert!(name_prompt.contains("character name"));
        assert!(profile_prompt.contains("character profile"));
    }
}
