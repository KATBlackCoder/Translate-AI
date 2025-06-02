use serde::Deserialize;
use serde_json::Value; // Required for EventCommand parameters
use crate::models::translation::{SourceStringData, WorkingTranslation};
use crate::core::rpgmv::common::{
    EventCommand,
    extract_translatable_strings_from_event_command_list,
    reconstruct_event_command_list,
};

use crate::error::CoreError;
use crate::utils::json_utils::update_value_at_path;

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
) -> Result<Vec<SourceStringData>, String> {
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
                entries.push(SourceStringData {
                    object_id: event.id, 
                    original_text: event.name.clone(),
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


pub fn reconstruct_map_json(
    original_json_str: &str,
    translations: Vec<&WorkingTranslation>,
    source_file_name_for_error_logging: &str, // e.g., "Map001.json"
) -> Result<String, CoreError> {
    let mut map_data_json: Value = serde_json::from_str(original_json_str)
        .map_err(|e| CoreError::JsonParse(format!("Failed to parse {}: {}", source_file_name_for_error_logging, e)))?;

    // Direct updates for event names
    for entry in translations.iter().filter(|t| t.json_path.ends_with("].name")) {
        // Example path: "events[1].name"
        let parts: Vec<&str> = entry.json_path.split(|c| c == '[' || c == ']' || c == '.').filter(|s| !s.is_empty()).collect();
        // Expected parts: ["events", "event_idx_str", "name"]

        if parts.len() == 3 && parts[0] == "events" && parts[2] == "name" {
            if let Ok(event_idx) = parts[1].parse::<usize>() {
                if let Some(events_array) = map_data_json.get_mut("events").and_then(|e| e.as_array_mut()) {
                    if event_idx < events_array.len() && !events_array[event_idx].is_null() {
                        
                        let event_object_id_from_json = events_array[event_idx].get("id")
                            .and_then(|id_val| id_val.as_u64())
                            .map_or(0, |id| id as u32);

                        if event_object_id_from_json != entry.object_id {
                            eprintln!(
                                "Warning ({}): Mismatched object_id for event name at index {}. Expected {}, found in translation {}. Path: {}. Skipping.",
                                source_file_name_for_error_logging, event_idx, event_object_id_from_json, entry.object_id, entry.json_path
                            );
                            continue;
                        }
                        
                        let text_to_insert = if entry.error.is_some() { &entry.original_text } else { &entry.translated_text };
                        if let Err(e) = update_value_at_path(&mut events_array[event_idx], "name", text_to_insert) {
                            eprintln!(
                                "Warning ({}): Failed to update event name for event id {} (index {}): {}. Path: {}. Skipping.",
                                source_file_name_for_error_logging, entry.object_id, event_idx, e, entry.json_path
                            );
                        }
                    } else {
                        eprintln!(
                            "Warning ({}): Event index {} for name update out of bounds or null. Path: {}. Skipping.",
                            source_file_name_for_error_logging, event_idx, entry.json_path
                        );
                    }
                }
            } else {
                eprintln!(
                    "Warning ({}): Could not parse event index from path for name update: {}. Skipping.",
                    source_file_name_for_error_logging, entry.json_path
                );
            }
        }
    }

    // Reconstruct event command lists within pages
    if let Some(events_array) = map_data_json.get_mut("events").and_then(|e| e.as_array_mut()) {
        for event_idx in 0..events_array.len() {
            if events_array[event_idx].is_null() { continue; }

            let current_event_id = events_array[event_idx].get("id")
                .and_then(|id_val| id_val.as_u64())
                .map_or(0, |id| id as u32);
            
            if current_event_id == 0 { continue; } // Should not happen for valid events

            if let Some(pages_array) = events_array[event_idx].get_mut("pages").and_then(|p| p.as_array_mut()) {
                for page_idx in 0..pages_array.len() {
                    let page_json_path_prefix = format!("events[{}].pages[{}].list", event_idx, page_idx);
                    
                    let relevant_translations_for_page: Vec<&WorkingTranslation> = translations
                        .iter()
                        .filter(|t| t.object_id == current_event_id && t.json_path.starts_with(&page_json_path_prefix))
                        .map(|&t_ref| t_ref)
                        .collect();

                    if !relevant_translations_for_page.is_empty() {
                        if let Some(list_value) = pages_array[page_idx].get_mut("list") {
                            if let Value::Array(list_array) = list_value {
                                match reconstruct_event_command_list(list_array, current_event_id, &relevant_translations_for_page, &page_json_path_prefix) {
                                    Ok(_) => { /* Successfully updated list */ }
                                    Err(e) => {
                                        eprintln!(
                                            "Error reconstructing command list for {} event id {}, page {}: {}. List might be partially updated.", 
                                            source_file_name_for_error_logging, current_event_id, page_idx, e
                                        );
                                    }
                                }
                            } else {
                                eprintln!("Warning ({}): 'list' field for event id {}, page {} is not an array.", source_file_name_for_error_logging, current_event_id, page_idx);
                            }
                        } else {
                             eprintln!("Warning ({}): No 'list' field found for event id {}, page {}.", source_file_name_for_error_logging, current_event_id, page_idx);
                        }
                    }
                }
            }
        }
    }

    serde_json::to_string_pretty(&map_data_json)
        .map_err(|e| CoreError::JsonSerialize(format!("Failed to serialize {}: {}", source_file_name_for_error_logging, e)))
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::Value;

    const TEST_MAP001_JSON: &str = r#"
{
"autoplayBgm":false,
"autoplayBgs":false,
"battleback1Name":"",
"battleback2Name":"",
"bgm":{"name":"","pan":0,"pitch":100,"volume":90},
"bgs":{"name":"","pan":0,"pitch":100,"volume":90},
"disableDashing":false,
"displayName":"コモンイベントマップ",
"encounterList":[],
"encounterStep":30,
"events":[
null,
{"id":1,"name":"EV001","note":"","pages":[{"conditions":{"actorId":1,"actorValid":false,"itemId":1,"itemValid":false,"selfSwitchCh":"A","selfSwitchValid":false,"switch1Id":1,"switch1Valid":false,"switch2Id":1,"switch2Valid":false,"variableId":1,"variableValid":false,"variableValue":0},"directionFix":false,"image":{"characterIndex":0,"characterName":"","direction":2,"pattern":0,"tileId":0},"list":[{"code":101,"indent":0,"parameters":["Face1",0,0,2,""]},{"code":401,"indent":0,"parameters":["This is a dialogue."]},{"code":102,"indent":0,"parameters":[["Choice A","Choice B"],1,0,2,0]},{"code":0,"indent":0,"parameters":[]}],"moveFrequency":3,"moveRoute":{"list":[{"code":0,"parameters":[]}],"repeat":true,"skippable":false,"wait":false},"moveSpeed":3,"moveType":0,"priorityType":0,"stepAnime":false,"through":false,"trigger":0,"walkAnime":true}],"x":3,"y":4},
{"id":2,"name":"EV002","note":"イベントのメモです","pages":[{"conditions":{"actorId":1,"actorValid":false,"itemId":1,"itemValid":false,"selfSwitchCh":"A","selfSwitchValid":false,"switch1Id":1,"switch1Valid":false,"switch2Id":1,"switch2Valid":false,"variableId":1,"variableValid":false,"variableValue":0},"directionFix":false,"image":{"characterIndex":0,"characterName":"","direction":2,"pattern":0,"tileId":0},"list":[{"code":108,"indent":0,"parameters":["This is a comment."]},{"code":401,"indent":0,"parameters":["Another line here."]},{"code":0,"indent":0,"parameters":[]}],"moveFrequency":3,"moveRoute":{"list":[{"code":0,"parameters":[]}],"repeat":true,"skippable":false,"wait":false},"moveSpeed":3,"moveType":0,"priorityType":1,"stepAnime":false,"through":false,"trigger":1,"walkAnime":true}],"x":6,"y":7}
],
"height":10,
"note":"マップのメモです。\n改行も入れたりします。",
"parallaxLoopX":false,
"parallaxLoopY":false,
"parallaxName":"",
"parallaxShow":false,
"parallaxSx":0,
"parallaxSy":0,
"scrollType":0,
"specifyBattleback":false,
"tilesetId":1,
"width":10,
"data":[]
}
"#; // data array is empty for simplicity

    #[test]
    fn test_reconstruct_map_basic_translations() {
        let original_json_str = TEST_MAP001_JSON;
        let translations_data = vec![
            WorkingTranslation {
                object_id: 1, 
                original_text: "EV001".to_string(),
                source_file: "www/data/Map001.json".to_string(),
                json_path: "events[1].name".to_string(),
                translated_text: "Event One (EN)".to_string(),
                translation_source: "test".to_string(),
                error: None,
            },
            WorkingTranslation {
                object_id: 1, 
                original_text: "This is a dialogue.".to_string(),
                source_file: "www/data/Map001.json".to_string(),
                json_path: "events[1].pages[0].list[1].parameters[0]".to_string(),
                translated_text: "C'est un dialogue. (FR)".to_string(),
                translation_source: "test".to_string(),
                error: None,
            },
            WorkingTranslation {
                object_id: 1, 
                original_text: "Choice A".to_string(),
                source_file: "www/data/Map001.json".to_string(),
                json_path: "events[1].pages[0].list[2].parameters[0].[0]".to_string(),
                translated_text: "Choix A (FR)".to_string(),
                translation_source: "test".to_string(),
                error: None,
            },
            WorkingTranslation {
                object_id: 2, 
                original_text: "EV002".to_string(),
                source_file: "www/data/Map001.json".to_string(),
                json_path: "events[2].name".to_string(),
                translated_text: "Event Two (DE)".to_string(),
                translation_source: "test".to_string(),
                error: None,
            },
            WorkingTranslation {
                object_id: 2, 
                original_text: "This is a comment.".to_string(),
                source_file: "www/data/Map001.json".to_string(),
                json_path: "events[2].pages[0].list[0].parameters[0]".to_string(),
                translated_text: "Das ist ein Kommentar. (DE)".to_string(),
                translation_source: "test".to_string(),
                error: None,
            },
        ];
        let translations_ref: Vec<&WorkingTranslation> = translations_data.iter().collect();

        let result = reconstruct_map_json(original_json_str, translations_ref, "Map001.json");
        assert!(result.is_ok(), "reconstruct_map_json failed: {:?}", result.err());
        let reconstructed_json_str = result.unwrap();
        let reconstructed_json: Value = serde_json::from_str(&reconstructed_json_str).expect("Failed to parse reconstructed JSON");

        assert_eq!(reconstructed_json["events"][1]["name"].as_str().unwrap(), "Event One (EN)");
        assert_eq!(reconstructed_json["events"][1]["pages"][0]["list"][1]["parameters"][0].as_str().unwrap(), "C'est un dialogue. (FR)");
        assert_eq!(reconstructed_json["events"][1]["pages"][0]["list"][2]["parameters"][0][0].as_str().unwrap(), "Choix A (FR)");
        
        assert_eq!(reconstructed_json["events"][2]["name"].as_str().unwrap(), "Event Two (DE)");
        assert_eq!(reconstructed_json["events"][2]["pages"][0]["list"][0]["parameters"][0].as_str().unwrap(), "Das ist ein Kommentar. (DE)");

        // Check something not translated
        assert_eq!(reconstructed_json["events"][1]["pages"][0]["list"][2]["parameters"][0][1].as_str().unwrap(), "Choice B");
        assert_eq!(reconstructed_json["displayName"].as_str().unwrap(), "コモンイベントマップ"); // displayName not touched
    }

    #[test]
    fn test_reconstruct_map_with_translation_error() {
        let original_json_str = TEST_MAP001_JSON;
        let translations_data = vec![
            WorkingTranslation { 
                object_id: 1,
                original_text: "EV001".to_string(),
                source_file: "www/data/Map001.json".to_string(),
                json_path: "events[1].name".to_string(),
                translated_text: "Failed Name".to_string(),
                translation_source: "test".to_string(),
                error: Some("AI blew up".to_string()),
            },
            WorkingTranslation { 
                object_id: 1,
                original_text: "This is a dialogue.".to_string(),
                source_file: "www/data/Map001.json".to_string(),
                json_path: "events[1].pages[0].list[1].parameters[0]".to_string(),
                translated_text: "Good Dialogue!".to_string(),
                translation_source: "test".to_string(),
                error: None,
            },
        ];
        let translations_ref: Vec<&WorkingTranslation> = translations_data.iter().collect();
        let result = reconstruct_map_json(original_json_str, translations_ref, "Map001.json");
        assert!(result.is_ok());
        let reconstructed_json: Value = serde_json::from_str(&result.unwrap()).unwrap();

        assert_eq!(reconstructed_json["events"][1]["name"].as_str().unwrap(), "EV001"); // Original text
        assert_eq!(reconstructed_json["events"][1]["pages"][0]["list"][1]["parameters"][0].as_str().unwrap(), "Good Dialogue!");
    }

    #[test]
    fn test_reconstruct_map_non_existent_event_index_in_path() {
        let original_json_str = TEST_MAP001_JSON;
        let translations_data = vec![
            WorkingTranslation {
                object_id: 1, 
                original_text: "EV001".to_string(),
                source_file: "www/data/Map001.json".to_string(),
                json_path: "events[99].name".to_string(), 
                translated_text: "Phantom Name".to_string(),
                translation_source: "test".to_string(),
                error: None,
            },
        ];
        let translations_ref: Vec<&WorkingTranslation> = translations_data.iter().collect();
        let result = reconstruct_map_json(original_json_str, translations_ref, "Map001.json");
        assert!(result.is_ok());
        let reconstructed_value: Value = serde_json::from_str(&result.unwrap()).unwrap();
        let original_value: Value = serde_json::from_str(original_json_str).unwrap();
        assert_eq!(reconstructed_value, original_value, "JSON should be unchanged for out-of-bounds event index");
    }
    
    #[test]
    fn test_reconstruct_map_id_mismatch_event_name() {
        let original_json_str = TEST_MAP001_JSON;
        let translations_data = vec![
            WorkingTranslation {
                object_id: 2, 
                original_text: "EV001".to_string(),
                source_file: "www/data/Map001.json".to_string(),
                json_path: "events[1].name".to_string(), 
                translated_text: "Wrong Event Name".to_string(),
                translation_source: "test".to_string(),
                error: None,
            },
        ];
        let translations_ref: Vec<&WorkingTranslation> = translations_data.iter().collect();
        let result = reconstruct_map_json(original_json_str, translations_ref, "Map001.json");
        assert!(result.is_ok());
        let reconstructed_value: Value = serde_json::from_str(&result.unwrap()).unwrap();
        let original_value: Value = serde_json::from_str(original_json_str).unwrap();
        assert_eq!(reconstructed_value, original_value, "JSON should be unchanged due to event ID mismatch");
    }


    #[test]
    fn test_reconstruct_map_empty_translations() {
        let original_json_str = TEST_MAP001_JSON;
        let translations_data: Vec<WorkingTranslation> = vec![];
        let translations_ref: Vec<&WorkingTranslation> = translations_data.iter().collect();

        let result = reconstruct_map_json(original_json_str, translations_ref, "Map001.json");
        assert!(result.is_ok());
        let reconstructed_json_str = result.unwrap();
        let original_value: Value = serde_json::from_str(original_json_str).expect("Failed to parse original JSON for comparison");
        let reconstructed_value: Value = serde_json::from_str(&reconstructed_json_str).expect("Failed to parse reconstructed JSON for comparison");
        assert_eq!(reconstructed_value, original_value);
    }

    #[test]
    fn test_reconstruct_map_invalid_original_json() {
        let original_json_str = r#"{"events": [null, {"id":1, name:"broken"}]}"#; // Malformed
        let translations_data: Vec<WorkingTranslation> = vec![];
        let translations_ref: Vec<&WorkingTranslation> = translations_data.iter().collect();
        let result = reconstruct_map_json(original_json_str, translations_ref, "MapBroken.json");
        assert!(result.is_err());
        match result.err().unwrap() {
            CoreError::JsonParse(_) => {} // Expected
            _ => panic!("Expected JsonParse error"),
        }
    }

    #[test]
    fn test_reconstruct_map_non_existent_internal_path_in_command() {
        let original_json_str = TEST_MAP001_JSON;
        let translations_data = vec![
            WorkingTranslation {
                object_id: 1, 
                original_text: "Value".to_string(),
                source_file: "www/data/Map001.json".to_string(),
                json_path: "events[1].pages[0].list[0].parameters.[99]".to_string(), // Non-existent parameter index
                translated_text: "Translated Deep Invented".to_string(),
                translation_source: "test".to_string(),
                error: None,
            },
        ];
        let translations_ref: Vec<&WorkingTranslation> = translations_data.iter().collect();
        let result = reconstruct_map_json(original_json_str, translations_ref, "Map001.json");
        assert!(result.is_ok());
        let reconstructed_value: Value = serde_json::from_str(&result.unwrap()).expect("Failed to parse reconstructed");
        let original_value: Value = serde_json::from_str(original_json_str).expect("Failed to parse original");
        assert_eq!(reconstructed_value, original_value, "JSON should be unchanged for non-existent parameter path");
    }
} 