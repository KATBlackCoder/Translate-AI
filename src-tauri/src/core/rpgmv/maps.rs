use serde::Deserialize;
use serde_json::Value; // Required for EventCommand parameters
use crate::core::rpgmv::common::{
    EventCommand, TranslatableStringEntry,
    extract_translatable_strings_from_event_command_list, // Import the helper
};

// Represents an event page within a map event.
#[derive(Deserialize, Debug, Clone)]
struct MapEventPage {
    // We only need the list of commands for string extraction.
    // Conditions, image, moveType, etc., are not relevant here.
    list: Vec<EventCommand>,
}

// Represents a single event on the map.
#[derive(Deserialize, Debug)]
struct MapEvent {
    id: u32,
    name: String,
    // x: u32, // Not needed for string extraction
    // y: u32, // Not needed for string extraction
    pages: Vec<MapEventPage>,
}

// Represents the top-level structure of a MapXXX.json file.
#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct MapData {
    // tileset_id: u32, // Not needed
    // width: u32, // Not needed
    // height: u32, // Not needed
    // scroll_type: u32, // Not needed
    // specify_battleback: bool, // Not needed
    // battleback1_name: Option<String>, // Not needed (usually image file path)
    // battleback2_name: Option<String>, // Not needed (usually image file path)
    // autoplay_bgm: bool, // Not needed
    // bgm: Value, // Not needed
    // autoplay_bgs: bool, // Not needed
    // bgs: Value, // Not needed
    // disable_dashing: bool, // Not needed
    // encounter_list: Vec<Value>, // Not needed
    // encounter_step: u32, // Not needed
    // parallax_name: Option<String>, // Not needed (image file path)
    // parallax_loop_x: bool, // Not needed
    // parallax_loop_y: bool, // Not needed
    // parallax_sx: u32, // Not needed
    // parallax_sy: u32, // Not needed
    // parallax_show: bool, // Not needed
    // note: Option<String>, // Map notes are usually for editor, but could be extracted if needed.
    data: Vec<u32>, // Tile data, not needed for string extraction
    events: Vec<Option<MapEvent>>, // Array of events on the map, can contain nulls
}

pub fn extract_strings(
    file_content: &str,
    source_file: &str, // e.g., "www/data/Map001.json"
) -> Result<Vec<TranslatableStringEntry>, String> {
    let map_data: MapData = serde_json::from_str(file_content)
        .map_err(|e| format!("Failed to parse {}: {}. Content snippet: {:.100}", source_file, e, file_content.chars().take(100).collect::<String>()))?;

    let mut entries = Vec::new();

    // 1. Extract Map Display Name
    // if let Some(display_name) = &map_data.display_name {
    //     if !display_name.trim().is_empty() {
    //         entries.push(TranslatableStringEntry {
    //             object_id: 0, // Using 0 as a convention for map display name (map ID is in source_file)
    //             text: display_name.clone(),
    //             source_file: source_file.to_string(),
    //             json_path: "displayName".to_string(),
    //         });
    //     }
    // }

    // 2. Extract from Events
    for (event_idx, event_option) in map_data.events.iter().enumerate() {
        if event_idx == 0 && event_option.is_none() {
            // RPG Maker map events can be null, especially the 0th element if 1-indexed in editor
            continue;
        }
        if let Some(event) = event_option {
            if event.id == 0 { // Should not happen for valid events if index 0 is skipped/null
                continue;
            }

            // Extract Event Name
            if !event.name.trim().is_empty() {
                entries.push(TranslatableStringEntry {
                    object_id: event.id, 
                    text: event.name.clone(),
                    source_file: source_file.to_string(),
                    json_path: format!("events[{}].name", event_idx), // event_idx is the original index in the JSON array
                });
            }

            // Extract from Event Pages
            for (page_idx, page) in event.pages.iter().enumerate() {
                let command_list_json_path_prefix = format!(
                    "events[{}].pages[{}].list",
                    event_idx, page_idx
                );
                let mut page_entries = extract_translatable_strings_from_event_command_list(
                    &page.list,
                    event.id,
                    source_file,
                    &command_list_json_path_prefix,
                );
                entries.append(&mut page_entries);
            }
        } else if event_idx != 0 { // Log if a non-0th event is unexpectedly null
             eprintln!("Warning: Found null event at non-zero index {} in file {}", event_idx, source_file);
        }
    }

    Ok(entries)
} 