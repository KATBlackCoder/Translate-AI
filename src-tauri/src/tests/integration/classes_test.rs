#[cfg(test)]
mod tests {
    use crate::core::rpgmv::classes;
    use crate::models::translation::{SourceStringData, WorkingTranslation};
    use crate::tests::common_test_utils::setup_project_and_extract_strings;
    use serde_json::json;

    const TEST_PROJECT_SUBPATH: &str = "test_projects/rpg_mv_project_1";
    const CLASSES_JSON_FILENAME: &str = "Classes.json";
    const CLASSES_JSON_FIXTURE_PATH: &str = "www/data/Classes.json";

    fn create_class_translation(
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
    fn test_extract_classes_strings() {
        let (_temp_dir, _project_root_path, extracted_strings) = setup_project_and_extract_strings(
            TEST_PROJECT_SUBPATH, 
            &[CLASSES_JSON_FIXTURE_PATH], 
            CLASSES_JSON_FILENAME
        );

        // Based on test_projects/rpg_mv_project_1/www/data/Classes.json
        // ID 1 (Hero): name, learnings[0].note, learnings[1].note (3)
        // ID 2 (Warrior): name (1)
        // ID 3 (Mage): name (1)
        // ID 4 (Priest): name (1)
        // Note: The `note` field for the class itself is empty for all these.
        // Total = 3 + 1 + 1 + 1 = 6 strings
        assert_eq!(extracted_strings.len(), 6, "Incorrect number of strings from Classes.json");

        let hero_name = extracted_strings.iter().find(|s| s.object_id == 1 && s.json_path == "[1].name").unwrap();
        assert_eq!(hero_name.original_text, "Hero");
        assert_eq!(hero_name.source_file, "www/data/Classes.json");

        let hero_learning_1_note = extracted_strings.iter().find(|s| s.object_id == 1 && s.json_path == "[1].learnings[0].note").unwrap();
        assert_eq!(hero_learning_1_note.original_text, "Learns Double Attack at level 1.");

        let hero_learning_2_note = extracted_strings.iter().find(|s| s.object_id == 1 && s.json_path == "[1].learnings[1].note").unwrap();
        assert_eq!(hero_learning_2_note.original_text, "Learns Triple Attack at level 5.");
    }

    #[test]
    fn test_reconstruct_classes_json() {
        let (temp_dir, project_root_path, _) = setup_project_and_extract_strings(
            TEST_PROJECT_SUBPATH, 
            &[CLASSES_JSON_FIXTURE_PATH], 
            CLASSES_JSON_FILENAME
        );
        let original_json_path = project_root_path.join("www/data").join(CLASSES_JSON_FILENAME);
        let original_json_str = std::fs::read_to_string(original_json_path).unwrap();

        let relative_path_for_translation = format!("www/data/{}", CLASSES_JSON_FILENAME);

        let translations = vec![
            create_class_translation(1, "Hero", "Héroe", "[1].name", &relative_path_for_translation),
            create_class_translation(1, "Learns Double Attack at level 1.", "Aprende Doble Ataque en nivel 1.", "[1].learnings[0].note", &relative_path_for_translation),
            // Skip hero_learning_2_note translation to test partial reconstruction
            create_class_translation(2, "Warrior", "Guerrero", "[2].name", &relative_path_for_translation),
        ];
        let translations_refs: Vec<&WorkingTranslation> = translations.iter().collect();

        let result = classes::reconstruct_classes_json(&original_json_str, translations_refs);
        assert!(result.is_ok(), "Reconstruction failed: {:?}", result.err());
        let reconstructed_json_str = result.unwrap();
        let recon_val: serde_json::Value = serde_json::from_str(&reconstructed_json_str).unwrap();

        assert_eq!(recon_val[1]["name"].as_str().unwrap(), "Héroe");
        assert_eq!(recon_val[1]["learnings"][0]["note"].as_str().unwrap(), "Aprende Doble Ataque en nivel 1.");
        assert_eq!(recon_val[1]["learnings"][1]["note"].as_str().unwrap(), "Learns Triple Attack at level 5."); // Original
        assert_eq!(recon_val[2]["name"].as_str().unwrap(), "Guerrero");
        assert_eq!(recon_val[3]["name"].as_str().unwrap(), "Mage"); // Untranslated

        temp_dir.close().unwrap();
    }
} 