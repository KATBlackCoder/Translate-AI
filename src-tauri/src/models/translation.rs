use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug, Clone, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct SourceStringData {
    pub object_id: u32,        // The ID from the JSON object itself (e.g., actor.id, item.id)
    pub original_text: String,          // The actual string to be translated
    pub source_file: String,   // Relative path to the file from the project root, e.g., "www/data/Actors.json"
    pub json_path: String,     // A string representing the path within the JSON, e.g., "[1].name"
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct WorkingTranslation {
    pub object_id: u32,
    pub original_text: String,
    pub translated_text: String,
    pub source_file: String,
    pub json_path: String,
    pub translation_source: String, // e.g., "ollama", "deepl", "glossary"
    pub error: Option<String>,     // To capture individual translation errors
}

// Future: May add other shared translation-related models here. 