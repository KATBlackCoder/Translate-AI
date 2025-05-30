use serde::Deserialize;
use super::common::{
    TranslatableStringEntry,
    RpgMvDataObject,
    extract_strings_from_json_array,
    reconstruct_object_array_by_id
};

use serde_json::Value;
use crate::models::translation::TranslatedStringEntryFromFrontend;
use crate::error::CoreError;
use crate::utils::json_utils::update_value_at_path;

#[derive(Deserialize, Debug)]
struct Skill {
    id: u32,
    name: String,
    description: String,
    message1: String, // For skills, message1 and message2 can contain translatable text
    message2: String,
    note: String,
    // Other fields like stypeId, mpCost, tpCost, etc., are not needed for translation
}

impl RpgMvDataObject for Skill {
    fn get_id(&self) -> u32 {
        self.id
    }

    fn get_translatable_fields(&self) -> Vec<(&'static str, &String)> {
        let mut fields = vec![
            ("name", &self.name),
            ("description", &self.description),
            ("note", &self.note),
        ];
        // Message1 and Message2 are often formatted like "%1 uses %2!"
        // or can be blank. We should extract them if not blank.
        if !self.message1.is_empty() {
            fields.push(("message1", &self.message1));
        }
        if !self.message2.is_empty() {
            fields.push(("message2", &self.message2));
        }
        fields
    }
}

pub fn extract_strings(
    file_content: &str,
    source_file: &str,
) -> Result<Vec<TranslatableStringEntry>, String> {
    extract_strings_from_json_array::<Skill>(file_content, source_file, "Skills.json")
}

pub fn reconstruct_skills_json(
    original_json_str: &str,
    translations: Vec<&TranslatedStringEntryFromFrontend>,
) -> Result<String, CoreError> {
    super::common::reconstruct_object_array_by_id(
        original_json_str,
        &translations,
        "Skills.json"
    )
}

