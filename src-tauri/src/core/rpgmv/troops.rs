use serde::Deserialize;
use serde_json::Value;
use crate::models::translation::{SourceStringData, WorkingTranslation};
use crate::core::rpgmv::common::{
    EventCommand, 
    extract_translatable_strings_from_event_command_list,
    reconstruct_event_command_list
};
use crate::error::CoreError;
use crate::utils::json_utils::update_value_at_path;

#[derive(Deserialize, Debug, Clone)]
struct TroopPage {
    // conditions: Value, // Not needed for string extraction
    list: Vec<EventCommand>,
    // span: u32, // Not needed for string extraction
}

#[derive(Deserialize, Debug)]
struct Troop {
    id: u32,
    name: String,
    // members: Vec<Value>, // Not needed for string extraction
    pages: Vec<TroopPage>,
}

pub fn extract_strings(
    file_content: &str,
    source_file: &str,
) -> Result<Vec<SourceStringData>, String> {
    let troops_json: Value = serde_json::from_str(file_content)
        .map_err(|e| format!("Failed to parse Troops.json: {}", e))?;

    let mut entries = Vec::new();

    if let Value::Array(troops_array) = troops_json {
        for (troop_idx, troop_value) in troops_array.iter().enumerate() {
            if troop_idx == 0 && troop_value.is_null() { // RPG Maker arrays are often 1-indexed with a null at [0]
                continue;
            }
            if troop_value.is_null() {
                continue;
            }

            match serde_json::from_value::<Troop>(troop_value.clone()) {
                Ok(troop) => {
                    if troop.id == 0 { // Should not happen for valid troops if index 0 is null
                        continue;
                    }

                    // 1. Extract Troop Name
                    if !troop.name.trim().is_empty() {
                        entries.push(SourceStringData {
                            object_id: troop.id,
                            original_text: troop.name.clone(),
                            source_file: source_file.to_string(),
                            json_path: format!("[{}].name", troop_idx),
                        });
                    }

                    // 2. Extract from Event Pages using the helper
                    for (page_idx, page) in troop.pages.iter().enumerate() {
                        let json_path_prefix = format!("[{}].pages[{}].list", troop_idx, page_idx);
                        let mut command_entries = extract_translatable_strings_from_event_command_list(
                            &page.list,
                            troop.id,
                            source_file,
                            &json_path_prefix,
                        );
                        entries.append(&mut command_entries);
                    }
                }
                Err(e) => {
                    eprintln!(
                        "Skipping troop entry at index {} due to parsing error: {}. Value: {}",
                        troop_idx,
                        e,
                        troop_value
                    );
                }
            }
        }
    } else {
        return Err("Troops.json is not a JSON array.".to_string());
    }

    Ok(entries)
} 


