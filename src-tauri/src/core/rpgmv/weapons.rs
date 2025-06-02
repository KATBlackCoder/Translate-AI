use serde::Deserialize;
use super::common::{
    RpgMvDataObject,
    extract_strings_from_json_array,
    reconstruct_object_array_by_id
};

use crate::models::translation::{WorkingTranslation, SourceStringData};
use crate::error::CoreError;

#[derive(Deserialize, Debug)]
struct Weapon {
    id: u32,
    name: String,
    description: String,
    note: String,
    // Other fields are not needed for translation
}

impl RpgMvDataObject for Weapon {
    fn get_id(&self) -> u32 {
        self.id
    }

    fn get_translatable_fields(&self) -> Vec<(&'static str, &String)> {
        vec![
            ("name", &self.name),
            ("description", &self.description),
            ("note", &self.note),
        ]
    }
}

pub fn extract_strings(
    file_content: &str,
    source_file: &str,
) -> Result<Vec<SourceStringData>, String> {
    extract_strings_from_json_array::<Weapon>(file_content, source_file, "Weapons.json")
}

pub fn reconstruct_weapons_json(
    original_json_str: &str,
    translations: Vec<&WorkingTranslation>,
) -> Result<String, CoreError> {
    reconstruct_object_array_by_id(
        original_json_str,
        &translations,
        "Weapons.json"
    )
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::Value;
    const TEST_WEAPONS_JSON: &str = r#"[
        null,
        {"id":1,"animationId":6,"description":"","etypeId":1,"traits":[{"code":31,"dataId":1,"value":0},{"code":22,"dataId":0,"value":0}],"iconIndex":97,"name":"剣","note":"","params":[0,0,10,0,0,0,0,0],"price":500,"wtypeId":2},
        {"id":2,"animationId":6,"description":"","etypeId":1,"traits":[{"code":31,"dataId":1,"value":0},{"code":22,"dataId":0,"value":0}],"iconIndex":99,"name":"斧","note":"","params":[0,0,10,0,0,0,0,0],"price":500,"wtypeId":4},
        {"id":7,"animationId":11,"description":"暗殺用の隠し武器。\n右腕に装着する。","etypeId":1,"traits":[{"code":22,"dataId":0,"value":0}],"iconIndex":112,"name":"隠し銃剣","note":"<隠し武器>","params":[0,0,5,0,0,0,0,0],"price":500,"wtypeId":14}
    ]"#;

    #[test]
    fn test_reconstruct_weapons_basic() {
        let original_json_str = TEST_WEAPONS_JSON;
        let translations = vec![
            WorkingTranslation {
                object_id: 1,
                original_text: "剣".to_string(),
                source_file: "www/data/Weapons.json".to_string(),
                json_path: "name".to_string(),
                translated_text: "Sword (EN)".to_string(),
                translation_source: "test".to_string(),
                error: None,
            },
            WorkingTranslation {
                object_id: 1,
                original_text: "".to_string(),
                source_file: "www/data/Weapons.json".to_string(),
                json_path: "description".to_string(),
                translated_text: "A basic sword.".to_string(),
                translation_source: "test".to_string(),
                error: None,
            },
            WorkingTranslation {
                object_id: 7,
                original_text: "隠し銃剣".to_string(),
                source_file: "www/data/Weapons.json".to_string(),
                json_path: "name".to_string(),
                translated_text: "Hidden Bayonet (EN)".to_string(),
                translation_source: "test".to_string(),
                error: None,
            },
            WorkingTranslation {
                object_id: 7,
                original_text: "暗殺用の隠し武器。\n右腕に装着する。".to_string(),
                source_file: "www/data/Weapons.json".to_string(),
                json_path: "description".to_string(),
                translated_text: "Concealed weapon for assassination.\nEquipped on the right arm. (EN)".to_string(),
                translation_source: "test".to_string(),
                error: None,
            },
            WorkingTranslation {
                object_id: 7,
                original_text: "<隠し武器>".to_string(),
                source_file: "www/data/Weapons.json".to_string(),
                json_path: "note".to_string(),
                translated_text: "<HiddenWeaponTag>".to_string(),
                translation_source: "test".to_string(),
                error: None,
            },
        ];
        let translations_ref: Vec<&WorkingTranslation> = translations.iter().collect();
        let result = reconstruct_weapons_json(&original_json_str, translations_ref);
        assert!(result.is_ok(), "reconstruct_weapons_json failed: {:?}", result.err());
        let reconstructed_json_str = result.unwrap();
        let reconstructed_json: Value = serde_json::from_str(&reconstructed_json_str).expect("Failed to parse reconstructed JSON");

        assert_eq!(reconstructed_json[1]["name"].as_str().unwrap(), "Sword (EN)");
        assert_eq!(reconstructed_json[1]["description"].as_str().unwrap(), "A basic sword.");
        assert_eq!(reconstructed_json[1]["price"].as_u64().unwrap(), 500);

        assert_eq!(reconstructed_json[3]["name"].as_str().unwrap(), "Hidden Bayonet (EN)");
        assert_eq!(reconstructed_json[3]["description"].as_str().unwrap(), "Concealed weapon for assassination.\nEquipped on the right arm. (EN)");
        assert_eq!(reconstructed_json[3]["note"].as_str().unwrap(), "<HiddenWeaponTag>");
        assert_eq!(reconstructed_json[3]["wtypeId"].as_u64().unwrap(), 14);
    }

    #[test]
    fn test_reconstruct_weapons_with_translation_error() {
        let original_json_str = TEST_WEAPONS_JSON;
        let translations = vec![
            WorkingTranslation {
                object_id: 1, // Sword
                original_text: "剣".to_string(), 
                source_file: "www/data/Weapons.json".to_string(),
                json_path: "name".to_string(),
                translated_text: "SwordFail".to_string(),
                translation_source: "test".to_string(),
                error: Some("AI error".to_string()), 
            },
            WorkingTranslation {
                object_id: 2, // Axe
                original_text: "".to_string(), 
                source_file: "www/data/Weapons.json".to_string(),
                json_path: "description".to_string(),
                translated_text: "A mighty axe.".to_string(),
                translation_source: "test".to_string(),
                error: None,
            },
        ];
        let translations_ref: Vec<&WorkingTranslation> = translations.iter().collect();
        let result = reconstruct_weapons_json(&original_json_str, translations_ref);
        assert!(result.is_ok());
        let reconstructed_json: Value = serde_json::from_str(&result.unwrap()).unwrap();

        assert_eq!(reconstructed_json[1]["name"].as_str().unwrap(), "剣"); // Original due to error
        assert_eq!(reconstructed_json[2]["description"].as_str().unwrap(), "A mighty axe."); // Translated
        assert_eq!(reconstructed_json[2]["name"].as_str().unwrap(), "斧"); // Original name for axe, untouched
    }

    #[test]
    fn test_reconstruct_weapons_non_existent_id() {
        let original_json_str = TEST_WEAPONS_JSON;
        let translations = vec![
            WorkingTranslation {
                object_id: 999, 
                original_text: "Unknown Weapon".to_string(),
                source_file: "www/data/Weapons.json".to_string(),
                json_path: "name".to_string(),
                translated_text: "Phantom Weapon".to_string(),
                translation_source: "test".to_string(),
                error: None,
            },
        ];
        let translations_ref: Vec<&WorkingTranslation> = translations.iter().collect();
        let result = reconstruct_weapons_json(&original_json_str, translations_ref);
        assert!(result.is_ok());
        let reconstructed_value: Value = serde_json::from_str(&result.unwrap()).expect("Failed to parse reconstructed");
        let original_value: Value = serde_json::from_str(original_json_str).expect("Failed to parse original");
        assert_eq!(reconstructed_value, original_value);
    }

    #[test]
    fn test_reconstruct_weapons_non_existent_json_path() {
        let original_json_str = TEST_WEAPONS_JSON;
        let translations = vec![
            WorkingTranslation {
                object_id: 1, 
                original_text: "Value".to_string(),
                source_file: "www/data/Weapons.json".to_string(),
                json_path: "superPowerLevel".to_string(), 
                translated_text: "Over 9000".to_string(),
                translation_source: "test".to_string(),
                error: None,
            },
        ];
        let translations_ref: Vec<&WorkingTranslation> = translations.iter().collect();
        let result = reconstruct_weapons_json(&original_json_str, translations_ref);
        assert!(result.is_ok());
        let reconstructed_value: Value = serde_json::from_str(&result.unwrap()).expect("Failed to parse reconstructed");
        let original_value: Value = serde_json::from_str(original_json_str).expect("Failed to parse original");
        assert_eq!(reconstructed_value, original_value);
    }
    
    #[test]
    fn test_reconstruct_weapons_empty_translations_list() {
        let original_json_str = TEST_WEAPONS_JSON;
        let translations: Vec<WorkingTranslation> = Vec::new();        
        let translations_ref: Vec<&WorkingTranslation> = translations.iter().collect();
        let result = reconstruct_weapons_json(&original_json_str, translations_ref);
        assert!(result.is_ok());
        let reconstructed_value: Value = serde_json::from_str(&result.unwrap()).expect("Failed to parse reconstructed");
        let original_value: Value = serde_json::from_str(original_json_str).expect("Failed to parse original");
        assert_eq!(reconstructed_value, original_value);
    }

    #[test]
    fn test_reconstruct_weapons_invalid_original_json() {
        let original_json_str = r#"[null, {"id":1, "name":"Sword", "description":"BrokenJson"#;
        let translations = vec![
            WorkingTranslation {
                object_id: 1,
                original_text: "Sword".to_string(),
                source_file: "www/data/Weapons.json".to_string(),
                json_path: "name".to_string(),
                translated_text: "剣".to_string(),
                translation_source: "test".to_string(),
                error: None,
            },
        ];
        let translations_ref: Vec<&WorkingTranslation> = translations.iter().collect();
        let result = reconstruct_weapons_json(original_json_str, translations_ref);
        assert!(result.is_err());
        match result.err().unwrap() {
            CoreError::JsonParse(_) => { /* Expected */ },
            other => panic!("Expected JsonParse error, got {:?}", other),
        }
    }
} 