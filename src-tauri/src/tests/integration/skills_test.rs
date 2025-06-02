#[cfg(test)]
mod skills_extraction_tests {
    // use std::path::Path;
    use crate::models::translation::SourceStringData;
    // use crate::core::rpgmv::project::extract_translatable_strings_from_project;
    use crate::tests::common_test_utils::setup_and_extract_all_strings;

    #[test]
    fn test_skills_extraction() {
        let all_extracted_strings = setup_and_extract_all_strings();

        let skill_strings: Vec<&SourceStringData> = all_extracted_strings
            .iter()
            .filter(|e| e.source_file.ends_with("Skills.json"))
            .collect();

        // --- SKILLS.JSON --- 
        // IMPORTANT: Update this count after running the test and seeing the actual output.
        let expected_skill_strings_count = 15;
        if skill_strings.len() != expected_skill_strings_count {
            eprintln!("Found {} strings from Skills.json, but expected {}.", skill_strings.len(), expected_skill_strings_count);
            eprintln!("Please update 'expected_skill_strings_count' in the test if fixture changed.");
            for (i, entry) in skill_strings.iter().take(25).enumerate() { // Show some examples
                eprintln!("  Skill String Example {}: {:?}", i + 1, entry);
            }
        }
        assert_eq!(skill_strings.len(), expected_skill_strings_count, "Incorrect number of strings extracted from Skills.json.");

        // Spot Checks based on the second test module's fixture (test_projects/rpg_mv_project_1/www/data/Skills.json)
        // ID 1 (Attack): name, message1, message2 
        let expected_skill_id_1 = 1;
        let expected_skill_name_1 = "Attack"; 
        let expected_json_path_name_1 = "[1].name";

        if let Some(skill_name_entry) = skill_strings.iter().find(|e| 
            e.object_id == expected_skill_id_1 && e.json_path == expected_json_path_name_1
        ) {
            assert_eq!(skill_name_entry.original_text, expected_skill_name_1, "Incorrect text for skill name (ID {}, path {}).", expected_skill_id_1, expected_json_path_name_1);
        } else {
            panic!("Could not find skill name for ID {} with path {}. Update placeholder if necessary.", expected_skill_id_1, expected_json_path_name_1);
        }

        // ID 1 (Attack): message2
        let expected_skill_message2_1 = "attacks."; 
        let expected_json_path_message2_1 = "[1].message2";
        if let Some(skill_msg2_entry) = skill_strings.iter().find(|e| 
            e.object_id == expected_skill_id_1 && e.json_path == expected_json_path_message2_1
        ) {
            assert_eq!(skill_msg2_entry.original_text, expected_skill_message2_1, "Incorrect text for skill message2 (ID {}, path {}).", expected_skill_id_1, expected_json_path_message2_1);
        } else {
            panic!("Could not find skill message2 for ID {} with path {}. Update placeholder.", expected_skill_id_1, expected_json_path_message2_1);
        }
        
        // ID 5 (Dual Attack): description
        let expected_skill_id_5 = 5;
        let expected_skill_description_5 = "Attacks twice in one turn.";
        let expected_json_path_description_5 = "[5].description";
        if let Some(skill_desc_entry) = skill_strings.iter().find(|e| 
            e.object_id == expected_skill_id_5 && e.json_path == expected_json_path_description_5
        ) {
            assert_eq!(skill_desc_entry.original_text, expected_skill_description_5, "Incorrect text for skill description (ID {}, path {}).", expected_skill_id_5, expected_json_path_description_5);
        } else {
             panic!("Could not find skill description for ID {} with path {}. Update placeholder or check extraction.", expected_skill_id_5, expected_json_path_description_5);
        }

        println!("Successfully validated strings from Skills.json in skills_extraction_tests module.");
    }
}

#[cfg(test)]
mod tests {
    use crate::core::rpgmv::skills;
    use crate::models::translation::{SourceStringData, WorkingTranslation};
    use crate::tests::common_test_utils::setup_project_and_extract_strings;
    use serde_json::json;

    const TEST_PROJECT_SUBPATH: &str = "test_projects/rpg_mv_project_1";
    const SKILLS_JSON_FILENAME: &str = "Skills.json";
    const SKILLS_JSON_FIXTURE_PATH: &str = "www/data/Skills.json";

