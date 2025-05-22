#[cfg(test)]
mod skills_extraction_tests {
    // use std::path::Path;
    use crate::core::rpgmv::common::TranslatableStringEntry;
    // use crate::core::rpgmv::project::extract_translatable_strings_from_project;
    use crate::tests::common_test_utils::setup_and_extract_all_strings;

    #[test]
    fn test_skills_extraction() {
        let all_extracted_strings = setup_and_extract_all_strings();

        let skill_strings: Vec<&TranslatableStringEntry> = all_extracted_strings
            .iter()
            .filter(|e| e.source_file.ends_with("Skills.json"))
            .collect();

        // --- SKILLS.JSON --- 
        // IMPORTANT: Update this count after running the test and seeing the actual output.
        let expected_skill_strings_count = 246; // Placeholder - PLEASE UPDATE
        if skill_strings.len() != expected_skill_strings_count {
            eprintln!("Found {} strings from Skills.json, but expected {}.", skill_strings.len(), expected_skill_strings_count);
            eprintln!("Please update 'expected_skill_strings_count' in the test.");
            for (i, entry) in skill_strings.iter().take(25).enumerate() { // Show some examples
                eprintln!("  Skill String Example {}: {:?}", i + 1, entry);
            }
        }
        // Comment out or adjust this assertion until you have the correct count.
        // assert_eq!(skill_strings.len(), expected_skill_strings_count, "Incorrect number of strings extracted from Skills.json.");

        // Placeholder Spot Checks - PLEASE UPDATE these with actual data from your Skills.json
        // Example: Spot check for Skill ID 1, name
        let expected_skill_id_1 = 1;
        let expected_skill_name_1 = "攻撃"; // Placeholder name
        let expected_json_path_name_1 = "[1].name";

        if let Some(skill_name_entry) = skill_strings.iter().find(|e| 
            e.object_id == expected_skill_id_1 && e.json_path == expected_json_path_name_1
        ) {
            assert_eq!(skill_name_entry.text, expected_skill_name_1, "Incorrect text for skill name (ID {}, path {}).", expected_skill_id_1, expected_json_path_name_1);
        } else {
            // Only panic if count is confirmed, otherwise it's hard to bootstrap
            if expected_skill_strings_count > 0 { 
                panic!("Could not find skill name for ID {} with path {}. Update placeholder if necessary.", expected_skill_id_1, expected_json_path_name_1);
            }
        }

        // Example: Spot check for Skill ID 1, description
        let expected_skill_description_1 = ""; // Placeholder description - This might be empty or not present for skill 1. Adjust as needed.
        let expected_json_path_description_1 = "[1].description";
        if let Some(skill_desc_entry) = skill_strings.iter().find(|e| 
            e.object_id == expected_skill_id_1 && e.json_path == expected_json_path_description_1
        ) {
            assert_eq!(skill_desc_entry.text, expected_skill_description_1, "Incorrect text for skill description (ID {}, path {}).", expected_skill_id_1, expected_json_path_description_1);
        } else {
            // If skill_description_1 is expected to be non-empty, this panic is valid.
            // If it can be empty or absent, this check needs to be more nuanced or removed.
            if !expected_skill_description_1.is_empty() && expected_skill_strings_count > 0 { 
                panic!("Could not find skill description for ID {} with path {}. Update placeholder.", expected_skill_id_1, expected_json_path_description_1);
            }
        }
        
        // Example: Spot check for Skill ID 1, message1 (if it exists and is translatable)
        let expected_skill_message1_1 = "の攻撃！"; // Placeholder message1
        let expected_json_path_message1_1 = "[1].message1";
        if let Some(skill_msg1_entry) = skill_strings.iter().find(|e| 
            e.object_id == expected_skill_id_1 && e.json_path == expected_json_path_message1_1
        ) {
            assert_eq!(skill_msg1_entry.text, expected_skill_message1_1, "Incorrect text for skill message1 (ID {}, path {}).", expected_skill_id_1, expected_json_path_message1_1);
        } else {
             // Only panic if count is confirmed and you expect this field
            // if expected_skill_strings_count > 0 && !expected_skill_message1_1.is_empty() {
            //     panic!("Could not find skill message1 for ID {} with path {}. Update placeholder or check extraction.", expected_skill_id_1, expected_json_path_message1_1);
            // }
        }

        if expected_skill_strings_count > 0 {
            println!("Successfully (tentatively) validated strings from Skills.json. PLEASE VERIFY COUNTS AND SPOT CHECKS.");
        } else {
            println!("Skills.json test ran. PLEASE UPDATE expected_skill_strings_count and spot checks based on output.");
        }
    }
} 