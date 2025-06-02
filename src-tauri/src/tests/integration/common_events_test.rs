#[cfg(test)]
mod tests {
    use crate::core::rpgmv::common_events;
    use crate::models::translation::{SourceStringData, WorkingTranslation};
    use crate::tests::common_test_utils::setup_project_and_extract_strings;
    use serde_json::json;

    const TEST_PROJECT_SUBPATH: &str = "test_projects/rpg_mv_project_1";
    const COMMON_EVENTS_JSON_FILENAME: &str = "CommonEvents.json";
    const COMMON_EVENTS_JSON_FIXTURE_PATH: &str = "www/data/CommonEvents.json";

    fn create_event_translation(
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
    fn test_extract_common_events_strings() {
        let (_temp_dir, _project_root_path, extracted_strings) = setup_project_and_extract_strings(
            TEST_PROJECT_SUBPATH, 
            &[COMMON_EVENTS_JSON_FIXTURE_PATH], 
            COMMON_EVENTS_JSON_FILENAME
        );

        // Based on test_projects/rpg_mv_project_1/www/data/CommonEvents.json
        // Event 1 (Sample Common Event): name, list[0].parameters[4] (Show Text name), list[1].parameters[0] (Show Text line 1), list[2].parameters[0] (Show Choices choice 1), list[2].parameters[0] (Show Choices choice 2)
        // Total = 5 strings for Event 1
        // Event 2 (Another Event): name, list[0].parameters[0] (Show Text line 1)
        // Total = 2 strings for Event 2
        // Grand Total = 7 strings
        assert_eq!(extracted_strings.len(), 7, "Incorrect number of strings from CommonEvents.json");

        let event1_name = extracted_strings.iter().find(|s| s.object_id == 1 && s.json_path == "[1].name").unwrap();
        assert_eq!(event1_name.original_text, "Sample Common Event");
        assert_eq!(event1_name.source_file, "www/data/CommonEvents.json");

        let event1_showtext_name = extracted_strings.iter().find(|s| s.object_id == 1 && s.json_path == "[1].list[0].parameters[4]").unwrap();
        assert_eq!(event1_showtext_name.original_text, "Narrator");

        let event1_choice2 = extracted_strings.iter().find(|s| s.object_id == 1 && s.json_path == "[1].list[2].parameters[0][1]").unwrap(); // Choice 2 is at index 1 of parameters[0] array
        assert_eq!(event1_choice2.original_text, "Choice B");
    }

    #[test]
    fn test_reconstruct_common_events_json() {
        let (temp_dir, project_root_path, _) = setup_project_and_extract_strings(
            TEST_PROJECT_SUBPATH, 
            &[COMMON_EVENTS_JSON_FIXTURE_PATH], 
            COMMON_EVENTS_JSON_FILENAME
        );
        let original_json_path = project_root_path.join("www/data").join(COMMON_EVENTS_JSON_FILENAME);
        let original_json_str = std::fs::read_to_string(original_json_path).unwrap();

        let relative_path = format!("www/data/{}", COMMON_EVENTS_JSON_FILENAME);

        let translations = vec![
            create_event_translation(1, "Sample Common Event", "Evento Común de Muestra", "[1].name", &relative_path),
            create_event_translation(1, "Narrator", "Narrador", "[1].list[0].parameters[4]", &relative_path),
            create_event_translation(1, "This is the first line.", "Esta es la primera línea.", "[1].list[1].parameters[0]", &relative_path),
            create_event_translation(1, "Choice A", "Opción A", "[1].list[2].parameters[0][0]", &relative_path),
            // Skip translating Choice B for Event 1
            create_event_translation(2, "Another Event", "Otro Evento", "[2].name", &relative_path),
            create_event_translation(2, "Hello from event 2!", "¡Hola desde el evento 2!", "[2].list[0].parameters[0]", &relative_path),
        ];
        let translations_refs: Vec<&WorkingTranslation> = translations.iter().collect();

        let result = common_events::reconstruct_common_events_json(&original_json_str, translations_refs);
        assert!(result.is_ok(), "Reconstruction failed: {:?}", result.err());
        let reconstructed_json_str = result.unwrap();
        let recon_val: serde_json::Value = serde_json::from_str(&reconstructed_json_str).unwrap();

        assert_eq!(recon_val[1]["name"].as_str().unwrap(), "Evento Común de Muestra");
        assert_eq!(recon_val[1]["list"][0]["parameters"][4].as_str().unwrap(), "Narrador");
        assert_eq!(recon_val[1]["list"][1]["parameters"][0].as_str().unwrap(), "Esta es la primera línea.");
        assert_eq!(recon_val[1]["list"][2]["parameters"][0][0].as_str().unwrap(), "Opción A");
        assert_eq!(recon_val[1]["list"][2]["parameters"][0][1].as_str().unwrap(), "Choice B"); // Original

        assert_eq!(recon_val[2]["name"].as_str().unwrap(), "Otro Evento");
        assert_eq!(recon_val[2]["list"][0]["parameters"][0].as_str().unwrap(), "¡Hola desde el evento 2!");

        temp_dir.close().unwrap();
    }
} 