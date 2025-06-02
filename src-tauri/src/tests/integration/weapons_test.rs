#[cfg(test)]
mod weapons_extraction_tests {
    // use std::path::Path;
    use crate::models::translation::SourceStringData;
    // use crate::core::rpgmv::project::extract_translatable_strings_from_project;
    use crate::tests::common_test_utils::setup_and_extract_all_strings;

    // Removed local helper

    #[test]
    fn test_weapons_extraction() {
        let all_extracted_strings = setup_and_extract_all_strings();

        let weapons_strings: Vec<&SourceStringData> = all_extracted_strings
            .iter()
            .filter(|e| e.source_file.ends_with("Weapons.json"))
            .collect();

        // --- WEAPONS.JSON ---
        // Based on the second test module's fixture: test_projects/rpg_mv_project_1/www/data/Weapons.json
        // ID 1 (Short Sword): name, description (2)
        // ID 2 (Long Sword): name, description (2)
        // ID 3 (Wooden Bow): name, description (2)
        // ID 4 (Battle Axe): name, description (2)
        // Total = 8 strings
        let expected_weapons_strings_count = 8; 
        if weapons_strings.len() != expected_weapons_strings_count {
            eprintln!("Found {} strings from Weapons.json, but expected {}.", weapons_strings.len(), expected_weapons_strings_count);
            eprintln!("Please update 'expected_weapons_strings_count' in the test if fixture changed.");
            for (i, entry) in weapons_strings.iter().take(15).enumerate() { // Show some examples
                eprintln!("  Weapons String Example {}: {:?}", i + 1, entry);
            }
        }
        assert_eq!(weapons_strings.len(), expected_weapons_strings_count, "Incorrect number of strings extracted from Weapons.json.");

        // --- Spot Checks for Weapons.json (aligned with the second module's fixture) ---

        // Weapon ID 1 (Short Sword)
        let expected_weapon_id_1 = 1;
        let expected_weapon_name_1 = "Short Sword"; 
        let expected_json_path_name_1 = "[1].name";

        if let Some(entry) = weapons_strings.iter().find(|e| 
            e.object_id == expected_weapon_id_1 && e.json_path == expected_json_path_name_1
        ) {
            assert_eq!(entry.original_text, expected_weapon_name_1, "Incorrect name for Weapon ID {}, path {}.", expected_weapon_id_1, expected_json_path_name_1);
        } else {
            panic!("Could not find Weapon name for ID {} with path {}. Update placeholder or check extraction.", expected_weapon_id_1, expected_json_path_name_1);
        }

        let expected_weapon_description_1 = "A basic sword, easy to handle."; 
        let expected_json_path_description_1 = "[1].description";
        if let Some(entry) = weapons_strings.iter().find(|e| 
            e.object_id == expected_weapon_id_1 && e.json_path == expected_json_path_description_1
        ) {
            assert_eq!(entry.original_text, expected_weapon_description_1, "Incorrect description for Weapon ID {}, path {}.", expected_weapon_id_1, expected_json_path_description_1);
        } else {
            panic!("Could not find Weapon description for ID {} with path {}. Update placeholder or check extraction.", expected_weapon_id_1, expected_json_path_description_1);
        }

        // Weapon ID 4 (Battle Axe)
        let expected_weapon_id_4 = 4; 
        let expected_weapon_name_4 = "Battle Axe"; 
        let expected_json_path_name_4 = "[4].name";

        if let Some(entry) = weapons_strings.iter().find(|e| 
            e.object_id == expected_weapon_id_4 && e.json_path == expected_json_path_name_4
        ) {
            assert_eq!(entry.original_text, expected_weapon_name_4, "Incorrect name for Weapon ID {}, path {}.", expected_weapon_id_4, expected_json_path_name_4);
        } else {
            panic!("Could not find Weapon name for ID {} with path {}. Update placeholder or check extraction.", expected_weapon_id_4, expected_json_path_name_4);
        }
        
        let expected_weapon_description_4 = "A heavy axe suited for powerful strikes.";
        let expected_json_path_description_4 = "[4].description";
        if let Some(entry) = weapons_strings.iter().find(|e| 
            e.object_id == expected_weapon_id_4 && e.json_path == expected_json_path_description_4
        ) {
            assert_eq!(entry.original_text, expected_weapon_description_4, "Incorrect note for Weapon ID {}, path {}.", expected_weapon_id_4, expected_json_path_description_4);
        } else {
            panic!("Could not find Weapon description for ID {} with path {}. Update placeholder, check sample data, or extraction logic.", expected_weapon_id_4, expected_json_path_description_4);
        }

        println!("Successfully validated strings from Weapons.json in weapons_extraction_tests module.");
    }
}

