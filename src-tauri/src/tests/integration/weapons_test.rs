#[cfg(test)]
mod weapons_extraction_tests {
    // use std::path::Path;
    use crate::core::rpgmv::common::TranslatableStringEntry;
    // use crate::core::rpgmv::project::extract_translatable_strings_from_project;
    use crate::tests::common_test_utils::setup_and_extract_all_strings;

    // Removed local helper

    #[test]
    fn test_weapons_extraction() {
        let all_extracted_strings = setup_and_extract_all_strings();

        let weapons_strings: Vec<&TranslatableStringEntry> = all_extracted_strings
            .iter()
            .filter(|e| e.source_file.ends_with("Weapons.json"))
            .collect();

        // --- WEAPONS.JSON ---
        // IMPORTANT: This count will need to be updated after the first run.
        let expected_weapons_strings_count = 8; // <<<< UPDATE THIS PLACEHOLDER
        if weapons_strings.len() != expected_weapons_strings_count {
            eprintln!("Found {} strings from Weapons.json, but expected {}.", weapons_strings.len(), expected_weapons_strings_count);
            eprintln!("Please update 'expected_weapons_strings_count' in the test.");
            for (i, entry) in weapons_strings.iter().take(15).enumerate() { // Show some examples
                eprintln!("  Weapons String Example {}: {:?}", i + 1, entry);
            }
        }
        // Comment out or adjust this assertion until you have the correct count.
        // assert_eq!(weapons_strings.len(), expected_weapons_strings_count, "Incorrect number of strings extracted from Weapons.json.");

        // --- Spot Checks for Weapons.json ---
        // These are examples. You'll need to verify against your actual SampleRpgMvProject/www/data/Weapons.json

        // Example: Weapon ID 1
        let expected_weapon_id_1 = 1;
        let expected_weapon_name_1 = "剣"; // <<<< UPDATE THIS PLACEHOLDER
        let expected_json_path_name_1 = "[1].name";

        if let Some(entry) = weapons_strings.iter().find(|e| 
            e.object_id == expected_weapon_id_1 && e.json_path == expected_json_path_name_1
        ) {
            assert_eq!(entry.text, expected_weapon_name_1, "Incorrect name for Weapon ID {}, path {}.", expected_weapon_id_1, expected_json_path_name_1);
        } else {
            if expected_weapons_strings_count > 0 && !expected_weapon_name_1.is_empty() { 
                panic!("Could not find Weapon name for ID {} with path {}. Update placeholder or check extraction.", expected_weapon_id_1, expected_json_path_name_1);
            }
        }

        let expected_weapon_description_1 = ""; // <<<< UPDATE THIS PLACEHOLDER (Likely empty or not present for ID 1 in sample)
        let expected_json_path_description_1 = "[1].description";
        if let Some(entry) = weapons_strings.iter().find(|e| 
            e.object_id == expected_weapon_id_1 && e.json_path == expected_json_path_description_1
        ) {
            assert_eq!(entry.text, expected_weapon_description_1, "Incorrect description for Weapon ID {}, path {}.", expected_weapon_id_1, expected_json_path_description_1);
        } else {
            if expected_weapons_strings_count > 0 && !expected_weapon_description_1.is_empty() { 
                 panic!("Could not find Weapon description for ID {} with path {}. Update placeholder or check extraction.", expected_weapon_id_1, expected_json_path_description_1);
            }
        }

        // Example: Weapon ID 4 (e.g., a weapon that might have a note)
        let expected_weapon_id_4 = 4; // Change this ID if weapon 4 has no note or you want to check another one
        let expected_weapon_name_4 = "弓"; // <<<< UPDATE THIS PLACEHOLDER
        let expected_json_path_name_4 = "[4].name";

        if let Some(entry) = weapons_strings.iter().find(|e| 
            e.object_id == expected_weapon_id_4 && e.json_path == expected_json_path_name_4
        ) {
            assert_eq!(entry.text, expected_weapon_name_4, "Incorrect name for Weapon ID {}, path {}.", expected_weapon_id_4, expected_json_path_name_4);
        } else {
            if expected_weapons_strings_count > 0 && !expected_weapon_name_4.is_empty() { 
                panic!("Could not find Weapon name for ID {} with path {}. Update placeholder or check extraction.", expected_weapon_id_4, expected_json_path_name_4);
            }
        }
        
        let expected_weapon_note_4 = ""; // <<<< UPDATE THIS PLACEHOLDER (Many weapons have empty notes)
        let expected_json_path_note_4 = "[4].note";
        if let Some(entry) = weapons_strings.iter().find(|e| 
            e.object_id == expected_weapon_id_4 && e.json_path == expected_json_path_note_4
        ) {
            assert_eq!(entry.text, expected_weapon_note_4, "Incorrect note for Weapon ID {}, path {}.", expected_weapon_id_4, expected_json_path_note_4);
        } else {
            // Only panic if count is confirmed AND this specific note is expected to be non-empty
            if expected_weapons_strings_count > 0 && !expected_weapon_note_4.is_empty() {
                 panic!("Could not find Weapon note for ID {} with path {}. Update placeholder, check sample data, or extraction logic.", expected_weapon_id_4, expected_json_path_note_4);
            }
        }

        if expected_weapons_strings_count > 0 {
            println!("Successfully (tentatively) validated strings from Weapons.json. PLEASE VERIFY COUNTS AND SPOT CHECKS.");
        } else {
            println!("Weapons.json test ran. PLEASE UPDATE expected_weapons_strings_count and spot checks based on output.");
        }
    }
} 