use std::fs;
use std::path::Path;
use walkdir::WalkDir;
use crate::models::translation::TranslatedStringEntryFromFrontend;
use crate::core::rpgmv::common::TranslatableStringEntry;
use crate::error::CoreError;

// This will be moved from the old parser or defined fresh in common.rs
// For now, assuming it will be in a sibling module `common`
// Placeholder for specific parsers that will live in sibling modules
// e.g., use super::actors;
// e.g., use super::items;
// ... and so on

// Enable parsers as they are implemented
 use super::actors; 
 use super::items;
 use super::armors;
 use super::weapons;
 use super::skills;
 use super::enemies;
 use super::common_events;
 use super::troops;
 use super::system;
 use super::maps;
 use super::map_infos;
 use super::classes;
 use super::states;

/// Orchestrates the extraction of translatable strings from an RPG Maker MV project.
///
/// It walks through the `www/data` directory of the project, identifies relevant
/// JSON files, and delegates parsing to specific modules.
pub fn extract_translatable_strings_from_project(
    project_path: &str,
) -> Result<Vec<TranslatableStringEntry>, String> {
    let data_path = Path::new(project_path).join("www").join("data");
    if !data_path.is_dir() {
        return Err(format!(
            "Data directory not found or is not a directory: {:?}",
            data_path
        ));
    }

    let mut all_strings: Vec<TranslatableStringEntry> = Vec::new();
    let mut parsing_errors: Vec<String> = Vec::new();

    for entry in WalkDir::new(&data_path)
        .into_iter()
        .filter_map(Result::ok)
        .filter(|e| e.file_type().is_file() && e.path().extension().map_or(false, |ext| ext == "json"))
    {
        let file_path = entry.path();
        let file_name_str = match file_path.file_name().and_then(|name| name.to_str()) {
            Some(name) => name,
            None => {
                parsing_errors.push(format!("Skipping file with invalid name: {:?}", file_path));
                continue;
            }
        };

        // Calculate relative path from project_path for TranslatableStringEntry
        // This ensures the source_file path is consistent.
        let relative_file_path = match file_path.strip_prefix(project_path) {
            Ok(p) => p.to_str().unwrap_or_default().replace('\\', "/"), // Ensure cross-platform path separators
            Err(_) => file_name_str.to_string(), // Fallback, though ideally strip_prefix should work
        };
        
        // Using eprintln for temporary debugging output, can be removed later
        eprintln!("Processing file: {}", relative_file_path);

        match fs::read_to_string(file_path) {
            Ok(_content) => {
                if file_name_str == "Actors.json" {
                    match actors::extract_strings(&_content, &relative_file_path) {
                        Ok(mut actor_strings) => all_strings.append(&mut actor_strings),
                        Err(e) => parsing_errors.push(format!("Error parsing {}: {}", relative_file_path, e)),
                    }
                } else if file_name_str == "Items.json" {
                    match items::extract_strings(&_content, &relative_file_path) {
                        Ok(mut item_strings) => all_strings.append(&mut item_strings),
                        Err(e) => parsing_errors.push(format!("Error parsing {}: {}", relative_file_path, e)),
                    }
                } else if file_name_str == "Armors.json" {
                    match armors::extract_strings(&_content, &relative_file_path) {
                        Ok(mut armor_strings) => all_strings.append(&mut armor_strings),
                        Err(e) => parsing_errors.push(format!("Error parsing {}: {}", relative_file_path, e)),
                    }
                } else if file_name_str == "Weapons.json" {
                    match weapons::extract_strings(&_content, &relative_file_path) {
                        Ok(mut weapon_strings) => all_strings.append(&mut weapon_strings),
                        Err(e) => parsing_errors.push(format!("Error parsing {}: {}", relative_file_path, e)),
                    }
                } else if file_name_str == "Skills.json" {
                    match skills::extract_strings(&_content, &relative_file_path) {
                        Ok(mut skill_strings) => all_strings.append(&mut skill_strings),
                        Err(e) => parsing_errors.push(format!("Error parsing {}: {}", relative_file_path, e)),
                    }
                } else if file_name_str == "Enemies.json" {
                    match enemies::extract_strings(&_content, &relative_file_path) {
                        Ok(mut enemy_strings) => all_strings.append(&mut enemy_strings),
                        Err(e) => parsing_errors.push(format!("Error parsing {}: {}", relative_file_path, e)),
                    }
                } else if file_name_str == "CommonEvents.json" {
                    match common_events::extract_strings(&_content, &relative_file_path) {
                        Ok(mut common_event_strings) => all_strings.append(&mut common_event_strings),
                        Err(e) => parsing_errors.push(format!("Error parsing {}: {}", relative_file_path, e)),
                    }
                } else if file_name_str == "Troops.json" {
                    match troops::extract_strings(&_content, &relative_file_path) {
                        Ok(mut troop_strings) => all_strings.append(&mut troop_strings),
                        Err(e) => parsing_errors.push(format!("Error parsing {}: {}", relative_file_path, e)),
                    }
                } else if file_name_str == "System.json" {
                    match system::extract_strings(&_content, &relative_file_path) {
                        Ok(mut system_strings) => all_strings.append(&mut system_strings),
                        Err(e) => parsing_errors.push(format!("Error parsing {}: {}", relative_file_path, e)),
                    }
                } else if file_name_str == "MapInfos.json" {
                    match map_infos::extract_strings(&_content, &relative_file_path) {
                        Ok(mut map_info_strings) => all_strings.append(&mut map_info_strings),
                        Err(e) => parsing_errors.push(format!("Error parsing {}: {}", relative_file_path, e)),
                    }
                } else if file_name_str == "Classes.json" {
                    match classes::extract_strings(&_content, &relative_file_path) {
                        Ok(mut class_strings) => all_strings.append(&mut class_strings),
                        Err(e) => parsing_errors.push(format!("Error parsing {}: {}", relative_file_path, e)),
                    }
                } else if file_name_str == "States.json" {
                    match states::extract_strings(&_content, &relative_file_path) {
                        Ok(mut state_strings) => all_strings.append(&mut state_strings),
                        Err(e) => parsing_errors.push(format!("Error parsing {}: {}", relative_file_path, e)),
                    }
                } else if file_name_str.starts_with("Map") && file_name_str.ends_with(".json") && file_name_str != "MapInfos.json" {
                    match maps::extract_strings(&_content, &relative_file_path) {
                        Ok(mut map_strings) => all_strings.append(&mut map_strings),
                        Err(e) => parsing_errors.push(format!("Error parsing {}: {}", relative_file_path, e)),
                    }
                } else {
                    // Placeholder for other files or unhandled files
                    // You might want to log these or handle them specifically later
                    if file_name_str != "Actors.json" { // Only log if it's not the one we are processing
                        eprintln!("Skipping file (no specific parser implemented yet or intentionally skipped): {}", relative_file_path);
                    }
                }
            }
            Err(e) => {
                parsing_errors.push(format!("Failed to read file {}: {}", relative_file_path, e));
            }
        }
    }

    if !parsing_errors.is_empty() {
        // Depending on strictness, you might return Err here or just log warnings.
        // For now, returning Ok with collected strings and logging errors.
        eprintln!("Errors during string extraction:\n{}", parsing_errors.join("\n"));
        // To make it an error: return Err(parsing_errors.join("\n"));
    }

    Ok(all_strings)
}

