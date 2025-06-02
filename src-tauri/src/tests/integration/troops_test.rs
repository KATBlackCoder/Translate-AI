#[cfg(test)]
mod troops_extraction_tests {
    // use std::path::Path;
    use crate::models::translation::SourceStringData;
    // use crate::core::rpgmv::project::extract_translatable_strings_from_project;
    use crate::tests::common_test_utils::setup_and_extract_all_strings;

    // Removed local helper

    #[test]
    fn test_troops_extraction() {
        let all_extracted_strings = setup_and_extract_all_strings();

        let troops_strings: Vec<&SourceStringData> = all_extracted_strings
            .iter()
            .filter(|e| e.source_file.ends_with("Troops.json"))
            .collect();

        // --- TROOPS.JSON ---
        // Based on the second test module's fixture: test_projects/rpg_mv_project_1/www/data/Troops.json
        // Troop 1 (Bat*2): name, pages[0].list[0].parameters[0] (Show Text) (2)
        // Troop 2 (Slime*3): name, pages[0].list[0].parameters[0] (Show Text) (2)
        // Troop 3 (Orc + Bat): name (1)
        // Troop 4 (Minotaur): name (1)
        // Total = 2+2+1+1 = 6 strings
        let expected_troops_strings_count = 6; 
        if troops_strings.len() != expected_troops_strings_count {
            eprintln!("Found {} strings from Troops.json, but expected {}.", troops_strings.len(), expected_troops_strings_count);
            eprintln!("Please update 'expected_troops_strings_count' in the test if fixture changed.");
            for (i, entry) in troops_strings.iter().take(25).enumerate() { // Show more examples for troops due to nested events
                eprintln!("  Troops String Example {}: {:?}", i + 1, entry);
            }
        }
        assert_eq!(troops_strings.len(), expected_troops_strings_count, "Incorrect number of strings extracted from Troops.json.");

        // --- Spot Checks for Troops.json (aligned with the second module's fixture) ---

        // Troop ID 1, name
        let expected_troop_id_1 = 1;
        let expected_troop_name_1 = "Bat*2"; 
        let expected_json_path_troop_name_1 = "[1].name";

        if let Some(entry) = troops_strings.iter().find(|e| 
            e.object_id == expected_troop_id_1 && e.json_path == expected_json_path_troop_name_1
        ) {
            assert_eq!(entry.original_text, expected_troop_name_1, "Incorrect name for Troop ID {}, path {}.", expected_troop_id_1, expected_json_path_troop_name_1);
        } else {
            panic!("Could not find Troop name for ID {} with path {}. Update placeholder or check extraction.", expected_troop_id_1, expected_json_path_troop_name_1);
        }

        // Troop ID 1, Page 0, event command string
        let expected_troop_id_1_event_text = "Two bats appear!";
        let expected_json_path_troop_1_event = "[1].pages[0].list[0].parameters[0]";

        if let Some(entry) = troops_strings.iter().find(|e| 
            e.object_id == expected_troop_id_1 && e.json_path == expected_json_path_troop_1_event
        ) {
            assert_eq!(entry.original_text, expected_troop_id_1_event_text, "Incorrect event text for Troop ID {}, path {}.", expected_troop_id_1, expected_json_path_troop_1_event);
        } else {
            panic!("Could not find event text for Troop ID {} with path {}. Update placeholder or check sample data/extraction logic.", expected_troop_id_1, expected_json_path_troop_1_event);
        }

        // Troop ID 4, name
        let expected_troop_id_4 = 4;
        let expected_troop_name_4 = "Minotaur";
        let expected_json_path_troop_name_4 = "[4].name";

        if let Some(entry) = troops_strings.iter().find(|e| 
            e.object_id == expected_troop_id_4 && e.json_path == expected_json_path_troop_name_4
        ) {
            assert_eq!(entry.original_text, expected_troop_name_4, "Incorrect name for Troop ID {}, path {}.", expected_troop_id_4, expected_json_path_troop_name_4);
        } else {
            panic!("Could not find Troop name for ID {} with path {}. Update placeholder or check extraction.", expected_troop_id_4, expected_json_path_troop_name_4);
        }

        println!("Successfully validated strings from Troops.json in troops_extraction_tests module.");
    }
}

