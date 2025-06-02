use serde::Deserialize;
use crate::models::translation::{SourceStringData, WorkingTranslation};
use super::common::reconstruct_object_array_by_path_index;
use crate::error::CoreError;

#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct MapInfoEntry {
    id: u32,
    name: String,
    // parent_id: u32, // Not needed for translation
    // order: u32,     // Not needed for translation
    // expanded: bool, // Not needed for translation
    // scroll_x: f64,  // Not needed for translation
    // scroll_y: f64,  // Not needed for translation
}

pub fn extract_strings(
    file_content: &str,
    source_file: &str, // e.g., "www/data/MapInfos.json"
) -> Result<Vec<SourceStringData>, String> {
    let map_infos: Vec<Option<MapInfoEntry>> = serde_json::from_str(file_content)
        .map_err(|e| format!("Failed to parse {}: {}. Content snippet: {:.100}", source_file, e, file_content.chars().take(100).collect::<String>()))?;

    let mut entries = Vec::new();

    for (index, map_info_option) in map_infos.iter().enumerate() {
        if index == 0 && map_info_option.is_none() {
            // Common RPG Maker pattern: first element is null.
            continue;
        }

        if let Some(map_info) = map_info_option {
            if map_info.id == 0 { // Skip if id is 0, placeholder or invalid
                continue;
            }
            if !map_info.name.trim().is_empty() {
                entries.push(SourceStringData {
                    object_id: map_info.id,
                    original_text: map_info.name.clone(),
                    source_file: source_file.to_string(),
                    json_path: format!("[{}].name", index), // Use original index from JSON array
                });
            }
        }
        // No need to log other nulls explicitly unless debugging, as Vec<Option<T>> handles it.
    }

    Ok(entries)
}

pub fn reconstruct_map_infos_json(
    original_json_str: &str,
    translations: Vec<&WorkingTranslation>,
) -> Result<String, CoreError> {
    reconstruct_object_array_by_path_index(
        original_json_str,
        &translations,
        "MapInfos.json"
    )
}

#[cfg(test)]
mod tests {
    use super::*; 
    use serde_json::Value;

