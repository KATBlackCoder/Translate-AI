use serde::Deserialize;
use crate::core::rpgmv::common::TranslatableStringEntry;
use super::common::reconstruct_object_array_by_path_index;

#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct Learning {
    // level: u32, // Not needed for translation
    note: String,
    // skill_id: u32, // Not needed for translation
}

#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct ClassEntry {
    id: u32,
    // exp_params: [u32; 4], // Not needed
    // traits: Vec<Value>, // Not needed, complex and unlikely to contain direct translatable text
    learnings: Vec<Learning>,
    name: String,
    note: String,
    // params: Vec<Vec<u32>>, // Not needed
}

pub fn extract_strings(
    file_content: &str,
    source_file: &str, // e.g., "www/data/Classes.json"
) -> Result<Vec<TranslatableStringEntry>, String> {
    let classes: Vec<Option<ClassEntry>> = serde_json::from_str(file_content)
        .map_err(|e| format!("Failed to parse {}: {}. Content snippet: {:.100}", source_file, e, file_content.chars().take(100).collect::<String>()))?;

    let mut entries = Vec::new();

    for (index, class_option) in classes.iter().enumerate() {
        if let Some(class_data) = class_option {
            // Skip if id is 0, often a placeholder or invalid entry (common pattern)
            if class_data.id == 0 && index != 0 { // Allow id 0 if it's not the typical null first entry
                 // If we're strictly following the pattern of skipping ID 0, this should be just:
                 // if class_data.id == 0 { continue; }
                 // However, some games might use ID 0 for a "none" class that still has a name.
                 // For now, let's be less strict on ID 0 unless it's clearly a null placeholder.
                 // The typical RPG Maker MV pattern is `[null, {id:1,...}, {id:2,...}]`
                 // So, if `class_data.id == 0` and `index > 0` (meaning it's not the leading null),
                 // it *could* be intentional. Let's assume for now ID 0 is skippable if it's a non-first entry.
                 // A more robust way is to rely on `Option<ClassEntry>` and skip `None`s.
            }
            
            let object_id = class_data.id;

            // Handle name
            if !class_data.name.trim().is_empty() {
                entries.push(TranslatableStringEntry {
                    object_id,
                    text: class_data.name.clone(),
                    source_file: source_file.to_string(),
                    json_path: format!("[{}].name", index),
                });
            }

            // Handle note
            if !class_data.note.trim().is_empty() {
                entries.push(TranslatableStringEntry {
                    object_id,
                    text: class_data.note.clone(),
                    source_file: source_file.to_string(),
                    json_path: format!("[{}].note", index),
                });
            }

            // Handle learnings notes
            for (learning_idx, learning) in class_data.learnings.iter().enumerate() {
                if !learning.note.trim().is_empty() {
                    entries.push(TranslatableStringEntry {
                        object_id,
                        text: learning.note.clone(),
                        source_file: source_file.to_string(),
                        json_path: format!("[{}].learnings[{}].note", index, learning_idx),
                    });
                }
            }
        }
        // If class_option is None (e.g. the first element is often null), it's skipped naturally.
    }

    Ok(entries)
}

use serde_json::Value;
use crate::models::translation::TranslatedStringEntryFromFrontend;
use crate::error::CoreError;
use crate::utils::json_utils::update_value_at_path;

pub fn reconstruct_classes_json(
    original_json_str: &str,
    translations: Vec<&TranslatedStringEntryFromFrontend>,
) -> Result<String, CoreError> {
    super::common::reconstruct_object_array_by_path_index(
        original_json_str,
        &translations,
        "Classes.json"
    )
}


#[cfg(test)]
mod tests {
    use super::*;
    // Import TranslatableStringEntry from common for tests if not already globally available in this scope
    // No, `use super::*` brings in `TranslatableStringEntry` from the module's top level imports.