pub fn reconstruct_file_content(
    original_json_str: &str,
    relative_file_path: &str,
    translations: Vec<&TranslatedStringEntryFromFrontend>,
) -> Result<String, CoreError> {
    let file_name = Path::new(relative_file_path)
        .file_name()
        .and_then(|name| name.to_str())
        .unwrap_or("");

    // Placeholder calls to specific reconstructors (Sub-Task 6.4)
    // These functions (e.g., super::actors::reconstruct_actors_json) do not exist yet.
    // For the dispatcher to compile and be callable, we'll return Unimplemented error for now.
    match file_name {
        "Actors.json" => super::actors::reconstruct_actors_json(original_json_str, translations),
        "Items.json" => super::items::reconstruct_items_json(original_json_str, translations),
        "Armors.json" => super::armors::reconstruct_armors_json(original_json_str, translations),
        "Weapons.json" => super::weapons::reconstruct_weapons_json(original_json_str, translations),
        "Skills.json" => super::skills::reconstruct_skills_json(original_json_str, translations),
        "Enemies.json" => super::enemies::reconstruct_enemies_json(original_json_str, translations),
        "CommonEvents.json" => super::common_events::reconstruct_common_events_json(original_json_str, translations),
        "Troops.json" => super::troops::reconstruct_troops_json(original_json_str, translations),
        "System.json" => super::system::reconstruct_system_json(original_json_str, translations),
        "MapInfos.json" => super::map_infos::reconstruct_map_infos_json(original_json_str, translations),
        "Classes.json" => super::classes::reconstruct_classes_json(original_json_str, translations),
        "States.json" => super::states::reconstruct_states_json(original_json_str, translations),
        _ if file_name.starts_with("Map") && file_name.ends_with(".json") => {
            // Pass the file_name itself for more specific error logging inside reconstruct_map_json
            super::maps::reconstruct_map_json(original_json_str, translations, file_name)
        }
        _ => Err(CoreError::Unimplemented(format!(
            "Reconstruction dispatch not implemented for file type: {}",
            file_name
        ))),
    }
    // Example of how it would look when a reconstructor exists:
    // match file_name {
    //     "Actors.json" => super::actors::reconstruct_actors_json(original_json_str, translations),
    //     // ... other cases ...
    // }
}
