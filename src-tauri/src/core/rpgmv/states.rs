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
            {"id":1, "name":"", "note":"", "message1":"", "message2":"", "message3":"", "message4":""},
            {"id":2, "name":"Poison", "note":"", "message1":"is poisoned.", "message2":"", "message3":"recovers from poison.", "message4":""}
        ]
"#;
        let result = extract_strings(json_content, "www/data/States.json").unwrap();
        assert_eq!(result.len(), 3); // name, msg1, msg3 for Poison state

        let expected_entries = vec![
            TranslatableStringEntry {
                object_id: 2, text: "Poison".to_string(), source_file: "www/data/States.json".to_string(), json_path: "[2].name".to_string()
            },
            TranslatableStringEntry {
                object_id: 2, text: "is poisoned.".to_string(), source_file: "www/data/States.json".to_string(), json_path: "[2].message1".to_string()
            },
            TranslatableStringEntry {
                object_id: 2, text: "recovers from poison.".to_string(), source_file: "www/data/States.json".to_string(), json_path: "[2].message3".to_string()
            }
        ];
        for expected in expected_entries {
            assert!(result.contains(&expected), "Missing expected entry: {:?}", expected);
        }
    }
} 