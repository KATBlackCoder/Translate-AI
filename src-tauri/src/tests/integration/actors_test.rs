#[cfg(test)]
mod tests {
    // use std::path::Path; // No longer needed here
    // use crate::core::rpgmv::common::TranslatableStringEntry; // No longer needed here
    // use crate::core::rpgmv::project::extract_translatable_strings_from_project; // No longer needed here
    use crate::tests::common_test_utils::setup_project_and_extract_strings;
    use crate::core::rpgmv::actors; // Updated import
    use crate::models::translation::WorkingTranslation; // Added import
    use serde_json::json;

    const TEST_PROJECT_SUBPATH: &str = "test_projects/rpg_mv_project_1";
    const ACTORS_JSON_FILENAME: &str = "Actors.json";
    // This is the path relative to the *fixture* project root, used for specifying what to copy.
    const ACTORS_JSON_FIXTURE_PATH: &str = "www/data/Actors.json"; 

    // Helper to create a WorkingTranslation for tests
    fn create_actor_translation(
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
            translation_source: "test_engine".to_string(), // Added field
            error: None,
        }
    }

    #[test]
    fn test_extract_actors_strings() {
        // setup_project_and_extract_strings copies ACTORS_JSON_FIXTURE_PATH from the fixture 
        // to the temp directory, then extracts strings specifically from ACTORS_JSON_FILENAME in that temp dir.
        let (_temp_dir, _project_root_path, extracted_strings) = setup_project_and_extract_strings(
            TEST_PROJECT_SUBPATH, 
            &[ACTORS_JSON_FIXTURE_PATH], // File(s) to copy from fixture to temp project
            ACTORS_JSON_FILENAME // The specific file to parse from the temp project
        );

        // Check extracted strings
        // Based on rpg_mv_project_1/www/data/Actors.json:
        // Actor 1 (Harold): name, nickname, profile, note (4)
        // Actor 2 (Therese): name, profile (nickname and note are empty) (2)
        // Actor 3 (Marsha): name (nickname, profile, note are empty) (1)
        // Actor 4 (Lucius): name, nickname, profile (note is empty) - Wait, Lucius (ID 4) has empty name, nickname, profile in RPGMV sample.
        // The RPG Maker MV sample Actors.json has: 
        // ID 1: Harold - name, nickname, profile, note
        // ID 2: Therese - name, profile (nickname, note empty)
        // ID 3: Marsha - name (nickname, profile, note empty)
        // ID 4: Lucius - name (nickname, profile, note empty) -> ID 4 is actually empty in the sample project.
        // The test data `test_projects/rpg_mv_project_1/www/data/Actors.json` seems to be custom.
        // Let's re-verify the actual test fixture file `test_projects/rpg_mv_project_1/www/data/Actors.json`
        // It has:
        // ID 1 (Harold): name, nickname, profile, note ("<Test Note: Harold>")
        // ID 2 (Therese): name, profile (nickname="", note="")
        // ID 3 (Marsha): name (nickname="", profile="", note="")
        // ID 4 (Lucius - in json file, but id 0 is skipped): all fields empty in provided json. The extractor skips ID 0.
        // The generic RpgMvDataObject extractor skips empty strings for `name`, `nickname`, `profile`, `note`.

        // Harold: name, nickname, profile, note (4)
        // Therese: name, profile (2) - RpgMvDataObject skips nickname, note if empty.
        // Marsha: name (1)
        // Lucius: none, because actor id 4 has empty fields which are skipped by the parser.
        // Total = 4 + 2 + 1 = 7.
        assert_eq!(extracted_strings.len(), 7, "Mismatch in extracted strings count from Actors.json. Expected 7 based on RpgMvDataObject filtering.");

        // Harold's Name
        let harold_name = extracted_strings
            .iter()
            .find(|s| s.object_id == 1 && s.json_path == "[1].name")
            .expect("Harold's name not found");
        assert_eq!(harold_name.original_text, "Harold");
        // Source file path is now relative to the www/data directory within the *temp* project.
        assert_eq!(harold_name.source_file, format!("www/data/{}", ACTORS_JSON_FILENAME));

        // Harold's Nickname
        let harold_nickname = extracted_strings
            .iter()
            .find(|s| s.object_id == 1 && s.json_path == "[1].nickname")
            .expect("Harold's nickname not found");
        assert_eq!(harold_nickname.original_text, "Young Hero");
        
        // Harold's Profile
        let harold_profile = extracted_strings
            .iter()
            .find(|s| s.object_id == 1 && s.json_path == "[1].profile")
            .expect("Harold's profile not found");
        assert_eq!(harold_profile.original_text, "A young man training to be a hero.\nHe's kind but can be a bit naive.");
        
        // Harold's Note
        let harold_note = extracted_strings
            .iter()
            .find(|s| s.object_id == 1 && s.json_path == "[1].note")
            .expect("Harold's note not found");
        assert_eq!(harold_note.original_text, "<Test Note: Harold>");

        // Therese's Name
        let therese_name = extracted_strings
            .iter()
            .find(|s| s.object_id == 2 && s.json_path == "[2].name")
            .expect("Therese's name not found");
        assert_eq!(therese_name.original_text, "Therese");

        // Therese's Profile
        let therese_profile = extracted_strings
            .iter()
            .find(|s| s.object_id == 2 && s.json_path == "[2].profile")
            .expect("Therese's profile not found");
        assert_eq!(therese_profile.original_text, "A skilled sorceress with a sharp wit.");
        
        // Marsha's Name (actor 3)
        let marsha_name = extracted_strings
            .iter()
            .find(|s| s.object_id == 3 && s.json_path == "[3].name")
            .expect("Marsha's name not found");
        assert_eq!(marsha_name.original_text, "Marsha");

        // Lucius (ID 4 in JSON, object_id 4) should not have any strings extracted as its fields are empty in the fixture
        let lucius_strings: Vec<_> = extracted_strings.iter().filter(|s| s.object_id == 4).collect();
        assert!(lucius_strings.is_empty(), "No strings should be extracted for Lucius (ID 4) as its fields are empty in the fixture. Found: {:?}", lucius_strings);
    }

    #[test]
    fn test_reconstruct_actors_json() {
        let (temp_dir, project_root_path, _) = setup_project_and_extract_strings(
            TEST_PROJECT_SUBPATH, 
            &[ACTORS_JSON_FIXTURE_PATH], 
            ACTORS_JSON_FILENAME
        );
        let original_actors_json_path = project_root_path.join("www/data").join(ACTORS_JSON_FILENAME);
        let original_json_str = std::fs::read_to_string(&original_actors_json_path).unwrap();
        
        // Path relative to www/data for WorkingTranslation source_file, matching what extract_strings produces
        let relative_actors_path_for_translation = format!("www/data/{}", ACTORS_JSON_FILENAME); 

        let translations = vec![
            create_actor_translation(1, "Harold", "Haroldo", "[1].name", &relative_actors_path_for_translation),
            create_actor_translation(1, "Young Hero", "Joven Héroe", "[1].nickname", &relative_actors_path_for_translation),
            create_actor_translation(1, "A young man training to be a hero.\nHe's kind but can be a bit naive.", "Un joven entrenando para ser héroe.\nEs amable pero un poco ingenuo.", "[1].profile", &relative_actors_path_for_translation),
            create_actor_translation(1, "<Test Note: Harold>", "<Nota de Prueba: Haroldo>", "[1].note", &relative_actors_path_for_translation),
            create_actor_translation(2, "Therese", "Teresa", "[2].name", &relative_actors_path_for_translation),
            create_actor_translation(2, "A skilled sorceress with a sharp wit.", "Una hechicera habilidosa con ingenio agudo.", "[2].profile", &relative_actors_path_for_translation),
            // Therese's nickname and note are empty and not extracted, so no translation entries for them.
            create_actor_translation(3, "Marsha", "Marcia", "[3].name", &relative_actors_path_for_translation), 
            // Lucius (ID 4) fields are empty and not extracted.
        ];

        let translations_refs: Vec<&WorkingTranslation> = translations.iter().collect();

        let result = actors::reconstruct_actors_json(&original_json_str, translations_refs);
        assert!(result.is_ok(), "Reconstruction failed: {:?}", result.err());
        let reconstructed_json_str = result.unwrap();

        let reconstructed_value: serde_json::Value = serde_json::from_str(&reconstructed_json_str).expect("Failed to parse reconstructed JSON");

        // Check Harold (ID 1)
        assert_eq!(reconstructed_value[1]["name"].as_str().unwrap(), "Haroldo");
        assert_eq!(reconstructed_value[1]["nickname"].as_str().unwrap(), "Joven Héroe");
        assert_eq!(reconstructed_value[1]["profile"].as_str().unwrap(), "Un joven entrenando para ser héroe.\nEs amable pero un poco ingenuo.");
        assert_eq!(reconstructed_value[1]["note"].as_str().unwrap(), "<Nota de Prueba: Haroldo>");
        
        // Check Therese (ID 2)
        assert_eq!(reconstructed_value[2]["name"].as_str().unwrap(), "Teresa");
        assert_eq!(reconstructed_value[2]["nickname"].as_str().unwrap(), ""); // Nickname was empty, should remain empty
        assert_eq!(reconstructed_value[2]["profile"].as_str().unwrap(), "Una hechicera habilidosa con ingenio agudo.");
        assert_eq!(reconstructed_value[2]["note"].as_str().unwrap(), ""); // Note was empty

        // Check Marsha (ID 3) - only name translated
        assert_eq!(reconstructed_value[3]["name"].as_str().unwrap(), "Marcia");
        assert_eq!(reconstructed_value[3]["nickname"].as_str().unwrap(), "");
        assert_eq!(reconstructed_value[3]["profile"].as_str().unwrap(), "");
        assert_eq!(reconstructed_value[3]["note"].as_str().unwrap(), "");

        // Check Lucius (ID 4) - fields were empty, should remain empty
        assert_eq!(reconstructed_value[4]["name"].as_str().unwrap(), ""); 
        assert_eq!(reconstructed_value[4]["nickname"].as_str().unwrap(), "");
        assert_eq!(reconstructed_value[4]["profile"].as_str().unwrap(), "");
        assert_eq!(reconstructed_value[4]["note"].as_str().unwrap(), "");

        // Ensure original structure is preserved for non-translated parts or untouched entries (e.g. ID 0 which is null)
        assert_eq!(reconstructed_value[0], json!(null));
        assert_eq!(reconstructed_value[1]["battlerName"].as_str().unwrap(), "Actor1_1"); // Unchanged field

        // Clean up
        temp_dir.close().unwrap();
    }
}