#[cfg(test)]
mod tests {
    use crate::core::rpgmv::weapons;
    use crate::models::translation::{SourceStringData, WorkingTranslation};
    use crate::tests::common_test_utils::setup_project_and_extract_strings;
    use serde_json::json;

    const TEST_PROJECT_SUBPATH: &str = "test_projects/rpg_mv_project_1";
    const WEAPONS_JSON_FILENAME: &str = "Weapons.json";
    const WEAPONS_JSON_FIXTURE_PATH: &str = "www/data/Weapons.json";

    fn create_weapon_translation(
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
    fn test_extract_weapons_strings() {
        let (_temp_dir, _project_root_path, extracted_strings) = setup_project_and_extract_strings(
            TEST_PROJECT_SUBPATH, 
            &[WEAPONS_JSON_FIXTURE_PATH], 
            WEAPONS_JSON_FILENAME
        );

        // Based on test_projects/rpg_mv_project_1/www/data/Weapons.json
        // ID 1 (Short Sword): name, description (2)
        // ID 2 (Long Sword): name, description (2)
        // ID 3 (Wooden Bow): name, description (2)
        // ID 4 (Battle Axe): name, description (2)
        // Total = 8 strings
        assert_eq!(extracted_strings.len(), 8, "Incorrect number of strings from Weapons.json");

        let short_sword_name = extracted_strings.iter().find(|s| s.object_id == 1 && s.json_path == "[1].name").unwrap();
        assert_eq!(short_sword_name.original_text, "Short Sword");
        assert_eq!(short_sword_name.source_file, "www/data/Weapons.json");

        let battle_axe_desc = extracted_strings.iter().find(|s| s.object_id == 4 && s.json_path == "[4].description").unwrap();
        assert_eq!(battle_axe_desc.original_text, "A heavy axe suited for powerful strikes.");
    }

    #[test]
    fn test_reconstruct_weapons_json() {
        let (temp_dir, project_root_path, _) = setup_project_and_extract_strings(
            TEST_PROJECT_SUBPATH, 
            &[WEAPONS_JSON_FIXTURE_PATH], 
            WEAPONS_JSON_FILENAME
        );
        let original_json_path = project_root_path.join("www/data").join(WEAPONS_JSON_FILENAME);
        let original_json_str = std::fs::read_to_string(original_json_path).unwrap();

        let relative_path = format!("www/data/{}", WEAPONS_JSON_FILENAME);

        let translations = vec![
            create_weapon_translation(1, "Short Sword", "Espada Corta", "[1].name", &relative_path),
            create_weapon_translation(1, "A basic sword, easy to handle.", "Una espada básica, fácil de manejar.", "[1].description", &relative_path),
            create_weapon_translation(3, "Wooden Bow", "Arco de Madera", "[3].name", &relative_path),
            // Skip description for ID 3
        ];
        let translations_refs: Vec<&WorkingTranslation> = translations.iter().collect();

        let result = weapons::reconstruct_weapons_json(&original_json_str, translations_refs);
        assert!(result.is_ok(), "Reconstruction failed: {:?}", result.err());
        let reconstructed_json_str = result.unwrap();
        let recon_val: serde_json::Value = serde_json::from_str(&reconstructed_json_str).unwrap();

        assert_eq!(recon_val[1]["name"].as_str().unwrap(), "Espada Corta");
        assert_eq!(recon_val[1]["description"].as_str().unwrap(), "Una espada básica, fácil de manejar.");
        assert_eq!(recon_val[2]["name"].as_str().unwrap(), "Long Sword"); // Original
        assert_eq!(recon_val[3]["name"].as_str().unwrap(), "Arco de Madera");
        assert_eq!(recon_val[3]["description"].as_str().unwrap(), "A simple bow crafted from wood."); // Original
        assert_eq!(recon_val[4]["name"].as_str().unwrap(), "Battle Axe"); // Untranslated

        temp_dir.close().unwrap();
    }
} 