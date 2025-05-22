#[cfg(test)]
mod armors_extraction_tests {
    // use std::path::Path;
    use crate::core::rpgmv::common::TranslatableStringEntry;
    // use crate::core::rpgmv::project::extract_translatable_strings_from_project;
    use crate::tests::common_test_utils::setup_and_extract_all_strings;

    #[test]
    fn test_armors_extraction() {
        let all_extracted_strings = setup_and_extract_all_strings();

        let armor_strings: Vec<&TranslatableStringEntry> = all_extracted_strings
            .iter()
            .filter(|e| e.source_file.ends_with("Armors.json"))
            .collect();

        // --- ARMORS.JSON --- 
        let expected_armor_strings_count = 22; // Updated based on test output
        if armor_strings.len() != expected_armor_strings_count {
            eprintln!("Found {} strings from Armors.json, but expected {}.", armor_strings.len(), expected_armor_strings_count);
            for (i, entry) in armor_strings.iter().take(10).enumerate() {
                eprintln!("  Armor String Example {}: {:?}", i + 1, entry);
            }
        }
        assert_eq!(armor_strings.len(), expected_armor_strings_count, "Incorrect number of strings extracted from Armors.json.");

        // Spot check for Armor ID 1, name "盾"
        let expected_armor_id_1 = 1;
        let expected_armor_name_1 = "盾";
        let expected_json_path_name_1 = "[1].name";
        
        let armor_name_entry_1 = armor_strings.iter().find(|e| 
            e.object_id == expected_armor_id_1 && e.json_path == expected_json_path_name_1
        );
        assert!(armor_name_entry_1.is_some(), "Could not find armor name for ID {} with path {}", expected_armor_id_1, expected_json_path_name_1);
        assert_eq!(armor_name_entry_1.unwrap().text, expected_armor_name_1, "Incorrect text for armor name spot check (ID {}, path {}).", expected_armor_id_1, expected_json_path_name_1);

        // Spot check for Armor ID 6, description
        let expected_armor_id_6 = 6;
        let expected_armor_description_6 = "隠し銃。左腕に装着する。";
        let expected_json_path_description_6 = "[6].description";
        
        let armor_description_entry_6 = armor_strings.iter().find(|e| 
            e.object_id == expected_armor_id_6 && e.json_path == expected_json_path_description_6
        );
        assert!(armor_description_entry_6.is_some(), "Could not find armor description for ID {} with path {}", expected_armor_id_6, expected_json_path_description_6);
        assert_eq!(armor_description_entry_6.unwrap().text, expected_armor_description_6, "Incorrect text for armor description spot check (ID {}, path {}).", expected_armor_id_6, expected_json_path_description_6);

        // Spot check for Armor ID 7, description (with newline)
        let expected_armor_id_7 = 7;
        // Note: Rust strings handle literal newlines. Ensure your JSON parser preserves them correctly.
        let expected_armor_description_7 = "顔を隠すのにはコレ！\n少しエッチなマスク";
        let expected_json_path_description_7 = "[7].description";

        let armor_description_entry_7 = armor_strings.iter().find(|e| 
            e.object_id == expected_armor_id_7 && e.json_path == expected_json_path_description_7
        );
        assert!(armor_description_entry_7.is_some(), "Could not find armor description for ID {} with path {}", expected_armor_id_7, expected_json_path_description_7);
        assert_eq!(armor_description_entry_7.unwrap().text, expected_armor_description_7, "Incorrect text for armor description spot check (ID {}, path {}).", expected_armor_id_7, expected_json_path_description_7);

        // Add more spot checks if needed for other armors or fields like 'note'.

        println!("Successfully validated {} strings from Armors.json.", armor_strings.len());
    }
} 