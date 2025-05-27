use serde::Deserialize;
use crate::core::rpgmv::common::TranslatableStringEntry;

#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct StateEntry {
    id: u32,
    // auto_removal_timing: u32, // Not needed
    // chance_by_damage: u32, // Not needed
    // icon_index: u32, // Not needed
    // max_turns: u32, // Not needed
    message1: String, // "[Actor] is afflicted with [State]!"
    message2: String, // "[Actor] is still afflicted with [State]!" (unused by default engine)
    message3: String, // "[Actor] is no longer afflicted with [State]!"
    message4: String, // "[Actor] recovered from [State]!" (unused by default engine)
    // min_turns: u32, // Not needed
    // motion: u32, // Not needed
    name: String,
    note: String,
    // overlay: u32, // Not needed
    // priority: u32, // Not needed
    // release_by_damage: bool, // Not needed
    // remove_at_battle_end: bool, // Not needed
    // remove_by_restriction: bool, // Not needed
    // remove_by_walking: bool, // Not needed
    // remove_by_damage: bool, // Not needed
    // restriction: u32, // Not needed
    // steps_to_remove: u32, // Not needed
    // traits: Vec<Value>, // Not needed
}

pub fn extract_strings(
    file_content: &str,
    source_file: &str, // e.g., "www/data/States.json"
) -> Result<Vec<TranslatableStringEntry>, String> {
    let states: Vec<Option<StateEntry>> = serde_json::from_str(file_content)
        .map_err(|e| format!("Failed to parse {}: {}. Content snippet: {:.100}", source_file, e, file_content.chars().take(100).collect::<String>()))?;

    let mut entries = Vec::new();

    for (index, state_option) in states.iter().enumerate() {
        if let Some(state_data) = state_option {
            let object_id = state_data.id;

            // Name
            if !state_data.name.trim().is_empty() {
                entries.push(TranslatableStringEntry {
                    object_id,
                    text: state_data.name.clone(),
                    source_file: source_file.to_string(),
                    json_path: format!("[{}].name", index),
                });
            }

            // Note
            if !state_data.note.trim().is_empty() {
                entries.push(TranslatableStringEntry {
                    object_id,
                    text: state_data.note.clone(),
                    source_file: source_file.to_string(),
                    json_path: format!("[{}].note", index),
                });
            }

            // Message1
            if !state_data.message1.trim().is_empty() {
                entries.push(TranslatableStringEntry {
                    object_id,
                    text: state_data.message1.clone(),
                    source_file: source_file.to_string(),
                    json_path: format!("[{}].message1", index),
                });
            }

            // Message2
            if !state_data.message2.trim().is_empty() {
                entries.push(TranslatableStringEntry {
                    object_id,
                    text: state_data.message2.clone(),
                    source_file: source_file.to_string(),
                    json_path: format!("[{}].message2", index),
                });
            }

            // Message3
            if !state_data.message3.trim().is_empty() {
                entries.push(TranslatableStringEntry {
                    object_id,
                    text: state_data.message3.clone(),
                    source_file: source_file.to_string(),
                    json_path: format!("[{}].message3", index),
                });
            }

            // Message4
            if !state_data.message4.trim().is_empty() {
                entries.push(TranslatableStringEntry {
                    object_id,
                    text: state_data.message4.clone(),
                    source_file: source_file.to_string(),
                    json_path: format!("[{}].message4", index),
                });
            }
        }
    }

    Ok(entries)
}

use serde_json::Value;
use crate::models::translation::TranslatedStringEntryFromFrontend;
use crate::error::CoreError;
use crate::utils::json_utils::update_value_at_path;

