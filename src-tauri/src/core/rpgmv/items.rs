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
struct Item {
    id: u32,
    name: String,
    description: String,
    note: String,
    // Other fields like iconIndex, price, etc., are not needed for translation
}

impl RpgMvDataObject for Item {
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
) -> Result<Vec<TranslatableStringEntry>, String> {
    extract_strings_from_json_array::<Item>(file_content, source_file, "Items.json")
}

pub fn reconstruct_items_json(
    original_json_str: &str,
    translations: Vec<&TranslatedStringEntryFromFrontend>,
) -> Result<String, CoreError> {
    super::common::reconstruct_object_array_by_id(
        original_json_str,
        &translations,
        "Items.json"
    )
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::Value;
    use crate::models::translation::TranslatedStringEntryFromFrontend;
    use crate::error::CoreError; // Ensure CoreError is in scope for tests if needed for matching

    const TEST_ITEMS_JSON: &str = r#"[
        null,
        {"id":1,"animationId":41,"consumable":true,"damage":{"critical":false,"elementId":0,"formula":"0","type":0,"variance":20},"description":"","effects":[{"code":11,"dataId":0,"value1":0,"value2":500}],"hitType":0,"iconIndex":176,"itypeId":1,"name":"ポーション","note":"","occasion":0,"price":50,"repeats":1,"scope":7,"speed":0,"successRate":100,"tpGain":0},
        {"id":2,"animationId":41,"consumable":true,"damage":{"critical":false,"elementId":0,"formula":"0","type":0,"variance":20},"description":"","effects":[{"code":12,"dataId":0,"value1":0,"value2":200}],"hitType":0,"iconIndex":176,"itypeId":1,"name":"マジックウォーター","note":"","occasion":0,"price":100,"repeats":1,"scope":7,"speed":0,"successRate":100,"tpGain":0},
        {"id":5,"animationId":0,"consumable":true,"damage":{"critical":false,"elementId":0,"formula":"0","type":0,"variance":20},"description":"","effects":[],"hitType":0,"iconIndex":0,"itypeId":1,"name":"アイテム　↓","note":"<拡張説明:>","occasion":0,"price":0,"repeats":1,"scope":7,"speed":0,"successRate":100,"tpGain":0},
        {"id":6,"animationId":0,"consumable":false,"damage":{"critical":false,"elementId":0,"formula":"0","type":0,"variance":20},"description":"","effects":[],"hitType":0,"iconIndex":195,"itypeId":1,"name":"牢屋の鍵","note":"<拡張説明:\\n捕まった人達がいる牢の鍵\\nかなり頑丈にできている。>","occasion":3,"price":0,"repeats":1,"scope":0,"speed":0,"successRate":100,"tpGain":0}
    ]"#;

    #[test]
    fn test_reconstruct_items_basic() {
        let original_json_str = TEST_ITEMS_JSON;

        let translations = vec![
            // Translate Potion (ID 1) name and description
            TranslatedStringEntryFromFrontend {
                object_id: 1,
                text: "ポーション".to_string(),
                source_file: "www/data/Items.json".to_string(),
                json_path: "name".to_string(),
                translated_text: "Potion (EN)".to_string(),
                error: None,
            },
            TranslatedStringEntryFromFrontend {
                object_id: 1,
                text: "".to_string(), // Original description is empty
                source_file: "www/data/Items.json".to_string(),
                json_path: "description".to_string(),
                translated_text: "Heals a small amount of HP.".to_string(),
                error: None,
            },
             // Translate Magic Water (ID 2) name, leave note empty as it was
            TranslatedStringEntryFromFrontend {
                object_id: 2,
                text: "マジックウォーター".to_string(),
                source_file: "www/data/Items.json".to_string(),
                json_path: "name".to_string(),
                translated_text: "Magic Water (EN)".to_string(),
                error: None,
            },
            // Translate Item 5 name and note
            TranslatedStringEntryFromFrontend {
                object_id: 5,
                text: "アイテム　↓".to_string(),
                source_file: "www/data/Items.json".to_string(),
                json_path: "name".to_string(),
                translated_text: "Item Placeholder (EN)".to_string(),
                error: None,
            },
            TranslatedStringEntryFromFrontend {
                object_id: 5,
                text: "<拡張説明:>".to_string(),
                source_file: "www/data/Items.json".to_string(),
                json_path: "note".to_string(),
                translated_text: "<Extended Desc: (EN)>".to_string(),
                error: None,
            },
        ];
        
        let translations_ref: Vec<&TranslatedStringEntryFromFrontend> = translations.iter().collect();

        let result = reconstruct_items_json(&original_json_str, translations_ref);
        assert!(result.is_ok(), "reconstruct_items_json failed: {:?}", result.err());
        let reconstructed_json_str = result.unwrap();
        let reconstructed_json: Value = serde_json::from_str(&reconstructed_json_str).expect("Failed to parse reconstructed JSON");

        // Assertions for Item 1 (Potion)
        assert_eq!(reconstructed_json[1]["name"].as_str().unwrap(), "Potion (EN)");
        assert_eq!(reconstructed_json[1]["description"].as_str().unwrap(), "Heals a small amount of HP.");
        assert_eq!(reconstructed_json[1]["note"].as_str().unwrap(), ""); // Unchanged note
        assert_eq!(reconstructed_json[1]["price"].as_u64().unwrap(), 50); // Check preserved field

        // Assertions for Item 2 (Magic Water)
        assert_eq!(reconstructed_json[2]["name"].as_str().unwrap(), "Magic Water (EN)");
        assert_eq!(reconstructed_json[2]["description"].as_str().unwrap(), ""); // Unchanged empty description
        assert_eq!(reconstructed_json[2]["note"].as_str().unwrap(), ""); // Unchanged empty note
        assert_eq!(reconstructed_json[2]["price"].as_u64().unwrap(), 100); // Check preserved field

        // Assertions for Item 5
        assert_eq!(reconstructed_json[3]["name"].as_str().unwrap(), "Item Placeholder (EN)"); // Index 3 because original JSON has null at 0
        assert_eq!(reconstructed_json[3]["note"].as_str().unwrap(), "<Extended Desc: (EN)>");
        
        // Assertions for Item 6 (Jail Key) - Should be untouched by these translations
        assert_eq!(reconstructed_json[4]["name"].as_str().unwrap(), "牢屋の鍵");
        assert_eq!(reconstructed_json[4]["note"].as_str().unwrap(), "<拡張説明:\\n捕まった人達がいる牢の鍵\\nかなり頑丈にできている。>");
        assert_eq!(reconstructed_json[4]["consumable"].as_bool().unwrap(), false); // Check preserved field
    }

    #[test]
    fn test_reconstruct_items_with_translation_error() {
        let original_json_str = TEST_ITEMS_JSON;

        let translations = vec![
            TranslatedStringEntryFromFrontend {
                object_id: 1, // Potion
                text: "ポーション".to_string(), 
                source_file: "www/data/Items.json".to_string(),
                json_path: "name".to_string(),
                translated_text: "NameFail".to_string(), // This would be some placeholder from translation attempt
                error: Some("AI translation failed".to_string()), 
            },
            TranslatedStringEntryFromFrontend {
                object_id: 1, // Potion
                text: "".to_string(), // Original description for Potion is empty
                source_file: "www/data/Items.json".to_string(),
                json_path: "description".to_string(),
                translated_text: "Translated Desc".to_string(), 
                error: None, // Description translation is successful
            },
            TranslatedStringEntryFromFrontend {
                object_id: 6, // Jail Key
                text: "<拡張説明:\\n捕まった人達がいる牢の鍵\\nかなり頑丈にできている。>".to_string(),
                source_file: "www/data/Items.json".to_string(),
                json_path: "note".to_string(),
                translated_text: "NoteFail".to_string(),
                error: Some("Another AI error".to_string()),
            },
        ];
        let translations_ref: Vec<&TranslatedStringEntryFromFrontend> = translations.iter().collect();

        let result = reconstruct_items_json(&original_json_str, translations_ref);
        assert!(result.is_ok(), "reconstruct_items_json failed: {:?}", result.err());
        let reconstructed_json_str = result.unwrap();
        let reconstructed_json: Value = serde_json::from_str(&reconstructed_json_str).expect("Failed to parse reconstructed JSON");

        // Assertions for Item 1 (Potion)
        assert_eq!(reconstructed_json[1]["name"].as_str().unwrap(), "ポーション"); // Original name due to error
        assert_eq!(reconstructed_json[1]["description"].as_str().unwrap(), "Translated Desc"); // Description translated
        assert_eq!(reconstructed_json[1]["note"].as_str().unwrap(), ""); // Original note (empty) preserved

        // Assertions for Item 6 (Jail Key)
        assert_eq!(reconstructed_json[4]["name"].as_str().unwrap(), "牢屋の鍵"); // Original name preserved
        assert_eq!(reconstructed_json[4]["note"].as_str().unwrap(), "<拡張説明:\\n捕まった人達がいる牢の鍵\\nかなり頑丈にできている。>"); // Original note due to error
    }

    #[test]
    fn test_reconstruct_items_non_existent_id() {
        let original_json_str = TEST_ITEMS_JSON;
        let translations = vec![
            TranslatedStringEntryFromFrontend {
                object_id: 999, // Non-existent ID
                text: "Unknown Item".to_string(),
                source_file: "www/data/Items.json".to_string(),
                json_path: "name".to_string(),
                translated_text: "Ghost Item".to_string(),
                error: None,
            },
        ];
        let translations_ref: Vec<&TranslatedStringEntryFromFrontend> = translations.iter().collect();

        let result = reconstruct_items_json(&original_json_str, translations_ref);
        assert!(result.is_ok());
        let reconstructed_json_str = result.unwrap();
        // The original JSON string should be returned if no modifications were made
        // Parse both to Value and compare, to ignore formatting differences
        let reconstructed_value: Value = serde_json::from_str(&reconstructed_json_str).expect("Failed to parse reconstructed_json_str");
        let original_value: Value = serde_json::from_str(original_json_str).expect("Failed to parse original_json_str");
        assert_eq!(reconstructed_value, original_value);
        // We expect an eprintln! warning in the console for this case.
    }

    #[test]
    fn test_reconstruct_items_non_existent_json_path() {
        let original_json_str = TEST_ITEMS_JSON;
        let translations = vec![
            TranslatedStringEntryFromFrontend {
                object_id: 1, // Potion
                text: "Some value".to_string(),
                source_file: "www/data/Items.json".to_string(),
                json_path: "inventedField".to_string(), // This field does not exist in the Item struct/JSON
                translated_text: "Translated Invented Field".to_string(),
                error: None,
            },
        ];
        let translations_ref: Vec<&TranslatedStringEntryFromFrontend> = translations.iter().collect();

        let result = reconstruct_items_json(&original_json_str, translations_ref);
        assert!(result.is_ok());
        let reconstructed_json_str = result.unwrap();
        // The original JSON string should be returned as no valid path was updated
        // Parse both to Value and compare, to ignore formatting differences
        let reconstructed_value: Value = serde_json::from_str(&reconstructed_json_str).expect("Failed to parse reconstructed_json_str");
        let original_value: Value = serde_json::from_str(original_json_str).expect("Failed to parse original_json_str");
        assert_eq!(reconstructed_value, original_value);
        // We expect an eprintln! warning from update_value_at_path (via reconstruct_items_json)
    }
    
    #[test]
    fn test_reconstruct_items_empty_translations_list() {
        let original_json_str = TEST_ITEMS_JSON;
        let translations: Vec<TranslatedStringEntryFromFrontend> = Vec::new(); // Empty list
        
        let translations_ref: Vec<&TranslatedStringEntryFromFrontend> = translations.iter().collect();

        let result = reconstruct_items_json(&original_json_str, translations_ref);
        assert!(result.is_ok());
        let reconstructed_json_str = result.unwrap();
        // Should return the original JSON string as no translations were applied
        // Parse both to Value and compare, to ignore formatting differences
        let reconstructed_value: Value = serde_json::from_str(&reconstructed_json_str).expect("Failed to parse reconstructed_json_str");
        let original_value: Value = serde_json::from_str(original_json_str).expect("Failed to parse original_json_str");
        assert_eq!(reconstructed_value, original_value);
    }

    #[test]
    fn test_reconstruct_items_invalid_original_json() {
        let original_json_str = r#"[null, {"id":1, "name":"Potion", "description":"Broken JSON"#; // Intentionally broken
        let translations = vec![
            TranslatedStringEntryFromFrontend {
                object_id: 1,
                text: "Potion".to_string(),
                source_file: "www/data/Items.json".to_string(),
                json_path: "name".to_string(),
                translated_text: "ポーション".to_string(),
                error: None,
            },
        ];
        let translations_ref: Vec<&TranslatedStringEntryFromFrontend> = translations.iter().collect();

        let result = reconstruct_items_json(original_json_str, translations_ref);
        assert!(result.is_err());
        match result.err().unwrap() {
            CoreError::JsonParse(_) => { /* Expected error */ },
            other_error => panic!("Expected JsonParse error, got {:?}", other_error),
        }
    }
} 