use serde::Deserialize;
use super::common::{
    TranslatableStringEntry,
    RpgMvDataObject,
    extract_strings_from_json_array
};

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