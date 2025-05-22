use serde::Deserialize;
use super::common::{
    TranslatableStringEntry,
    RpgMvDataObject,
    extract_strings_from_json_array
};

#[derive(Deserialize, Debug)]
struct Enemy {
    id: u32,
    name: String,
    note: String,
    // Other fields like battlerHue, battlerName, actions, dropItems, etc., are not needed for translation
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
) -> Result<Vec<TranslatableStringEntry>, String> {
    extract_strings_from_json_array::<Enemy>(file_content, source_file, "Enemies.json")
} 