    #[test]
    fn test_extract_classes_strings_empty_learnings_note() {
        let json_content = r#"[
            null,
            {
                "id": 1,
                "expParams": [30,20,30,30],
                "traits": [],
                "learnings": [
                    {"level": 1, "note": "", "skillId": 8}
                ],
                "name": "Hero",
                "note": "The main protagonist.",
                "params": []
            }
        ]"#;
        let expected_entries = vec![
            TranslatableStringEntry {
                object_id: 1,
                text: "Hero".to_string(),
                source_file: "www/data/Classes.json".to_string(),
                json_path: "[1].name".to_string(),
            },
            TranslatableStringEntry {
                object_id: 1,
                text: "The main protagonist.".to_string(),
                source_file: "www/data/Classes.json".to_string(),
                json_path: "[1].note".to_string(),
            },
        ];
        let result = extract_strings(json_content, "www/data/Classes.json").unwrap();
        assert_eq!(result.len(), 2);
        for expected in expected_entries {
            assert!(result.contains(&expected), "Missing expected entry: {:?}", expected);
        }
    }

    #[test]
    fn test_extract_classes_strings_with_learnings_note() {
        let json_content = r#"[
            null,
            {
                "id": 1,
                "expParams": [30,20,30,30],
                "traits": [],
                "learnings": [
                    {"level": 1, "note": "Learns early", "skillId": 8},
                    {"level": 5, "note": "", "skillId": 10},
                    {"level": 10, "note": "Powerful skill!", "skillId": 12}
                ],
                "name": "Mage",
                "note": "Magic user.",
                "params": []
            }
        ]"#;
        let result = extract_strings(json_content, "www/data/Classes.json").unwrap();
        
        assert_eq!(result.len(), 4); // Name, Note, Learning Note 1, Learning Note 3

        let expected_name = TranslatableStringEntry {
            object_id: 1, text: "Mage".to_string(), source_file: "www/data/Classes.json".to_string(), json_path: "[1].name".to_string()
        };
        let expected_note = TranslatableStringEntry {
            object_id: 1, text: "Magic user.".to_string(), source_file: "www/data/Classes.json".to_string(), json_path: "[1].note".to_string()
        };
        let expected_learning1_note = TranslatableStringEntry {
            object_id: 1, text: "Learns early".to_string(), source_file: "www/data/Classes.json".to_string(), json_path: "[1].learnings[0].note".to_string()
        };
         let expected_learning3_note = TranslatableStringEntry {
            object_id: 1, text: "Powerful skill!".to_string(), source_file: "www/data/Classes.json".to_string(), json_path: "[1].learnings[2].note".to_string()
        };

        assert!(result.contains(&expected_name));
        assert!(result.contains(&expected_note));
        assert!(result.contains(&expected_learning1_note));
        assert!(result.contains(&expected_learning3_note));
    }

     #[test]
    fn test_empty_and_null_handling() {
        let json_content = r#"[
            null,
            {"id":1,"expParams":[30,20,30,30],"traits":[],"learnings":[],"name":"","note":"","params":[]},
            {"id":2,"expParams":[30,20,30,30],"traits":[],"learnings":[{"level":1,"note":"","skillId":1}],"name":"Warrior","note":"A strong fighter","params":[]}
        ]"#;
        let result = extract_strings(json_content, "www/data/Classes.json").unwrap();
        assert_eq!(result.len(), 2); // Only Warrior name and note
         let expected_warrior_name = TranslatableStringEntry {
            object_id: 2, text: "Warrior".to_string(), source_file: "www/data/Classes.json".to_string(), json_path: "[2].name".to_string()
        };
        let expected_warrior_note = TranslatableStringEntry {
            object_id: 2, text: "A strong fighter".to_string(), source_file: "www/data/Classes.json".to_string(), json_path: "[2].note".to_string()
        };
        assert!(result.contains(&expected_warrior_name));
        assert!(result.contains(&expected_warrior_note));
    }

    // Tests for reconstruct_classes_json
    const TEST_CLASSES_JSON_FOR_RECONSTRUCTION: &str = r#"[
        null,
        {
            "id": 1,
            "expParams": [30,20,30,30],
            "traits": [],
            "learnings": [
                {"level": 1, "note": "Initial Note 1", "skillId": 8},
                {"level": 5, "note": "", "skillId": 10},
                {"level": 10, "note": "Initial Note 3", "skillId": 12}
            ],
            "name": "Hero",
            "note": "The main protagonist.",
            "params": []
        },
        {
            "id": 2,
            "expParams": [25,25,25,25],
            "traits": [],
            "learnings": [],
            "name": "Sidekick",
            "note": "A trusty companion.",
            "params": []
        }
    ]"#;

    #[test]
    fn test_reconstruct_classes_basic() {
        let original_json_str = TEST_CLASSES_JSON_FOR_RECONSTRUCTION;
        let translations = vec![
            TranslatedStringEntryFromFrontend {
                object_id: 1,
                text: "Hero".to_string(),
                source_file: "www/data/Classes.json".to_string(),
                json_path: "[1].name".to_string(),
                translated_text: "Héroe".to_string(),
                error: None,
            },
            TranslatedStringEntryFromFrontend {
                object_id: 1,
                text: "The main protagonist.".to_string(),
                source_file: "www/data/Classes.json".to_string(),
                json_path: "[1].note".to_string(),
                translated_text: "El protagonista principal.".to_string(),
                error: None,
            },
            TranslatedStringEntryFromFrontend {
                object_id: 1,
                text: "Initial Note 1".to_string(),
                source_file: "www/data/Classes.json".to_string(),
                json_path: "[1].learnings[0].note".to_string(),
                translated_text: "Nota Inicial 1 Traducida".to_string(),
                error: None,
            },
            TranslatedStringEntryFromFrontend { // Test translating an empty learning note
                object_id: 1,
                text: "".to_string(), // Original was empty
                source_file: "www/data/Classes.json".to_string(),
                json_path: "[1].learnings[1].note".to_string(),
                translated_text: "Nota Aprendizaje 2 Traducida".to_string(),
                error: None,
            },
            TranslatedStringEntryFromFrontend {
                object_id: 2,
                text: "Sidekick".to_string(),
                source_file: "www/data/Classes.json".to_string(),
                json_path: "[2].name".to_string(),
                translated_text: "Compañero".to_string(),
                error: None,
            },
        ];
        let translations_ref: Vec<&TranslatedStringEntryFromFrontend> = translations.iter().collect();
        let result = reconstruct_classes_json(&original_json_str, translations_ref);
        assert!(result.is_ok(), "reconstruct_classes_json failed: {:?}", result.err());
        let reconstructed_json: Value = serde_json::from_str(&result.unwrap()).expect("Failed to parse reconstructed JSON");

        assert_eq!(reconstructed_json[1]["name"].as_str().unwrap(), "Héroe");
        assert_eq!(reconstructed_json[1]["note"].as_str().unwrap(), "El protagonista principal.");
        assert_eq!(reconstructed_json[1]["learnings"][0]["note"].as_str().unwrap(), "Nota Inicial 1 Traducida");
        assert_eq!(reconstructed_json[1]["learnings"][1]["note"].as_str().unwrap(), "Nota Aprendizaje 2 Traducida");
        assert_eq!(reconstructed_json[1]["learnings"][2]["note"].as_str().unwrap(), "Initial Note 3"); // Unchanged

        assert_eq!(reconstructed_json[2]["name"].as_str().unwrap(), "Compañero");
        assert_eq!(reconstructed_json[2]["note"].as_str().unwrap(), "A trusty companion."); // Unchanged
    }

    #[test]
    fn test_reconstruct_classes_with_translation_error() {
        let original_json_str = TEST_CLASSES_JSON_FOR_RECONSTRUCTION;
        let translations = vec![
            TranslatedStringEntryFromFrontend {
                object_id: 1,
                text: "Hero".to_string(),
                source_file: "www/data/Classes.json".to_string(),
                json_path: "[1].name".to_string(),
                translated_text: "FailName".to_string(),
                error: Some("AI error".to_string()),
            },
            TranslatedStringEntryFromFrontend {
                object_id: 1,
                text: "Initial Note 1".to_string(),
                source_file: "www/data/Classes.json".to_string(),
                json_path: "[1].learnings[0].note".to_string(),
                translated_text: "GoodLearningNote".to_string(),
                error: None,
            },
        ];
        let translations_ref: Vec<&TranslatedStringEntryFromFrontend> = translations.iter().collect();
        let result = reconstruct_classes_json(&original_json_str, translations_ref);
        assert!(result.is_ok());
        let reconstructed_json: Value = serde_json::from_str(&result.unwrap()).unwrap();

        assert_eq!(reconstructed_json[1]["name"].as_str().unwrap(), "Hero"); // Original due to error
        assert_eq!(reconstructed_json[1]["learnings"][0]["note"].as_str().unwrap(), "GoodLearningNote"); // Translated
    }

    #[test]
    fn test_reconstruct_classes_non_existent_id() {
        let original_json_str = TEST_CLASSES_JSON_FOR_RECONSTRUCTION;
        let translations = vec![
            TranslatedStringEntryFromFrontend {
                object_id: 999, 
                text: "Phantom Class".to_string(),
                source_file: "www/data/Classes.json".to_string(),
                json_path: "[1].name".to_string(), // Path points to existing class, but ID is wrong
                translated_text: "Fantasma".to_string(),
                error: None,
            },
        ];
        let translations_ref: Vec<&TranslatedStringEntryFromFrontend> = translations.iter().collect();
        let result = reconstruct_classes_json(&original_json_str, translations_ref);
        assert!(result.is_ok());
        let reconstructed_value: Value = serde_json::from_str(&result.unwrap()).unwrap();
        let original_value: Value = serde_json::from_str(original_json_str).unwrap();
        assert_eq!(reconstructed_value, original_value); // Should not change due to ID mismatch
    }

    #[test]
    fn test_reconstruct_classes_non_existent_json_path_index() {
        let original_json_str = TEST_CLASSES_JSON_FOR_RECONSTRUCTION;
        let translations = vec![
            TranslatedStringEntryFromFrontend {
                object_id: 1,
                text: "Value".to_string(),
                source_file: "www/data/Classes.json".to_string(),
                json_path: "[99].name".to_string(), // Class index 99 does not exist
                translated_text: "Translated Mystery".to_string(),
                error: None,
            },
        ];
        let translations_ref: Vec<&TranslatedStringEntryFromFrontend> = translations.iter().collect();
        let result = reconstruct_classes_json(&original_json_str, translations_ref);
        assert!(result.is_ok());
        let reconstructed_value: Value = serde_json::from_str(&result.unwrap()).unwrap();
        let original_value: Value = serde_json::from_str(original_json_str).unwrap();
        assert_eq!(reconstructed_value, original_value); // No change expected
    }
    
    #[test]
    fn test_reconstruct_classes_non_existent_json_path_field() {
        let original_json_str = TEST_CLASSES_JSON_FOR_RECONSTRUCTION;
        let translations = vec![
            TranslatedStringEntryFromFrontend {
                object_id: 1,
                text: "Value".to_string(),
                source_file: "www/data/Classes.json".to_string(),
                json_path: "[1].unknownField".to_string(), // Field "unknownField" does not exist
                translated_text: "Translated Unknown".to_string(),
                error: None,
            },
            TranslatedStringEntryFromFrontend {
                object_id: 1,
                text: "Value".to_string(),
                source_file: "www/data/Classes.json".to_string(),
                json_path: "[1].learnings[0].unknownSubField".to_string(), // Field "unknownSubField" does not exist
                translated_text: "Translated Deep Unknown".to_string(),
                error: None,
            },
        ];
        let translations_ref: Vec<&TranslatedStringEntryFromFrontend> = translations.iter().collect();
        let result = reconstruct_classes_json(&original_json_str, translations_ref);
        assert!(result.is_ok());
        let reconstructed_value: Value = serde_json::from_str(&result.unwrap()).unwrap();
        let original_value: Value = serde_json::from_str(original_json_str).unwrap();
        // update_value_at_path will log an error and not modify if path is invalid
        assert_eq!(reconstructed_value, original_value); 
    }

    #[test]
    fn test_reconstruct_classes_empty_translations_list() {
        let original_json_str = TEST_CLASSES_JSON_FOR_RECONSTRUCTION;
        let translations: Vec<TranslatedStringEntryFromFrontend> = Vec::new();        
        let translations_ref: Vec<&TranslatedStringEntryFromFrontend> = translations.iter().collect();
        let result = reconstruct_classes_json(&original_json_str, translations_ref);
        assert!(result.is_ok());
        let reconstructed_value: Value = serde_json::from_str(&result.unwrap()).unwrap();
        let original_value: Value = serde_json::from_str(original_json_str).unwrap();
        assert_eq!(reconstructed_value, original_value);
    }

    #[test]
    fn test_reconstruct_classes_invalid_original_json() {
        let original_json_str = r#"[null, {"id":1, "name":"Hero", "note":"Broken"#; 
        let translations = vec![/* ... */];
        let translations_ref: Vec<&TranslatedStringEntryFromFrontend> = translations.iter().collect();
        let result = reconstruct_classes_json(original_json_str, translations_ref);
        assert!(result.is_err());
        match result.err().unwrap() {
            CoreError::JsonParse(_) => { /* Expected */ },
            other => panic!("Expected JsonParse error, got {:?}", other),
        }
    }
} 