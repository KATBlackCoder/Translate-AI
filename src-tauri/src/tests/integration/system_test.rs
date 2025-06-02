#[cfg(test)]
mod system_extraction_tests {
    // use std::path::Path;
    use crate::models::translation::SourceStringData;
    // use crate::core::rpgmv::project::extract_translatable_strings_from_project;
    use crate::tests::common_test_utils::setup_and_extract_all_strings;

    // Removed local helper

    #[test]
    fn test_system_extraction() {
        let all_extracted_strings = setup_and_extract_all_strings();

        let system_strings: Vec<&SourceStringData> = all_extracted_strings
            .iter()
            .filter(|e| e.source_file.ends_with("System.json"))
            .collect();

        // --- SYSTEM.JSON ---
        // Count based on the second test module's fixture (test_projects/rpg_mv_project_1/www/data/System.json)
        // gameTitle: 1, currencyUnit: 1, elements: 9, skillTypes: 2, weaponTypes: 12, armorTypes: 5
        // terms.basic: 8, terms.commands: 24 (index 13 empty), terms.params: 10
        // terms.messages (all 21 fields non-empty): 21
        // boat.name: 1, ship.name: 1, airship.name: 1, titleCommands: 3
        // Total = 1+1+9+2+12+5+8+24+10+21+1+1+1+3 = 99
        let expected_system_strings_count = 99; 
        if system_strings.len() != expected_system_strings_count {
            eprintln!("Found {} strings from System.json, but expected {}.", system_strings.len(), expected_system_strings_count);
            eprintln!("Please update 'expected_system_strings_count' in the test if fixture changed.");
            for (i, entry) in system_strings.iter().take(50).enumerate() { // Show some examples
                eprintln!("  System String Example {}: {:?}", i + 1, entry);
            }
        }
        assert_eq!(system_strings.len(), expected_system_strings_count, "Incorrect number of strings extracted from System.json.");

        // --- Spot Checks for System.json (aligned with the second module's fixture) ---

        let expected_game_title = "My RPG Game"; 
        let expected_json_path_game_title = "gameTitle";
        if let Some(entry) = system_strings.iter().find(|e| e.json_path == expected_json_path_game_title) {
            assert_eq!(entry.original_text, expected_game_title, "Incorrect game title.");
        } else {
            panic!("Could not find game title with path '{}'. Update placeholder or check extraction.", expected_json_path_game_title);
        }

        let expected_currency_unit = "G";
        let expected_json_path_currency_unit = "currencyUnit";
         if let Some(entry) = system_strings.iter().find(|e| e.json_path == expected_json_path_currency_unit) {
            assert_eq!(entry.original_text, expected_currency_unit, "Incorrect currency unit.");
        } else {
            panic!("Could not find currency unit with path '{}'. Update placeholder or check extraction.", expected_json_path_currency_unit);
        }
        
        let expected_armor_type_1 = "General"; // armorTypes[1] in fixture (index 0 is "")
        let expected_json_path_armor_type_1 = "armorTypes[1]"; 
        if let Some(entry) = system_strings.iter().find(|e| e.json_path == expected_json_path_armor_type_1) {
            assert_eq!(entry.original_text, expected_armor_type_1, "Incorrect armor type at {}.", expected_json_path_armor_type_1);
        } else {
            panic!("Could not find armor type with path '{}'. Update placeholder or check extraction.", expected_json_path_armor_type_1);
        }

        let expected_skill_type_1 = "Magic"; // skillTypes[1] in fixture (index 0 is "")
        let expected_json_path_skill_type_1 = "skillTypes[1]";
        if let Some(entry) = system_strings.iter().find(|e| e.json_path == expected_json_path_skill_type_1) {
            assert_eq!(entry.original_text, expected_skill_type_1, "Incorrect skill type at {}.", expected_json_path_skill_type_1);
        } else {
            panic!("Could not find skill type with path '{}'. Update placeholder or check extraction.", expected_json_path_skill_type_1);
        }

        let expected_element_2 = "Fire"; // elements[2] in fixture (index 0 is "", index 1 is "Physical")
        let expected_json_path_element_2 = "elements[2]";
         if let Some(entry) = system_strings.iter().find(|e| e.json_path == expected_json_path_element_2) {
            assert_eq!(entry.original_text, expected_element_2, "Incorrect element at {}.", expected_json_path_element_2);
        } else {
            panic!("Could not find element with path '{}'. Update placeholder or check extraction.", expected_json_path_element_2);
        }
        
        let expected_message_always_dash = "Always Dash";
        let expected_json_path_message_always_dash = "terms.messages.alwaysDash";
        if let Some(entry) = system_strings.iter().find(|e| e.json_path == expected_json_path_message_always_dash) {
            assert_eq!(entry.original_text, expected_message_always_dash, "Incorrect message for '{}'.", expected_json_path_message_always_dash);
        } else {
            panic!("Could not find message with path '{}'. Update placeholder or check extraction.", expected_json_path_message_always_dash);
        }
        
        let expected_term_command_new_game = "New Game"; // titleCommands[0]
        let expected_json_path_term_command_new_game = "titleCommands[0]";
         if let Some(entry) = system_strings.iter().find(|e| e.json_path == expected_json_path_term_command_new_game) {
            assert_eq!(entry.original_text, expected_term_command_new_game, "Incorrect term command at '{}'.", expected_json_path_term_command_new_game);
        } else {
            panic!("Could not find term command with path '{}'. Update placeholder or check extraction.", expected_json_path_term_command_new_game);
        }

        println!("Successfully validated strings from System.json in system_extraction_tests module.");
    }
}

