use serde::Deserialize; // Keep Deserialize for the Actor struct
use super::common::{
    TranslatableStringEntry, 
    RpgMvDataObject, 
    extract_strings_from_json_array
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