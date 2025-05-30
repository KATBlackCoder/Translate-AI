use serde::Deserialize;
use serde_json::Value;

#[derive(serde::Serialize, serde::Deserialize, Debug, Clone, PartialEq, Eq)]
pub struct TranslatableStringEntry {
    pub object_id: u32,        // The ID from the JSON object itself (e.g., actor.id, item.id)
    pub text: String,          // The actual string to be translated
    pub source_file: String,   // Relative path to the file from the project root, e.g., "www/data/Actors.json"
    pub json_path: String,     // A string representing the path within the JSON, e.g., "[1].name"
}

#[derive(serde::Serialize, Debug)]
pub struct TranslatedStringEntry {
    pub object_id: u32,
    pub original_text: String,
    pub translated_text: String,
    pub source_file: String,
    pub json_path: String,
    pub translation_source: String, // e.g., "ollama", "deepl", "glossary"
    pub error: Option<String>,     // To capture individual translation errors
}

// Represents a single command in an event's list.
// This is used by CommonEvents.json, Troops.json event pages, and MapXXX.json events.
#[derive(Deserialize, Debug, Clone)]
pub struct EventCommand {
    pub code: i32,
    pub parameters: Vec<Value>,
}

// Trait for RPG Maker MV data objects that can be processed by the generic extractor.
pub trait RpgMvDataObject: for<'de> serde::Deserialize<'de> + std::fmt::Debug + Sized {
    fn get_id(&self) -> u32;
    // Returns a vector of (JSON key name, reference to string value to be translated)
    fn get_translatable_fields(&self) -> Vec<(&'static str, &String)>;
}

// Generic function to extract strings from a JSON array of objects implementing RpgMvDataObject
pub fn extract_strings_from_json_array<T: RpgMvDataObject>(
    file_content: &str,
    source_file: &str,
    file_type_name: &str, // e.g., "Actors.json" or "Armors" for error messages
) -> Result<Vec<TranslatableStringEntry>, String> {
    // Attempt to parse the whole file as Vec<Option<T>> to handle nulls gracefully.
    // This is a common pattern in RPG Maker MV JSON files (e.g., first element is often null).
    let data_array_options: Vec<Option<T>> = serde_json::from_str(file_content)
        .map_err(|e| format!("Failed to parse {} as array of options: {}. Content snippet: {:.100}", file_type_name, e, file_content.chars().take(100).collect::<String>()))?;

    let mut entries = Vec::new();

    for (index, item_option) in data_array_options.iter().enumerate() {
        if index == 0 && item_option.is_none() {
            // Common RPG Maker pattern: first element is null, skip it.
            // This check is mostly redundant if we are iterating Vec<Option<T>> and handling None below,
            // but kept for clarity or if a direct array parse was used.
            continue;
        }

        if let Some(item) = item_option {
            if item.get_id() == 0 {
                // Skip if id is 0, often a placeholder or invalid entry
                continue;
            }

            for (field_key, field_value_ref) in item.get_translatable_fields() {
                if !field_value_ref.trim().is_empty() {
                    entries.push(TranslatableStringEntry {
                        object_id: item.get_id(),
                        text: field_value_ref.clone(),
                        source_file: source_file.to_string(),
                        json_path: format!("[{}].{}", index, field_key),
                    });
                }
            }
        } else {
            // This handles other null entries in the array, not just the first one.
            // eprintln!("Skipping null entry in {} at index {}", file_type_name, index);
        }
    }

    Ok(entries)
}

/// Extracts translatable strings from a list of RPG Maker MV event commands.
///
/// # Arguments
/// * `commands` - A slice of `EventCommand`s to process.
/// * `entry_object_id` - The ID to be used for `TranslatableStringEntry.object_id` (e.g., CommonEvent ID, Troop ID, Map Event ID).
/// * `source_file` - The relative path of the source JSON file.
/// * `json_path_prefix_for_command_list` - The JSON path string that leads up to the command list itself 
///   (e.g., "[1].list" or "events[0].pages[0].list").
///
/// # Returns
/// A vector of `TranslatableStringEntry` extracted from the commands.
pub fn extract_translatable_strings_from_event_command_list(
    commands: &[EventCommand],
    entry_object_id: u32,
    source_file: &str,
    json_path_prefix_for_command_list: &str,
) -> Vec<TranslatableStringEntry> {
    let mut entries = Vec::new();

    for (cmd_idx, command) in commands.iter().enumerate() {
        match command.code {
            101 => { // Show Text (Face/NameBox)
                if command.parameters.len() > 4 {
                    if let Value::String(speaker_name) = &command.parameters[4] {
                        if !speaker_name.trim().is_empty() {
                            entries.push(TranslatableStringEntry {
                                object_id: entry_object_id,
                                text: speaker_name.clone(),
                                source_file: source_file.to_string(),
                                json_path: format!(
                                    "{}[{}].parameters[4]",
                                    json_path_prefix_for_command_list, cmd_idx
                                ),
                            });
                        }
                    }
                }
            }
            401 => { // Show Text (Message line)
                if !command.parameters.is_empty() {
                    if let Value::String(text_line) = &command.parameters[0] {
                        if !text_line.trim().is_empty() {
                            entries.push(TranslatableStringEntry {
                                object_id: entry_object_id,
                                text: text_line.clone(),
                                source_file: source_file.to_string(),
                                json_path: format!(
                                    "{}[{}].parameters[0]",
                                    json_path_prefix_for_command_list, cmd_idx
                                ),
                            });
                        }
                    }
                }
            }
            102 => { // Show Choices
                if command.parameters.len() > 0 {
                    if let Value::Array(choices) = &command.parameters[0] {
                        for (choice_idx, choice_val) in choices.iter().enumerate() {
                            if let Value::String(choice_text) = choice_val {
                                if !choice_text.trim().is_empty() {
                                    entries.push(TranslatableStringEntry {
                                        object_id: entry_object_id,
                                        text: choice_text.clone(),
                                        source_file: source_file.to_string(),
                                        json_path: format!(
                                            "{}[{}].parameters[0][{}]",
                                            json_path_prefix_for_command_list, cmd_idx, choice_idx
                                        ),
                                    });
                                }
                            }
                        }
                    }
                }
            }
            105 => { // Show Scrolling Text
                if !command.parameters.is_empty() {
                    if let Value::String(scroll_text) = &command.parameters[0] {
                        if !scroll_text.trim().is_empty() {
                            entries.push(TranslatableStringEntry {
                                object_id: entry_object_id,
                                text: scroll_text.clone(),
                                source_file: source_file.to_string(),
                                json_path: format!(
                                    "{}[{}].parameters[0]",
                                    json_path_prefix_for_command_list, cmd_idx
                                ),
                            });
                        }
                    }
                }
            }
            // Other command codes (108, 408 for comments, specific script calls, etc.) 
            // are intentionally omitted here to maintain focus on the most common text-bearing commands.
            // The commented-out sections in common_events.rs can be referred to if more comprehensive
            // extraction is needed in the future, potentially by expanding this shared function or
            // by adding specific handlers in the calling parsers.
            _ => {}
        }
    }
    entries
}

use crate::models::translation::TranslatedStringEntryFromFrontend;
use crate::error::CoreError;
use crate::utils::json_utils::update_value_at_path;

/// Reconstructs an event command list by injecting translations.
///
/// # Arguments
/// * `command_list_value_array` - A mutable reference to `Vec<Value>`, representing the command list.
/// * `parent_object_id` - The ID of the parent object (e.g., Common Event ID, Map Event ID).
/// * `translations` - A slice of `TranslatedStringEntryFromFrontend` relevant to this command list.
/// * `json_path_prefix_for_command_list` - The JSON path prefix for this command list (e.g., "[1].list").
///
/// # Returns
/// `Ok(())` if reconstruction was successful for all applicable entries, or `CoreError` if a 
/// critical error occurred during processing (though most path errors are logged and skipped).
pub fn reconstruct_event_command_list(
    command_list_value_array: &mut Vec<Value>, // Mutably borrow the array of commands
    parent_object_id: u32,
    translations: &[&TranslatedStringEntryFromFrontend],
    json_path_prefix_for_command_list: &str, // e.g. "[1].list"
) -> Result<(), CoreError> { // Return a Result, CoreError for now can be generic or specific
    for entry in translations {
        if entry.object_id != parent_object_id {
            // This check might be redundant if translations are pre-filtered,
            // but good for safety.
            eprintln!(
                "Warning (reconstruct_event_command_list): Translation entry object_id {} does not match parent_object_id {}. Skipping entry: {:?}.",
                entry.object_id, parent_object_id, entry
            );
            continue;
        }

        // The entry.json_path is absolute from the root of the file (e.g., "[1].list.[0].parameters.[4]")
        // We need to derive the path relative to an individual command in the list.
        let path_within_command_list = entry.json_path.trim_start_matches(json_path_prefix_for_command_list);
        
        // path_within_command_list should now be like ".[0].parameters.[4]"
        // We need to parse out the command index and the path within that command.
        let parts: Vec<&str> = path_within_command_list.trim_start_matches('.').splitn(2, '.').collect();
        
        if parts.len() < 1 || !parts[0].starts_with('[') || !parts[0].ends_with(']') {
            eprintln!(
                "Warning (reconstruct_event_command_list): Could not parse command index from path {}. Original path: {}, Prefix: {}. Skipping entry: {:?}.",
                path_within_command_list, entry.json_path, json_path_prefix_for_command_list, entry
            );
            continue;
        }

        let cmd_index_str = &parts[0][1..parts[0].len()-1];
        let cmd_index: usize = match cmd_index_str.parse() {
            Ok(idx) => idx,
            Err(_) => {
                eprintln!(
                    "Warning (reconstruct_event_command_list): Failed to parse command index '{}' from path {}. Skipping entry: {:?}.",
                    cmd_index_str, entry.json_path, entry
                );
                continue;
            }
        };

        if cmd_index >= command_list_value_array.len() {
            eprintln!(
                "Warning (reconstruct_event_command_list): Command index {} out of bounds (list len {}). Path: {}. Skipping entry: {:?}.",
                cmd_index, command_list_value_array.len(), entry.json_path, entry
            );
            continue;
        }

        let path_within_command_params = if parts.len() > 1 { parts[1] } else { "" };
        if path_within_command_params.is_empty() {
            eprintln!(
                "Warning (reconstruct_event_command_list): Path within command parameters is empty for {}. Skipping entry: {:?}.",
                entry.json_path, entry
            );
            continue;
        }

        let text_to_insert = if entry.error.is_some() {
            &entry.text
        } else {
            &entry.translated_text
        };

        if let Some(command_value_mut) = command_list_value_array.get_mut(cmd_index) {
            // Now use update_value_at_path on command_value_mut with path_within_command_params
            match update_value_at_path(command_value_mut, path_within_command_params, text_to_insert) {
                Ok(_) => { /* Successfully updated */ }
                Err(e) => {
                    eprintln!(
                        "Warning (reconstruct_event_command_list): Failed to update path '{}' within command at index {} (id: {}, original full path: {}): {}. Skipping update for this field.", 
                        path_within_command_params, cmd_index, parent_object_id, entry.json_path, e.to_string()
                    );
                }
            }
        } // else: cmd_index out of bounds, already handled above
    }
    Ok(())
}

/// Generic function to reconstruct a JSON string by applying translated text entries.
/// This function is suitable for simple JSON structures where translations are applied
/// directly based on `json_path` relative to the root of the JSON document.
pub fn reconstruct_json_generically(
    original_json_str: &str,
    translations: &[&TranslatedStringEntryFromFrontend], // All translations for this file
) -> Result<String, CoreError> {
    let mut value: serde_json::Value = serde_json::from_str(original_json_str)
        .map_err(|e| CoreError::JsonParse(format!("Failed to parse original JSON for generic reconstruction: {}. Snippet: {:.100}", e, original_json_str.chars().take(100).collect::<String>())))?;

    for trans_entry in translations {
        // Use translated_text if available and not empty, and no error; otherwise use the original text.
        let text_to_insert = 
            if trans_entry.error.is_some() || trans_entry.translated_text.is_empty() {
                trans_entry.text.as_str()
            } else {
                trans_entry.translated_text.as_str()
            };
        
        match crate::utils::json_utils::update_value_at_path(
            &mut value,
            &trans_entry.json_path,
            text_to_insert, // Pass &str directly
        ) {
            Ok(_) => { /* Successfully updated path */ }
            Err(e) => {
                eprintln!(
                    "Failed to update path {} for object_id {} in file {}: {}. Using original text.", 
                    trans_entry.json_path, trans_entry.object_id, trans_entry.source_file, e
                );
            }
        }
    }

    serde_json::to_string_pretty(&value) // Using pretty print for better readability of output files
        .map_err(|e| CoreError::JsonSerialize(format!("Failed to serialize reconstructed JSON (generically): {}", e)))
}

/// Generic function to reconstruct a JSON array of objects where each object is identified by its `id` field.
/// The `json_path` in translations is relative to the found object.
pub fn reconstruct_object_array_by_id(
    original_json_str: &str,
    translations: &[&TranslatedStringEntryFromFrontend],
    file_type_name_for_logging: &str, // e.g., "Actors.json"
) -> Result<String, CoreError> {
    let mut json_array: Vec<Value> = serde_json::from_str(original_json_str)
        .map_err(|e| CoreError::JsonParse(format!("Failed to parse {} as array: {}", file_type_name_for_logging, e)))?;

    for entry in translations {
        let target_id = entry.object_id;
        let mut found_object = false;

        for item_value in json_array.iter_mut() {
            if item_value.is_null() {
                continue;
            }
            if let Some(id_val) = item_value.get("id").and_then(|id| id.as_u64()) {
                if id_val == target_id as u64 {
                    found_object = true;
                    let text_to_insert = 
                        if entry.error.is_some() || entry.translated_text.is_empty() {
                            entry.text.as_str()
                        } else {
                            entry.translated_text.as_str()
                        };

                    match update_value_at_path(item_value, &entry.json_path, text_to_insert) {
                        Ok(_) => { /* Successfully updated */ }
                        Err(e) => {
                            eprintln!(
                                "Warning ({}): Failed to update path '{}' for id {}: {}. Skipping update.", 
                                file_type_name_for_logging, entry.json_path, target_id, e
                            );
                        }
                    }
                    break; // Found and processed the object, move to next translation entry
                }
            }
        }

        if !found_object {
            eprintln!(
                "Warning ({}): Object with id {} not found for reconstruction. Path: '{}'. Skipping.", 
                file_type_name_for_logging, target_id, entry.json_path
            );
        }
    }

    serde_json::to_string_pretty(&json_array)
        .map_err(|e| CoreError::JsonSerialize(format!("Failed to serialize reconstructed {} (by id): {}", file_type_name_for_logging, e)))
}

/// Generic function to reconstruct a JSON array of objects where objects are targeted by an index in `json_path`.
/// It also verifies `object_id` if the target object has an `id` field.
/// The `json_path` has the format `"[index].field.subfield"`.
pub fn reconstruct_object_array_by_path_index(
    original_json_str: &str,
    translations: &[&TranslatedStringEntryFromFrontend],
    file_type_name_for_logging: &str, // e.g., "Classes.json"
) -> Result<String, CoreError> {
    let mut json_array: Vec<Value> = serde_json::from_str(original_json_str)
        .map_err(|e| CoreError::JsonParse(format!("Failed to parse {} as array: {}", file_type_name_for_logging, e)))?;

    for entry in translations {
        // Extract array index and relative path from entry.json_path (e.g., "[1].name" -> index 1, path "name")
        let parts: Vec<&str> = entry.json_path.splitn(2, '.').collect();
        if parts.len() < 1 || !parts[0].starts_with('[') || !parts[0].ends_with(']') {
            eprintln!(
                "Warning ({}): Invalid json_path format for entry (top level index missing): '{}'. Skipping.", 
                file_type_name_for_logging, entry.json_path
            );
            continue;
        }

        let index_str = &parts[0][1..parts[0].len()-1];
        let item_index: usize = match index_str.parse() {
            Ok(idx) => idx,
            Err(_) => {
                eprintln!(
                    "Warning ({}): Failed to parse index from path: '{}'. Skipping.", 
                    file_type_name_for_logging, entry.json_path
                );
                continue;
            }
        };

        if item_index >= json_array.len() || json_array[item_index].is_null() {
            eprintln!(
                "Warning ({}): Index {} out of bounds or null for path '{}'. Skipping.", 
                file_type_name_for_logging, item_index, entry.json_path
            );
            continue;
        }
        
        let path_within_object = if parts.len() > 1 { parts[1] } else {
            eprintln!(
                "Warning ({}): json_path '{}' lacks field part after index. Skipping.", 
                file_type_name_for_logging, entry.json_path
            );
            continue;
        };

        if let Some(item_value_mut) = json_array.get_mut(item_index) {
            // Optional: Verify object_id if applicable and present
            if let Some(id_val) = item_value_mut.get("id").and_then(|id| id.as_u64()) {
                if id_val != entry.object_id as u64 {
                    eprintln!(
                        "Warning ({}): Mismatched object_id for index {}. Expected id {}, translation entry has id {}. Path: '{}'. Skipping.",
                        file_type_name_for_logging, item_index, id_val, entry.object_id, entry.json_path
                    );
                    continue;
                }
            }
            // If no "id" field, we proceed based on index alone.

            let text_to_insert = 
                if entry.error.is_some() || entry.translated_text.is_empty() {
                    entry.text.as_str()
                } else {
                    entry.translated_text.as_str()
                };

            match update_value_at_path(item_value_mut, path_within_object, text_to_insert) {
                Ok(_) => { /* Successfully updated */ }
                Err(e) => {
                    eprintln!(
                        "Warning ({}): Failed to update path '{}' (relative: '{}') for index {}: {}. Skipping update.", 
                        file_type_name_for_logging, entry.json_path, path_within_object, item_index, e
                    );
                }
            }
        } 
        // item_value_mut will exist due to bounds check, so no else needed here.
    }

    serde_json::to_string_pretty(&json_array)
        .map_err(|e| CoreError::JsonSerialize(format!("Failed to serialize reconstructed {} (by path index): {}", file_type_name_for_logging, e)))
} 