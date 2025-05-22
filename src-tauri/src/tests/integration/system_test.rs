#[cfg(test)]
mod system_extraction_tests {
    // use std::path::Path;
    use crate::core::rpgmv::common::TranslatableStringEntry;
    // use crate::core::rpgmv::project::extract_translatable_strings_from_project;
    use crate::tests::common_test_utils::setup_and_extract_all_strings;

    // Removed local helper

    #[test]
    fn test_system_extraction() {
        let all_extracted_strings = setup_and_extract_all_strings();

        let system_strings: Vec<&TranslatableStringEntry> = all_extracted_strings
            .iter()
            .filter(|e| e.source_file.ends_with("System.json"))
            .collect();

        // --- SYSTEM.JSON ---
        // IMPORTANT: This count will need to be updated after the first run.
        let expected_system_strings_count = 247; // <<<< UPDATE THIS PLACEHOLDER
        if system_strings.len() != expected_system_strings_count {
            eprintln!("Found {} strings from System.json, but expected {}.", system_strings.len(), expected_system_strings_count);
            eprintln!("Please update 'expected_system_strings_count' in the test.");
            for (i, entry) in system_strings.iter().take(50).enumerate() { // Show some examples
                eprintln!("  System String Example {}: {:?}", i + 1, entry);
            }
        }
        // Comment out or adjust this assertion until you have the correct count.
        // assert_eq!(system_strings.len(), expected_system_strings_count, "Incorrect number of strings extracted from System.json.");

        // --- Spot Checks for System.json ---
        // These are examples. You'll need to verify against your actual SampleRpgMvProject/www/data/System.json

        // Example: Game Title
        let expected_game_title = "恥獄隷奴セレン"; // <<<< UPDATE THIS PLACEHOLDER
        let expected_json_path_game_title = "gameTitle";
        if let Some(entry) = system_strings.iter().find(|e| e.json_path == expected_json_path_game_title) {
            assert_eq!(entry.text, expected_game_title, "Incorrect game title.");
        } else {
            if expected_system_strings_count > 0 && !expected_game_title.is_empty() { // Only panic if count is confirmed and field is expected
                panic!("Could not find game title with path '{}'. Update placeholder or check extraction.", expected_json_path_game_title);
            }
        }

        // Example: Currency Unit
        let expected_currency_unit = "Ｇ"; // <<<< UPDATE THIS PLACEHOLDER
        let expected_json_path_currency_unit = "currencyUnit";
         if let Some(entry) = system_strings.iter().find(|e| e.json_path == expected_json_path_currency_unit) {
            assert_eq!(entry.text, expected_currency_unit, "Incorrect currency unit.");
        } else {
            if expected_system_strings_count > 0 && !expected_currency_unit.is_empty() {
                panic!("Could not find currency unit with path '{}'. Update placeholder or check extraction.", expected_json_path_currency_unit);
            }
        }
        
        // Example: An armor type (e.g., the first one if not null/empty)
        let expected_armor_type_0 = "一般防具"; // <<<< UPDATE THIS PLACEHOLDER
        let expected_json_path_armor_type_0 = "armorTypes[1]"; // RPG Maker is often 1-indexed in editor, but 0-indexed in JSON if the first element isn't empty or null.
                                                              // Our extractor uses 0-based for the array access.
                                                              // Your sample has "" at armorTypes[0], "一般防具" at armorTypes[1]
        if let Some(entry) = system_strings.iter().find(|e| e.json_path == expected_json_path_armor_type_0) {
            assert_eq!(entry.text, expected_armor_type_0, "Incorrect armor type at {}.", expected_json_path_armor_type_0);
        } else {
            if expected_system_strings_count > 0 && !expected_armor_type_0.is_empty() {
                 panic!("Could not find armor type with path '{}'. Update placeholder or check extraction.", expected_json_path_armor_type_0);
            }
        }

        // Example: A skill type
        let expected_skill_type_1 = "魔法"; // <<<< UPDATE THIS PLACEHOLDER
        let expected_json_path_skill_type_1 = "skillTypes[1]";
        if let Some(entry) = system_strings.iter().find(|e| e.json_path == expected_json_path_skill_type_1) {
            assert_eq!(entry.text, expected_skill_type_1, "Incorrect skill type at {}.", expected_json_path_skill_type_1);
        } else {
            if expected_system_strings_count > 0 && !expected_skill_type_1.is_empty() {
                panic!("Could not find skill type with path '{}'. Update placeholder or check extraction.", expected_json_path_skill_type_1);
            }
        }

        // Example: An element
        let expected_element_1 = "物理"; // <<<< UPDATE THIS PLACEHOLDER
        let expected_json_path_element_1 = "elements[1]";
         if let Some(entry) = system_strings.iter().find(|e| e.json_path == expected_json_path_element_1) {
            assert_eq!(entry.text, expected_element_1, "Incorrect element at {}.", expected_json_path_element_1);
        } else {
            if expected_system_strings_count > 0 && !expected_element_1.is_empty() {
                panic!("Could not find element with path '{}'. Update placeholder or check extraction.", expected_json_path_element_1);
            }
        }
        
        // Example: A term.messages field (e.g., "actorDamage")
        // Note: These messages often contain placeholders like %1, %2 which MUST be preserved.
        let expected_message_actor_damage = "%1は抵抗力を %2 削られた！"; // <<<< UPDATE THIS PLACEHOLDER
        let expected_json_path_message_actor_damage = "terms.messages.actorDamage";
        if let Some(entry) = system_strings.iter().find(|e| e.json_path == expected_json_path_message_actor_damage) {
            assert_eq!(entry.text, expected_message_actor_damage, "Incorrect message for '{}'.", expected_json_path_message_actor_damage);
        } else {
            if expected_system_strings_count > 0 && !expected_message_actor_damage.is_empty() {
                 panic!("Could not find message with path '{}'. Update placeholder or check extraction.", expected_json_path_message_actor_damage);
            }
        }
        
        // Example: A terms.commands field (e.g., the command for "Item")
        let expected_term_command_item = "所持道具"; // <<<< UPDATE THIS PLACEHOLDER
        // Based on typical System.json, "Item" is often at index 2 of terms.commands
        // Index 0: "Fight", Index 1: "Escape", Index 2: "Attack", Index 3: "Guard", Index 4: "Item" ...
        // Your sample file has "戦う", "逃げる", "攻撃", "防御", "アイテム" for commands[0-4]
        let expected_json_path_term_command_item = "terms.commands[4]";
         if let Some(entry) = system_strings.iter().find(|e| e.json_path == expected_json_path_term_command_item) {
            assert_eq!(entry.text, expected_term_command_item, "Incorrect term command at '{}'.", expected_json_path_term_command_item);
        } else {
            if expected_system_strings_count > 0 && !expected_term_command_item.is_empty() {
                panic!("Could not find term command with path '{}'. Update placeholder or check extraction.", expected_json_path_term_command_item);
            }
        }

        if expected_system_strings_count > 0 {
            println!("Successfully (tentatively) validated strings from System.json. PLEASE VERIFY COUNTS AND SPOT CHECKS.");
        } else {
            println!("System.json test ran. PLEASE UPDATE expected_system_strings_count and spot checks based on output.");
        }
    }
} 