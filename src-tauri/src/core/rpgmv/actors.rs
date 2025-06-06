use serde::Deserialize; // Keep Deserialize for the Actor struct
use crate::models::translation::{SourceStringData, WorkingTranslation}; // Updated imports
use crate::error::CoreError;
use super::common::{
    RpgMvDataObject, 
    extract_strings_from_json_array,
    reconstruct_object_array_by_id // Add the new common function here
};

// A simplified struct representing an Actor for deserialization.
// We only care about fields that might contain translatable text or are needed for context.
// Serde traits can be added if these structs are ever serialized, but for now, only Deserialize is essential.
#[derive(Deserialize, Debug)] //serde::Serialize is not needed for Actor itself
struct Actor {
    id: u32, // Now deserializing the id
    name: String,
    nickname: String,
    profile: String,
    note: String, // Added note field
    // We can ignore other fields like battlerName, characterIndex, classId, equips, etc.
    // by not defining them here, serde_json will ignore them during deserialization.
}

impl RpgMvDataObject for Actor {
    fn get_id(&self) -> u32 {
        self.id
    }

    fn get_translatable_fields(&self) -> Vec<(&'static str, &String)> {
        vec![
            ("name", &self.name),
            ("nickname", &self.nickname),
            ("profile", &self.profile),
            ("note", &self.note), // Added note field here
        ]
    }
}

/// Extracts translatable strings from Actors.json content using the generic helper.
pub fn extract_strings(
    json_content: &str, 
    file_path: &str
) -> Result<Vec<SourceStringData>, String> { // Updated return type
    extract_strings_from_json_array::<Actor>(json_content, file_path, "Actors.json")
} 

