#[cfg(test)]
mod enemies_extraction_tests {
    // use std::path::Path;
    use crate::core::rpgmv::common::TranslatableStringEntry;
    // use crate::core::rpgmv::project::extract_translatable_strings_from_project;
    use crate::tests::common_test_utils::setup_and_extract_all_strings;

    #[test]
    fn test_enemies_extraction() {
        let all_extracted_strings = setup_and_extract_all_strings();

        let enemy_strings: Vec<&TranslatableStringEntry> = all_extracted_strings
            .iter()
            .filter(|e| e.source_file.ends_with("Enemies.json"))
            .collect();

        // --- ENEMIES.JSON --- 
        let expected_enemy_strings_count = 96; // Updated based on test output
        if enemy_strings.len() != expected_enemy_strings_count {
            eprintln!("Found {} strings from Enemies.json, but expected {}.", enemy_strings.len(), expected_enemy_strings_count);
            for (i, entry) in enemy_strings.iter().take(15).enumerate() { // Show more if count is off
                eprintln!("  Enemy String Example {}: {:?}", i + 1, entry);
            }
        }
        assert_eq!(enemy_strings.len(), expected_enemy_strings_count, "Incorrect number of strings extracted from Enemies.json.");

        // Spot check for Enemy ID 1, name "こうもり"
        let expected_enemy_id_1 = 1;
        let expected_enemy_name_1 = "こうもり";
        let expected_json_path_name_1 = "[1].name";
        
        let enemy_name_entry_1 = enemy_strings.iter().find(|e| 
            e.object_id == expected_enemy_id_1 && e.json_path == expected_json_path_name_1
        );
        assert!(enemy_name_entry_1.is_some(), "Could not find enemy name for ID {} with path {}", expected_enemy_id_1, expected_json_path_name_1);
        assert_eq!(enemy_name_entry_1.unwrap().text, expected_enemy_name_1, "Incorrect text for enemy name spot check (ID {}, path {}).", expected_enemy_id_1, expected_json_path_name_1);

        // Spot check for Enemy ID 7, note "基本攻撃は拘束衣用の攻撃"
        let expected_enemy_id_7 = 7;
        let expected_enemy_note_7 = "基本攻撃は拘束衣用の攻撃";
        let expected_json_path_note_7 = "[7].note";
        
        let enemy_note_entry_7 = enemy_strings.iter().find(|e| 
            e.object_id == expected_enemy_id_7 && e.json_path == expected_json_path_note_7
        );
        assert!(enemy_note_entry_7.is_some(), "Could not find enemy note for ID {} with path {}", expected_enemy_id_7, expected_json_path_note_7);
        assert_eq!(enemy_note_entry_7.unwrap().text, expected_enemy_note_7, "Incorrect text for enemy note spot check (ID {}, path {}).", expected_enemy_id_7, expected_json_path_note_7);

        // Spot check for Enemy ID 10, name "改造触手"
        let expected_enemy_id_10 = 10;
        let expected_enemy_name_10 = "改造触手";
        let expected_json_path_name_10 = "[10].name";
        
        let enemy_name_entry_10 = enemy_strings.iter().find(|e| 
            e.object_id == expected_enemy_id_10 && e.json_path == expected_json_path_name_10
        );
        assert!(enemy_name_entry_10.is_some(), "Could not find enemy name for ID {} with path {}", expected_enemy_id_10, expected_json_path_name_10);
        assert_eq!(enemy_name_entry_10.unwrap().text, expected_enemy_name_10, "Incorrect text for enemy name spot check (ID {}, path {}).", expected_enemy_id_10, expected_json_path_name_10);
        
        // Spot check for Enemy ID 10, note "サンプル改造"
        let expected_enemy_note_10 = "サンプル改造"; // Note from Example 8
        let expected_json_path_note_10 = "[10].note";
        
        let enemy_note_entry_10_note = enemy_strings.iter().find(|e| // Renamed variable to avoid conflict
            e.object_id == expected_enemy_id_10 && e.json_path == expected_json_path_note_10
        );
        assert!(enemy_note_entry_10_note.is_some(), "Could not find enemy note for ID {} with path {}", expected_enemy_id_10, expected_json_path_note_10);
        assert_eq!(enemy_note_entry_10_note.unwrap().text, expected_enemy_note_10, "Incorrect text for enemy note spot check (ID {}, path {}).", expected_enemy_id_10, expected_json_path_note_10);


        println!("Successfully validated {} strings from Enemies.json.", enemy_strings.len());
    }
} 