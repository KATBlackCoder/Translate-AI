use serde::Deserialize;
use serde_json::Value;
use crate::core::rpgmv::common::{
    TranslatableStringEntry, 
    EventCommand,
    extract_translatable_strings_from_event_command_list
};

// Represents a single command in a move route list.
#[derive(Deserialize, Debug, Clone)]
struct MoveCommand {
    code: i32,
    parameters: Option<Vec<Value>>, 
}

// Represents a single command in an event's list.
// #[derive(Deserialize, Debug, Clone)]
// struct EventCommand {
//     code: i32,
//     parameters: Vec<Value>,
// }

// Represents a single Common Event.
#[derive(Deserialize, Debug)]
struct CommonEvent {
    id: u32,
    name: String,
    list: Vec<EventCommand>,
}

pub fn extract_strings(
    file_content: &str,
    source_file: &str,
) -> Result<Vec<TranslatableStringEntry>, String> {
    let common_events_json: Value = serde_json::from_str(file_content)
        .map_err(|e| format!("Failed to parse CommonEvents.json: {}", e))?;

    let mut entries = Vec::new();

    if let Value::Array(events_array) = common_events_json {
        for (event_index, event_value) in events_array.iter().enumerate() {
            if event_index == 0 && event_value.is_null() {
                continue;
            }
            if event_value.is_null() {
                continue;
            }

            match serde_json::from_value::<CommonEvent>(event_value.clone()) {
                Ok(common_event) => {
                    if common_event.id == 0 {
                        continue;
                    }

                    // 1. Extract the Common Event's name
                    if !common_event.name.trim().is_empty() {
                        entries.push(TranslatableStringEntry {
                            object_id: common_event.id, 
                            text: common_event.name.clone(),
                            source_file: source_file.to_string(),
                            json_path: format!("[{}].name", event_index),
                        });
                    }

                    // 2. Use the helper function to extract strings from the command list
                    let json_path_prefix = format!("[{}].list", event_index);
                    let mut command_entries = extract_translatable_strings_from_event_command_list(
                        &common_event.list,
                        common_event.id,
                        source_file,
                        &json_path_prefix,
                    );
                    entries.append(&mut command_entries);
                    
                    // The old detailed command processing loop is now replaced by the call above.
                    // The commented out section for more command codes (108, 122, etc.) remains 
                    // as a reference for future expansion if needed, potentially by enhancing 
                    // the shared helper or adding specific logic here.

                }
                Err(e) => {
                    eprintln!(
                        "Skipping common event entry at index {} due to parsing error: {}. Value: {}",
                        event_index, e, event_value
                    );
                }
            }
        }
    } else {
        return Err("CommonEvents.json is not a JSON array.".to_string());
    }

    Ok(entries)
} 