use serde::Deserialize;
use crate::core::rpgmv::common::TranslatableStringEntry;

#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct MapInfoEntry {
    id: u32,
    name: String,
    // parent_id: u32, // Not needed for translation
    // order: u32,     // Not needed for translation
    // expanded: bool, // Not needed for translation
    // scroll_x: f64,  // Not needed for translation
    // scroll_y: f64,  // Not needed for translation
}

pub fn extract_strings(
    file_content: &str,
    source_file: &str, // e.g., "www/data/MapInfos.json"
) -> Result<Vec<TranslatableStringEntry>, String> {
    let map_infos: Vec<Option<MapInfoEntry>> = serde_json::from_str(file_content)
        .map_err(|e| format!("Failed to parse {}: {}. Content snippet: {:.100}", source_file, e, file_content.chars().take(100).collect::<String>()))?;

    let mut entries = Vec::new();

    for (index, map_info_option) in map_infos.iter().enumerate() {
        if index == 0 && map_info_option.is_none() {
            // Common RPG Maker pattern: first element is null.
            continue;
        }

        if let Some(map_info) = map_info_option {
            if map_info.id == 0 { // Skip if id is 0, placeholder or invalid
                continue;
            }
            if !map_info.name.trim().is_empty() {
                entries.push(TranslatableStringEntry {
                    object_id: map_info.id,
                    text: map_info.name.clone(),
                    source_file: source_file.to_string(),
                    json_path: format!("[{}].name", index), // Use original index from JSON array
                });
            }
        }
        // No need to log other nulls explicitly unless debugging, as Vec<Option<T>> handles it.
    }

    Ok(entries)
} 