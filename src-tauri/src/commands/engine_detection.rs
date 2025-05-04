use crate::application::game::engine_detection::{detect_engine_for_folder, EngineDetectionResult};
use std::path::PathBuf;

/// Tauri command that exposes engine detection functionality to the frontend.
/// Takes a folder path as string and returns engine detection results (engine type, Actors.json path, etc).
#[tauri::command(rename_all = "snake_case", async)]
pub async fn detect_engine_and_find_actors(folder_path: String) -> Result<EngineDetectionResult, String> {
    let root = PathBuf::from(&folder_path);
    Ok(detect_engine_for_folder(&root))
}