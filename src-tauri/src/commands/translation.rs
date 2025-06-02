// This file will house commands related to text translation.

use crate::services::ollama_client; // Correct path to ollama_client within services module
use crate::models::translation::{SourceStringData, WorkingTranslation};

#[tauri::command]
pub async fn translate_text_command(text: String, source_lang: String, target_lang: String) -> Result<String, String> {
    // For now, hardcode the model. Later, this could come from frontend settings.
    // let model_name = "mistral".to_string(); // model_name is now hardcoded in ollama_client
    println!(
        "translate_text_command called from commands::translation: Text: '{}', SourceLang: '{}', TargetLang: '{}' (Model: mistral - hardcoded in client)",
        text,
        source_lang,
        target_lang,
        // model_name // No longer passed
    );
    ollama_client::translate_with_ollama(text, source_lang, target_lang).await // model_name no longer passed
}

#[tauri::command]
pub async fn batch_translate_strings_command(
    entries: Vec<SourceStringData>,
    source_language: String,
    target_language: String,
    // TODO: engine_name will be used later to select between Ollama, DeepL, etc.
    _engine_name: String // For now, it's implicitly Ollama
) -> Result<Vec<WorkingTranslation>, String> {
    let mut results: Vec<WorkingTranslation> = Vec::new();

    for entry in entries {
        match translate_text_command(
            entry.original_text.clone(),
            source_language.clone(),
            target_language.clone()
        ).await {
            Ok(translated_text) => {
                results.push(WorkingTranslation {
                    object_id: entry.object_id,
                    original_text: entry.original_text,
                    translated_text,
                    source_file: entry.source_file,
                    json_path: entry.json_path,
                    translation_source: "ollama".to_string(),
                    error: None,
                });
            }
            Err(e) => {
                results.push(WorkingTranslation {
                    object_id: entry.object_id,
                    original_text: entry.original_text,
                    translated_text: String::new(),
                    source_file: entry.source_file,
                    json_path: entry.json_path,
                    translation_source: "ollama".to_string(),
                    error: Some(e.to_string()),
                });
            }
        }
    }

    Ok(results)
} 