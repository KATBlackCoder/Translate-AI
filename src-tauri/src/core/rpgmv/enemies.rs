use serde::Deserialize;
use crate::models::translation::{SourceStringData, WorkingTranslation};
use crate::error::CoreError;
use super::common::{    
    RpgMvDataObject,
    extract_strings_from_json_array,
    reconstruct_object_array_by_id
};
// Value and update_value_at_path are not directly used here, handled by common helper

#[derive(Deserialize, Debug)]
struct Enemy {
    id: u32,
    name: String,
    note: String,
}

impl RpgMvDataObject for Enemy {
    fn get_id(&self) -> u32 {
        self.id
    }

    fn get_translatable_fields(&self) -> Vec<(&'static str, &String)> {
        vec![
            ("name", &self.name),
            ("note", &self.note),
        ]
    }
}

pub fn extract_strings(
    file_content: &str,
    source_file: &str,
) -> Result<Vec<SourceStringData>, String> { // Updated return type
    extract_strings_from_json_array::<Enemy>(file_content, source_file, "Enemies.json")
}

pub fn reconstruct_enemies_json(
    original_json_str: &str,
    translations: Vec<&WorkingTranslation>, // Updated parameter type
) -> Result<String, CoreError> {
    reconstruct_object_array_by_id( // Direct call
        original_json_str,
        &translations,
        "Enemies.json"
    )
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::Value; // Value is used in tests for assertions

    const TEST_ENEMIES_JSON: &str = r#"[
        null,
        {"id":1,"actions":[{"conditionParam1":0,"conditionParam2":0,"conditionType":0,"rating":5,"skillId":1}],"battlerHue":0,"battlerName":"Bat","dropItems":[{"dataId":1,"denominator":1,"kind":0},{"dataId":1,"denominator":1,"kind":0},{"dataId":1,"denominator":1,"kind":0}],"exp":0,"traits":[{"code":22,"dataId":0,"value":0.95},{"code":22,"dataId":1,"value":0.05},{"code":31,"dataId":1,"value":0}],"gold":0,"name":"こうもり","note":"","params":[200,0,30,30,30,30,30,30]},
        {"id":2,"actions":[{"conditionParam1":0,"conditionParam2":0,"conditionType":0,"rating":5,"skillId":1}],"battlerHue":0,"battlerName":"Slime","dropItems":[{"dataId":1,"denominator":1,"kind":0},{"dataId":1,"denominator":1,"kind":0},{"dataId":1,"denominator":1,"kind":0}],"exp":0,"traits":[{"code":22,"dataId":0,"value":0.95},{"code":22,"dataId":1,"value":0.05},{"code":31,"dataId":1,"value":0}],"gold":0,"name":"スライム","note":"A very slimy creature.","params":[250,0,30,30,30,30,30,30]},
        {"id":7,"actions":[{"conditionParam1":0,"conditionParam2":0,"conditionType":0,"rating":5,"skillId":81}],"battlerHue":0,"battlerName":"Ogre (3)","dropItems":[{"dataId":1,"denominator":1,"kind":0},{"dataId":1,"denominator":1,"kind":0},{"dataId":1,"denominator":1,"kind":0}],"exp":0,"traits":[],"gold":0,"name":"サンプルエネミー1","note":"基本攻撃は拘束衣用の攻撃","params":[1500,0,30,30,30,30,30,30]}
    ]"#;

    #[test]
    fn test_reconstruct_enemies_basic() {
        let original_json_str = TEST_ENEMIES_JSON;
        let translations = vec![
            WorkingTranslation { // Updated struct and fields
                object_id: 1,
                original_text: "こうもり".to_string(),
                source_file: "www/data/Enemies.json".to_string(),
                json_path: "name".to_string(),
                translated_text: "Bat (EN)".to_string(),
                translation_source: "test_source".to_string(),
                error: None,
            },
            WorkingTranslation { // Updated struct and fields
                object_id: 1,
                original_text: "".to_string(),
                source_file: "www/data/Enemies.json".to_string(),
                json_path: "note".to_string(),
                translated_text: "A nocturnal flying mammal.".to_string(),
                translation_source: "test_source".to_string(),
                error: None,
            },
            WorkingTranslation { // Updated struct and fields
                object_id: 7,
                original_text: "サンプルエネミー1".to_string(),
                source_file: "www/data/Enemies.json".to_string(),
                json_path: "name".to_string(),
                translated_text: "Sample Enemy 1 (EN)".to_string(),
                translation_source: "test_source".to_string(),
                error: None,
            },
            WorkingTranslation { // Updated struct and fields
                object_id: 7,
                original_text: "基本攻撃は拘束衣用の攻撃".to_string(),
                source_file: "www/data/Enemies.json".to_string(),
                json_path: "note".to_string(),
                translated_text: "Basic attack is for straitjackets.".to_string(),
                translation_source: "test_source".to_string(),
                error: None,
            },
        ];
        let translations_ref: Vec<&WorkingTranslation> = translations.iter().collect();

        let result = reconstruct_enemies_json(&original_json_str, translations_ref);
        assert!(result.is_ok(), "reconstruct_enemies_json failed: {:?}", result.err());
        let reconstructed_json_str = result.unwrap();
        let reconstructed_json: Value = serde_json::from_str(&reconstructed_json_str).expect("Failed to parse reconstructed JSON");

        assert_eq!(reconstructed_json[1]["name"].as_str().unwrap(), "Bat (EN)");
        assert_eq!(reconstructed_json[1]["note"].as_str().unwrap(), "A nocturnal flying mammal.");
        assert_eq!(reconstructed_json[1]["battlerName"].as_str().unwrap(), "Bat");

        assert_eq!(reconstructed_json[3]["name"].as_str().unwrap(), "Sample Enemy 1 (EN)");
        assert_eq!(reconstructed_json[3]["note"].as_str().unwrap(), "Basic attack is for straitjackets.");
    }

    #[test]
    fn test_reconstruct_enemies_with_translation_error() {
        let original_json_str = TEST_ENEMIES_JSON;
        let translations = vec![
            WorkingTranslation { // Updated struct and fields
                object_id: 1, 
                original_text: "こうもり".to_string(), 
                source_file: "www/data/Enemies.json".to_string(),
                json_path: "name".to_string(),
                translated_text: "BatFail".to_string(),
                translation_source: "test_source".to_string(),
                error: Some("AI error".to_string()), 
            },
            WorkingTranslation { // Updated struct and fields
                object_id: 2, 
                original_text: "A very slimy creature.".to_string(),
                source_file: "www/data/Enemies.json".to_string(),
                json_path: "note".to_string(),
                translated_text: "A translation for the slime note.".to_string(), 
                translation_source: "test_source".to_string(),
                error: None,
            },
        ];
        let translations_ref: Vec<&WorkingTranslation> = translations.iter().collect();
        let result = reconstruct_enemies_json(&original_json_str, translations_ref);
        assert!(result.is_ok());
        let reconstructed_json: Value = serde_json::from_str(&result.unwrap()).unwrap();

        assert_eq!(reconstructed_json[1]["name"].as_str().unwrap(), "こうもり");
        assert_eq!(reconstructed_json[2]["note"].as_str().unwrap(), "A translation for the slime note.");
        assert_eq!(reconstructed_json[2]["name"].as_str().unwrap(), "スライム");
    }

    #[test]
    fn test_reconstruct_enemies_non_existent_id() {
        let original_json_str = TEST_ENEMIES_JSON;
        let translations = vec![
            WorkingTranslation { // Updated struct and fields
                object_id: 999, 
                original_text: "Unknown Enemy".to_string(),
                source_file: "www/data/Enemies.json".to_string(),
                json_path: "name".to_string(),
                translated_text: "Phantom Enemy".to_string(),
                translation_source: "test_source".to_string(),
                error: None,
            },
        ];
        let translations_ref: Vec<&WorkingTranslation> = translations.iter().collect();
        let result = reconstruct_enemies_json(&original_json_str, translations_ref);
        assert!(result.is_ok());
        let reconstructed_value: Value = serde_json::from_str(&result.unwrap()).expect("Failed to parse reconstructed");
        let original_value: Value = serde_json::from_str(original_json_str).expect("Failed to parse original");
        assert_eq!(reconstructed_value, original_value);
    }

    #[test]
    fn test_reconstruct_enemies_non_existent_json_path() {
        let original_json_str = TEST_ENEMIES_JSON;
        let translations = vec![
            WorkingTranslation { // Updated struct and fields
                object_id: 1, 
                original_text: "Value".to_string(),
                source_file: "www/data/Enemies.json".to_string(),
                json_path: "inventedField".to_string(), 
                translated_text: "Translated Invented".to_string(),
                translation_source: "test_source".to_string(),
                error: None,
            },
        ];
        let translations_ref: Vec<&WorkingTranslation> = translations.iter().collect();
        let result = reconstruct_enemies_json(&original_json_str, translations_ref);
        assert!(result.is_ok());
        let reconstructed_value: Value = serde_json::from_str(&result.unwrap()).expect("Failed to parse reconstructed");
        let original_value: Value = serde_json::from_str(original_json_str).expect("Failed to parse original");
        assert_eq!(reconstructed_value, original_value);
    }
    
    #[test]
    fn test_reconstruct_enemies_empty_translations_list() {
        let original_json_str = TEST_ENEMIES_JSON;
        let translations: Vec<WorkingTranslation> = Vec::new(); // Updated type
        let translations_ref: Vec<&WorkingTranslation> = translations.iter().collect();
        let result = reconstruct_enemies_json(&original_json_str, translations_ref);
        assert!(result.is_ok());
        let reconstructed_value: Value = serde_json::from_str(&result.unwrap()).expect("Failed to parse reconstructed");
        let original_value: Value = serde_json::from_str(original_json_str).expect("Failed to parse original");
        assert_eq!(reconstructed_value, original_value);
    }

    #[test]
    fn test_reconstruct_enemies_invalid_original_json() {
        let original_json_str = r#"[null, {"id":1, "name":"Bat", "note":"Broken JSON"#;
        let translations = vec![
            WorkingTranslation { // Updated struct and fields
                object_id: 1,
                original_text: "Bat".to_string(),
                source_file: "www/data/Enemies.json".to_string(),
                json_path: "name".to_string(),
                translated_text: "こうもり".to_string(),
                translation_source: "test_source".to_string(),
                error: None,
            },
        ];
        let translations_ref: Vec<&WorkingTranslation> = translations.iter().collect();
        let result = reconstruct_enemies_json(original_json_str, translations_ref);
        assert!(result.is_err());
        match result.err().unwrap() {
            CoreError::JsonParse(_) => { /* Expected */ },
            other => panic!("Expected JsonParse error, got {:?}", other),
        }
    }
} 