#[cfg(test)]
mod tests {
    use super::*;
    // Using the provided Skills.json for test data inspiration
    const TEST_SKILLS_JSON: &str = r#"[
        null,
        {"id":1,"animationId":1,"damage":{"critical":true,"elementId":-1,"formula":"a.atk * 4 - b.def * 2","type":1,"variance":20},"description":"","effects":[{"code":21,"dataId":1,"value1":1,"value2":0}],"hitType":1,"iconIndex":76,"message1":" attacks!","message2":"","mpCost":0,"name":"Attack","note":"","occasion":1,"repeats":1,"requiredWtypeId1":0,"requiredWtypeId2":0,"scope":1,"speed":0,"stypeId":1,"successRate":100,"tpCost":0,"tpGain":10},
        {"id":2,"animationId":1,"damage":{"critical":false,"elementId":0,"formula":"0","type":0,"variance":20},"description":"","effects":[{"code":22,"dataId":1,"value1":0,"value2":0}],"hitType":0,"iconIndex":81,"message1":" guards.","message2":"","mpCost":0,"name":"Guard","note":"","occasion":1,"repeats":1,"requiredWtypeId1":0,"requiredWtypeId2":0,"scope":0,"speed":2000,"stypeId":1,"successRate":100,"tpCost":0,"tpGain":10},
        {"id":3,"animationId":0,"damage":{"critical":false,"elementId":0,"formula":"0","type":0,"variance":20},"description":"","effects":[{"code":32,"dataId":0,"value1":0,"value2":0}],"hitType":0,"iconIndex":78,"message1":" escapes.","message2":"","mpCost":0,"name":"Escape","note":"","occasion":1,"repeats":1,"requiredWtypeId1":0,"requiredWtypeId2":0,"scope":0,"speed":0,"stypeId":0,"successRate":100,"tpCost":0,"tpGain":0},
        {"id":10,"animationId":51,"damage":{"critical":false,"elementId":2,"formula":"200 + a.mat","type":1,"variance":20},"description":"Harness the power of fire to damage an enemy.","effects":[],"hitType":2,"iconIndex":64,"message1":" casts %1!","message2":"","mpCost":5,"name":"Fire","note":"Element: Fire\nCost: 5 MP","occasion":1,"repeats":1,"requiredWtypeId1":0,"requiredWtypeId2":0,"scope":1,"speed":0,"stypeId":1,"successRate":100,"tpCost":0,"tpGain":10}
    ]"#;

    #[test]
    fn test_reconstruct_skills_basic() {
        let original_json_str = TEST_SKILLS_JSON;
        let translations = vec![
            TranslatedStringEntryFromFrontend {
                object_id: 1,
                text: "Attack".to_string(),
                source_file: "www/data/Skills.json".to_string(),
                json_path: "name".to_string(),
                translated_text: "Attaque (FR)".to_string(),
                error: None,
            },
            TranslatedStringEntryFromFrontend {
                object_id: 1,
                text: " attacks!".to_string(),
                source_file: "www/data/Skills.json".to_string(),
                json_path: "message1".to_string(),
                translated_text: " attaque ! (FR)".to_string(),
                error: None,
            },
            TranslatedStringEntryFromFrontend {
                object_id: 10,
                text: "Fire".to_string(),
                source_file: "www/data/Skills.json".to_string(),
                json_path: "name".to_string(),
                translated_text: "Feu (FR)".to_string(),
                error: None,
            },
            TranslatedStringEntryFromFrontend {
                object_id: 10,
                text: "Harness the power of fire to damage an enemy.".to_string(),
                source_file: "www/data/Skills.json".to_string(),
                json_path: "description".to_string(),
                translated_text: "Exploite la puissance du feu pour blesser un ennemi. (FR)".to_string(),
                error: None,
            },
            TranslatedStringEntryFromFrontend {
                object_id: 10,
                text: " casts %1!".to_string(),
                source_file: "www/data/Skills.json".to_string(),
                json_path: "message1".to_string(),
                translated_text: " lance %1 ! (FR)".to_string(),
                error: None,
            },
             TranslatedStringEntryFromFrontend {
                object_id: 10,
                text: "Element: Fire\nCost: 5 MP".to_string(),
                source_file: "www/data/Skills.json".to_string(),
                json_path: "note".to_string(),
                translated_text: "Élément : Feu\nCoût : 5 PM (FR)".to_string(),
                error: None,
            },
        ];
        let translations_ref: Vec<&TranslatedStringEntryFromFrontend> = translations.iter().collect();
        let result = reconstruct_skills_json(&original_json_str, translations_ref);
        assert!(result.is_ok(), "reconstruct_skills_json failed: {:?}", result.err());
        let reconstructed_json_str = result.unwrap();
        let reconstructed_json: Value = serde_json::from_str(&reconstructed_json_str).expect("Failed to parse reconstructed JSON");

        assert_eq!(reconstructed_json[1]["name"].as_str().unwrap(), "Attaque (FR)");
        assert_eq!(reconstructed_json[1]["message1"].as_str().unwrap(), " attaque ! (FR)");
        assert_eq!(reconstructed_json[1]["mpCost"].as_u64().unwrap(), 0);

        assert_eq!(reconstructed_json[4]["name"].as_str().unwrap(), "Feu (FR)");
        assert_eq!(reconstructed_json[4]["description"].as_str().unwrap(), "Exploite la puissance du feu pour blesser un ennemi. (FR)");
        assert_eq!(reconstructed_json[4]["message1"].as_str().unwrap(), " lance %1 ! (FR)");
        assert_eq!(reconstructed_json[4]["note"].as_str().unwrap(), "Élément : Feu\nCoût : 5 PM (FR)");
        assert_eq!(reconstructed_json[4]["stypeId"].as_u64().unwrap(), 1);
    }

    #[test]
    fn test_reconstruct_skills_with_translation_error() {
        let original_json_str = TEST_SKILLS_JSON;
        let translations = vec![
            TranslatedStringEntryFromFrontend {
                object_id: 1, // Attack
                text: "Attack".to_string(), 
                source_file: "www/data/Skills.json".to_string(),
                json_path: "name".to_string(),
                translated_text: "AttackFail".to_string(),
                error: Some("AI error".to_string()), 
            },
            TranslatedStringEntryFromFrontend {
                object_id: 2, // Guard
                text: " guards.".to_string(), 
                source_file: "www/data/Skills.json".to_string(),
                json_path: "message1".to_string(),
                translated_text: " se protège. (FR)".to_string(), 
                error: None,
            },
        ];
        let translations_ref: Vec<&TranslatedStringEntryFromFrontend> = translations.iter().collect();
        let result = reconstruct_skills_json(&original_json_str, translations_ref);
        assert!(result.is_ok());
        let reconstructed_json: Value = serde_json::from_str(&result.unwrap()).unwrap();

        assert_eq!(reconstructed_json[1]["name"].as_str().unwrap(), "Attack"); // Original due to error
        assert_eq!(reconstructed_json[2]["message1"].as_str().unwrap(), " se protège. (FR)"); // Translated
        assert_eq!(reconstructed_json[2]["name"].as_str().unwrap(), "Guard"); // Original name for guard, untouched
    }

    #[test]
    fn test_reconstruct_skills_non_existent_id() {
        let original_json_str = TEST_SKILLS_JSON;
        let translations = vec![
            TranslatedStringEntryFromFrontend {
                object_id: 999, 
                text: "Unknown Skill".to_string(),
                source_file: "www/data/Skills.json".to_string(),
                json_path: "name".to_string(),
                translated_text: "Phantom Skill".to_string(),
                error: None,
            },
        ];
        let translations_ref: Vec<&TranslatedStringEntryFromFrontend> = translations.iter().collect();
        let result = reconstruct_skills_json(&original_json_str, translations_ref);
        assert!(result.is_ok());
        let reconstructed_value: Value = serde_json::from_str(&result.unwrap()).expect("Failed to parse reconstructed");
        let original_value: Value = serde_json::from_str(original_json_str).expect("Failed to parse original");
        assert_eq!(reconstructed_value, original_value);
    }

    #[test]
    fn test_reconstruct_skills_non_existent_json_path() {
        let original_json_str = TEST_SKILLS_JSON;
        let translations = vec![
            TranslatedStringEntryFromFrontend {
                object_id: 1, 
                text: "Value".to_string(),
                source_file: "www/data/Skills.json".to_string(),
                json_path: "ultimatePower".to_string(), 
                translated_text: "Divine Intervention".to_string(),
                error: None,
            },
        ];
        let translations_ref: Vec<&TranslatedStringEntryFromFrontend> = translations.iter().collect();
        let result = reconstruct_skills_json(&original_json_str, translations_ref);
        assert!(result.is_ok());
        let reconstructed_value: Value = serde_json::from_str(&result.unwrap()).expect("Failed to parse reconstructed");
        let original_value: Value = serde_json::from_str(original_json_str).expect("Failed to parse original");
        assert_eq!(reconstructed_value, original_value);
    }
    
    #[test]
    fn test_reconstruct_skills_empty_translations_list() {
        let original_json_str = TEST_SKILLS_JSON;
        let translations: Vec<TranslatedStringEntryFromFrontend> = Vec::new();        
        let translations_ref: Vec<&TranslatedStringEntryFromFrontend> = translations.iter().collect();
        let result = reconstruct_skills_json(&original_json_str, translations_ref);
        assert!(result.is_ok());
        let reconstructed_value: Value = serde_json::from_str(&result.unwrap()).expect("Failed to parse reconstructed");
        let original_value: Value = serde_json::from_str(original_json_str).expect("Failed to parse original");
        assert_eq!(reconstructed_value, original_value);
    }

    #[test]
    fn test_reconstruct_skills_invalid_original_json() {
        let original_json_str = r#"[null, {"id":1, "name":"Fire", "description":"Very hot"#;
        let translations = vec![
            TranslatedStringEntryFromFrontend {
                object_id: 1,
                text: "Fire".to_string(),
                source_file: "www/data/Skills.json".to_string(),
                json_path: "name".to_string(),
                translated_text: "Feu".to_string(),
                error: None,
            },
        ];
        let translations_ref: Vec<&TranslatedStringEntryFromFrontend> = translations.iter().collect();
        let result = reconstruct_skills_json(original_json_str, translations_ref);
        assert!(result.is_err());
        match result.err().unwrap() {
            CoreError::JsonParse(_) => { /* Expected */ },
            other => panic!("Expected JsonParse error, got {:?}", other),
        }
    }
} 