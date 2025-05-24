use std::fs;
use std::path::Path;
use walkdir::WalkDir;

// This will be moved from the old parser or defined fresh in common.rs
// For now, assuming it will be in a sibling module `common`
use super::common::TranslatableStringEntry; 
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
// use super::maps; // etc.

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
            Ok(content) => {
                if file_name_str == "Actors.json" {
                    match actors::extract_strings(&content, &relative_file_path) {
                        Ok(mut actor_strings) => all_strings.append(&mut actor_strings),
                        Err(e) => parsing_errors.push(format!("Error parsing {}: {}", relative_file_path, e)),
                    }
                } /* else if file_name_str == "Items.json" {
                    match items::extract_strings(&content, &relative_file_path) {
                        Ok(mut item_strings) => all_strings.append(&mut item_strings),
                        Err(e) => parsing_errors.push(format!("Error parsing {}: {}", relative_file_path, e)),
                    }
                } else if file_name_str == "Armors.json" {
                    match armors::extract_strings(&content, &relative_file_path) {
                        Ok(mut armor_strings) => all_strings.append(&mut armor_strings),
                        Err(e) => parsing_errors.push(format!("Error parsing {}: {}", relative_file_path, e)),
                    }
                } else if file_name_str == "Weapons.json" {
                    match weapons::extract_strings(&content, &relative_file_path) {
                        Ok(mut weapon_strings) => all_strings.append(&mut weapon_strings),
                        Err(e) => parsing_errors.push(format!("Error parsing {}: {}", relative_file_path, e)),
                    }
                } else if file_name_str == "Skills.json" {
                    match skills::extract_strings(&content, &relative_file_path) {
                        Ok(mut skill_strings) => all_strings.append(&mut skill_strings),
                        Err(e) => parsing_errors.push(format!("Error parsing {}: {}", relative_file_path, e)),
                    }
                } else if file_name_str == "Enemies.json" {
                    match enemies::extract_strings(&content, &relative_file_path) {
                        Ok(mut enemy_strings) => all_strings.append(&mut enemy_strings),
                        Err(e) => parsing_errors.push(format!("Error parsing {}: {}", relative_file_path, e)),
                    }
                } else if file_name_str == "CommonEvents.json" {
                    match common_events::extract_strings(&content, &relative_file_path) {
                        Ok(mut common_event_strings) => all_strings.append(&mut common_event_strings),
                        Err(e) => parsing_errors.push(format!("Error parsing {}: {}", relative_file_path, e)),
                    }
                } else if file_name_str == "Troops.json" {
                    match troops::extract_strings(&content, &relative_file_path) {
                        Ok(mut troop_strings) => all_strings.append(&mut troop_strings),
                        Err(e) => parsing_errors.push(format!("Error parsing {}: {}", relative_file_path, e)),
                    }
                } else if file_name_str == "System.json" {
                    match system::extract_strings(&content, &relative_file_path) {
                        Ok(mut system_strings) => all_strings.append(&mut system_strings),
                        Err(e) => parsing_errors.push(format!("Error parsing {}: {}", relative_file_path, e)),
                    }
                } else if file_name_str == "MapInfos.json" {
                    match map_infos::extract_strings(&content, &relative_file_path) {
                        Ok(mut map_info_strings) => all_strings.append(&mut map_info_strings),
                        Err(e) => parsing_errors.push(format!("Error parsing {}: {}", relative_file_path, e)),
                    }
                } else if file_name_str == "Classes.json" {
                    match classes::extract_strings(&content, &relative_file_path) {
                        Ok(mut class_strings) => all_strings.append(&mut class_strings),
                        Err(e) => parsing_errors.push(format!("Error parsing {}: {}", relative_file_path, e)),
                    }
                } else if file_name_str == "States.json" {
                    match states::extract_strings(&content, &relative_file_path) {
                        Ok(mut state_strings) => all_strings.append(&mut state_strings),
                        Err(e) => parsing_errors.push(format!("Error parsing {}: {}", relative_file_path, e)),
                    }
                } else if file_name_str.starts_with("Map") && file_name_str.ends_with(".json") && file_name_str != "MapInfos.json" {
                    match maps::extract_strings(&content, &relative_file_path) {
                        Ok(mut map_strings) => all_strings.append(&mut map_strings),
                        Err(e) => parsing_errors.push(format!("Error parsing {}: {}", relative_file_path, e)),
                    }
                } */else {
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
