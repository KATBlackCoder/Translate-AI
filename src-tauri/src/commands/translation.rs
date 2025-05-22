// This file will house commands related to text translation.

use crate::services::ollama_client; // Correct path to ollama_client within services module

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