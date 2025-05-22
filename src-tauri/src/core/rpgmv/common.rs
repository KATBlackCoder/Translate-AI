use serde::Deserialize;
use serde_json::Value;

#[derive(serde::Serialize, serde::Deserialize, Debug, Clone, PartialEq, Eq)]
pub struct TranslatableStringEntry {
    pub object_id: u32,        // The ID from the JSON object itself (e.g., actor.id, item.id)
    pub text: String,          // The actual string to be translated
    pub source_file: String,   // Relative path to the file from the project root, e.g., "www/data/Actors.json"
    pub json_path: String,     // A string representing the path within the JSON, e.g., "[1].name"
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