pub fn reconstruct_troops_json(
    original_json_str: &str,
    translations: Vec<&WorkingTranslation>,
) -> Result<String, CoreError> {
    let mut troops_json_array: Vec<Value> = serde_json::from_str(original_json_str)
        .map_err(|e| CoreError::JsonParse(format!("Failed to parse Troops.json: {}", e)))?;

    for entry in &translations {
        let parts: Vec<&str> = entry.json_path.splitn(4, '.').collect(); // e.g., "[1].name" or "[1].pages.[0].list"

        if parts.len() < 2 || !parts[0].starts_with('[') || !parts[0].ends_with(']') {
            eprintln!("Warning (Troops.json): Invalid json_path format for entry: {:?}. Skipping.", entry);
            continue;
        }

        let troop_index_str = &parts[0][1..parts[0].len()-1];
        let troop_index: usize = match troop_index_str.parse() {
            Ok(idx) => idx,
            Err(_) => {
                eprintln!("Warning (Troops.json): Failed to parse troop index from path: {}. Skipping.", entry.json_path);
                continue;
            }
        };

        if troop_index >= troops_json_array.len() || troops_json_array[troop_index].is_null() {
            eprintln!("Warning (Troops.json): Troop index {} out of bounds or null. Skipping entry: {:?}.", troop_index, entry);
            continue;
        }
        
        let troop_object_id = troops_json_array[troop_index].get("id")
            .and_then(|id_val| id_val.as_u64())
            .map_or(0, |id| id as u32);

        if troop_object_id != entry.object_id {
            eprintln!(
                "Warning (Troops.json): Mismatched object_id for troop_index {}. Expected {}, found in translation {}. Skipping entry: {:?}.",
                troop_index, troop_object_id, entry.object_id, entry
            );
            continue;
        }

        let text_to_insert = if entry.error.is_some() {
            &entry.original_text
        } else {
            &entry.translated_text
        };

        if parts.len() == 2 && parts[1] == "name" { // Path like "[1].name"
            if let Some(troop_value_mut) = troops_json_array.get_mut(troop_index) {
                if let Err(e) = update_value_at_path(troop_value_mut, "name", text_to_insert) {
                    eprintln!(
                        "Warning (Troops.json): Failed to update name for troop id {}: {}. Skipping update for this field.", 
                        entry.object_id, e.to_string()
                    );
                }
            }
        } else if parts.len() > 3 && parts[1] == "pages" && parts[3] == "list" { // Path like "[1].pages.[0].list..."
            // This will be handled by iterating through pages and calling reconstruct_event_command_list
        } else {
             eprintln!("Warning (Troops.json): Unhandled json_path structure for direct update: {} for entry: {:?}", entry.json_path, entry);
        }
    }

    // Iterate again for pages and their command lists
    for troop_idx_val in 0..troops_json_array.len() {
        if troops_json_array[troop_idx_val].is_null() { continue; }

        let current_troop_id = troops_json_array[troop_idx_val].get("id")
            .and_then(|id| id.as_u64())
            .map_or(0, |id| id as u32);
        if current_troop_id == 0 { continue; }

        if let Some(pages_value) = troops_json_array[troop_idx_val].get_mut("pages") {
            if let Value::Array(pages_array) = pages_value {
                for page_idx in 0..pages_array.len() {
                    let page_json_path_prefix = format!("[{}].pages.[{}].list", troop_idx_val, page_idx);
                    
                    let relevant_translations_for_page: Vec<&WorkingTranslation> = translations
                        .iter()
                        .filter(|t| t.object_id == current_troop_id && t.json_path.starts_with(&page_json_path_prefix))
                        .map(|&t_ref| t_ref)
                        .collect();

                    if !relevant_translations_for_page.is_empty() {
                        if let Some(list_value) = pages_array[page_idx].get_mut("list") {
                            if let Value::Array(list_array) = list_value {
                                match reconstruct_event_command_list(list_array, current_troop_id, &relevant_translations_for_page, &page_json_path_prefix) {
                                    Ok(_) => { /* Successfully updated list */ }
                                    Err(e) => {
                                        eprintln!(
                                            "Error reconstructing command list for troop id {}, page {}: {}. List might be partially updated.", 
                                            current_troop_id, page_idx, e
                                        );
                                    }
                                }
                            } else {
                                eprintln!("Warning (Troops.json): 'list' field for troop id {}, page {} is not an array.", current_troop_id, page_idx);
                            }
                        } else {
                            eprintln!("Warning (Troops.json): No 'list' field found for troop id {}, page {}.", current_troop_id, page_idx);
                        }
                    }
                }
            } else {
                 eprintln!("Warning (Troops.json): 'pages' field for troop id {} is not an array.", current_troop_id);
            }
        } // No pages field, or not an array
    }


    serde_json::to_string_pretty(&troops_json_array)
        .map_err(|e| CoreError::JsonSerialize(format!("Failed to serialize Troops.json: {}", e)))
}


#[cfg(test)]
mod tests {
    use super::*;

