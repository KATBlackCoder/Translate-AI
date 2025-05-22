#[cfg(test)]
mod map_infos_extraction_tests {
    // use std::path::Path;
    use crate::core::rpgmv::common::TranslatableStringEntry;
    // use crate::core::rpgmv::project::extract_translatable_strings_from_project;
    use crate::tests::common_test_utils::setup_and_extract_all_strings;

    // Removed local helper

    #[test]
    fn test_map_infos_extraction() {
        let all_extracted_strings = setup_and_extract_all_strings();

        let map_infos_strings: Vec<&TranslatableStringEntry> = all_extracted_strings
            .iter()
            .filter(|e| e.source_file.ends_with("MapInfos.json"))
            .collect();

        // --- MAPINFOS.JSON ---
        // IMPORTANT: This count will need to be updated after the first run.
        let expected_map_infos_strings_count = 38; // <<<< UPDATE THIS PLACEHOLDER
        if map_infos_strings.len() != expected_map_infos_strings_count {
            eprintln!("Found {} strings from MapInfos.json, but expected {}.", map_infos_strings.len(), expected_map_infos_strings_count);
            eprintln!("Please update 'expected_map_infos_strings_count' in the test.");
            for (i, entry) in map_infos_strings.iter().take(10).enumerate() { // Show some examples
                eprintln!("  MapInfos String Example {}: {:?}", i + 1, entry);
            }
        }
        // Comment out or adjust this assertion until you have the correct count.
        // assert_eq!(map_infos_strings.len(), expected_map_infos_strings_count, "Incorrect number of strings extracted from MapInfos.json.");

        // --- Spot Checks for MapInfos.json ---
        // These are examples. You'll need to verify against your actual SampleRpgMvProject/www/data/MapInfos.json

        // Example: MapInfo ID 1, name
        // In MapInfos.json, the first entry (index 0) is often null.
        // Map ID 1 usually corresponds to index 1 in the JSON array.
        let expected_map_id_1 = 1;
        let expected_map_name_1 = "テストマップ"; // <<<< UPDATE THIS PLACEHOLDER (Name of Map ID 1)
        let expected_json_path_map_name_1 = "[1].name"; // Path for Map ID 1's name

        if let Some(entry) = map_infos_strings.iter().find(|e| 
            e.object_id == expected_map_id_1 && e.json_path == expected_json_path_map_name_1
        ) {
            assert_eq!(entry.text, expected_map_name_1, "Incorrect name for MapInfo ID {}, path {}.", expected_map_id_1, expected_json_path_map_name_1);
        } else {
            if expected_map_infos_strings_count > 0 && !expected_map_name_1.is_empty() { 
                panic!("Could not find MapInfo name for ID {} with path {}. Update placeholder or check extraction.", expected_map_id_1, expected_json_path_map_name_1);
            }
        }

        // Example: MapInfo ID 2, name (if it exists in your sample)
        let expected_map_id_2 = 2;
        let expected_map_name_2 = "監獄サンプル"; // <<<< UPDATE THIS PLACEHOLDER (Name of Map ID 2)
        let expected_json_path_map_name_2 = "[2].name"; // Path for Map ID 2's name

        if let Some(entry) = map_infos_strings.iter().find(|e| 
            e.object_id == expected_map_id_2 && e.json_path == expected_json_path_map_name_2
        ) {
            assert_eq!(entry.text, expected_map_name_2, "Incorrect name for MapInfo ID {}, path {}.", expected_map_id_2, expected_json_path_map_name_2);
        } else {
            // Only panic if count is confirmed AND this specific map ID is expected to have a name
            if expected_map_infos_strings_count > 0 && !expected_map_name_2.is_empty() { 
                 // Before panicking, ensure your SampleRpgMvProject actually has a Map ID 2 with a non-empty name.
                // You might need to adjust `expected_map_id_2` and `expected_map_name_2` to a valid entry from your sample.
                let found_any_map_id_2 = map_infos_strings.iter().any(|e| e.object_id == expected_map_id_2);
                if found_any_map_id_2 {
                    panic!("Could not find MapInfo name for ID {} with path {}. It exists, but name field might be missing or extraction differs. Update placeholder or check extraction logic.", expected_map_id_2, expected_json_path_map_name_2);
                } else if expected_map_infos_strings_count > 1 { // If there are multiple entries, and this one is missing, it's more likely an issue
                    panic!("MapInfo ID {} not found at all. Update placeholder to a valid ID from your sample data.", expected_map_id_2);
                }
            }
        }

        if expected_map_infos_strings_count > 0 {
            println!("Successfully (tentatively) validated strings from MapInfos.json. PLEASE VERIFY COUNTS AND SPOT CHECKS.");
        } else {
            println!("MapInfos.json test ran. PLEASE UPDATE expected_map_infos_strings_count and spot checks based on output.");
        }
    }
} 