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

use crate::error::CoreError;
use crate::models::translation::TranslatedStringEntryFromFrontend;
use crate::utils::json_utils::update_value_at_path;
use super::common::reconstruct_event_command_list; // New helper needed

pub fn reconstruct_common_events_json(
    original_json_str: &str,
    translations: Vec<&TranslatedStringEntryFromFrontend>,
) -> Result<String, CoreError> {
    let mut common_events_json_array: Vec<Value> = serde_json::from_str(original_json_str)
        .map_err(|e| CoreError::JsonParse(format!("Failed to parse CommonEvents.json: {}", e)))?;

    for entry in &translations {
        // Common Event names are at paths like "[1].name"
        // Command list items are at paths like "[1].list.[0].parameters.[0]"
        let parts: Vec<&str> = entry.json_path.splitn(3, '.').collect();
        
        if parts.len() < 2 || !parts[0].starts_with('[') || !parts[0].ends_with(']') {
            eprintln!("Warning (CommonEvents.json): Invalid json_path format for entry: {:?}. Skipping.", entry);
            continue;
        }

        let index_str = &parts[0][1..parts[0].len()-1];
        let event_index: usize = match index_str.parse() {
            Ok(idx) => idx,
            Err(_) => {
                eprintln!("Warning (CommonEvents.json): Failed to parse event index from path: {}. Skipping.", entry.json_path);
                continue;
            }
        };

        if event_index >= common_events_json_array.len() || common_events_json_array[event_index].is_null() {
            eprintln!("Warning (CommonEvents.json): Event index {} out of bounds or null. Skipping entry: {:?}.", event_index, entry);
            continue;
        }
        
        let event_object_id = common_events_json_array[event_index].get("id")
            .and_then(|id_val| id_val.as_u64())
            .map_or(0, |id| id as u32);

        if event_object_id != entry.object_id {
            eprintln!(
                "Warning (CommonEvents.json): Mismatched object_id for event_index {}. Expected {}, found in translation {}. Skipping entry: {:?}.",
                event_index, event_object_id, entry.object_id, entry
            );
            continue;
        }

        let text_to_insert = if entry.error.is_some() {
            &entry.text
        } else {
            &entry.translated_text
        };

        if parts.len() == 2 && parts[1] == "name" {
            if let Some(event_value_mut) = common_events_json_array.get_mut(event_index) {
                if let Err(e) = update_value_at_path(event_value_mut, "name", text_to_insert) {
                    eprintln!(
                        "Warning (CommonEvents.json): Failed to update name for event id {}: {}. Skipping update for this field.", 
                        entry.object_id, e.to_string()
                    );
                }
            } // else already handled by bounds check
        } else if parts.len() > 2 && parts[1] == "list" {
            // This part will be handled by reconstruct_event_command_list
            // We group translations by object_id (common event id) and pass them to the helper
            // The helper will then internally use the specific json_path within the list.
            // This main loop focuses on dispatching to the helper per common event.
        } else {
            // This case should ideally not be hit if json_paths are generated correctly
            eprintln!("Warning (CommonEvents.json): Unhandled json_path structure: {} for entry: {:?}", entry.json_path, entry);
        }
    }
    
    // After processing direct name changes, iterate again to reconstruct command lists
    // This ensures names are updated before command lists, though order might not strictly matter here
    // as they are separate fields.
    for event_index in 0..common_events_json_array.len() {
        if common_events_json_array[event_index].is_null() {
            continue;
        }
        let common_event_id = common_events_json_array[event_index].get("id")
                                .and_then(|id| id.as_u64())
                                .map_or(0, |id| id as u32);
        if common_event_id == 0 { continue; }

        let relevant_translations: Vec<&TranslatedStringEntryFromFrontend> = translations
            .iter()
            .filter(|t| t.object_id == common_event_id && t.json_path.contains(&format!("[{}].list", event_index)))
            .map(|&t_ref| t_ref)
            .collect();

        if !relevant_translations.is_empty() {
            if let Some(event_value_mut) = common_events_json_array.get_mut(event_index) {
                 if let Some(list_value) = event_value_mut.get_mut("list") {
                    if let Value::Array(list_array) = list_value {
                        // The json_path for commands already includes the event_index, e.g. "[1].list.[0]..."
                        // The helper needs to adjust for this if it expects paths relative to the list itself.
                        // For now, assume reconstruct_event_command_list handles full paths or can derive relative ones.
                        match reconstruct_event_command_list(list_array, common_event_id, &relevant_translations, &format!("[{}].list", event_index)) {
                            Ok(_) => { /* Successfully updated list */ }
                            Err(e) => {
                                eprintln!(
                                    "Error reconstructing command list for common event id {}: {}. List might be partially updated or inconsistent.", 
                                    common_event_id, e
                                );
                                // Decide on error handling: continue, or propagate as a partial success/failure
                            }
                        }
                    } else {
                        eprintln!("Warning (CommonEvents.json): 'list' field for event id {} is not an array. Skipping command reconstruction.", common_event_id);
                    }
                } else {
                     eprintln!("Warning (CommonEvents.json): No 'list' field found for event id {}. Skipping command reconstruction.", common_event_id);
                }
            } // else: event_index out of bounds, already handled or impossible here
        }
    }

    serde_json::to_string_pretty(&common_events_json_array)
        .map_err(|e| CoreError::JsonSerialize(format!("Failed to serialize CommonEvents.json: {}", e)))
}


