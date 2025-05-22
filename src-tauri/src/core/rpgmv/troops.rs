use serde::Deserialize;
use serde_json::Value;
use crate::core::rpgmv::common::{
    EventCommand, 
    TranslatableStringEntry,
    extract_translatable_strings_from_event_command_list
};

#[derive(Deserialize, Debug, Clone)]
struct TroopPage {
    // conditions: Value, // Not needed for string extraction
    list: Vec<EventCommand>,
    // span: u32, // Not needed for string extraction
}

#[derive(Deserialize, Debug)]
struct Troop {
    id: u32,
    name: String,
    // members: Vec<Value>, // Not needed for string extraction
    pages: Vec<TroopPage>,
}

pub fn extract_strings(
    file_content: &str,
    source_file: &str,
) -> Result<Vec<TranslatableStringEntry>, String> {
    let troops_json: Value = serde_json::from_str(file_content)
        .map_err(|e| format!("Failed to parse Troops.json: {}", e))?;

    let mut entries = Vec::new();

    if let Value::Array(troops_array) = troops_json {
        for (troop_idx, troop_value) in troops_array.iter().enumerate() {
            if troop_idx == 0 && troop_value.is_null() { // RPG Maker arrays are often 1-indexed with a null at [0]
                continue;
            }
            if troop_value.is_null() {
                continue;
            }

            match serde_json::from_value::<Troop>(troop_value.clone()) {
                Ok(troop) => {
                    if troop.id == 0 { // Should not happen for valid troops if index 0 is null
                        continue;
                    }

                    // 1. Extract Troop Name
                    if !troop.name.trim().is_empty() {
                        entries.push(TranslatableStringEntry {
                            object_id: troop.id,
                            text: troop.name.clone(),
                            source_file: source_file.to_string(),
                            json_path: format!("[{}].name", troop_idx),
                        });
                    }

                    // 2. Extract from Event Pages using the helper
                    for (page_idx, page) in troop.pages.iter().enumerate() {
                        let json_path_prefix = format!("[{}].pages[{}].list", troop_idx, page_idx);
                        let mut command_entries = extract_translatable_strings_from_event_command_list(
                            &page.list,
                            troop.id,
                            source_file,
                            &json_path_prefix,
                        );
                        entries.append(&mut command_entries);
                    }
                }
                Err(e) => {
                    eprintln!(
                        "Skipping troop entry at index {} due to parsing error: {}. Value: {}",
                        troop_idx,
                        e,
                        troop_value
                    );
                }
            }
        }
    } else {
        return Err("Troops.json is not a JSON array.".to_string());
    }

    Ok(entries)
} 