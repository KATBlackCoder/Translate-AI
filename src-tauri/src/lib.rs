// mod ollama_client; // Removed old module declaration
pub mod commands; // Declare the commands module
pub mod services; // Declare the services module
pub mod core;     // Declare the new core module

#[cfg(test)]
mod tests; // Added for integration tests

#[tauri::command]
async fn simple_ipc_test(text: String, source_lang: String, target_lang: String) -> Result<String, String> {
    // Log received data to the backend console (requires tauri-plugin-log or just println! for basic cases)
    // For tauri-plugin-log, you'd use: log::info!(...);
    println!(
        "Backend received IPC test: Text: '{}', SourceLang: '{}', TargetLang: '{}'",
        text,
        source_lang,
        target_lang
    );

    // Simulate some processing or just format a response
    Ok(format!(
        "Backend says: Received text '{}' for translation from {} to {}. This is a test!",
        text,
        source_lang,
        target_lang
    ))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            simple_ipc_test,
            commands::translation::translate_text_command,
            commands::project::select_project_folder_command,
            commands::project::detect_rpg_maker_mv_project_command,
            commands::project::extract_project_strings_command,
            commands::project::batch_translate_strings_command
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
