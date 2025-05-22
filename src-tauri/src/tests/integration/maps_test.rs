#[cfg(test)]
mod maps_extraction_tests { // Renaming module for consistency
    // use std::path::Path;
    use crate::core::rpgmv::common::TranslatableStringEntry;
    // use crate::core::rpgmv::project::extract_translatable_strings_from_project;
    use crate::tests::common_test_utils::setup_and_extract_all_strings;

    #[test]
    fn test_map_files_extraction() {
        let all_extracted_strings = setup_and_extract_all_strings();

        let map_strings: Vec<&TranslatableStringEntry> = all_extracted_strings
            .iter()
            .filter(|e| e.source_file.starts_with("www/data/Map") && e.source_file.ends_with(".json") && !e.source_file.ends_with("MapInfos.json"))
            .collect();

        // --- MAPXXX.JSON (excluding MapInfos.json) ---
        let expected_map_strings_count = 203; 
        if map_strings.len() != expected_map_strings_count {
            eprintln!("Found {} total strings from MapXXX.json files (excluding MapInfos.json), but expected {}.", map_strings.len(), expected_map_strings_count);
            // Print details for a specific map file if the count is off, e.g., Map001.json
            let map001_strings_for_debug: Vec<&&TranslatableStringEntry> = map_strings.iter().filter(|e| e.source_file.ends_with("Map001.json")).collect();
            eprintln!("Found {} strings specifically from Map001.json (for detail):", map001_strings_for_debug.len());
            for (i, entry) in map001_strings_for_debug.iter().take(25).enumerate() { // Show some examples from Map001.json
                eprintln!("  Map001.json String Example {}: {:?}", i + 1, entry);
            }
            // It might be useful to also see a few from other actual map files if they exist
            let other_map_strings_for_debug: Vec<&&TranslatableStringEntry> = map_strings.iter().filter(|e| e.source_file.starts_with("www/data/Map") && e.source_file.ends_with(".json") && !e.source_file.ends_with("Map001.json") && !e.source_file.ends_with("MapInfos.json")).collect();
            if !other_map_strings_for_debug.is_empty() {
                eprintln!("Found {} strings from other MapXXX.json files (excluding Map001.json and MapInfos.json) (first few shown):", other_map_strings_for_debug.len());
                for (i, entry) in other_map_strings_for_debug.iter().take(5).enumerate() {
                     eprintln!("  Other Map String Example {}: {:?}", i + 1, entry);
                }
            }
        }
        assert_eq!(map_strings.len(), expected_map_strings_count, "Incorrect total number of strings extracted from all MapXXX.json files (excluding MapInfos.json).");

        // Debug: Print all entries from Map001.json that are in map_strings
        eprintln!("--- Debug: Entries from Map001.json in map_strings ---");
        for entry in map_strings.iter().filter(|e| e.source_file == "www/data/Map001.json") {
            eprintln!("{:?}", entry);
        }
        eprintln!("--- End Debug ---");

        // Spot checks for Map001.json
        let map001_file_name = "www/data/Map001.json";

        // 1. Map Display Name for Map001.json
        // The displayName field extraction was temporarily removed, so these checks are commented out.
        // let expected_map_display_name_map1 = "テスト用マップ１";
        // let expected_json_path_display_name_map1 = "displayName";
        // let map_display_name_entry_map1 = map_strings.iter().find(|e| 
        //     e.source_file == map001_file_name && e.object_id == 0 && e.json_path == expected_json_path_display_name_map1
        // );
        // assert!(map_display_name_entry_map1.is_some(), "Could not find map display name for {} with path {} and object_id 0", map001_file_name, expected_json_path_display_name_map1);
        // assert_eq!(map_display_name_entry_map1.unwrap().text, expected_map_display_name_map1, "Incorrect text for map display name ({}, path {}, object_id 0).", map001_file_name, expected_json_path_display_name_map1);

        // 2. Event Name from Map001.json
        let expected_event_id_1_map1 = 1; // Event ID is u32, corresponds to object_id
        let expected_event_name_map1_ev1 = "EV001";
        let expected_json_path_event_name_map1_ev1 = "events[1].name"; // CHANGED from events[0].name
        
        let event_name_entry_map1_ev1 = map_strings.iter().find(|e| 
            e.source_file == map001_file_name && 
            e.object_id == expected_event_id_1_map1 && 
            e.json_path == expected_json_path_event_name_map1_ev1
        );
        assert!(event_name_entry_map1_ev1.is_some(), "Could not find event name for event ID {} on {} with path {}. Found: {:?}", expected_event_id_1_map1, map001_file_name, expected_json_path_event_name_map1_ev1, map_strings.iter().filter(|e| e.source_file == map001_file_name && e.object_id == expected_event_id_1_map1).collect::<Vec<_>>());
        assert_eq!(event_name_entry_map1_ev1.unwrap().text, expected_event_name_map1_ev1, "Incorrect text for event name ({}, Event ID {}, path {}).", map001_file_name, expected_event_id_1_map1, expected_json_path_event_name_map1_ev1);

        // 3. Event Command Text from Map001.json
        let expected_command_text_map1_ev1 = "お呼びですか？ご主人様。";
        let expected_json_path_command_map1_ev1 = "events[1].pages[0].list[10].parameters[0]"; // CHANGED from events[0]...
        
        let command_text_entry_map1_ev1 = map_strings.iter().find(|e| 
            e.source_file == map001_file_name && 
            e.object_id == expected_event_id_1_map1 && // Associates with Event ID 1
            e.json_path == expected_json_path_command_map1_ev1
        );
        assert!(command_text_entry_map1_ev1.is_some(), "Could not find command text for event ID {} on {} with path {}. Check if this specific command exists and is extracted. Filtered: {:?}", expected_event_id_1_map1, map001_file_name, expected_json_path_command_map1_ev1, map_strings.iter().filter(|e|e.source_file == map001_file_name && e.object_id == expected_event_id_1_map1).collect::<Vec<_>>());
        assert_eq!(command_text_entry_map1_ev1.unwrap().text, expected_command_text_map1_ev1, "Incorrect text for command ({}, Event ID {}, path {}).", map001_file_name, expected_event_id_1_map1, expected_json_path_command_map1_ev1);

        // 4. Event Choice Text from Map001.json
        let expected_event_id_2_map1 = 2; // Event ID 2
        let expected_choice_text_map1_ev2 = "メダル1";
        let expected_json_path_choice_map1_ev2 = "events[2].pages[0].list[2].parameters[0][0]"; // CHANGED from events[1]...

        let choice_text_entry_map1_ev2 = map_strings.iter().find(|e| 
            e.source_file == map001_file_name && 
            e.object_id == expected_event_id_2_map1 && // Associates with Event ID 2
            e.json_path == expected_json_path_choice_map1_ev2
        );
        assert!(choice_text_entry_map1_ev2.is_some(), "Could not find choice text for event ID {} on {} with path {}. Filtered: {:?}", expected_event_id_2_map1, map001_file_name, expected_json_path_choice_map1_ev2, map_strings.iter().filter(|e|e.source_file == map001_file_name && e.object_id == expected_event_id_2_map1).collect::<Vec<_>>());
        assert_eq!(choice_text_entry_map1_ev2.unwrap().text, expected_choice_text_map1_ev2, "Incorrect text for choice ({}, Event ID {}, path {}).", map001_file_name, expected_event_id_2_map1, expected_json_path_choice_map1_ev2);

        // If the asserts fail, the eprintln messages with more detailed filtering in the assert! calls should help debug.
        // println!("Successfully validated {} strings from MapXXX.json files (excluding MapInfos.json). DEBUG MODE - SOME ASSERTS COMMENTED", map_strings.len());
         println!("Successfully validated {} strings from MapXXX.json files (excluding MapInfos.json).", map_strings.len());
    }