    const TEST_TROOPS_JSON: &str = r#"[
        null,
        {
            "id": 1,
            "members": [],
            "name": "こうもり*2",
            "pages": [
                {
                    "conditions": {"turnValid": false},
                    "list": [
                        {"code":101,"indent":0,"parameters":["BatFace.png",0,0,2,"Bat A"]},
                        {"code":401,"indent":0,"parameters":["Screech!"]}
                    ],
                    "span": 0
                }
            ]
        },
        {
            "id": 9,
            "members": [],
            "name": "サンプル4　暗殺者",
            "pages": [
                {
                    "conditions": {"turnValid": true},
                    "list": [
                        {"code":121,"indent":0,"parameters":[1,1,0]},
                        {"code":101,"indent":0,"parameters":["",0,0,2]},
                        {"code":401,"indent":0,"parameters":["だ、誰だお前は！！！"]},
                        {"code":101,"indent":0,"parameters":["主人公1-3",0,0,2]},
                        {"code":401,"indent":0,"parameters":["暗殺者："]},
                        {"code":401,"indent":0,"parameters":["お前の命を頂きに来た。"]},
                        {"code":401,"indent":0,"parameters":["観念するんだな・・。"]}
                    ],
                    "span": 0
                },
                {
                    "conditions": {"turnValid": false, "enemyHp": 50, "enemyIndex": 0},
                     "list": [
                        {"code":108,"indent":0,"parameters":["Second page comment"]}
                    ],
                    "span": 1
                }
            ]
        }
    ]"#;

    #[test]
    fn test_reconstruct_troops_basic() {
        let original_json_str = TEST_TROOPS_JSON;
        let translations = vec![
            WorkingTranslation {
                object_id: 1,
                original_text: "こうもり*2".to_string(),
                source_file: "www/data/Troops.json".to_string(),
                json_path: "[1].name".to_string(),
                translated_text: "Bat*2 (EN)".to_string(),
                translation_source: "test".to_string(),
                error: None,
            },
            WorkingTranslation {
                object_id: 1,
                original_text: "Bat A".to_string(),
                source_file: "www/data/Troops.json".to_string(),
                json_path: "[1].pages.[0].list.[0].parameters.[4]".to_string(),
                translated_text: "Murciélago A".to_string(),
                translation_source: "test".to_string(),
                error: None,
            },
            WorkingTranslation {
                object_id: 1,
                original_text: "Screech!".to_string(),
                source_file: "www/data/Troops.json".to_string(),
                json_path: "[1].pages.[0].list.[1].parameters.[0]".to_string(),
                translated_text: "¡Chillido!".to_string(),
                translation_source: "test".to_string(),
                error: None,
            },
            WorkingTranslation {
                object_id: 9,
                original_text: "サンプル4　暗殺者".to_string(),
                source_file: "www/data/Troops.json".to_string(),
                json_path: "[2].name".to_string(),
                translated_text: "Sample 4 Assassin (EN)".to_string(),
                translation_source: "test".to_string(),
                error: None,
            },
            WorkingTranslation {
                object_id: 9,
                original_text: "だ、誰だお前は！！！".to_string(),
                source_file: "www/data/Troops.json".to_string(),
                json_path: "[2].pages.[0].list.[2].parameters.[0]".to_string(),
                translated_text: "W-who are you!!! (EN)".to_string(),
                translation_source: "test".to_string(),
                error: None,
            },
            WorkingTranslation {
                object_id: 9,
                original_text: "Second page comment".to_string(),
                source_file: "www/data/Troops.json".to_string(),
                json_path: "[2].pages.[1].list.[0].parameters.[0]".to_string(),
                translated_text: "Comentario de segunda página".to_string(),
                translation_source: "test".to_string(),
                error: None,
            },
        ];
        let translations_ref: Vec<&WorkingTranslation> = translations.iter().collect();

        let result = reconstruct_troops_json(&original_json_str, translations_ref);
        assert!(result.is_ok(), "reconstruct_troops_json failed: {:?}", result.err());
        let reconstructed_json_str = result.unwrap();
        let reconstructed_json: Value = serde_json::from_str(&reconstructed_json_str).expect("Failed to parse reconstructed JSON");
        
        assert_eq!(reconstructed_json[1]["name"].as_str().unwrap(), "Bat*2 (EN)");
        assert_eq!(reconstructed_json[1]["pages"][0]["list"][0]["parameters"][4].as_str().unwrap(), "Murciélago A");
        assert_eq!(reconstructed_json[1]["pages"][0]["list"][1]["parameters"][0].as_str().unwrap(), "¡Chillido!");
        
        assert_eq!(reconstructed_json[2]["name"].as_str().unwrap(), "Sample 4 Assassin (EN)");
        assert_eq!(reconstructed_json[2]["pages"][0]["list"][2]["parameters"][0].as_str().unwrap(), "W-who are you!!! (EN)");
        assert_eq!(reconstructed_json[2]["pages"][1]["list"][0]["parameters"][0].as_str().unwrap(), "Comentario de segunda página");
        
        // Check non-translated parts
        assert_eq!(reconstructed_json[2]["pages"][0]["list"][3]["parameters"][0].as_str().unwrap(), "主人公1-3");
    }

    #[test]
    fn test_reconstruct_troops_with_translation_error() {
        let original_json_str = TEST_TROOPS_JSON;
        let translations = vec![
            WorkingTranslation {
                object_id: 1,
                original_text: "こうもり*2".to_string(),
                source_file: "www/data/Troops.json".to_string(),
                json_path: "[1].name".to_string(),
                translated_text: "Bat*2 (Failed)".to_string(),
                translation_source: "test".to_string(),
                error: Some("AI Error".to_string()),
            },
            WorkingTranslation {
                object_id: 1,
                original_text: "Screech!".to_string(),
                source_file: "www/data/Troops.json".to_string(),
                json_path: "[1].pages.[0].list.[1].parameters.[0]".to_string(),
                translated_text: "¡Chillido! (Bueno)".to_string(),
                translation_source: "test".to_string(),
                error: None,
            },
        ];
        let translations_ref: Vec<&WorkingTranslation> = translations.iter().collect();
        let result = reconstruct_troops_json(&original_json_str, translations_ref);
        assert!(result.is_ok());
        let reconstructed_json: Value = serde_json::from_str(&result.unwrap()).unwrap();

        assert_eq!(reconstructed_json[1]["name"].as_str().unwrap(), "こうもり*2");
        assert_eq!(reconstructed_json[1]["pages"][0]["list"][1]["parameters"][0].as_str().unwrap(), "¡Chillido! (Bueno)");
    }

    #[test]
    fn test_reconstruct_troops_non_existent_id_in_json_path() {
        let original_json_str = TEST_TROOPS_JSON;
        let translations = vec![
            WorkingTranslation {
                object_id: 1,
                original_text: "Data".to_string(),
                source_file: "www/data/Troops.json".to_string(),
                json_path: "[99].name".to_string(),
                translated_text: "Phantom Name".to_string(),
                translation_source: "test".to_string(),
                error: None,
            },
        ];
        let translations_ref: Vec<&WorkingTranslation> = translations.iter().collect();
        let result = reconstruct_troops_json(&original_json_str, translations_ref);
        assert!(result.is_ok());
        let reconstructed_value: Value = serde_json::from_str(&result.unwrap()).expect("Failed to parse reconstructed");
        let original_value: Value = serde_json::from_str(original_json_str).expect("Failed to parse original");
        assert_eq!(reconstructed_value, original_value);
    }

     #[test]
    fn test_reconstruct_troops_id_mismatch_between_path_and_entry() {
        let original_json_str = TEST_TROOPS_JSON;
        let translations = vec![
            WorkingTranslation {
                object_id: 9,
                original_text: "こうもり*2".to_string(),
                source_file: "www/data/Troops.json".to_string(),
                json_path: "[1].name".to_string(),
                translated_text: "Mismatched Name".to_string(),
                translation_source: "test".to_string(),
                error: None,
            },
        ];
        let translations_ref: Vec<&WorkingTranslation> = translations.iter().collect();
        let result = reconstruct_troops_json(&original_json_str, translations_ref);
        assert!(result.is_ok());
        let reconstructed_value: Value = serde_json::from_str(&result.unwrap()).expect("Failed to parse reconstructed");
        let original_value: Value = serde_json::from_str(original_json_str).expect("Failed to parse original");
        assert_eq!(reconstructed_value, original_value); 
    }


    #[test]
    fn test_reconstruct_troops_non_existent_internal_path() {
        let original_json_str = TEST_TROOPS_JSON;
        let translations = vec![
            WorkingTranslation {
                object_id: 1,
                original_text: "Value".to_string(),
                source_file: "www/data/Troops.json".to_string(),
                json_path: "[1].inventedField".to_string(),
                translated_text: "Translated Invented".to_string(),
                translation_source: "test".to_string(),
                error: None,
            },
            WorkingTranslation {
                object_id: 1,
                original_text: "Value".to_string(),
                source_file: "www/data/Troops.json".to_string(),
                json_path: "[1].pages.[0].list.[0].parameters.[99]".to_string(),
                translated_text: "Translated Deep Invented".to_string(),
                translation_source: "test".to_string(),
                error: None,
            },
        ];
        let translations_ref: Vec<&WorkingTranslation> = translations.iter().collect();
        let result = reconstruct_troops_json(&original_json_str, translations_ref);
        assert!(result.is_ok());
        let reconstructed_value: Value = serde_json::from_str(&result.unwrap()).expect("Failed to parse reconstructed");
        let original_value: Value = serde_json::from_str(original_json_str).expect("Failed to parse original");
        assert_eq!(reconstructed_value, original_value);
    }
    
    #[test]
    fn test_reconstruct_troops_empty_translations_list() {
        let original_json_str = TEST_TROOPS_JSON;
        let translations: Vec<WorkingTranslation> = Vec::new();        
        let translations_ref: Vec<&WorkingTranslation> = translations.iter().collect();
        let result = reconstruct_troops_json(&original_json_str, translations_ref);
        assert!(result.is_ok());
        let reconstructed_value: Value = serde_json::from_str(&result.unwrap()).expect("Failed to parse reconstructed");
        let original_value: Value = serde_json::from_str(original_json_str).expect("Failed to parse original");
        assert_eq!(reconstructed_value, original_value);
    }

    #[test]
    fn test_reconstruct_troops_invalid_original_json() {
        let original_json_str = r#"[null, {"id":1, "name":"Bat"}]Broken"#; 
        let translations = vec![ /* ... */ ];
        let translations_ref: Vec<&WorkingTranslation> = translations.iter().collect();
        let result = reconstruct_troops_json(original_json_str, translations_ref);
        assert!(result.is_err());
        match result.err().unwrap() {
            CoreError::JsonParse(_) => { /* Expected */ },
            other => panic!("Expected JsonParse error, got {:?}", other),
        }
    }
} 