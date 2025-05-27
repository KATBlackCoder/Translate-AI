use serde::Deserialize;

#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct TranslatedStringEntryFromFrontend {
    pub object_id: u32,
    pub text: String, // Original text
    pub source_file: String,
    pub json_path: String,
    pub translated_text: String,
    pub error: Option<String>,
}

// Future: May add other shared translation-related models here. 