    // Placeholder for MapInfos.json test (if you decide to add it back or test separately)
    /*
    #[test]
    fn test_map_infos_extraction() {
        let all_extracted_strings = setup_and_extract_all_strings();
        let map_info_strings: Vec<&TranslatableStringEntry> = all_extracted_strings
            .iter()
            .filter(|e| e.source_file.ends_with("MapInfos.json"))
            .collect();
        
        // Update with expected count for MapInfos.json
        let expected_map_info_strings_count = 2; // Placeholder! Update with actual count from your sample.
        assert_eq!(map_info_strings.len(), expected_map_info_strings_count, "Incorrect number of strings from MapInfos.json");

        // Example for a map name (e.g., Map ID 1, name from MapInfos.json)
        // Update text, object_id, and json_path based on your MapInfos.json
        let expected_map_id_1_info = 1;
        let expected_map_name_1_info = "テスト用マップ１"; // Name from MapInfos.json for Map ID 1
        let expected_json_path_map_name_1_info = "[1].name"; // Assuming map id 1 is at index 1 in the JSON array

        if let Some(map_info_entry) = map_info_strings.iter().find(|e|
            e.object_id == expected_map_id_1_info && e.json_path == expected_json_path_map_name_1_info
        ) {
            assert_eq!(map_info_entry.text, expected_map_name_1_info, "Incorrect text for map info name spot check (ID {}).", expected_map_id_1_info);
        } else {
            panic!("Map info for ID {} (name) not found in MapInfos.json. Verify your MapInfos.json and extraction logic.", expected_map_id_1_info);
        }
        println!("Successfully validated {} strings from MapInfos.json.", map_info_strings.len());
    }
    */
} 