#[cfg(test)]
mod tests {
    use crate::core::rpgmv::troops;
    use crate::models::translation::{SourceStringData, WorkingTranslation};
    use crate::tests::common_test_utils::setup_project_and_extract_strings;
    use serde_json::json;

    const TEST_PROJECT_SUBPATH: &str = "test_projects/rpg_mv_project_1";
    const TROOPS_JSON_FILENAME: &str = "Troops.json";
    const TROOPS_JSON_FIXTURE_PATH: &str = "www/data/Troops.json";

    fn create_troop_translation(
        object_id: u32, // Troop ID
        original_text: &str, 
        translated_text: &str, 
        json_path: &str, // e.g. "[1].name" or "[1].pages[0].list[0].parameters[0]"
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
    fn test_extract_troops_strings() {
        let (_temp_dir, _project_root_path, extracted_strings) = setup_project_and_extract_strings(
            TEST_PROJECT_SUBPATH, 
            &[TROOPS_JSON_FIXTURE_PATH], 
            TROOPS_JSON_FILENAME
        );

        // Based on test_projects/rpg_mv_project_1/www/data/Troops.json
        // Troop 1 (Bat*2): name, pages[0].list[0].parameters[0] (Show Text) (2)
        // Troop 2 (Slime*3): name, pages[0].list[0].parameters[0] (Show Text) (2)
        // Troop 3 (Orc + Bat): name (1)
        // Troop 4 (Minotaur): name (1)
        // Total = 2+2+1+1 = 6 strings
        assert_eq!(extracted_strings.len(), 6, "Incorrect number of strings from Troops.json");

        let troop1_name = extracted_strings.iter().find(|s| s.object_id == 1 && s.json_path == "[1].name").unwrap();
        assert_eq!(troop1_name.original_text, "Bat*2");
        assert_eq!(troop1_name.source_file, "www/data/Troops.json");

        let troop1_page0_text = extracted_strings.iter().find(|s| s.object_id == 1 && s.json_path == "[1].pages[0].list[0].parameters[0]").unwrap();
        assert_eq!(troop1_page0_text.original_text, "Two bats appear!");

        let troop4_name = extracted_strings.iter().find(|s| s.object_id == 4 && s.json_path == "[4].name").unwrap();
        assert_eq!(troop4_name.original_text, "Minotaur");
    }

    #[test]
    fn test_reconstruct_troops_json() {
        let (temp_dir, project_root_path, _) = setup_project_and_extract_strings(
            TEST_PROJECT_SUBPATH, 
            &[TROOPS_JSON_FIXTURE_PATH], 
            TROOPS_JSON_FILENAME
        );
        let original_json_path = project_root_path.join("www/data").join(TROOPS_JSON_FILENAME);
        let original_json_str = std::fs::read_to_string(original_json_path).unwrap();

        let relative_path = format!("www/data/{}", TROOPS_JSON_FILENAME);

        let translations = vec![
            create_troop_translation(1, "Bat*2", "Murciélago*2", "[1].name", &relative_path),
            create_troop_translation(1, "Two bats appear!", "¡Aparecen dos murciélagos!", "[1].pages[0].list[0].parameters[0]", &relative_path),
            create_troop_translation(3, "Orc + Bat", "Orco + Murciélago", "[3].name", &relative_path),
        ];
        let translations_refs: Vec<&WorkingTranslation> = translations.iter().collect();

        let result = troops::reconstruct_troops_json(&original_json_str, translations_refs);
        assert!(result.is_ok(), "Reconstruction failed: {:?}", result.err());
        let reconstructed_json_str = result.unwrap();
        let recon_val: serde_json::Value = serde_json::from_str(&reconstructed_json_str).unwrap();

        assert_eq!(recon_val[1]["name"].as_str().unwrap(), "Murciélago*2");
        assert_eq!(recon_val[1]["pages"][0]["list"][0]["parameters"][0].as_str().unwrap(), "¡Aparecen dos murciélagos!");
        assert_eq!(recon_val[2]["name"].as_str().unwrap(), "Slime*3"); // Original
        assert_eq!(recon_val[2]["pages"][0]["list"][0]["parameters"][0].as_str().unwrap(), "A group of slimes emerges!"); // Original
        assert_eq!(recon_val[3]["name"].as_str().unwrap(), "Orco + Murciélago");

        temp_dir.close().unwrap();
    }
} 