pub fn reconstruct_states_json(
    original_json_str: &str,
    translations: Vec<&TranslatedStringEntryFromFrontend>,
) -> Result<String, CoreError> {
    let mut states_json_array: Vec<Value> = serde_json::from_str(original_json_str)
        .map_err(|e| CoreError::JsonParse(format!("Failed to parse States.json: {}", e)))?;

    for entry in translations {
        // Example json_path: "[1].name", "[1].message1"
        let parts: Vec<&str> = entry.json_path.splitn(2, '.').collect();
        if parts.len() < 2 || !parts[0].starts_with('[') || !parts[0].ends_with(']') {
            eprintln!("Warning (States.json): Invalid json_path format for entry (top level index): {:?}. Skipping.", entry);
            continue;
        }

        let index_str = &parts[0][1..parts[0].len()-1];
        let state_index: usize = match index_str.parse() {
            Ok(idx) => idx,
            Err(_) => {
                eprintln!("Warning (States.json): Failed to parse state index from path: {}. Skipping.", entry.json_path);
                continue;
            }
        };

        if state_index >= states_json_array.len() || states_json_array[state_index].is_null() {
            eprintln!("Warning (States.json): State index {} out of bounds or null. Skipping entry: {:?}.", state_index, entry);
            continue;
        }

        if let Some(state_value_mut) = states_json_array.get_mut(state_index) {
            if let Some(id_val) = state_value_mut.get("id").and_then(|id| id.as_u64()) {
                if id_val != entry.object_id as u64 {
                    eprintln!(
                        "Warning (States.json): Mismatched object_id for state_index {}. Expected {}, found in translation {}. Skipping entry: {:?}.",
                        state_index, id_val, entry.object_id, entry
                    );
                    continue;
                }
            } else {
                eprintln!("Warning (States.json): Could not read id for state_index {}. Skipping id check for entry: {:?}.", state_index, entry);
            }

            let text_to_insert = if entry.error.is_some() {
                &entry.text
            } else {
                &entry.translated_text
            };
            
            let path_within_state = parts[1]; // e.g., "name", "note", "message1"

            match update_value_at_path(state_value_mut, path_within_state, text_to_insert) {
                Ok(_) => { /* Successfully updated */ }
                Err(e) => {
                    eprintln!(
                        "Warning (States.json): Failed to update path '{}' for state id {}: {}. Skipping update for this field.", 
                        entry.json_path, entry.object_id, e.to_string()
                    );
                }
            }
        } // else already handled by bounds check
    }

    serde_json::to_string_pretty(&states_json_array)
        .map_err(|e| CoreError::JsonSerialize(format!("Failed to serialize States.json: {}", e)))
}


#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_extract_states_strings() {
        let json_content = r#"[
            null,
            {
                "id": 1,
                "autoRemovalTiming": 0,
                "chanceByDamage": 100,
                "iconIndex": 1,
                "maxTurns": 1,
                "message1": "is knocked out.",
                "message2": "",
                "message3": "is revived!",
                "message4": "",
                "minTurns": 1,
                "motion": 3,
                "name": "Knockout",
                "note": "This is a KO state.",
                "overlay": 0,
                "priority": 100,
                "releaseByDamage": false,
                "removeAtBattleEnd": false,
                "removeByRestriction": false,
                "removeByWalking": false,
                "restriction": 4,
                "stepsToRemove": 100,
                "traits": [{"code":22,"dataId":0,"value":0}]
            },
            {
                "id": 2,
                "name": "Guard",
                "note": "",
                "message1": "guards.",
                "message2": "is still guarding.",
                "message3": "stops guarding.",
                "message4": "recovers from guard.",
                "iconIndex": 81,
                "priority": 60,
                "traits": [{"code":62,"dataId":1,"value":0}]
            }
        ]
