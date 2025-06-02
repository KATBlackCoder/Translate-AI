#[cfg(test)]
mod states_extraction_tests {
    // use std::path::Path;
    use crate::models::translation::SourceStringData;
    // use crate::core::rpgmv::project::extract_translatable_strings_from_project;
    use crate::tests::common_test_utils::setup_and_extract_all_strings;

    // Removed local helper

    #[test]
    fn test_states_extraction() {
        let all_extracted_strings = setup_and_extract_all_strings();

        let states_strings: Vec<&SourceStringData> = all_extracted_strings
            .iter()
            .filter(|e| e.source_file.ends_with("States.json"))
            .collect();

        // --- STATES.JSON ---
        // Based on the second test module's fixture: test_projects/rpg_mv_project_1/www/data/States.json
        // ID 1 (KO): name (1)
        // ID 2 (Guard): name (1)
        // ID 3 (Poison): name, message1, message2, message3, message4 (5)
        // ID 4 (Blind): name, message1, message2 (message3, message4 empty) (3)
        // Total = 1+1+5+3 = 10 strings
        let expected_states_strings_count = 10; 
        if states_strings.len() != expected_states_strings_count {
            eprintln!("Found {} strings from States.json, but expected {}.", states_strings.len(), expected_states_strings_count);
            eprintln!("Please update 'expected_states_strings_count' in the test if fixture changed.");
            for (i, entry) in states_strings.iter().take(20).enumerate() { // Show some examples
                eprintln!("  States String Example {}: {:?}", i + 1, entry);
            }
        }
        assert_eq!(states_strings.len(), expected_states_strings_count, "Incorrect number of strings extracted from States.json.");

        // --- Spot Checks for States.json (aligned with the second module's fixture) ---

        // State ID 1 (KO), name
        let expected_state_id_1 = 1;
        let expected_state_name_1 = "KO"; 
        let expected_json_path_name_1 = "[1].name";

        if let Some(entry) = states_strings.iter().find(|e| 
            e.object_id == expected_state_id_1 && e.json_path == expected_json_path_name_1
        ) {
            assert_eq!(entry.original_text, expected_state_name_1, "Incorrect name for State ID {}, path {}.", expected_state_id_1, expected_json_path_name_1);
        } else {
            panic!("Could not find State name for ID {} with path {}. Update placeholder or check extraction.", expected_state_id_1, expected_json_path_name_1);
        }
        
        // State ID 3 (Poison), message4
        let expected_state_id_3 = 3; 
        let expected_state_message4_3 = "continues to be poisoned!";
        let expected_json_path_message4_3 = "[3].message4";
        if let Some(entry) = states_strings.iter().find(|e| 
            e.object_id == expected_state_id_3 && e.json_path == expected_json_path_message4_3
        ) {
            assert_eq!(entry.original_text, expected_state_message4_3, "Incorrect message4 for State ID {}, path {}.", expected_state_id_3, expected_json_path_message4_3);
        } else {
            panic!("Could not find State message4 for ID {} with path {}. Update placeholder, check sample data, or extraction logic.", expected_state_id_3, expected_json_path_message4_3);
        }

        // State ID 4 (Blind), message1
        let expected_state_id_4 = 4; 
        let expected_state_message1_4 = "is blinded!"; 
        let expected_json_path_message1_4 = "[4].message1"; 
        if let Some(entry) = states_strings.iter().find(|e| 
            e.object_id == expected_state_id_4 && e.json_path == expected_json_path_message1_4
        ) {
            assert_eq!(entry.original_text, expected_state_message1_4, "Incorrect message1 for State ID {}, path {}.", expected_state_id_4, expected_json_path_message1_4);
        } else {
            panic!("Could not find State message1 for ID {} with path {}. Update placeholder, check sample data, or extraction logic.", expected_state_id_4, expected_json_path_message1_4);
        }

        println!("Successfully validated strings from States.json in states_extraction_tests module.");
    }
}

#[cfg(test)]
mod tests {
    use crate::core::rpgmv::states;
    use crate::models::translation::{SourceStringData, WorkingTranslation};
    use crate::tests::common_test_utils::setup_project_and_extract_strings;
    use serde_json::json;

    const TEST_PROJECT_SUBPATH: &str = "test_projects/rpg_mv_project_1";
    const STATES_JSON_FILENAME: &str = "States.json";
    const STATES_JSON_FIXTURE_PATH: &str = "www/data/States.json";

