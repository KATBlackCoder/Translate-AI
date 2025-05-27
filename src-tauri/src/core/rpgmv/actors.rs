use serde::Deserialize; // Keep Deserialize for the Actor struct
use super::common::{
    TranslatableStringEntry, 
    RpgMvDataObject, 
    extract_strings_from_json_array
};
use serde_json::Value;
// No, TranslatedStringEntryFromFrontend is in crate::models::translation
// use crate::core::rpgmv::common::TranslatedStringEntryFromFrontend; // This path would be wrong if struct is in models
use crate::models::translation::TranslatedStringEntryFromFrontend;
use crate::error::CoreError;
use crate::utils::json_utils::update_value_at_path; // Added import for the helper

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
) -> Result<Vec<TranslatableStringEntry>, String> {
    extract_strings_from_json_array::<Actor>(json_content, file_path, "Actors.json")
} 

pub fn reconstruct_actors_json(
    original_json_str: &str,
    translations: Vec<&TranslatedStringEntryFromFrontend>,
) -> Result<String, CoreError> {
    let mut actors_json_array: Vec<Value> = serde_json::from_str(original_json_str)
        .map_err(|e| CoreError::JsonParse(format!("Failed to parse Actors.json: {}", e)))?;

    for entry in translations {
        let actor_id_to_find = entry.object_id;

        if let Some(actor_value_mut) = actors_json_array.iter_mut().find(|val| {
            // Actors.json can have null entries, so check if it's an object first
            val.is_object() && val.get("id").and_then(|id_val| id_val.as_u64()).map_or(false, |id| id == actor_id_to_find as u64)
        }) {
            // actor_value_mut is now the specific actor object (as a mutable Value)
            // The json_path for actors (e.g., "name", "profile") is relative to this actor object.
            
            let text_to_insert = if entry.error.is_some() {
                &entry.text // Original text if translation failed
            } else {
                &entry.translated_text
            };

            // Use the helper function to update the field within the actor_value_mut
            match update_value_at_path(actor_value_mut, &entry.json_path, text_to_insert) {
                Ok(_) => { /* Successfully updated */ }
                Err(e) => {
                    // Log the error and continue. The field will remain unchanged.
                    eprintln!(
                        "Warning (Actors.json): Failed to update path '{}' for actor id {}: {}. Skipping update for this field.", 
                        entry.json_path, actor_id_to_find, e.to_string()
                    );
                }
            }
        } else {
            eprintln!(
                "Warning (Actors.json): Actor with id {} not found for reconstruction. Path: {}. Skipping update for this entry.", 
                actor_id_to_find, entry.json_path
            );
        }
    }

    serde_json::to_string_pretty(&actors_json_array)
        .map_err(|e| CoreError::JsonSerialize(format!("Failed to serialize Actors.json: {}", e)))
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::models::translation::TranslatedStringEntryFromFrontend;
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
            TranslatedStringEntryFromFrontend {
                object_id: 1,
                text: "ハロルド".to_string(),
                source_file: "www/data/Actors.json".to_string(),
                json_path: "name".to_string(),
                translated_text: "Harold (EN)".to_string(),
                error: None,
            },
            TranslatedStringEntryFromFrontend {
                object_id: 1,
                text: "".to_string(),
                source_file: "www/data/Actors.json".to_string(),
                json_path: "nickname".to_string(),
                translated_text: "Harry".to_string(),
                error: None,
            },
            TranslatedStringEntryFromFrontend {
                object_id: 1,
                text: "".to_string(),
                source_file: "www/data/Actors.json".to_string(),
                json_path: "profile".to_string(),
                translated_text: "A brave hero indeed.".to_string(),
                error: None,
            },
            TranslatedStringEntryFromFrontend {
                object_id: 1,
                text: "".to_string(),
                source_file: "www/data/Actors.json".to_string(),
                json_path: "note".to_string(),
                translated_text: "Harold's translated note.".to_string(),
                error: None,
            },
            // Translate Seren's (ID 9) name and profile only
            TranslatedStringEntryFromFrontend {
                object_id: 9,
                text: "セレン".to_string(),
                source_file: "www/data/Actors.json".to_string(),
                json_path: "name".to_string(),
                translated_text: "Seren (EN)".to_string(),
                error: None,
            },
            TranslatedStringEntryFromFrontend {
                object_id: 9,
                text: "素性は誰も知らない。暗器を隠している。\n振り向いて、彼女がいれば命はない！".to_string(),
                source_file: "www/data/Actors.json".to_string(),
                json_path: "profile".to_string(),
                translated_text: "Her origins are unknown. She conceals hidden weapons.\nIf you turn and see her, your life is forfeit!".to_string(),
                error: None,
            },
        ];
        
        let translations_ref: Vec<&TranslatedStringEntryFromFrontend> = translations.iter().collect();

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
            TranslatedStringEntryFromFrontend {
                object_id: 1,
                text: "ハロルド".to_string(), // Original name
                source_file: "www/data/Actors.json".to_string(),
                json_path: "name".to_string(),
                translated_text: "HLD_TransFail".to_string(), // This would be some placeholder or error string from translation attempt
                error: Some("AI translation timed out".to_string()), // Error occurred for name
            },
            TranslatedStringEntryFromFrontend {
                object_id: 1,
                text: "元のプロフィール".to_string(),
                source_file: "www/data/Actors.json".to_string(),
                json_path: "profile".to_string(),
                translated_text: "Translated Profile".to_string(), // Successful translation for profile
                error: None,
            },
        ];
        let translations_ref: Vec<&TranslatedStringEntryFromFrontend> = translations.iter().collect();

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
            TranslatedStringEntryFromFrontend {
                object_id: 99, // Non-existent ID
                text: "Unknown".to_string(),
                source_file: "www/data/Actors.json".to_string(),
                json_path: "name".to_string(),
                translated_text: "亡霊".to_string(),
                error: None,
            },
        ];
        let translations_ref: Vec<&TranslatedStringEntryFromFrontend> = translations.iter().collect();

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
            TranslatedStringEntryFromFrontend {
                object_id: 1,
                text: "Original Field Value".to_string(),
                source_file: "www/data/Actors.json".to_string(),
                json_path: "nonExistentField".to_string(), // Field not in Actor object
                translated_text: "Translated value for non-existent field".to_string(),
                error: None,
            },
        ];
        let translations_ref: Vec<&TranslatedStringEntryFromFrontend> = translations.iter().collect();

        let result = reconstruct_actors_json(&original_json_str, translations_ref);
        assert!(result.is_ok()); // Function should succeed
        let reconstructed_json: Value = serde_json::from_str(&result.unwrap()).unwrap();

        // Ensure original data is untouched as the path was not found for update
        let original_value: Value = serde_json::from_str(&original_json_str).unwrap();
        assert_eq!(reconstructed_json, original_value);
        // We expect an eprintln! warning from update_value_at_path (via reconstruct_actors_json)
    }
}