#[cfg(test)]
mod tests {
    use super::*;

    const TEST_COMMON_EVENTS_JSON: &str = r#"[
        null,
        {
            "id": 1,
            "list": [
                {"code":101,"indent":0,"parameters":["",0,0,2,"ActorName"]},
                {"code":401,"indent":0,"parameters":["This is the first line of dialogue."]},
                {"code":401,"indent":0,"parameters":["This is the second line of dialogue."]},
                {"code":102,"indent":0,"parameters":[["Choice 1","Choice 2","Cancel"],2,0,1,0]},
                {"code":0,"indent":0,"parameters":[]}
            ],
            "name": "Test Event 1",
            "switchId": 1,
            "trigger": 0
        },
        {
            "id": 2,
            "list": [
                {"code":108,"indent":0,"parameters":["Comment line 1"]},
                {"code":408,"indent":0,"parameters":["Comment line 2"]},
                {"code":101,"indent":0,"parameters":["Face.png",1,1,2,"Another Actor"]},
                {"code":401,"indent":0,"parameters":["Another dialogue here."]},
                {"code":0,"indent":0,"parameters":[]}
            ],
            "name": "",
            "switchId": 2,
            "trigger": 1
        },
        {
            "id": 3,
            "list": [
                 {"code":355,"indent":0,"parameters":["this.setupEnemy();"]}, 
                 {"code":655,"indent":0,"parameters":["this.doAction();"]}
            ],
            "name": "Script Event",
            "switchId": 3,
            "trigger": 2
        }
    ]"#;

    #[test]
    fn test_reconstruct_common_events_basic() {
        let original_json_str = TEST_COMMON_EVENTS_JSON;
        let translations = vec![
            TranslatedStringEntryFromFrontend {
                object_id: 1,
                text: "Test Event 1".to_string(),
                source_file: "www/data/CommonEvents.json".to_string(),
                json_path: "[1].name".to_string(),
                translated_text: "Evento de Prueba 1".to_string(),
                error: None,
            },
            TranslatedStringEntryFromFrontend {
                object_id: 1,
                text: "ActorName".to_string(),
                source_file: "www/data/CommonEvents.json".to_string(),
                json_path: "[1].list.[0].parameters.[4]".to_string(),
                translated_text: "NombreDelActor".to_string(),
                error: None,
            },
            TranslatedStringEntryFromFrontend {
                object_id: 1,
                text: "This is the first line of dialogue.".to_string(),
                source_file: "www/data/CommonEvents.json".to_string(),
                json_path: "[1].list.[1].parameters.[0]".to_string(),
                translated_text: "Esta es la primera línea de diálogo.".to_string(),
                error: None,
            },
            TranslatedStringEntryFromFrontend {
                object_id: 1,
                text: "Choice 1".to_string(),
                source_file: "www/data/CommonEvents.json".to_string(),
                json_path: "[1].list.[3].parameters.[0].[0]".to_string(), // First choice
                translated_text: "Opción 1".to_string(),
                error: None,
            },
            TranslatedStringEntryFromFrontend {
                object_id: 2, // Event with no name originally
                text: "".to_string(),
                source_file: "www/data/CommonEvents.json".to_string(),
                json_path: "[2].name".to_string(),
                translated_text: "Evento Sin Nombre".to_string(), 
                error: None,
            },
             TranslatedStringEntryFromFrontend {
                object_id: 2,
                text: "Comment line 1".to_string(),
                source_file: "www/data/CommonEvents.json".to_string(),
                json_path: "[2].list.[0].parameters.[0]".to_string(), // 108 comment
                translated_text: "Línea de comentario 1".to_string(), 
                error: None,
            },
            TranslatedStringEntryFromFrontend {
                object_id: 2,
                text: "Another dialogue here.".to_string(),
                source_file: "www/data/CommonEvents.json".to_string(),
                json_path: "[2].list.[3].parameters.[0]".to_string(), 
                translated_text: "Otro diálogo aquí.".to_string(), 
                error: None,
            },
        ];
        let translations_ref: Vec<&TranslatedStringEntryFromFrontend> = translations.iter().collect();

        let result = reconstruct_common_events_json(&original_json_str, translations_ref);
        assert!(result.is_ok(), "reconstruct_common_events_json failed: {:?}", result.err());
        let reconstructed_json_str = result.unwrap();
        let reconstructed_json: Value = serde_json::from_str(&reconstructed_json_str).expect("Failed to parse reconstructed JSON");

        assert_eq!(reconstructed_json[1]["name"].as_str().unwrap(), "Evento de Prueba 1");
        assert_eq!(reconstructed_json[1]["list"][0]["parameters"][4].as_str().unwrap(), "NombreDelActor");
        assert_eq!(reconstructed_json[1]["list"][1]["parameters"][0].as_str().unwrap(), "Esta es la primera línea de diálogo.");
        assert_eq!(reconstructed_json[1]["list"][3]["parameters"][0][0].as_str().unwrap(), "Opción 1");
        
        assert_eq!(reconstructed_json[2]["name"].as_str().unwrap(), "Evento Sin Nombre");
        assert_eq!(reconstructed_json[2]["list"][0]["parameters"][0].as_str().unwrap(), "Línea de comentario 1");
        assert_eq!(reconstructed_json[2]["list"][3]["parameters"][0].as_str().unwrap(), "Otro diálogo aquí.");

        // Check that non-translated parts remain the same
        assert_eq!(reconstructed_json[1]["list"][2]["parameters"][0].as_str().unwrap(), "This is the second line of dialogue."); // Not in translations list
        assert_eq!(reconstructed_json[3]["name"].as_str().unwrap(), "Script Event"); // Event 3 not in translations
        assert_eq!(reconstructed_json[3]["list"][0]["parameters"][0].as_str().unwrap(), "this.setupEnemy();"); // Script call
    }

    #[test]
    fn test_reconstruct_common_events_with_translation_error() {
        let original_json_str = TEST_COMMON_EVENTS_JSON;
        let translations = vec![
            TranslatedStringEntryFromFrontend {
                object_id: 1,
                text: "Test Event 1".to_string(),
                source_file: "www/data/CommonEvents.json".to_string(),
                json_path: "[1].name".to_string(),
                translated_text: "FailName".to_string(),
                error: Some("AI error".to_string()),
            },
            TranslatedStringEntryFromFrontend {
                object_id: 1,
                text: "This is the first line of dialogue.".to_string(),
                source_file: "www/data/CommonEvents.json".to_string(),
                json_path: "[1].list.[1].parameters.[0]".to_string(),
                translated_text: "Good Dialogue".to_string(),
                error: None,
            },
        ];
        let translations_ref: Vec<&TranslatedStringEntryFromFrontend> = translations.iter().collect();
        let result = reconstruct_common_events_json(&original_json_str, translations_ref);
        assert!(result.is_ok());
        let reconstructed_json: Value = serde_json::from_str(&result.unwrap()).unwrap();

        assert_eq!(reconstructed_json[1]["name"].as_str().unwrap(), "Test Event 1"); // Original due to error
        assert_eq!(reconstructed_json[1]["list"][1]["parameters"][0].as_str().unwrap(), "Good Dialogue"); // Translated
    }

    #[test]
    fn test_reconstruct_common_events_non_existent_id_in_json_path() {
        // This tests if the event_index in json_path is out of bounds
        let original_json_str = TEST_COMMON_EVENTS_JSON;
        let translations = vec![
            TranslatedStringEntryFromFrontend {
                object_id: 1, // ID exists, but path index might be wrong
                text: "Data".to_string(),
                source_file: "www/data/CommonEvents.json".to_string(),
                json_path: "[99].name".to_string(), // Non-existent event index
                translated_text: "Phantom Name".to_string(),
                error: None,
            },
        ];
        let translations_ref: Vec<&TranslatedStringEntryFromFrontend> = translations.iter().collect();
        let result = reconstruct_common_events_json(&original_json_str, translations_ref);
        assert!(result.is_ok());
        let reconstructed_value: Value = serde_json::from_str(&result.unwrap()).expect("Failed to parse reconstructed");
        let original_value: Value = serde_json::from_str(original_json_str).expect("Failed to parse original");
        assert_eq!(reconstructed_value, original_value); // Expect no change
    }

    #[test]
    fn test_reconstruct_common_events_id_mismatch_between_path_and_entry() {
        let original_json_str = TEST_COMMON_EVENTS_JSON;
        let translations = vec![
            TranslatedStringEntryFromFrontend {
                object_id: 2, // Entry says object_id is 2
                text: "Test Event 1".to_string(),
                source_file: "www/data/CommonEvents.json".to_string(),
                json_path: "[1].name".to_string(), // but path points to event with id 1
                translated_text: "Mismatched Name".to_string(),
                error: None,
            },
        ];
        let translations_ref: Vec<&TranslatedStringEntryFromFrontend> = translations.iter().collect();
        let result = reconstruct_common_events_json(&original_json_str, translations_ref);
        assert!(result.is_ok());
        let reconstructed_value: Value = serde_json::from_str(&result.unwrap()).expect("Failed to parse reconstructed");
        let original_value: Value = serde_json::from_str(original_json_str).expect("Failed to parse original");
        assert_eq!(reconstructed_value, original_value); // Expect no change due to mismatch logic
    }

    #[test]
    fn test_reconstruct_common_events_non_existent_internal_path() {
        let original_json_str = TEST_COMMON_EVENTS_JSON;
        let translations = vec![
            TranslatedStringEntryFromFrontend {
                object_id: 1,
                text: "Value".to_string(),
                source_file: "www/data/CommonEvents.json".to_string(),
                json_path: "[1].inventedField".to_string(), // Path inside event object that doesn't exist
                translated_text: "Translated Invented".to_string(),
                error: None,
            },
             TranslatedStringEntryFromFrontend {
                object_id: 1,
                text: "Value".to_string(),
                source_file: "www/data/CommonEvents.json".to_string(),
                json_path: "[1].list.[0].parameters.[99]".to_string(), // Path inside command parameters that doesn't exist
                translated_text: "Translated Deep Invented".to_string(),
                error: None,
            },
        ];
        let translations_ref: Vec<&TranslatedStringEntryFromFrontend> = translations.iter().collect();
        let result = reconstruct_common_events_json(&original_json_str, translations_ref);
        assert!(result.is_ok());
        let reconstructed_value: Value = serde_json::from_str(&result.unwrap()).expect("Failed to parse reconstructed");
        let original_value: Value = serde_json::from_str(original_json_str).expect("Failed to parse original");
        // For the inventedField, the update_value_at_path will fail, original value preserved.
        // For the parameters.[99], reconstruct_event_command_list internal update_value_at_path will fail.
        assert_eq!(reconstructed_value, original_value); // Expect no change if paths are truly non-existent
    }
    
    #[test]
    fn test_reconstruct_common_events_empty_translations_list() {
        let original_json_str = TEST_COMMON_EVENTS_JSON;
        let translations: Vec<TranslatedStringEntryFromFrontend> = Vec::new();        
        let translations_ref: Vec<&TranslatedStringEntryFromFrontend> = translations.iter().collect();
        let result = reconstruct_common_events_json(&original_json_str, translations_ref);
        assert!(result.is_ok());
        let reconstructed_value: Value = serde_json::from_str(&result.unwrap()).expect("Failed to parse reconstructed");
        let original_value: Value = serde_json::from_str(original_json_str).expect("Failed to parse original");
        assert_eq!(reconstructed_value, original_value);
    }

    #[test]
    fn test_reconstruct_common_events_invalid_original_json() {
        let original_json_str = r#"[null, {"id":1, "name":"Test Event" "list":[]}]"#; // Malformed
        let translations = vec![ /* ... */ ];
        let translations_ref: Vec<&TranslatedStringEntryFromFrontend> = translations.iter().collect();
        let result = reconstruct_common_events_json(original_json_str, translations_ref);
        assert!(result.is_err());
        match result.err().unwrap() {
            CoreError::JsonParse(_) => { /* Expected */ },
            other => panic!("Expected JsonParse error, got {:?}", other),
        }
    }
} 