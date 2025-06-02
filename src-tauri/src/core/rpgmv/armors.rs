use serde::Deserialize;
use crate::models::translation::{SourceStringData, WorkingTranslation};
use crate::error::CoreError;
use super::common::{
    RpgMvDataObject, 
    extract_strings_from_json_array,
    reconstruct_object_array_by_id
};

#[derive(Deserialize, Debug)]
struct Armor {
    id: u32,
    name: String,
    description: String,
    note: String,
    // other fields are not needed for translation
}

impl RpgMvDataObject for Armor {
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
    extract_strings_from_json_array::<Armor>(file_content, source_file, "Armors.json")
} 

pub fn reconstruct_armors_json(
    original_json_str: &str,
    translations: Vec<&WorkingTranslation>,
) -> Result<String, CoreError> {
    reconstruct_object_array_by_id(
        original_json_str,
        &translations,
        "Armors.json"
    )
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::{json, Value};

    const TEST_ARMORS_JSON: &str = r#"[
        null,
        {"id":1,"atypeId":5,"description":"","etypeId":2,"traits":[{"code":22,"dataId":1,"value":0}],"iconIndex":128,"name":"盾","note":"","params":[0,0,0,10,0,0,0,0],"price":300},
        {"id":2,"atypeId":1,"description":"","etypeId":3,"traits":[{"code":22,"dataId":1,"value":0}],"iconIndex":130,"name":"帽子","note":"","params":[0,0,0,10,0,0,0,0],"price":300},
        {"id":3,"atypeId":1,"description":"","etypeId":4,"traits":[{"code":22,"dataId":1,"value":0}],"iconIndex":135,"name":"服","note":"","params":[0,0,0,10,0,0,0,0],"price":300},
        {"id":12,"atypeId":9,"description":"身体の自由を奪い、\n立場をわからせる拘束衣。","etypeId":4,"traits":[{"code":22,"dataId":1,"value":0}],"iconIndex":135,"name":"教育用拘束衣","note":"<拡張説明:”教育用拘束衣”\n身体の自由を奪い、\n立場をわからせる拘束衣。>","params":[0,0,0,0,0,0,0,0],"price":0}
    ]"#;

    #[test]
    fn test_reconstruct_armors_basic() {
        let original_json_str = TEST_ARMORS_JSON;

        let translations = vec![
            WorkingTranslation {
                object_id: 1,
                original_text: "盾".to_string(),
                source_file: "www/data/Armors.json".to_string(),
                json_path: "name".to_string(),
                translated_text: "Shield (EN)".to_string(),
                translation_source: "test_source".to_string(),
                error: None,
            },
            WorkingTranslation {
                object_id: 1,
                original_text: "".to_string(),
                source_file: "www/data/Armors.json".to_string(),
                json_path: "description".to_string(),
                translated_text: "A basic shield.".to_string(),
                translation_source: "test_source".to_string(),
                error: None,
            },
            WorkingTranslation {
                object_id: 3,
                original_text: "服".to_string(),
                source_file: "www/data/Armors.json".to_string(),
                json_path: "name".to_string(),
                translated_text: "Clothes (EN)".to_string(),
                translation_source: "test_source".to_string(),
                error: None,
            },
            WorkingTranslation {
                object_id: 12,
                original_text: "教育用拘束衣".to_string(),
                source_file: "www/data/Armors.json".to_string(),
                json_path: "name".to_string(),
                translated_text: "Training Straitjacket (EN)".to_string(),
                translation_source: "test_source".to_string(),
                error: None,
            },
            WorkingTranslation {
                object_id: 12,
                original_text: "<拡張説明:”教育用拘束衣”\n身体の自由を奪い、\n立場をわからせる拘束衣。>".to_string(),
                source_file: "www/data/Armors.json".to_string(),
                json_path: "note".to_string(),
                translated_text: "<Extended Desc: \"Training Straitjacket\"\nA straitjacket that restricts movement and enforces submission. (EN)>".to_string(),
                translation_source: "test_source".to_string(),
                error: None,
            },
        ];
        
        let translations_ref: Vec<&WorkingTranslation> = translations.iter().collect();

        let result = reconstruct_armors_json(&original_json_str, translations_ref);
        assert!(result.is_ok(), "reconstruct_armors_json failed: {:?}", result.err());
        let reconstructed_json_str = result.unwrap();
        let reconstructed_json: Value = serde_json::from_str(&reconstructed_json_str).expect("Failed to parse reconstructed JSON");

        assert_eq!(reconstructed_json[1]["name"].as_str().unwrap(), "Shield (EN)");
        assert_eq!(reconstructed_json[1]["description"].as_str().unwrap(), "A basic shield.");
        assert_eq!(reconstructed_json[1]["price"].as_u64().unwrap(), 300);

        assert_eq!(reconstructed_json[3]["name"].as_str().unwrap(), "Clothes (EN)");

        assert_eq!(reconstructed_json[4]["name"].as_str().unwrap(), "Training Straitjacket (EN)");
        assert_eq!(reconstructed_json[4]["note"].as_str().unwrap(), "<Extended Desc: \"Training Straitjacket\"\nA straitjacket that restricts movement and enforces submission. (EN)>");
        assert_eq!(reconstructed_json[4]["atypeId"].as_u64().unwrap(), 9);
    }

    #[test]
    fn test_reconstruct_armors_with_translation_error() {
        let original_json_str = TEST_ARMORS_JSON;
        let translations = vec![
            WorkingTranslation {
                object_id: 1,
                original_text: "盾".to_string(),
                source_file: "www/data/Armors.json".to_string(),
                json_path: "name".to_string(),
                translated_text: "ShieldFail".to_string(),
                translation_source: "test_source".to_string(),
                error: Some("AI error".to_string()), 
            },
            WorkingTranslation {
                object_id: 2,
                original_text: "".to_string(),
                source_file: "www/data/Armors.json".to_string(),
                json_path: "description".to_string(),
                translated_text: "A simple hat.".to_string(), 
                translation_source: "test_source".to_string(),
                error: None,
            },
        ];
        let translations_ref: Vec<&WorkingTranslation> = translations.iter().collect();
        let result = reconstruct_armors_json(&original_json_str, translations_ref);
        assert!(result.is_ok());
        let reconstructed_json: Value = serde_json::from_str(&result.unwrap()).unwrap();

        assert_eq!(reconstructed_json[1]["name"].as_str().unwrap(), "盾");
        assert_eq!(reconstructed_json[2]["description"].as_str().unwrap(), "A simple hat.");
        assert_eq!(reconstructed_json[2]["name"].as_str().unwrap(), "帽子");
    }

    #[test]
    fn test_reconstruct_armors_non_existent_id() {
        let original_json_str = TEST_ARMORS_JSON;
        let translations = vec![
            WorkingTranslation {
                object_id: 999,
                original_text: "Unknown Armor".to_string(),
                source_file: "www/data/Armors.json".to_string(),
                json_path: "name".to_string(),
                translated_text: "Phantom Armor".to_string(),
                translation_source: "test_source".to_string(),
                error: None,
            },
        ];
        let translations_ref: Vec<&WorkingTranslation> = translations.iter().collect();
        let result = reconstruct_armors_json(&original_json_str, translations_ref);
        assert!(result.is_ok());
        let reconstructed_value: Value = serde_json::from_str(&result.unwrap()).expect("Failed to parse reconstructed");
        let original_value: Value = serde_json::from_str(original_json_str).expect("Failed to parse original");
        assert_eq!(reconstructed_value, original_value);
    }

    #[test]
    fn test_reconstruct_armors_non_existent_json_path() {
        let original_json_str = TEST_ARMORS_JSON;
        let translations = vec![
            WorkingTranslation {
                object_id: 1,
                original_text: "Value".to_string(),
                source_file: "www/data/Armors.json".to_string(),
                json_path: "mysteryField".to_string(), 
                translated_text: "Translated Mystery".to_string(),
                translation_source: "test_source".to_string(),
                error: None,
            },
        ];
        let translations_ref: Vec<&WorkingTranslation> = translations.iter().collect();
        let result = reconstruct_armors_json(&original_json_str, translations_ref);
        assert!(result.is_ok());
        let reconstructed_value: Value = serde_json::from_str(&result.unwrap()).expect("Failed to parse reconstructed");
        let original_value: Value = serde_json::from_str(original_json_str).expect("Failed to parse original");
        assert_eq!(reconstructed_value, original_value);
    }
    
    #[test]
    fn test_reconstruct_armors_empty_translations_list() {
        let original_json_str = TEST_ARMORS_JSON;
        let translations: Vec<WorkingTranslation> = Vec::new();
        let translations_ref: Vec<&WorkingTranslation> = translations.iter().collect();
        let result = reconstruct_armors_json(&original_json_str, translations_ref);
        assert!(result.is_ok());
        let reconstructed_value: Value = serde_json::from_str(&result.unwrap()).expect("Failed to parse reconstructed");
        let original_value: Value = serde_json::from_str(original_json_str).expect("Failed to parse original");
        assert_eq!(reconstructed_value, original_value);
    }

    #[test]
    fn test_reconstruct_armors_invalid_original_json() {
        let original_json_str = r#"[null, {"id":1, "name":"Shield", "description":"Broken"#; 
        let translations = vec![
            WorkingTranslation {
                object_id: 1,
                original_text: "Shield".to_string(),
                source_file: "www/data/Armors.json".to_string(),
                json_path: "name".to_string(),
                translated_text: "盾".to_string(),
                translation_source: "test_source".to_string(),
                error: None,
            },
        ];
        let translations_ref: Vec<&WorkingTranslation> = translations.iter().collect();
        let result = reconstruct_armors_json(original_json_str, translations_ref);
        assert!(result.is_err());
        match result.err().unwrap() {
            CoreError::JsonParse(_) => { /* Expected */ },
            other => panic!("Expected JsonParse error, got {:?}", other),
        }
    }
} 