#[cfg(test)]
mod tests {
    use crate::core::rpgmv::system;
    use crate::models::translation::{SourceStringData, WorkingTranslation};
    use crate::tests::common_test_utils::setup_project_and_extract_strings;
    use serde_json::json;

    const TEST_PROJECT_SUBPATH: &str = "test_projects/rpg_mv_project_1";
    const SYSTEM_JSON_FILENAME: &str = "System.json";
    const SYSTEM_JSON_FIXTURE_PATH: &str = "www/data/System.json";

    fn create_system_translation(
        object_id: u32, // For System.json, object_id is often dummy (e.g., 0 or 1) as it's a single object file
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
    fn test_extract_system_strings() {
        let (_temp_dir, _project_root_path, extracted_strings) = setup_project_and_extract_strings(
            TEST_PROJECT_SUBPATH, 
            &[SYSTEM_JSON_FIXTURE_PATH], 
            SYSTEM_JSON_FILENAME
        );
        
        // Count based on test_projects/rpg_mv_project_1/www/data/System.json
        // gameTitle: 1
        // currencyUnit: 1
        // elements (0-8): 9 (index 0 is empty, but "" is a string)
        // skillTypes (1-2): 2
        // weaponTypes (1-12): 12
        // armorTypes (1-5): 5
        // terms:
        //    basic (0-7): 8
        //    commands (0-24): 25 (index 13 is empty)
        //    params (0-9): 10
        //    messages (all fields): 21 (e.g. actionFailure, actorDamage, actorRecovery etc.)
        // boat, ship, airship names: 3
        // titleCommands (0-2): 3
        // Total: 1+1+9+2+12+5+8+25+10+21+3+3 = 100. 
        // The parser for System.json filters out empty strings.
        // Let's recount from fixture, assuming empty strings are skipped:
        // gameTitle: "My RPG Game" (1)
        // currencyUnit: "G" (1)
        // elements: ["", "Physical", "Fire", "Ice", "Thunder", "Water", "Earth", "Wind", "Light", "Dark"] -> 9 (index 0 is "", rest are non-empty)
        // skillTypes: ["", "Magic", "Special"] -> 2 (index 0 is "", rest non-empty)
        // weaponTypes: ["", "Sword", "Axe", ..., "Whip"] -> 12
        // armorTypes: ["", "General", "Shield", ..., "Accessory"] -> 5
        // terms.basic: ["Level", ..., "EXP"] -> 8
        // terms.commands: ["Fight", ..., "Game End"] (index 13 is empty) -> 24
        // terms.params: ["HP", ..., "Evasion"] -> 10
        // terms.messages (all 21 fields are non-empty in fixture)
        //    actionFailure: "%1's action has failed."
        //    ... all 21 are non-empty.
        // boat.name: "Boat" (1)
        // ship.name: "Ship" (1)
        // airship.name: "Airship" (1)
        // titleCommands: ["New Game", "Continue", "Options"] -> 3
        // Total = 1+1+9+2+12+5+8+24+10+21+1+1+1+3 = 99
        assert_eq!(extracted_strings.len(), 99, "Incorrect number of strings from System.json");

        let game_title = extracted_strings.iter().find(|s| s.json_path == "gameTitle").unwrap();
        assert_eq!(game_title.original_text, "My RPG Game");
        assert_eq!(game_title.source_file, "www/data/System.json");
        assert_eq!(game_title.object_id, 0); // object_id is 0 for system strings

        let currency = extracted_strings.iter().find(|s| s.json_path == "currencyUnit").unwrap();
        assert_eq!(currency.original_text, "G");

        let fire_element = extracted_strings.iter().find(|s| s.json_path == "elements[2]").unwrap();
        assert_eq!(fire_element.original_text, "Fire");

        let level_term = extracted_strings.iter().find(|s| s.json_path == "terms.basic[0]").unwrap();
        assert_eq!(level_term.original_text, "Level");

        let always_dash_msg = extracted_strings.iter().find(|s| s.json_path == "terms.messages.alwaysDash").unwrap();
        assert_eq!(always_dash_msg.original_text, "Always Dash");
    }

    #[test]
    fn test_reconstruct_system_json() {
        let (temp_dir, project_root_path, _) = setup_project_and_extract_strings(
            TEST_PROJECT_SUBPATH, 
            &[SYSTEM_JSON_FIXTURE_PATH], 
            SYSTEM_JSON_FILENAME
        );
        let original_json_path = project_root_path.join("www/data").join(SYSTEM_JSON_FILENAME);
        let original_json_str = std::fs::read_to_string(original_json_path).unwrap();

        let relative_path = format!("www/data/{}", SYSTEM_JSON_FILENAME);

        let translations = vec![
            create_system_translation(0, "My RPG Game", "Mi Juego RPG", "gameTitle", &relative_path),
            create_system_translation(0, "G", "Oro", "currencyUnit", &relative_path),
            create_system_translation(0, "Fire", "Fuego", "elements[2]", &relative_path),
            create_system_translation(0, "Level", "Nivel", "terms.basic[0]", &relative_path),
            create_system_translation(0, "Always Dash", "Correr Siempre", "terms.messages.alwaysDash", &relative_path),
            create_system_translation(0, "New Game", "Nuevo Juego", "titleCommands[0]", &relative_path),
        ];
        let translations_refs: Vec<&WorkingTranslation> = translations.iter().collect();

        let result = system::reconstruct_system_json(&original_json_str, translations_refs);
        assert!(result.is_ok(), "Reconstruction failed: {:?}", result.err());
        let reconstructed_json_str = result.unwrap();
        let recon_val: serde_json::Value = serde_json::from_str(&reconstructed_json_str).unwrap();

        assert_eq!(recon_val["gameTitle"].as_str().unwrap(), "Mi Juego RPG");
        assert_eq!(recon_val["currencyUnit"].as_str().unwrap(), "Oro");
        assert_eq!(recon_val["elements"][0].as_str().unwrap(), ""); // Original empty element
        assert_eq!(recon_val["elements"][1].as_str().unwrap(), "Physical"); // Original
        assert_eq!(recon_val["elements"][2].as_str().unwrap(), "Fuego");
        assert_eq!(recon_val["terms"]["basic"][0].as_str().unwrap(), "Nivel");
        assert_eq!(recon_val["terms"]["messages"]["alwaysDash"].as_str().unwrap(), "Correr Siempre");
        assert_eq!(recon_val["terms"]["messages"]["commandRemember"].as_str().unwrap(), "Command Remember"); // Original
        assert_eq!(recon_val["titleCommands"][0].as_str().unwrap(), "Nuevo Juego");
        assert_eq!(recon_val["titleCommands"][1].as_str().unwrap(), "Continue"); // Original

        temp_dir.close().unwrap();
    }
} 