    const TEST_MAP_INFOS_JSON: &str = r#"[
        null,
        {"id":1,"expanded":false,"name":"Test Map 1","order":1,"parentId":0,"scrollX":0,"scrollY":0},
        {"id":2,"expanded":false,"name":"Another Map","order":2,"parentId":1,"scrollX":0,"scrollY":0},
        {"id":3,"expanded":true,"name":"Empty Name Map","order":3,"parentId":0,"scrollX":0,"scrollY":0},
        {"id":4,"expanded":false,"name":"テストマップ","order":4,"parentId":0,"scrollX":0,"scrollY":0}
    ]"#;

    #[test]
    fn test_reconstruct_map_infos_basic() {
        let original_json_str = TEST_MAP_INFOS_JSON;
        let translations = vec![
            WorkingTranslation {
                object_id: 1,
                original_text: "Test Map 1".to_string(),
                source_file: "www/data/MapInfos.json".to_string(),
                json_path: "[1].name".to_string(),
                translated_text: "Carte de Test 1".to_string(),
                translation_source: "test".to_string(),
                error: None,
            },
            WorkingTranslation {
                object_id: 4,
                original_text: "テストマップ".to_string(),
                source_file: "www/data/MapInfos.json".to_string(),
                json_path: "[4].name".to_string(),
                translated_text: "テストマップ (TL)".to_string(),
                translation_source: "test".to_string(),
                error: None,
            },
        ];
        let translations_ref: Vec<&WorkingTranslation> = translations.iter().collect();

        let result = reconstruct_map_infos_json(&original_json_str, translations_ref);
        assert!(result.is_ok(), "reconstruct_map_infos_json failed: {:?}", result.err());
        let reconstructed_json_str = result.unwrap();
        let reconstructed_json: Value = serde_json::from_str(&reconstructed_json_str).expect("Failed to parse reconstructed JSON");

        assert_eq!(reconstructed_json[1]["name"].as_str().unwrap(), "Carte de Test 1");
        assert_eq!(reconstructed_json[1]["id"].as_u64().unwrap(), 1);
        assert_eq!(reconstructed_json[2]["name"].as_str().unwrap(), "Another Map"); // Unchanged
        assert_eq!(reconstructed_json[4]["name"].as_str().unwrap(), "テストマップ (TL)");
    }

    #[test]
    fn test_reconstruct_map_infos_with_translation_error() {
        let original_json_str = TEST_MAP_INFOS_JSON;
        let translations = vec![
            WorkingTranslation {
                object_id: 1,
                original_text: "Test Map 1".to_string(),
                source_file: "www/data/MapInfos.json".to_string(),
                json_path: "[1].name".to_string(),
                translated_text: "Fail Map".to_string(),
                translation_source: "test".to_string(),
                error: Some("AI boom".to_string()),
            },
            WorkingTranslation {
                object_id: 2,
                original_text: "Another Map".to_string(),
                source_file: "www/data/MapInfos.json".to_string(),
                json_path: "[2].name".to_string(),
                translated_text: "Autre Carte".to_string(),
                translation_source: "test".to_string(),
                error: None,
            },
        ];
        let translations_ref: Vec<&WorkingTranslation> = translations.iter().collect();
        let result = reconstruct_map_infos_json(&original_json_str, translations_ref);
        assert!(result.is_ok());
        let reconstructed_json: Value = serde_json::from_str(&result.unwrap()).unwrap();

        assert_eq!(reconstructed_json[1]["name"].as_str().unwrap(), "Test Map 1"); // Original due to error
        assert_eq!(reconstructed_json[2]["name"].as_str().unwrap(), "Autre Carte"); // Translated
    }

    #[test]
    fn test_reconstruct_map_infos_non_existent_index_in_path() {
        let original_json_str = TEST_MAP_INFOS_JSON;
        let translations = vec![
            WorkingTranslation {
                object_id: 1, 
                original_text: "Data".to_string(),
                source_file: "www/data/MapInfos.json".to_string(),
                json_path: "[99].name".to_string(), // Index 99 does not exist
                translated_text: "Phantom Name".to_string(),
                translation_source: "test".to_string(),
                error: None,
            },
        ];
        let translations_ref: Vec<&WorkingTranslation> = translations.iter().collect();
        let result = reconstruct_map_infos_json(&original_json_str, translations_ref);
        assert!(result.is_ok());
        let reconstructed_value: Value = serde_json::from_str(&result.unwrap()).expect("Failed to parse reconstructed");
        let original_value: Value = serde_json::from_str(original_json_str).expect("Failed to parse original");
        assert_eq!(reconstructed_value, original_value); // Expect no change
    }

    #[test]
    fn test_reconstruct_map_infos_id_mismatch() {
        let original_json_str = TEST_MAP_INFOS_JSON;
        let translations = vec![
            WorkingTranslation {
                object_id: 55, // This ID does not match ID 1 at index [1]
                original_text: "Test Map 1".to_string(),
                source_file: "www/data/MapInfos.json".to_string(),
                json_path: "[1].name".to_string(), 
                translated_text: "Mismatched ID Map".to_string(),
                translation_source: "test".to_string(),
                error: None,
            },
        ];
        let translations_ref: Vec<&WorkingTranslation> = translations.iter().collect();
        let result = reconstruct_map_infos_json(&original_json_str, translations_ref);
        assert!(result.is_ok());
        let reconstructed_value: Value = serde_json::from_str(&result.unwrap()).expect("Failed to parse reconstructed");
        let original_value: Value = serde_json::from_str(original_json_str).expect("Failed to parse original");
        assert_eq!(reconstructed_value, original_value); // Expect no change due to ID mismatch check
    }

    #[test]
    fn test_reconstruct_map_infos_invalid_json_path_format() {
        let original_json_str = TEST_MAP_INFOS_JSON;
        let translations = vec![
            WorkingTranslation {
                object_id: 1,
                original_text: "Test Map 1".to_string(),
                source_file: "www/data/MapInfos.json".to_string(),
                json_path: "MapInfos[1].name".to_string(), // Invalid format, missing dot or wrong field
                translated_text: "Bad Path Map".to_string(),
                translation_source: "test".to_string(),
                error: None,
            },
            WorkingTranslation {
                object_id: 2,
                original_text: "Another Map".to_string(),
                source_file: "www/data/MapInfos.json".to_string(),
                json_path: "[2].description".to_string(), // Invalid field name for reconstruction
                translated_text: "Bad Field Map".to_string(),
                translation_source: "test".to_string(),
                error: None,
            },
        ];
        let translations_ref: Vec<&WorkingTranslation> = translations.iter().collect();
        let result = reconstruct_map_infos_json(&original_json_str, translations_ref);
        assert!(result.is_ok());
        let reconstructed_value: Value = serde_json::from_str(&result.unwrap()).expect("Failed to parse reconstructed");
        let original_value: Value = serde_json::from_str(original_json_str).expect("Failed to parse original");
        assert_eq!(reconstructed_value, original_value);
    }

    #[test]
    fn test_reconstruct_map_infos_empty_translations_list() {
        let original_json_str = TEST_MAP_INFOS_JSON;
        let translations: Vec<WorkingTranslation> = Vec::new();
        let translations_ref: Vec<&WorkingTranslation> = translations.iter().collect();
        let result = reconstruct_map_infos_json(&original_json_str, translations_ref);
        assert!(result.is_ok());
        let reconstructed_value: Value = serde_json::from_str(&result.unwrap()).expect("Failed to parse reconstructed");
        let original_value: Value = serde_json::from_str(original_json_str).expect("Failed to parse original");
        assert_eq!(reconstructed_value, original_value);
    }

    #[test]
    fn test_reconstruct_map_infos_invalid_original_json() {
        let original_json_str = r#"[null, {"id":1, "name":"Map1" broken}]"#;
        let translations: Vec<WorkingTranslation> = vec![/* ... */];
        let translations_ref: Vec<&WorkingTranslation> = translations.iter().collect();
        let result = reconstruct_map_infos_json(&original_json_str, translations_ref);
        assert!(result.is_err());
        match result.err().unwrap() {
            CoreError::JsonParse(_) => { /* Expected */ }
            other => panic!("Expected JsonParse error, got {:?}", other),
        }
    }
} 