pub fn reconstruct_actors_json(
    original_json_str: &str,
    translations: Vec<&WorkingTranslation>, // Updated parameter type
) -> Result<String, CoreError> {
    // Call the generic reconstruction function from common.rs
    reconstruct_object_array_by_id(
        original_json_str,
        &translations, // Pass as slice
        "Actors.json"  // Identifier for logging purposes
    )
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::models::translation::WorkingTranslation; // Updated import for tests
    use serde_json::{json, Value};

    #[test]
    fn test_reconstruct_actors_basic() {
        let original_json_str = json!([
            null, 
            {
                "id": 1,
                "battlerName": "Actor1_1", // Non-translatable, should be preserved
                "characterIndex": 0,
                "characterName": "Actor1",
                "classId": 1,
                "equips": [1,1,2,3,0],
                "faceIndex": 0,
                "faceName": "Actor1",
                "traits": [],
                "initialLevel": 1,
                "maxLevel": 99,
                "name": "ハロルド",
                "nickname": "", // Empty, will translate
                "note": "",       // Empty, will translate
                "profile": ""   // Empty, will translate
            },
            {
                "id": 9,
                "battlerName": "", 
                "characterIndex": 0,
                "characterName": "暗殺者1-1",
                "classId": 7,
                "equips": [7,6,7,8,0],
                "faceIndex": 0,
                "faceName": "主人公1-3",
                "traits": [{"code":62,"dataId":3,"value":1},{"code":23,"dataId":5,"value":0}],
                "initialLevel": 99,
                "maxLevel": 99,
                "name": "セレン",
                "nickname": "Selly", // Will remain if not in translations
                "note": "<Graphic:立ち絵用>\n",
                "profile": "素性は誰も知らない。暗器を隠している。\n振り向いて、彼女がいれば命はない！"
            }
        ]).to_string();

        let translations = vec![
            // Translate Harold's (ID 1) name, nickname, profile, and note
            WorkingTranslation { // Updated struct name
                object_id: 1,
                original_text: "ハロルド".to_string(), // Field name is original_text
                source_file: "www/data/Actors.json".to_string(),
                json_path: "[1].name".to_string(), // Format: "[index].field"
                translated_text: "Harold (EN)".to_string(),
                translation_source: "test_source".to_string(), // Added for WorkingTranslation
                error: None,
            },
            WorkingTranslation { // Updated struct name
                object_id: 1,
                original_text: "".to_string(),
                source_file: "www/data/Actors.json".to_string(),
                json_path: "[1].nickname".to_string(), // Format: "[index].field"
                translated_text: "Harry".to_string(),
                translation_source: "test_source".to_string(),
                error: None,
            },
            WorkingTranslation { // Updated struct name
                object_id: 1,
                original_text: "".to_string(),
                source_file: "www/data/Actors.json".to_string(),
                json_path: "[1].profile".to_string(), // Format: "[index].field"
                translated_text: "A brave hero indeed.".to_string(),
                translation_source: "test_source".to_string(),
                error: None,
            },
            WorkingTranslation { // Updated struct name
                object_id: 1,
                original_text: "".to_string(),
                source_file: "www/data/Actors.json".to_string(),
                json_path: "[1].note".to_string(), // Format: "[index].field"
                translated_text: "Harold's translated note.".to_string(),
                translation_source: "test_source".to_string(),
                error: None,
            },
            // Translate Seren's (ID 9) name and profile only
            WorkingTranslation { // Updated struct name
                object_id: 9,
                original_text: "セレン".to_string(),
                source_file: "www/data/Actors.json".to_string(),
                json_path: "[2].name".to_string(), // Actor ID 9 is at index 2
                translated_text: "Seren (EN)".to_string(),
                translation_source: "test_source".to_string(),
                error: None,
            },
            WorkingTranslation { // Updated struct name
                object_id: 9,
                original_text: "素性は誰も知らない。暗器を隠している。\n振り向いて、彼女がいれば命はない！".to_string(),
                source_file: "www/data/Actors.json".to_string(),
                json_path: "[2].profile".to_string(), // Actor ID 9 is at index 2
                translated_text: "Her origins are unknown. She conceals hidden weapons.\nIf you turn and see her, your life is forfeit!".to_string(),
                translation_source: "test_source".to_string(),
                error: None,
            },
        ];
        
        let translations_ref: Vec<&WorkingTranslation> = translations.iter().collect(); // Updated type

        let result = reconstruct_actors_json(&original_json_str, translations_ref);
        assert!(result.is_ok(), "reconstruct_actors_json failed: {:?}", result.err());
        let reconstructed_json_str = result.unwrap();
        let reconstructed_json: Value = serde_json::from_str(&reconstructed_json_str).expect("Failed to parse reconstructed JSON");

        // Assertions for Actor 1 (Harold)
        assert_eq!(reconstructed_json[1]["name"].as_str().unwrap(), "Harold (EN)");
        assert_eq!(reconstructed_json[1]["nickname"].as_str().unwrap(), "Harry");
        assert_eq!(reconstructed_json[1]["profile"].as_str().unwrap(), "A brave hero indeed.");
        assert_eq!(reconstructed_json[1]["note"].as_str().unwrap(), "Harold's translated note.");
        assert_eq!(reconstructed_json[1]["battlerName"].as_str().unwrap(), "Actor1_1"); // Check preserved field

        // Assertions for Actor 9 (Seren)
        assert_eq!(reconstructed_json[2]["name"].as_str().unwrap(), "Seren (EN)");
        assert_eq!(reconstructed_json[2]["nickname"].as_str().unwrap(), "Selly"); // Unchanged
        assert_eq!(reconstructed_json[2]["profile"].as_str().unwrap(), "Her origins are unknown. She conceals hidden weapons.\nIf you turn and see her, your life is forfeit!");
        assert_eq!(reconstructed_json[2]["note"].as_str().unwrap(), "<Graphic:立ち絵用>\n"); // Unchanged note for Seren
        assert_eq!(reconstructed_json[2]["classId"].as_u64().unwrap(), 7); // Check preserved field
    }

    #[test]
    fn test_reconstruct_actors_with_translation_error() {
        let original_json_str = json!([
            null,
            {
                "id": 1,
                "battlerName": "Actor1_1",
                "name": "ハロルド",
                "nickname": "",
                "profile": "元のプロフィール",
                "note": "元のノート"
            }
        ]).to_string();

        let translations = vec![
            WorkingTranslation { // Updated struct name
                object_id: 1,
                original_text: "ハロルド".to_string(), // Original name. Field name is original_text
                source_file: "www/data/Actors.json".to_string(),
                json_path: "[1].name".to_string(), // Format: "[index].field"
                translated_text: "HLD_TransFail".to_string(), 
                translation_source: "test_source".to_string(), // Added
                error: Some("AI translation timed out".to_string()),
            },
            WorkingTranslation { // Updated struct name
                object_id: 1,
                original_text: "元のプロフィール".to_string(),
                source_file: "www/data/Actors.json".to_string(),
                json_path: "[1].profile".to_string(), // Format: "[index].field"
                translated_text: "Translated Profile".to_string(),
                translation_source: "test_source".to_string(), // Added
                error: None,
            },
        ];
        let translations_ref: Vec<&WorkingTranslation> = translations.iter().collect(); // Updated type

        let result = reconstruct_actors_json(&original_json_str, translations_ref);
        assert!(result.is_ok(), "reconstruct_actors_json failed: {:?}", result.err());
        let reconstructed_json_str = result.unwrap();
        let reconstructed_json: Value = serde_json::from_str(&reconstructed_json_str).expect("Failed to parse reconstructed JSON");

        // Name should be the original text due to error
        assert_eq!(reconstructed_json[1]["name"].as_str().unwrap(), "ハロルド"); 
        // Profile should be translated
        assert_eq!(reconstructed_json[1]["profile"].as_str().unwrap(), "Translated Profile"); 
        // Nickname should be original (empty) and preserved
        assert_eq!(reconstructed_json[1]["nickname"].as_str().unwrap(), ""); 
        // Note should be original and preserved
        assert_eq!(reconstructed_json[1]["note"].as_str().unwrap(), "元のノート"); 
        // battlerName should be original and preserved
        assert_eq!(reconstructed_json[1]["battlerName"].as_str().unwrap(), "Actor1_1");
    }

    #[test]
    fn test_reconstruct_actors_non_existent_id() {
        let original_json_str = json!([
            null,
            {
                "id": 1,
                "name": "Harold",
                "nickname": "",
                "profile": "",
                "note": ""
            }
        ]).to_string();

        let translations = vec![
            WorkingTranslation { // Updated struct name
                object_id: 99, // Non-existent ID
                original_text: "Unknown".to_string(),
                source_file: "www/data/Actors.json".to_string(),
                json_path: "[99].name".to_string(), // Hypothetical path for a non-existent ID
                translated_text: "亡霊".to_string(),
                translation_source: "test_source".to_string(), // Added
                error: None,
            },
        ];
        let translations_ref: Vec<&WorkingTranslation> = translations.iter().collect(); // Updated type

        let result = reconstruct_actors_json(&original_json_str, translations_ref);
        assert!(result.is_ok()); // Function should still succeed, just not modify anything
        let reconstructed_json: Value = serde_json::from_str(&result.unwrap()).unwrap();
        
        // Ensure original data is untouched
        let original_value: Value = serde_json::from_str(&original_json_str).unwrap(); 
        assert_eq!(reconstructed_json, original_value);
        // We expect an eprintln! warning in the console for this case from the main function.
    }

    #[test]
    fn test_reconstruct_actors_non_existent_json_path() {
        let original_json_str = json!([
            null,
            {
                "id": 1,
                "name": "Harold",
                "nickname": "",
                "profile": "",
                "note": ""
            }
        ]).to_string();

        let translations = vec![
            WorkingTranslation { // Updated struct name
                object_id: 1,
                original_text: "Original Field Value".to_string(),
                source_file: "www/data/Actors.json".to_string(),
                json_path: "[1].nonExistentField".to_string(), // Format: "[index].field"
                translated_text: "Translated value for non-existent field".to_string(),
                translation_source: "test_source".to_string(), // Added
                error: None,
            },
        ];
        let translations_ref: Vec<&WorkingTranslation> = translations.iter().collect(); // Updated type

        let result = reconstruct_actors_json(&original_json_str, translations_ref);
        assert!(result.is_ok()); // Function should succeed
        let reconstructed_json: Value = serde_json::from_str(&result.unwrap()).unwrap();

        // Ensure original data is untouched as the path was not found for update
        let original_value: Value = serde_json::from_str(&original_json_str).unwrap();
        assert_eq!(reconstructed_json, original_value);
        // We expect an eprintln! warning from update_value_at_path (via reconstruct_actors_json)
    }
} 