#[cfg(test)]
mod tests {
    use crate::core::rpgmv::armors;
    use crate::models::translation::{SourceStringData, WorkingTranslation};
    use crate::tests::common_test_utils::setup_project_and_extract_strings;
    use serde_json::json;

    const TEST_PROJECT_SUBPATH: &str = "test_projects/rpg_mv_project_1";
    const ARMORS_JSON_FILENAME: &str = "Armors.json";
    const ARMORS_JSON_FIXTURE_PATH: &str = "www/data/Armors.json";

    fn create_armor_translation(
        object_id: u32, 
        original_text: &str, 
        translated_text: &str, 
        json_path: &str,
        source_file: &str // e.g. "www/data/Armors.json"
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
    fn test_extract_armors_strings() {
        let (_temp_dir, _project_root_path, extracted_strings) = setup_project_and_extract_strings(
            TEST_PROJECT_SUBPATH, 
            &[ARMORS_JSON_FIXTURE_PATH], 
            ARMORS_JSON_FILENAME
        );

        // Based on test_projects/rpg_mv_project_1/www/data/Armors.json
        // ID 1 (Cotton Robe): name, description (2)
        // ID 2 (Traveler's Cloak): name, description (2)
        // ID 3 (Leather Vest): name, description (2)
        // ID 4 (Iron Plate): name, description (2)
        // Total = 8 strings
        assert_eq!(extracted_strings.len(), 8, "Incorrect number of strings from Armors.json");

        let robe_name = extracted_strings.iter().find(|s| s.object_id == 1 && s.json_path == "[1].name").unwrap();
        assert_eq!(robe_name.original_text, "Cotton Robe");
        assert_eq!(robe_name.source_file, "www/data/Armors.json");

        let robe_desc = extracted_strings.iter().find(|s| s.object_id == 1 && s.json_path == "[1].description").unwrap();
        assert_eq!(robe_desc.original_text, "A simple robe woven from cotton.");
    }

    #[test]
    fn test_reconstruct_armors_json() {
        let (temp_dir, project_root_path, _) = setup_project_and_extract_strings(
            TEST_PROJECT_SUBPATH, 
            &[ARMORS_JSON_FIXTURE_PATH], 
            ARMORS_JSON_FILENAME
        );
        let original_json_path = project_root_path.join("www/data").join(ARMORS_JSON_FILENAME);
        let original_json_str = std::fs::read_to_string(original_json_path).unwrap();

        let relative_path_for_translation = format!("www/data/{}", ARMORS_JSON_FILENAME);

        let translations = vec![
            create_armor_translation(1, "Cotton Robe", "Túnica de Algodón", "[1].name", &relative_path_for_translation),
            create_armor_translation(1, "A simple robe woven from cotton.", "Una túnica simple tejida de algodón.", "[1].description", &relative_path_for_translation),
            create_armor_translation(2, "Traveler's Cloak", "Capa de Viajero", "[2].name", &relative_path_for_translation),
            // Skip description for ID 2 to test partial translation
            create_armor_translation(3, "Leather Vest", "Chaleco de Cuero", "[3].name", &relative_path_for_translation),
            create_armor_translation(3, "Armor made from tanned leather.", "Armadura de cuero curtido.", "[3].description", &relative_path_for_translation),
        ];
        let translations_refs: Vec<&WorkingTranslation> = translations.iter().collect();

        let result = armors::reconstruct_armors_json(&original_json_str, translations_refs);
        assert!(result.is_ok(), "Reconstruction failed: {:?}", result.err());
        let reconstructed_json_str = result.unwrap();
        let recon_val: serde_json::Value = serde_json::from_str(&reconstructed_json_str).unwrap();

        assert_eq!(recon_val[1]["name"].as_str().unwrap(), "Túnica de Algodón");
        assert_eq!(recon_val[1]["description"].as_str().unwrap(), "Una túnica simple tejida de algodón.");
        assert_eq!(recon_val[2]["name"].as_str().unwrap(), "Capa de Viajero");
        assert_eq!(recon_val[2]["description"].as_str().unwrap(), "A light cloak perfect for travel."); // Original description for ID 2
        assert_eq!(recon_val[3]["name"].as_str().unwrap(), "Chaleco de Cuero");
        assert_eq!(recon_val[3]["description"].as_str().unwrap(), "Armadura de cuero curtido.");
        assert_eq!(recon_val[4]["name"].as_str().unwrap(), "Iron Plate"); // Untranslated

        temp_dir.close().unwrap();
    }
} 