use ollama_rs::Ollama;
use ollama_rs::generation::completion::request::GenerationRequest;
// Removed unused HashMap import if it was only for the old options

// OllamaGenerateRequest and OllamaGenerateResponse structs are no longer needed,
// as ollama-rs provides its own types.

// A helper function to map ISO codes to full language names for the prompt
fn map_language_code_to_name(code: &str) -> &str {
    match code.to_lowercase().as_str() {
        "en" => "English",
        "es" => "Spanish",
        "fr" => "French",
        "de" => "German",
        "ja" => "Japanese",
        "ko" => "Korean",
        "zh" => "Chinese", // Assuming simplified for now, could be more specific
        _ => code, // Fallback to the code itself if not mapped
    }
}

pub async fn translate_with_ollama(
    text_to_translate: String,
    source_language_code: String, 
    target_language_code: String,
    // model_name: String, // No longer passed as a parameter
) -> Result<String, String> {
    
    let model_name = "mistral".to_string(); // Hardcode model_name here for now

    let source_lang_name = map_language_code_to_name(&source_language_code);
    let target_lang_name = map_language_code_to_name(&target_language_code);

    let prompt = format!(
        "Translate the following text from {} to {}. Output *only* the translated text. Do not include the original text, any explanations, commentary, phonetic transcription, or romanization:\n\n{}",
        source_lang_name, target_lang_name, text_to_translate
    );
    // NOTE: With the current prompt and the 'mistral' model,
    // translations to Japanese may include romanization (e.g., "こんにちは (Kon'nichiwa)").
    // This is despite the prompt asking to exclude it. Further prompt engineering
    // or model selection might be needed if this is a critical issue.

    let ollama = Ollama::default(); // Assumes Ollama is running at http://localhost:11434
    // For custom host/port: Ollama::new("http://custom_host".to_string(), 12345);

    let gen_request = GenerationRequest::new(model_name.clone(), prompt);
    // We can add .options() here if needed in the future, similar to the old implementation
    // For example: .options(ollama_rs::models::ModelOptions::default().temperature(0.8));

    println!("Sending request to Ollama API via ollama-rs: Model: {}, Prompt Snippet: {}...", model_name, text_to_translate.chars().take(50).collect::<String>());

    match ollama.generate(gen_request).await {
        Ok(res) => {
            println!("Ollama response via ollama-rs: {}", res.response);
            Ok(res.response.trim().to_string()) // .trim() is still good practice
        }
        Err(e) => {
            println!("Error from ollama-rs: {}", e);
            Err(format!("Failed to translate with Ollama model '{}': {}. Ensure Ollama is running and the model is available.", model_name, e.to_string()))
        }
    }
}

/* // Placeholder for the actual function to be implemented - REMOVED
pub async fn translate_with_ollama(
    _text_to_translate: String,
    _source_language_code: String, 
    _target_language_code: String,
    _model_name: String,
) -> Result<String, String> {
    println!("translate_with_ollama called, but not yet implemented.");
    // For now, return a mock success or error to test integration points
    // Ok("Mock translation from ollama_client.rs".to_string())
    Err("Ollama translation not yet implemented.".to_string())
}
*/ 