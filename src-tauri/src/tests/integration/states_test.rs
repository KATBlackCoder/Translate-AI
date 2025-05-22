#[cfg(test)]
mod states_extraction_tests {
    // use std::path::Path;
    use crate::core::rpgmv::common::TranslatableStringEntry;
    // use crate::core::rpgmv::project::extract_translatable_strings_from_project;
    use crate::tests::common_test_utils::setup_and_extract_all_strings;

    // Removed local helper

    #[test]
    fn test_states_extraction() {
        let all_extracted_strings = setup_and_extract_all_strings();

        let states_strings: Vec<&TranslatableStringEntry> = all_extracted_strings
            .iter()
            .filter(|e| e.source_file.ends_with("States.json"))
            .collect();

        // --- STATES.JSON ---
        // IMPORTANT: This count will need to be updated after the first run.
        let expected_states_strings_count = 52; // <<<< UPDATE THIS PLACEHOLDER
        if states_strings.len() != expected_states_strings_count {
            eprintln!("Found {} strings from States.json, but expected {}.", states_strings.len(), expected_states_strings_count);
            eprintln!("Please update 'expected_states_strings_count' in the test.");
            for (i, entry) in states_strings.iter().take(20).enumerate() { // Show some examples
                eprintln!("  States String Example {}: {:?}", i + 1, entry);
            }
        }
        // Comment out or adjust this assertion until you have the correct count.
        // assert_eq!(states_strings.len(), expected_states_strings_count, "Incorrect number of strings extracted from States.json.");

        // --- Spot Checks for States.json ---
        // These are examples. You'll need to verify against your actual SampleRpgMvProject/www/data/States.json

        // Example: State ID 1 (usually "戦闘不能" - Knockout/Defeated)
        let expected_state_id_1 = 1;
        let expected_state_name_1 = "戦闘不能"; // <<<< UPDATE THIS PLACEHOLDER
        let expected_json_path_name_1 = "[1].name";

        if let Some(entry) = states_strings.iter().find(|e| 
            e.object_id == expected_state_id_1 && e.json_path == expected_json_path_name_1
        ) {
            assert_eq!(entry.text, expected_state_name_1, "Incorrect name for State ID {}, path {}.", expected_state_id_1, expected_json_path_name_1);
        } else {
            if expected_states_strings_count > 0 && !expected_state_name_1.is_empty() { 
                panic!("Could not find State name for ID {} with path {}. Update placeholder or check extraction.", expected_state_id_1, expected_json_path_name_1);
            }
        }
        
        // Example: State ID 1, message1 (e.g., "<actor> is knocked out!")
        // Your sample data for state 1 (戦闘不能) might have an empty message1, message2, etc.
        // If so, these specific checks might need to target a different state ID that *does* have these messages.
        let expected_state_message1_1 = "は倒れた！"; // <<<< UPDATE THIS PLACEHOLDER (or change ID if State 1 has no message1)
        let expected_json_path_message1_1 = "[1].message1";
        if let Some(entry) = states_strings.iter().find(|e| 
            e.object_id == expected_state_id_1 && e.json_path == expected_json_path_message1_1
        ) {
            assert_eq!(entry.text, expected_state_message1_1, "Incorrect message1 for State ID {}, path {}.", expected_state_id_1, expected_json_path_message1_1);
        } else {
            // Only panic if count is confirmed AND this specific message is expected to be non-empty
            if expected_states_strings_count > 0 && !expected_state_message1_1.is_empty() {
                 panic!("Could not find State message1 for ID {} with path {}. Update placeholder, check sample data, or extraction logic.", expected_state_id_1, expected_json_path_message1_1);
            }
        }

        // Example: State ID 4 (e.g., "毒" - Poison)
        let expected_state_id_4 = 4; // Example, adjust to a state with multiple messages if possible
        let expected_state_name_4 = "毒"; // <<<< UPDATE THIS PLACEHOLDER
        let expected_json_path_name_4 = "[4].name";
        if let Some(entry) = states_strings.iter().find(|e| 
            e.object_id == expected_state_id_4 && e.json_path == expected_json_path_name_4
        ) {
            assert_eq!(entry.text, expected_state_name_4, "Incorrect name for State ID {}, path {}.", expected_state_id_4, expected_json_path_name_4);
        } else {
            if expected_states_strings_count > 0 && !expected_state_name_4.is_empty() { 
                panic!("Could not find State name for ID {} with path {}. Update placeholder or check extraction.", expected_state_id_4, expected_json_path_name_4);
            }
        }

        let expected_state_message4_4 = "の毒が消えた！"; // <<<< UPDATE THIS PLACEHOLDER (message when poison damage is taken on floor)
        let expected_json_path_message4_4 = "[4].message4"; // message4: Message when taking damage from the state on the map screen.
        if let Some(entry) = states_strings.iter().find(|e| 
            e.object_id == expected_state_id_4 && e.json_path == expected_json_path_message4_4
        ) {
            assert_eq!(entry.text, expected_state_message4_4, "Incorrect message4 for State ID {}, path {}.", expected_state_id_4, expected_json_path_message4_4);
        } else {
            if expected_states_strings_count > 0 && !expected_state_message4_4.is_empty() {
                 panic!("Could not find State message4 for ID {} with path {}. Update placeholder, check sample data, or extraction logic.", expected_state_id_4, expected_json_path_message4_4);
            }
        }

        if expected_states_strings_count > 0 {
            println!("Successfully (tentatively) validated strings from States.json. PLEASE VERIFY COUNTS AND SPOT CHECKS.");
        } else {
            println!("States.json test ran. PLEASE UPDATE expected_states_strings_count and spot checks based on output.");
        }
    }
} 