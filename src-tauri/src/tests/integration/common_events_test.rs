#[cfg(test)]
mod common_events_extraction_tests {
    // use std::path::Path;
    use crate::core::rpgmv::common::TranslatableStringEntry;
    // use crate::core::rpgmv::project::extract_translatable_strings_from_project;
    use crate::tests::common_test_utils::setup_and_extract_all_strings;

    #[test]
    fn test_common_events_extraction() {
        let all_extracted_strings = setup_and_extract_all_strings();

        let common_event_strings: Vec<&TranslatableStringEntry> = all_extracted_strings
            .iter()
            .filter(|e| e.source_file.ends_with("CommonEvents.json"))
            .collect();

        // --- COMMONITEMS.JSON --- 
        let expected_common_event_strings_count = 1084; 
        if common_event_strings.len() != expected_common_event_strings_count {
            eprintln!("Found {} strings from CommonEvents.json, but expected {}.", common_event_strings.len(), expected_common_event_strings_count);
            for (i, entry) in common_event_strings.iter().take(25).enumerate() { // Show more examples
                eprintln!("  CommonEvent String Example {}: {:?}", i + 1, entry);
            }
        }
        assert_eq!(common_event_strings.len(), expected_common_event_strings_count, "Incorrect number of strings extracted from CommonEvents.json.");

        // Spot check for Common Event ID 1, name "TPチャージ"
        let expected_event_id_1 = 1;
        let expected_event_name_1 = "TPチャージ";
        let expected_json_path_name_1 = "[1].name";
        
        let event_name_entry_1 = common_event_strings.iter().find(|e| 
            e.object_id == expected_event_id_1 && e.json_path == expected_json_path_name_1
        );
        assert!(event_name_entry_1.is_some(), "Could not find common event name for ID {} with path {}", expected_event_id_1, expected_json_path_name_1);
        assert_eq!(event_name_entry_1.unwrap().text, expected_event_name_1, "Incorrect text for common event name (ID {}, path {}).", expected_event_id_1, expected_json_path_name_1);

        // Spot check for Common Event ID 6, command text
        let expected_event_id_6 = 6;
        let expected_command_text_6 = "\u{3000}\u{3000}\u{3000}\u{3000}\u{3000}\u{3000}恥獄隷奴セレン体験版へようこそ！"; // "　　　　　　恥獄隷奴セレン体験版へようこそ！"
        let expected_json_path_command_6 = "[6].list[2].parameters[0]";
        
        let command_text_entry_6 = common_event_strings.iter().find(|e| 
            e.object_id == expected_event_id_6 && e.json_path == expected_json_path_command_6
        );
        assert!(command_text_entry_6.is_some(), "Could not find command text for event ID {} with path {}", expected_event_id_6, expected_json_path_command_6);
        assert_eq!(command_text_entry_6.unwrap().text, expected_command_text_6, "Incorrect text for command (event ID {}, path {}).", expected_event_id_6, expected_json_path_command_6);

        // Spot check for Common Event ID 20, name "降参"
        let expected_event_id_20 = 20;
        let expected_event_name_20 = "降参";
        let expected_json_path_name_20 = "[20].name";
        
        let event_name_entry_20 = common_event_strings.iter().find(|e| 
            e.object_id == expected_event_id_20 && e.json_path == expected_json_path_name_20
        );
        assert!(event_name_entry_20.is_some(), "Could not find common event name for ID {} with path {}", expected_event_id_20, expected_json_path_name_20);
        assert_eq!(event_name_entry_20.unwrap().text, expected_event_name_20, "Incorrect text for common event name (ID {}, path {}).", expected_event_id_20, expected_json_path_name_20);
        
        // Spot check for Common Event ID 20, command text "立場がわからず・・・・"
        let expected_command_text_20_alt = "立場がわからず・・・・";
        let expected_json_path_command_20_alt = "[20].list[5].parameters[0]";

        let command_text_entry_20_alt = common_event_strings.iter().find(|e| 
            e.object_id == expected_event_id_20 && e.json_path == expected_json_path_command_20_alt
        );
        assert!(command_text_entry_20_alt.is_some(), "Could not find command text for event ID {} with path {}", expected_event_id_20, expected_json_path_command_20_alt);
        assert_eq!(command_text_entry_20_alt.unwrap().text, expected_command_text_20_alt, "Incorrect text for command (event ID {}, path {}).", expected_event_id_20, expected_json_path_command_20_alt);

        println!("Successfully validated {} strings from CommonEvents.json.", common_event_strings.len());
    }
} 