"#;
        let result = extract_strings(json_content, "www/data/States.json").unwrap();
        
        // Expected: name, note, msg1, msg3 for state 1 (4 entries)
        // name, msg1, msg2, msg3, msg4 for state 2 (note is empty) (5 entries)
        // Total = 9. Original test said 7, which seems to have missed some.
        assert_eq!(result.len(), 9, "Incorrect number of entries extracted.");

        let expected_entries = vec![
            TranslatableStringEntry {
                object_id: 1, text: "Knockout".to_string(), source_file: "www/data/States.json".to_string(), json_path: "[1].name".to_string()
            },
            TranslatableStringEntry {
                object_id: 1, text: "This is a KO state.".to_string(), source_file: "www/data/States.json".to_string(), json_path: "[1].note".to_string()
            },
            TranslatableStringEntry {
                object_id: 1, text: "is knocked out.".to_string(), source_file: "www/data/States.json".to_string(), json_path: "[1].message1".to_string()
            },
            // message2 for state 1 is empty
            TranslatableStringEntry {
                object_id: 1, text: "is revived!".to_string(), source_file: "www/data/States.json".to_string(), json_path: "[1].message3".to_string()
            },
            // message4 for state 1 is empty
            TranslatableStringEntry {
                object_id: 2, text: "Guard".to_string(), source_file: "www/data/States.json".to_string(), json_path: "[2].name".to_string()
            },
            // note for state 2 is empty
            TranslatableStringEntry {
                object_id: 2, text: "guards.".to_string(), source_file: "www/data/States.json".to_string(), json_path: "[2].message1".to_string()
            },
            TranslatableStringEntry {
                object_id: 2, text: "is still guarding.".to_string(), source_file: "www/data/States.json".to_string(), json_path: "[2].message2".to_string()
            },
            TranslatableStringEntry {
                object_id: 2, text: "stops guarding.".to_string(), source_file: "www/data/States.json".to_string(), json_path: "[2].message3".to_string()
            },
            TranslatableStringEntry {
                object_id: 2, text: "recovers from guard.".to_string(), source_file: "www/data/States.json".to_string(), json_path: "[2].message4".to_string()
            }
        ];

        for expected in expected_entries {
            assert!(result.contains(&expected), "Missing expected entry: {:?}", expected);
        }
    }

    #[test]
    fn test_empty_and_null_states() {
        let json_content = r#"[
            null,
            {"id":1,"name":"","note":"","message1":"","message2":"","message3":"","message4":""},
            {"id":2,"name":"Active State","note":"Has a note.","message1":"Begins","message2":"Continues","message3":"Ends","message4":"Recovers"}
        ]"#;
        let result = extract_strings(json_content, "www/data/States.json").unwrap();
        assert_eq!(result.len(), 6); // name, note, msg1-4 for state 2
        
        let expected_entries_state2 = vec![
            TranslatableStringEntry {object_id: 2, text: "Active State".to_string(), source_file: "www/data/States.json".to_string(), json_path: "[2].name".to_string()},
            TranslatableStringEntry {object_id: 2, text: "Has a note.".to_string(), source_file: "www/data/States.json".to_string(), json_path: "[2].note".to_string()},
            TranslatableStringEntry {object_id: 2, text: "Begins".to_string(), source_file: "www/data/States.json".to_string(), json_path: "[2].message1".to_string()},
            TranslatableStringEntry {object_id: 2, text: "Continues".to_string(), source_file: "www/data/States.json".to_string(), json_path: "[2].message2".to_string()},
            TranslatableStringEntry {object_id: 2, text: "Ends".to_string(), source_file: "www/data/States.json".to_string(), json_path: "[2].message3".to_string()},
            TranslatableStringEntry {object_id: 2, text: "Recovers".to_string(), source_file: "www/data/States.json".to_string(), json_path: "[2].message4".to_string()},
        ];
        for expected in expected_entries_state2 {
            assert!(result.contains(&expected), "Missing expected entry for state 2: {:?}", expected);
        }
    }

    // Tests for reconstruct_states_json
    const TEST_STATES_JSON_FOR_RECONSTRUCTION: &str = r#"[
        null,
        {
            "id": 1,
            "name": "Poison",
            "note": "Deals damage over time.",
            "message1": "%1 takes poison damage!",
            "message2": "%1 is still poisoned.",
            "message3": "%1 is no longer poisoned.",
            "message4": "%1 recovered from poison.",
            "iconIndex": 2
        },
        {
            "id": 2,
            "name": "Blind",
            "note": "Reduces accuracy.",
            "message1": "%1 is blinded!",
            "message2": "", 
            "message3": "%1 can see again!",
            "message4": "",
            "iconIndex": 5
        }
    ]"#;

    #[test]
    fn test_reconstruct_states_basic() {
        let original_json_str = TEST_STATES_JSON_FOR_RECONSTRUCTION;
        let translations = vec![
            TranslatedStringEntryFromFrontend {
                object_id: 1,
                text: "Poison".to_string(),
                source_file: "www/data/States.json".to_string(),
                json_path: "[1].name".to_string(),
                translated_text: "Veneno".to_string(),
                error: None,
            },
            TranslatedStringEntryFromFrontend {
                object_id: 1,
                text: "Deals damage over time.".to_string(),
                source_file: "www/data/States.json".to_string(),
                json_path: "[1].note".to_string(),
                translated_text: "Causa daño con el tiempo.".to_string(),
                error: None,
            },
            TranslatedStringEntryFromFrontend {
                object_id: 1,
                text: "%1 takes poison damage!".to_string(),
                source_file: "www/data/States.json".to_string(),
                json_path: "[1].message1".to_string(),
                translated_text: "¡%1 sufre daño por veneno!".to_string(),
                error: None,
            },
            TranslatedStringEntryFromFrontend {
                object_id: 2,
                text: "Blind".to_string(),
                source_file: "www/data/States.json".to_string(),
                json_path: "[2].name".to_string(),
                translated_text: "Ceguera".to_string(),
                error: None,
            },
            TranslatedStringEntryFromFrontend { // Translate an originally empty message
                object_id: 2,
                text: "".to_string(),
                source_file: "www/data/States.json".to_string(),
                json_path: "[2].message2".to_string(),
                translated_text: "%1 sigue ciego.".to_string(),
                error: None,
            },
        ];
        let translations_ref: Vec<&TranslatedStringEntryFromFrontend> = translations.iter().collect();
        let result = reconstruct_states_json(&original_json_str, translations_ref);
        assert!(result.is_ok(), "reconstruct_states_json failed: {:?}", result.err());
        let reconstructed_json: Value = serde_json::from_str(&result.unwrap()).expect("Failed to parse reconstructed JSON");

        assert_eq!(reconstructed_json[1]["name"].as_str().unwrap(), "Veneno");
        assert_eq!(reconstructed_json[1]["note"].as_str().unwrap(), "Causa daño con el tiempo.");
        assert_eq!(reconstructed_json[1]["message1"].as_str().unwrap(), "¡%1 sufre daño por veneno!");
        assert_eq!(reconstructed_json[1]["message2"].as_str().unwrap(), "%1 is still poisoned."); // Unchanged

        assert_eq!(reconstructed_json[2]["name"].as_str().unwrap(), "Ceguera");
        assert_eq!(reconstructed_json[2]["note"].as_str().unwrap(), "Reduces accuracy."); // Unchanged
        assert_eq!(reconstructed_json[2]["message2"].as_str().unwrap(), "%1 sigue ciego.");
    }

    #[test]
    fn test_reconstruct_states_with_translation_error() {
        let original_json_str = TEST_STATES_JSON_FOR_RECONSTRUCTION;
        let translations = vec![
            TranslatedStringEntryFromFrontend {
                object_id: 1,
                text: "Poison".to_string(),
                source_file: "www/data/States.json".to_string(),
                json_path: "[1].name".to_string(),
                translated_text: "Veneno Fallido".to_string(),
                error: Some("AI error".to_string()),
            },
            TranslatedStringEntryFromFrontend {
                object_id: 1,
                text: "%1 is still poisoned.".to_string(),
                source_file: "www/data/States.json".to_string(),
                json_path: "[1].message2".to_string(),
                translated_text: "Mensaje Bueno".to_string(),
                error: None,
            },
        ];
        let translations_ref: Vec<&TranslatedStringEntryFromFrontend> = translations.iter().collect();
        let result = reconstruct_states_json(&original_json_str, translations_ref);
        assert!(result.is_ok());
        let reconstructed_json: Value = serde_json::from_str(&result.unwrap()).unwrap();

        assert_eq!(reconstructed_json[1]["name"].as_str().unwrap(), "Poison"); // Original due to error
        assert_eq!(reconstructed_json[1]["message2"].as_str().unwrap(), "Mensaje Bueno"); // Translated
    }

    #[test]
    fn test_reconstruct_states_non_existent_id() {
        let original_json_str = TEST_STATES_JSON_FOR_RECONSTRUCTION;
        let translations = vec![
            TranslatedStringEntryFromFrontend {
                object_id: 999, 
                text: "Phantom State".to_string(),
                source_file: "www/data/States.json".to_string(),
                json_path: "[1].name".to_string(),
                translated_text: "Estado Fantasma".to_string(),
                error: None,
            },
        ];
        let translations_ref: Vec<&TranslatedStringEntryFromFrontend> = translations.iter().collect();
        let result = reconstruct_states_json(&original_json_str, translations_ref);
        assert!(result.is_ok());
        let reconstructed_value: Value = serde_json::from_str(&result.unwrap()).unwrap();
        let original_value: Value = serde_json::from_str(original_json_str).unwrap();
        assert_eq!(reconstructed_value, original_value);
    }

    #[test]
    fn test_reconstruct_states_non_existent_json_path_index() {
        let original_json_str = TEST_STATES_JSON_FOR_RECONSTRUCTION;
        let translations = vec![
            TranslatedStringEntryFromFrontend {
                object_id: 1,
                text: "Value".to_string(),
                source_file: "www/data/States.json".to_string(),
                json_path: "[99].message1".to_string(), 
                translated_text: "Translated Mystery Message".to_string(),
                error: None,
            },
        ];
        let translations_ref: Vec<&TranslatedStringEntryFromFrontend> = translations.iter().collect();
        let result = reconstruct_states_json(&original_json_str, translations_ref);
        assert!(result.is_ok());
        let reconstructed_value: Value = serde_json::from_str(&result.unwrap()).unwrap();
        let original_value: Value = serde_json::from_str(original_json_str).unwrap();
        assert_eq!(reconstructed_value, original_value);
    }
    
    #[test]
    fn test_reconstruct_states_non_existent_json_path_field() {
        let original_json_str = TEST_STATES_JSON_FOR_RECONSTRUCTION;
        let translations = vec![
            TranslatedStringEntryFromFrontend {
                object_id: 1,
                text: "Value".to_string(),
                source_file: "www/data/States.json".to_string(),
                json_path: "[1].unknownField".to_string(),
                translated_text: "Translated Unknown".to_string(),
                error: None,
            },
        ];
        let translations_ref: Vec<&TranslatedStringEntryFromFrontend> = translations.iter().collect();
        let result = reconstruct_states_json(&original_json_str, translations_ref);
        assert!(result.is_ok());
        let reconstructed_value: Value = serde_json::from_str(&result.unwrap()).unwrap();
        let original_value: Value = serde_json::from_str(original_json_str).unwrap();
        assert_eq!(reconstructed_value, original_value); 
    }

    #[test]
    fn test_reconstruct_states_empty_translations_list() {
        let original_json_str = TEST_STATES_JSON_FOR_RECONSTRUCTION;
        let translations: Vec<TranslatedStringEntryFromFrontend> = Vec::new();        
        let translations_ref: Vec<&TranslatedStringEntryFromFrontend> = translations.iter().collect();
        let result = reconstruct_states_json(&original_json_str, translations_ref);
        assert!(result.is_ok());
        let reconstructed_value: Value = serde_json::from_str(&result.unwrap()).unwrap();
        let original_value: Value = serde_json::from_str(original_json_str).unwrap();
        assert_eq!(reconstructed_value, original_value);
    }

    #[test]
    fn test_reconstruct_states_invalid_original_json() {
        let original_json_str = r#"[null, {"id":1, "name":"Poison", "message1":"Broken"#;
        let translations = vec![/* ... */];
        let translations_ref: Vec<&TranslatedStringEntryFromFrontend> = translations.iter().collect();
        let result = reconstruct_states_json(original_json_str, translations_ref);
        assert!(result.is_err());
        match result.err().unwrap() {
            CoreError::JsonParse(_) => { /* Expected */ },
            other => panic!("Expected JsonParse error, got {:?}", other),
        }
    }
} 