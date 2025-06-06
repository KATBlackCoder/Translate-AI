// This file will house commands related to project selection, detection, and processing.

use tauri::AppHandle;
use tauri_plugin_dialog::{DialogExt, FilePath};
use tauri_plugin_opener::OpenerExt;
// walkdir, std::fs, std::path::Path are now primarily used in the core module

// Import the detection result and function from the core module
use crate::core::game_detection::{detect_rpg_maker_mv, RpgMakerDetectionResult};
use std::collections::HashMap;
use tokio::fs;
use std::path::Path;
use crate::models::translation::{SourceStringData, WorkingTranslation} ;

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
pub async fn extract_project_strings_command(project_path: String) -> Result<Vec<SourceStringData>, String> {
    // The command now delegates to the new core RPGMV project logic
    crate::core::rpgmv::project::extract_translatable_strings_from_project(&project_path)
}

#[tauri::command]
pub async fn reconstruct_translated_project_files(
    project_path: String,
    translated_entries: Vec<WorkingTranslation>,
) -> Result<String, String> {
    let mut grouped_translations: HashMap<String, Vec<&WorkingTranslation>> = HashMap::new();
    for entry in &translated_entries {
        grouped_translations.entry(entry.source_file.clone()).or_default().push(entry);
    }

    let mut all_reconstructed_content: HashMap<String, String> = HashMap::new();
    let mut reconstruction_errors: Vec<String> = Vec::new();

    for (relative_file_path, entries_for_file) in grouped_translations {
        let original_file_full_path = Path::new(&project_path).join(&relative_file_path);

        let original_content_bytes = match fs::read(&original_file_full_path).await {
            Ok(bytes) => bytes,
            Err(e) => {
                let error_msg = format!(
                    "Failed to read original file {}: {}",
                    original_file_full_path.display(),
                    e
                );
                eprintln!("{}", error_msg);
                reconstruction_errors.push(error_msg);
                continue; // Skip this file
            }
        };
        
        let original_content_str = String::from_utf8_lossy(&original_content_bytes).to_string();

        match crate::core::rpgmv::project::reconstruct_file_content(
            &original_content_str, 
            &relative_file_path, 
            entries_for_file
        ) {
            Ok(reconstructed_json_string) => {
                all_reconstructed_content.insert(relative_file_path.clone(), reconstructed_json_string);
            }
            Err(core_error) => {
                let error_msg = format!(
                    "Error reconstructing file {}: {}", 
                    relative_file_path, 
                    core_error.to_string()
                );
                eprintln!("{}", error_msg);
                reconstruction_errors.push(error_msg);
                // Continue to attempt other files
            }
        }
    }

    if !reconstruction_errors.is_empty() && all_reconstructed_content.is_empty() {
        // All files failed reconstruction or reading
        return Err(format!("All file processing failed. Errors: {}", reconstruction_errors.join("; ")));
    }
    
    if all_reconstructed_content.is_empty() && !translated_entries.is_empty() {
        return Err("No files were successfully reconstructed, though translated entries were provided.".to_string());
    }
    if all_reconstructed_content.is_empty() && translated_entries.is_empty() {
        // This is not an error, just means nothing to zip.
        // However, the frontend should ideally not call this if there are no entries.
        // For now, let's return an empty path or a specific signal if we decide so.
        // Or, let the zip creation handle an empty map (it should create an empty zip).
        println!("No reconstructed content to package into ZIP.");
        // To create an empty zip, we'd still proceed. If an error is preferred:
        // return Err("No content to package.".to_string()); 
    }

    // Define output path for the ZIP file (temporary for now)
    let target_dir = std::env::temp_dir();
    let output_zip_file_path = target_dir.join("translated_project_output.zip");

    match crate::services::zip_service::create_zip_archive_from_memory(&all_reconstructed_content, &output_zip_file_path) {
        Ok(_) => {
            if !reconstruction_errors.is_empty() {
                // Partial success: ZIP created, but some files had errors
                // The frontend should be notified of these errors separately.
                // For now, returning the ZIP path but logging errors.
                eprintln!("ZIP created with some reconstruction errors: {}", reconstruction_errors.join("; "));
            }
            Ok(output_zip_file_path.to_string_lossy().into_owned())
        }
        Err(e) => Err(format!("Failed to create ZIP archive: {}", e.to_string())),
    }
}

#[tauri::command]
pub async fn save_zip_archive_command(app_handle: AppHandle, temp_zip_path: String) -> Result<Option<String>, String> {
    let temp_path = Path::new(&temp_zip_path);
    let file_name = temp_path.file_name().unwrap_or_else(|| std::ffi::OsStr::new("translated.zip"));

    let dialog_result = app_handle
        .dialog()
        .file()
        .add_filter("ZIP Archive", &["zip"])
        .set_file_name(file_name.to_string_lossy().as_ref())
        .blocking_save_file();

    match dialog_result {
        Some(target_file_path_wrapper) => {
            match target_file_path_wrapper {
                FilePath::Path(target_path_buf) => {
                    match std::fs::rename(&temp_zip_path, &target_path_buf) {
                        Ok(_) => Ok(Some(target_path_buf.to_string_lossy().into_owned())),
                        Err(e) => {
                            // Attempt copy and delete if rename fails (e.g., across filesystems)
                            match std::fs::copy(&temp_zip_path, &target_path_buf) {
                                Ok(_) => {
                                    if let Err(del_err) = std::fs::remove_file(&temp_zip_path) {
                                        eprintln!("Failed to delete temporary ZIP after copy: {}", del_err);
                                        // Still return success as copy worked
                                        Ok(Some(target_path_buf.to_string_lossy().into_owned()))
                                    } else {
                                        Ok(Some(target_path_buf.to_string_lossy().into_owned()))
                                    }
                                }
                                Err(copy_err) => {
                                    let err_msg = format!("Failed to move/copy ZIP file from {} to {:?}: Rename error: {}, Copy error: {}", temp_zip_path, target_path_buf, e, copy_err);
                                    eprintln!("{}", err_msg);
                                    Err(err_msg)
                                }
                            }
                        }
                    }
                }
                _ => {
                    eprintln!("Unexpected FilePath variant from save dialog on desktop.");
                    Err("Save dialog returned an unexpected path format.".to_string())
                }
            }
        }
        None => Ok(None), // User cancelled the save dialog
    }
}

#[tauri::command]
pub async fn open_folder_command(app_handle: AppHandle, folder_path: String) -> Result<(), String> {
    // Ensure opener is available (it should be if plugin is registered)
    match app_handle.opener().open_path(folder_path.clone(), None::<&str>) {
        Ok(_) => Ok(()),
        Err(e) => {
            let err_msg = format!("Failed to open folder {}: {}", folder_path, e.to_string());
            eprintln!("{}", err_msg);
            Err(err_msg)
        }
    }
}

// Example (to be implemented in Task 1.2 of Phase 3):
// #[tauri::command]
// async fn select_project_folder_command() -> Result<Option<String>, String> {
//    // ... implementation using tauri_plugin_dialog ...
//    Ok(None)
// } 