    fn create_skill_translation(
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
    fn test_extract_skills_strings() {
        let (_temp_dir, _project_root_path, extracted_strings) = setup_project_and_extract_strings(
            TEST_PROJECT_SUBPATH, 
            &[SKILLS_JSON_FIXTURE_PATH], 
            SKILLS_JSON_FILENAME
        );

        // Based on test_projects/rpg_mv_project_1/www/data/Skills.json
        // ID 1 (Attack): name, message1, message2 (3)
        // ID 2 (Guard): name, message1, message2 (3)
        // ID 3 (Escape): name, message1 (message2 is empty) (2)
        // ID 4 (Wait): name (message1, message2 empty) (1)
        // ID 5 (Dual Attack): name, description, message1 (message2 empty) (3)
        // ID 6 (Triple Attack): name, description, message1 (message2 empty) (3)
        // Total = 3+3+2+1+3+3 = 15 strings
        assert_eq!(extracted_strings.len(), 15, "Incorrect number of strings from Skills.json");

        let attack_name = extracted_strings.iter().find(|s| s.object_id == 1 && s.json_path == "[1].name").unwrap();
        assert_eq!(attack_name.original_text, "Attack");
        assert_eq!(attack_name.source_file, "www/data/Skills.json");

        let attack_msg2 = extracted_strings.iter().find(|s| s.object_id == 1 && s.json_path == "[1].message2").unwrap();
        assert_eq!(attack_msg2.original_text, "attacks.");

        let dual_attack_desc = extracted_strings.iter().find(|s| s.object_id == 5 && s.json_path == "[5].description").unwrap();
        assert_eq!(dual_attack_desc.original_text, "Attacks twice in one turn.");
    }

    #[test]
    fn test_reconstruct_skills_json() {
        let (temp_dir, project_root_path, _) = setup_project_and_extract_strings(
            TEST_PROJECT_SUBPATH, 
            &[SKILLS_JSON_FIXTURE_PATH], 
            SKILLS_JSON_FILENAME
        );
        let original_json_path = project_root_path.join("www/data").join(SKILLS_JSON_FILENAME);
        let original_json_str = std::fs::read_to_string(original_json_path).unwrap();

        let relative_path = format!("www/data/{}", SKILLS_JSON_FILENAME);

        let translations = vec![
            create_skill_translation(1, "Attack", "Atacar", "[1].name", &relative_path),
            create_skill_translation(1, " performs ", " realiza ", "[1].message1", &relative_path),
            create_skill_translation(1, "attacks.", "ataques.", "[1].message2", &relative_path),
            create_skill_translation(5, "Dual Attack", "Ataque Dual", "[5].name", &relative_path),
            create_skill_translation(5, "Attacks twice in one turn.", "Ataca dos veces en un turno.", "[5].description", &relative_path),
            // message1 for Dual Attack uses %1, should remain as is if not translated.
        ];
        let translations_refs: Vec<&WorkingTranslation> = translations.iter().collect();

        let result = skills::reconstruct_skills_json(&original_json_str, translations_refs);
        assert!(result.is_ok(), "Reconstruction failed: {:?}", result.err());
        let reconstructed_json_str = result.unwrap();
        let recon_val: serde_json::Value = serde_json::from_str(&reconstructed_json_str).unwrap();

        assert_eq!(recon_val[1]["name"].as_str().unwrap(), "Atacar");
        assert_eq!(recon_val[1]["message1"].as_str().unwrap(), " realiza ");
        assert_eq!(recon_val[1]["message2"].as_str().unwrap(), "ataques.");
        
        assert_eq!(recon_val[2]["name"].as_str().unwrap(), "Guard"); // Original
        
        assert_eq!(recon_val[5]["name"].as_str().unwrap(), "Ataque Dual");
        assert_eq!(recon_val[5]["description"].as_str().unwrap(), "Ataca dos veces en un turno.");
        assert_eq!(recon_val[5]["message1"].as_str().unwrap(), " attacks with %1."); // Original, as it contains %1 and was not in translations list

        temp_dir.close().unwrap();
    }
} 