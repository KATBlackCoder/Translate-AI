// This file will house commands related to project selection, detection, and processing.

use tauri::AppHandle;
use tauri_plugin_dialog::{DialogExt, FilePath};
// walkdir, std::fs, std::path::Path are now primarily used in the core module

// Import the detection result and function from the core module
use crate::core::game_detection::{detect_rpg_maker_mv, RpgMakerDetectionResult};
// Import the TranslatableStringEntry for the command's return type
use crate::core::rpgmv::common::TranslatableStringEntry;

#[tauri::command]
pub async fn select_project_folder_command(app_handle: AppHandle) -> Result<Option<(String, RpgMakerDetectionResult)>, ()> {
    let folder_path_dialog: Option<FilePath> = app_handle
        .dialog()
        .file()
        .blocking_pick_folder();

    match folder_path_dialog {
        Some(dialog_file_path) => {
            match dialog_file_path {
                FilePath::Path(path_buf) => { 
                    match path_buf.to_str() {
                        Some(path_str) => {
                            let detection_result = detect_rpg_maker_mv(path_str);
                            Ok(Some((path_str.to_owned(), detection_result)))
                        }
                        None => {
                            eprintln!("Selected path is not valid UTF-8");
                            Ok(None) 
                        }
                    }
                }
                _ => {
                    eprintln!("Unexpected FilePath variant received from dialog on desktop.");
                    Ok(None) 
                }
            }
        }
        None => Ok(None), // User cancelled the dialog
    }
}

#[tauri::command]
pub async fn detect_rpg_maker_mv_project_command(project_path: String) -> Result<RpgMakerDetectionResult, String> {
    // This command now simply calls the core detection logic.
    // The error type `String` here is a placeholder if we wanted to add command-specific errors;
    // for now, detect_rpg_maker_mv doesn't return a Result itself, so we just wrap its output.
    Ok(detect_rpg_maker_mv(&project_path))
}

#[tauri::command]
pub async fn extract_project_strings_command(project_path: String) -> Result<Vec<TranslatableStringEntry>, String> {
    // The command now delegates to the new core RPGMV project logic
    crate::core::rpgmv::project::extract_translatable_strings_from_project(&project_path)
}

// Example (to be implemented in Task 1.2 of Phase 3):
// #[tauri::command]
// async fn select_project_folder_command() -> Result<Option<String>, String> {
//    // ... implementation using tauri_plugin_dialog ...
//    Ok(None)
// } 