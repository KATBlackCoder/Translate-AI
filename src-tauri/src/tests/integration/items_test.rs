#[cfg(test)]
mod items_extraction_tests {
    // use std::path::Path;
    use crate::models::translation::SourceStringData;
    // use crate::core::rpgmv::project::extract_translatable_strings_from_project;
    use crate::tests::common_test_utils::setup_and_extract_all_strings;
}

#[cfg(test)]
mod tests {
    use crate::core::rpgmv::items;
    use crate::models::translation::{SourceStringData, WorkingTranslation};
    use crate::tests::common_test_utils::setup_project_and_extract_strings;
    use serde_json::json;

    const TEST_PROJECT_SUBPATH: &str = "test_projects/rpg_mv_project_1";
    const ITEMS_JSON_FILENAME: &str = "Items.json";
    const ITEMS_JSON_FIXTURE_PATH: &str = "www/data/Items.json";

    fn create_item_translation(
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
    fn test_extract_items_strings() {
        let (_temp_dir, _project_root_path, extracted_strings) = setup_project_and_extract_strings(
            TEST_PROJECT_SUBPATH, 
            &[ITEMS_JSON_FIXTURE_PATH], 
            ITEMS_JSON_FILENAME
        );

        // Based on test_projects/rpg_mv_project_1/www/data/Items.json
        // ID 1 (Potion): name, description (2)
        // ID 2 (Magic Water): name, description (2)
        // ID 3 (Stimulant): name, description (2)
        // ID 4 (Super Potion): name, description (2)
        // Total = 8 strings
        assert_eq!(extracted_strings.len(), 8, "Incorrect number of strings from Items.json");

        let potion_name = extracted_strings.iter().find(|s| s.object_id == 1 && s.json_path == "[1].name").unwrap();
        assert_eq!(potion_name.original_text, "Potion");
        assert_eq!(potion_name.source_file, "www/data/Items.json");

        let potion_desc = extracted_strings.iter().find(|s| s.object_id == 1 && s.json_path == "[1].description").unwrap();
        assert_eq!(potion_desc.original_text, "Restores a small amount of HP.");
    }

    #[test]
    fn test_reconstruct_items_json() {
        let (temp_dir, project_root_path, _) = setup_project_and_extract_strings(
            TEST_PROJECT_SUBPATH, 
            &[ITEMS_JSON_FIXTURE_PATH], 
            ITEMS_JSON_FILENAME
        );
        let original_json_path = project_root_path.join("www/data").join(ITEMS_JSON_FILENAME);
        let original_json_str = std::fs::read_to_string(original_json_path).unwrap();

        let relative_path = format!("www/data/{}", ITEMS_JSON_FILENAME);

        let translations = vec![
            create_item_translation(1, "Potion", "Poción", "[1].name", &relative_path),
            create_item_translation(1, "Restores a small amount of HP.", "Restaura una pequeña cantidad de PV.", "[1].description", &relative_path),
            create_item_translation(2, "Magic Water", "Agua Mágica", "[2].name", &relative_path),
            // Skip description for ID 2
        ];
        let translations_refs: Vec<&WorkingTranslation> = translations.iter().collect();

        let result = items::reconstruct_items_json(&original_json_str, translations_refs);
        assert!(result.is_ok(), "Reconstruction failed: {:?}", result.err());
        let reconstructed_json_str = result.unwrap();
        let recon_val: serde_json::Value = serde_json::from_str(&reconstructed_json_str).unwrap();

        assert_eq!(recon_val[1]["name"].as_str().unwrap(), "Poción");
        assert_eq!(recon_val[1]["description"].as_str().unwrap(), "Restaura una pequeña cantidad de PV.");
        assert_eq!(recon_val[2]["name"].as_str().unwrap(), "Agua Mágica");
        assert_eq!(recon_val[2]["description"].as_str().unwrap(), "Restores a small amount of MP."); // Original
        assert_eq!(recon_val[3]["name"].as_str().unwrap(), "Stimulant"); // Untranslated

        temp_dir.close().unwrap();
    }
} 