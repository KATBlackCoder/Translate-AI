use serde::Deserialize;
use super::common::{
    TranslatableStringEntry, 
    RpgMvDataObject, 
    extract_strings_from_json_array
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
) -> Result<Vec<TranslatableStringEntry>, String> {
    extract_strings_from_json_array::<Armor>(file_content, source_file, "Armors.json")
} 