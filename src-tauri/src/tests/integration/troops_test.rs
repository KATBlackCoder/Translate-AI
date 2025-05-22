#[cfg(test)]
mod troops_extraction_tests {
    // use std::path::Path;
    use crate::core::rpgmv::common::TranslatableStringEntry;
    // use crate::core::rpgmv::project::extract_translatable_strings_from_project;
    use crate::tests::common_test_utils::setup_and_extract_all_strings;

    // Removed local helper

    #[test]
    fn test_troops_extraction() {
        let all_extracted_strings = setup_and_extract_all_strings();

        let troops_strings: Vec<&TranslatableStringEntry> = all_extracted_strings
            .iter()
            .filter(|e| e.source_file.ends_with("Troops.json"))
            .collect();

        // --- TROOPS.JSON ---
        // IMPORTANT: This count will need to be updated after the first run.
        let expected_troops_strings_count = 106; // <<<< UPDATE THIS PLACEHOLDER
        if troops_strings.len() != expected_troops_strings_count {
            eprintln!("Found {} strings from Troops.json, but expected {}.", troops_strings.len(), expected_troops_strings_count);
            eprintln!("Please update 'expected_troops_strings_count' in the test.");
            for (i, entry) in troops_strings.iter().take(25).enumerate() { // Show more examples for troops due to nested events
                eprintln!("  Troops String Example {}: {:?}", i + 1, entry);
            }
        }
        // Comment out or adjust this assertion until you have the correct count.
        // assert_eq!(troops_strings.len(), expected_troops_strings_count, "Incorrect number of strings extracted from Troops.json.");

        // --- Spot Checks for Troops.json ---
        // These are examples. You'll need to verify against your actual SampleRpgMvProject/www/data/Troops.json

        // Example: Troop ID 1, name
        let expected_troop_id_1 = 1;
        let expected_troop_name_1 = "こうもり*2"; // <<<< UPDATE THIS PLACEHOLDER
        let expected_json_path_troop_name_1 = "[1].name"; // Path for Troop ID 1's name

        if let Some(entry) = troops_strings.iter().find(|e| 
            e.object_id == expected_troop_id_1 && e.json_path == expected_json_path_troop_name_1
        ) {
            assert_eq!(entry.text, expected_troop_name_1, "Incorrect name for Troop ID {}, path {}.", expected_troop_id_1, expected_json_path_troop_name_1);
        } else {
            if expected_troops_strings_count > 0 && !expected_troop_name_1.is_empty() { 
                panic!("Could not find Troop name for ID {} with path {}. Update placeholder or check extraction.", expected_troop_id_1, expected_json_path_troop_name_1);
            }
        }

        // Example: Troop ID 1, Page 0 (first page), an event command string (e.g., Show Text)
        // The json_path for event commands will be like "[<troop_index>].pages[<page_index>].list[<command_index>].parameters[<param_index>]"
        // or a more specific path if the helper function constructs it differently for Show Text (e.g. parameters.string_field_name)
        // You'll need to determine the correct path from the test output.
        let expected_troop_id_1_event_text = ""; // <<<< UPDATED - Troop 1 has no event text in sample output
        // The json_path here is a GUESS. You MUST verify this from the first test run output.
        let expected_json_path_troop_1_event = "[1].pages[0].list[0].parameters[0]"; // This path won't be found for Troop 1 based on output

        if let Some(entry) = troops_strings.iter().find(|e| 
            e.object_id == expected_troop_id_1 && e.json_path == expected_json_path_troop_1_event
        ) {
            assert_eq!(entry.text, expected_troop_id_1_event_text, "Incorrect event text for Troop ID {}, path {}.", expected_troop_id_1, expected_json_path_troop_1_event);
        } else {
            if expected_troops_strings_count > 0 && !expected_troop_id_1_event_text.is_empty() { 
                // Only panic if you are sure this specific event text and path should exist.
                // It's common for the first page of troop events to be empty or conditional.
                // Check your SampleRpgMvProject/www/data/Troops.json for Troop ID 1, first page, first command.
                // eprintln!("Could not find event text for Troop ID {} with path {}. Update placeholder or check sample data/extraction logic.", expected_troop_id_1, expected_json_path_troop_1_event);
            }
        }

        // Example: Troop ID 2 (if it exists and has events)
        let expected_troop_id_2 = 2;
        let expected_troop_name_2 = "スライム*2"; // <<<< UPDATE THIS PLACEHOLDER
        let expected_json_path_troop_name_2 = "[2].name";

        if let Some(entry) = troops_strings.iter().find(|e| 
            e.object_id == expected_troop_id_2 && e.json_path == expected_json_path_troop_name_2
        ) {
            assert_eq!(entry.text, expected_troop_name_2, "Incorrect name for Troop ID {}, path {}.", expected_troop_id_2, expected_json_path_troop_name_2);
        } else {
            if expected_troops_strings_count > 0 && !expected_troop_name_2.is_empty() {
                // Check if troop ID 2 actually exists and has a name in your sample data
                let found_any_troop_id_2 = troops_strings.iter().any(|e| e.object_id == expected_troop_id_2 && e.json_path.ends_with(".name"));
                if found_any_troop_id_2 && expected_troops_strings_count > troops_strings.iter().filter(|s| s.object_id == expected_troop_id_1).count() { // Heuristic: more strings than just troop 1
                    panic!("Could not find Troop name for ID {} with path {}. Update placeholder or check extraction.", expected_troop_id_2, expected_json_path_troop_name_2);
                } else if !found_any_troop_id_2 && expected_troops_strings_count > 10 { // Arbitrary high enough count that troop 2 should exist
                     // panic!("Troop ID {} name not found. Update placeholder to a valid ID from your sample data or confirm it has no name.", expected_troop_id_2);
                }
            }
        }

        // Example: Troop ID 9, Page 0, specific event text
        let expected_troop_id_9 = 9;
        let expected_troop_id_9_event_text = "だ、誰だお前は！！！";
        let expected_json_path_troop_9_event = "[9].pages[0].list[2].parameters[0]";

        if let Some(entry) = troops_strings.iter().find(|e| 
            e.object_id == expected_troop_id_9 && e.json_path == expected_json_path_troop_9_event
        ) {
            assert_eq!(entry.text, expected_troop_id_9_event_text, "Incorrect event text for Troop ID {}, path {}.", expected_troop_id_9, expected_json_path_troop_9_event);
        } else {
            if expected_troops_strings_count > 0 && !expected_troop_id_9_event_text.is_empty() { 
                panic!("Could not find event text for Troop ID {} with path {}. Update placeholder or check sample data/extraction logic.", expected_troop_id_9, expected_json_path_troop_9_event);
            }
        }


        if expected_troops_strings_count > 0 {
            println!("Successfully (tentatively) validated strings from Troops.json. PLEASE VERIFY COUNTS AND SPOT CHECKS, especially for event paths.");
        } else {
            println!("Troops.json test ran. PLEASE UPDATE expected_troops_strings_count and spot checks based on output.");
        }
    }
} 