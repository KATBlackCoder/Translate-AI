use serde::Deserialize;
use super::common::{
    TranslatableStringEntry,
    RpgMvDataObject,
    extract_strings_from_json_array
};

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