    fn create_state_translation(
        object_id: u32, 
        original_text: &str, 
        translated_text: &str, 
        json_path: &str,
        source_file: &str
    ) -> WorkingTranslation {
        WorkingTranslation {
            object_id,
            original_text: original_text.to_string(),
            translated_text: translated_text.to_string(),
            source_file: source_file.to_string(),
            json_path: json_path.to_string(),
            translation_source: "test_engine".to_string(),
            error: None,
        }
    }

    #[test]
    fn test_extract_states_strings() {
        let (_temp_dir, _project_root_path, extracted_strings) = setup_project_and_extract_strings(
            TEST_PROJECT_SUBPATH, 
            &[STATES_JSON_FIXTURE_PATH], 
            STATES_JSON_FILENAME
        );

        // Based on test_projects/rpg_mv_project_1/www/data/States.json
        // ID 1 (KO): name (1)
        // ID 2 (Guard): name (1)
        // ID 3 (Poison): name, message1, message2, message3, message4 (5)
        // ID 4 (Blind): name, message1, message2 (message3, message4 empty) (3)
        // Total = 1+1+5+3 = 10 strings
        assert_eq!(extracted_strings.len(), 10, "Incorrect number of strings from States.json");

        let ko_name = extracted_strings.iter().find(|s| s.object_id == 1 && s.json_path == "[1].name").unwrap();
        assert_eq!(ko_name.original_text, "KO");
        assert_eq!(ko_name.source_file, "www/data/States.json");

        let poison_msg4 = extracted_strings.iter().find(|s| s.object_id == 3 && s.json_path == "[3].message4").unwrap();
        assert_eq!(poison_msg4.original_text, "continues to be poisoned!");

        let blind_msg1 = extracted_strings.iter().find(|s| s.object_id == 4 && s.json_path == "[4].message1").unwrap();
        assert_eq!(blind_msg1.original_text, "is blinded!");
    }

    #[test]
    fn test_reconstruct_states_json() {
        let (temp_dir, project_root_path, _) = setup_project_and_extract_strings(
            TEST_PROJECT_SUBPATH, 
            &[STATES_JSON_FIXTURE_PATH], 
            STATES_JSON_FILENAME
        );
        let original_json_path = project_root_path.join("www/data").join(STATES_JSON_FILENAME);
        let original_json_str = std::fs::read_to_string(original_json_path).unwrap();

        let relative_path = format!("www/data/{}", STATES_JSON_FILENAME);

        let translations = vec![
            create_state_translation(1, "KO", "Derrotado", "[1].name", &relative_path),
            create_state_translation(3, "Poison", "Veneno", "[3].name", &relative_path),
            create_state_translation(3, "is poisoned!", "¡está envenenado!", "[3].message1", &relative_path),
            // Skip other messages for poison
            create_state_translation(4, "Blind", "Cegado", "[4].name", &relative_path),
            create_state_translation(4, "is blinded!", "¡está cegado!", "[4].message1", &relative_path),
        ];
        let translations_refs: Vec<&WorkingTranslation> = translations.iter().collect();

        let result = states::reconstruct_states_json(&original_json_str, translations_refs);
        assert!(result.is_ok(), "Reconstruction failed: {:?}", result.err());
        let reconstructed_json_str = result.unwrap();
        let recon_val: serde_json::Value = serde_json::from_str(&reconstructed_json_str).unwrap();

        assert_eq!(recon_val[1]["name"].as_str().unwrap(), "Derrotado");
        assert_eq!(recon_val[2]["name"].as_str().unwrap(), "Guard"); // Original
        assert_eq!(recon_val[3]["name"].as_str().unwrap(), "Veneno");
        assert_eq!(recon_val[3]["message1"].as_str().unwrap(), "¡está envenenado!");
        assert_eq!(recon_val[3]["message2"].as_str().unwrap(), "takes poison damage."); // Original
        assert_eq!(recon_val[4]["name"].as_str().unwrap(), "Cegado");
        assert_eq!(recon_val[4]["message1"].as_str().unwrap(), "¡está cegado!");
        assert_eq!(recon_val[4]["message2"].as_str().unwrap(), "'s accuracy is lowered."); // Original

        temp_dir.close().unwrap();
    }
} 