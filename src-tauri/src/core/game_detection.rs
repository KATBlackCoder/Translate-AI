use std::path::Path;
// Note: std::fs is not directly used here anymore as is_file/is_dir are Path methods

// Enum to represent the outcome of the project detection
#[derive(serde::Serialize, Debug, Clone, Copy)] // Added Clone, Copy for easier use if returned by value
pub enum RpgMakerDetectionResult {
    DetectedByProjectFile, // Found Game.rpgproject
    DetectedByWwwData,   // Found www/data structure
    NotDetected,         // Not an RPG Maker MV project by our checks
}

// This is now a regular public Rust function, not a Tauri command.
pub fn detect_rpg_maker_mv(project_path: &str) -> RpgMakerDetectionResult {
    let path = Path::new(project_path);

    // Primary check: Game.rpgproject file
    let game_rpgproject_path = path.join("Game.rpgproject");
    if game_rpgproject_path.is_file() {
        return RpgMakerDetectionResult::DetectedByProjectFile;
    }

    // Fallback check: www/data directory structure
    let www_path = path.join("www");
    let data_path = www_path.join("data");

    if www_path.is_dir() && data_path.is_dir() {
        return RpgMakerDetectionResult::DetectedByWwwData;
    }

    RpgMakerDetectionResult::NotDetected
} 