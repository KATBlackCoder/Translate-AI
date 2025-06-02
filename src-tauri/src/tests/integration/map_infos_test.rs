#[cfg(test)]
mod map_infos_extraction_tests {
    // use std::path::Path;
    use crate::models::translation::SourceStringData;
    // use crate::core::rpgmv::project::extract_translatable_strings_from_project;
    use crate::tests::common_test_utils::setup_and_extract_all_strings;

    // Removed local helper

    #[test]
    fn test_map_infos_extraction() {
        let all_extracted_strings = setup_and_extract_all_strings();

        let map_infos_strings: Vec<&SourceStringData> = all_extracted_strings
            .iter()
            .filter(|e| e.source_file.ends_with("MapInfos.json"))
            .collect();

        // --- MAPINFOS.JSON ---
        // IMPORTANT: This count will need to be updated after the first run.
        let expected_map_infos_strings_count = 3; // Updated based on fixture in the second test module
        if map_infos_strings.len() != expected_map_infos_strings_count {
            eprintln!("Found {} strings from MapInfos.json, but expected {}.", map_infos_strings.len(), expected_map_infos_strings_count);
            eprintln!("Please update 'expected_map_infos_strings_count' in the test if fixture changed.");
            for (i, entry) in map_infos_strings.iter().take(10).enumerate() { // Show some examples
                eprintln!("  MapInfos String Example {}: {:?}", i + 1, entry);
            }
        }
        assert_eq!(map_infos_strings.len(), expected_map_infos_strings_count, "Incorrect number of strings extracted from MapInfos.json.");

        // --- Spot Checks for MapInfos.json ---
        // Based on the second test module's fixture: test_projects/rpg_mv_project_1/www/data/MapInfos.json
        // ID 1 (Overworld): name
        // ID 2 (Town1): name
        // ID 3 (Dungeon1): name

        let expected_map_id_1 = 1;
        let expected_map_name_1 = "Overworld"; 
        let expected_json_path_map_name_1 = "[1].name";

        if let Some(entry) = map_infos_strings.iter().find(|e| 
            e.object_id == expected_map_id_1 && e.json_path == expected_json_path_map_name_1
        ) {
            assert_eq!(entry.original_text, expected_map_name_1, "Incorrect name for MapInfo ID {}, path {}.", expected_map_id_1, expected_json_path_map_name_1);
        } else {
            panic!("Could not find MapInfo name for ID {} with path {}. Update placeholder or check extraction.", expected_map_id_1, expected_json_path_map_name_1);
        }

        let expected_map_id_2 = 2;
        let expected_map_name_2 = "Town1";
        let expected_json_path_map_name_2 = "[2].name";

        if let Some(entry) = map_infos_strings.iter().find(|e| 
            e.object_id == expected_map_id_2 && e.json_path == expected_json_path_map_name_2
        ) {
            assert_eq!(entry.original_text, expected_map_name_2, "Incorrect name for MapInfo ID {}, path {}.", expected_map_id_2, expected_json_path_map_name_2);
        } else {
            panic!("Could not find MapInfo name for ID {} with path {}. Update placeholder or check extraction.", expected_map_id_2, expected_json_path_map_name_2);
        }
        
        let expected_map_id_3 = 3;
        let expected_map_name_3 = "Dungeon1"; 
        let expected_json_path_map_name_3 = "[3].name";

        if let Some(entry) = map_infos_strings.iter().find(|e| 
            e.object_id == expected_map_id_3 && e.json_path == expected_json_path_map_name_3
        ) {
            assert_eq!(entry.original_text, expected_map_name_3, "Incorrect name for MapInfo ID {}, path {}.", expected_map_id_3, expected_json_path_map_name_3);
        } else {
            panic!("Could not find MapInfo name for ID {} with path {}. Update placeholder or check extraction.", expected_map_id_3, expected_json_path_map_name_3);
        }

        println!("Successfully validated strings from MapInfos.json in map_infos_extraction_tests module.");
    }
}

#[cfg(test)]
mod tests {
    use crate::core::rpgmv::map_infos;
    use crate::models::translation::{SourceStringData, WorkingTranslation};
    use crate::tests::common_test_utils::setup_project_and_extract_strings;
    use serde_json::json;

    const TEST_PROJECT_SUBPATH: &str = "test_projects/rpg_mv_project_1";
    const MAP_INFOS_JSON_FILENAME: &str = "MapInfos.json";
    const MAP_INFOS_JSON_FIXTURE_PATH: &str = "www/data/MapInfos.json";

    fn create_map_info_translation(
        object_id: u32, // In MapInfos, object_id usually corresponds to the map id (index in the array)
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
    fn test_extract_map_infos_strings() {
        let (_temp_dir, _project_root_path, extracted_strings) = setup_project_and_extract_strings(
            TEST_PROJECT_SUBPATH, 
            &[MAP_INFOS_JSON_FIXTURE_PATH], 
            MAP_INFOS_JSON_FILENAME
        );

        // Based on test_projects/rpg_mv_project_1/www/data/MapInfos.json
        // ID 1 (Overworld): name (1)
        // ID 2 (Town1): name (1)
        // ID 3 (Dungeon1): name (1)
        // Note: ID 0 is null and skipped. Other entries might be null or have empty names.
        // The fixture has 3 non-null entries with names.
        assert_eq!(extracted_strings.len(), 3, "Incorrect number of strings from MapInfos.json");

        let overworld_name = extracted_strings.iter().find(|s| s.object_id == 1 && s.json_path == "[1].name").unwrap();
        assert_eq!(overworld_name.original_text, "Overworld");
        assert_eq!(overworld_name.source_file, "www/data/MapInfos.json");

        let town1_name = extracted_strings.iter().find(|s| s.object_id == 2 && s.json_path == "[2].name").unwrap();
        assert_eq!(town1_name.original_text, "Town1");
    }

    #[test]
    fn test_reconstruct_map_infos_json() {
        let (temp_dir, project_root_path, _) = setup_project_and_extract_strings(
            TEST_PROJECT_SUBPATH, 
            &[MAP_INFOS_JSON_FIXTURE_PATH], 
            MAP_INFOS_JSON_FILENAME
        );
        let original_json_path = project_root_path.join("www/data").join(MAP_INFOS_JSON_FILENAME);
        let original_json_str = std::fs::read_to_string(original_json_path).unwrap();

        let relative_path = format!("www/data/{}", MAP_INFOS_JSON_FILENAME);

        let translations = vec![
            create_map_info_translation(1, "Overworld", "Superficie", "[1].name", &relative_path),
            create_map_info_translation(3, "Dungeon1", "Mazmorra1", "[3].name", &relative_path),
        ];
        let translations_refs: Vec<&WorkingTranslation> = translations.iter().collect();

        let result = map_infos::reconstruct_map_infos_json(&original_json_str, translations_refs);
        assert!(result.is_ok(), "Reconstruction failed: {:?}", result.err());
        let reconstructed_json_str = result.unwrap();
        let recon_val: serde_json::Value = serde_json::from_str(&reconstructed_json_str).unwrap();

        assert_eq!(recon_val[1]["name"].as_str().unwrap(), "Superficie");
        assert_eq!(recon_val[2]["name"].as_str().unwrap(), "Town1"); // Original, not in translations vec
        assert_eq!(recon_val[3]["name"].as_str().unwrap(), "Mazmorra1");
        assert_eq!(recon_val[0], json!(null)); // Ensure null entry is preserved

        temp_dir.close().unwrap();
    }
} 