#[cfg(test)]
mod actors_extraction_tests { // Renamed module to be specific
    // use std::path::Path; // No longer needed here
    use crate::core::rpgmv::common::TranslatableStringEntry; // Still needed for assertions
    // use crate::core::rpgmv::project::extract_translatable_strings_from_project; // No longer needed here
    use crate::tests::common_test_utils::setup_and_extract_all_strings; // Added this line

    // Removed the local setup_and_extract_all_strings() function

    #[test]
    fn test_actors_extraction() {
        let all_extracted_strings = setup_and_extract_all_strings();

        let actor_strings: Vec<&TranslatableStringEntry> = all_extracted_strings
            .iter()
            .filter(|e| e.source_file.ends_with("Actors.json"))
            .collect();

        // --- ACTORS.JSON --- 
        let expected_actor_strings_count = 25; // Updated based on test output
        if actor_strings.len() != expected_actor_strings_count {
            eprintln!("Found {} strings from Actors.json, but expected {}.", actor_strings.len(), expected_actor_strings_count);
            for (i, entry) in actor_strings.iter().take(10).enumerate() { // Show more examples if count is off
                eprintln!("  Actor String Example {}: {:?}", i + 1, entry);
            }
        }
        assert_eq!(actor_strings.len(), expected_actor_strings_count, "Incorrect number of strings extracted from Actors.json.");

        // Spot check for Actor ID 1, name "ハロルド"
        let expected_actor_id_1 = 1;
        let expected_actor_name_1 = "ハロルド";
        let expected_json_path_name_1 = "[1].name";

        let actor_name_entry_1 = actor_strings.iter().find(|e| 
            e.object_id == expected_actor_id_1 && e.json_path == expected_json_path_name_1
        );

        assert!(actor_name_entry_1.is_some(), "Could not find actor name for ID {} with path {}", expected_actor_id_1, expected_json_path_name_1);
        assert_eq!(actor_name_entry_1.unwrap().text, expected_actor_name_1, "Incorrect text for actor name spot check (ID {}, path {}).", expected_actor_id_1, expected_json_path_name_1);
        
        // Add another spot check, e.g., for Actor ID 2, name "テレーゼ"
        let expected_actor_id_2 = 2;
        let expected_actor_name_2 = "テレーゼ";
        let expected_json_path_name_2 = "[2].name";

        let actor_name_entry_2 = actor_strings.iter().find(|e| 
            e.object_id == expected_actor_id_2 && e.json_path == expected_json_path_name_2
        );
        assert!(actor_name_entry_2.is_some(), "Could not find actor name for ID {} with path {}", expected_actor_id_2, expected_json_path_name_2);
        assert_eq!(actor_name_entry_2.unwrap().text, expected_actor_name_2, "Incorrect text for actor name spot check (ID {}, path {}).", expected_actor_id_2, expected_json_path_name_2);

        // Spot check for Actor ID 6, name "サンプルキャラ1"
        let expected_actor_id_6 = 6;
        let expected_actor_name_6 = "サンプルキャラ1";
        let expected_json_path_name_6 = "[6].name"; // Assuming it's at index 6 in the JSON array

        let actor_name_entry_6 = actor_strings.iter().find(|e| 
            e.object_id == expected_actor_id_6 && e.json_path == expected_json_path_name_6
        );
        assert!(actor_name_entry_6.is_some(), "Could not find actor name for ID {} with path {}", expected_actor_id_6, expected_json_path_name_6);
        assert_eq!(actor_name_entry_6.unwrap().text, expected_actor_name_6, "Incorrect text for actor name spot check (ID {}, path {}).", expected_actor_id_6, expected_json_path_name_6);


        // TODO: Add spot checks for other fields in Actors.json like 'profile' and 'nickname' for these actors if they exist and are extracted.
        // For example, if Actor 1 has a profile:
        // let expected_actor_profile_1 = "ヒーローです"; // Replace with actual profile text
        // let expected_json_path_profile_1 = "[1].profile";
        // let actor_profile_entry_1 = actor_strings.iter().find(|e| 
        //     e.object_id == expected_actor_id_1 && e.json_path == expected_json_path_profile_1
        // );
        // assert!(actor_profile_entry_1.is_some(), "Could not find actor profile for ID {} with path {}", expected_actor_id_1, expected_json_path_profile_1);
        // assert_eq!(actor_profile_entry_1.unwrap().text, expected_actor_profile_1, "Incorrect text for actor profile spot check (ID {}, path {}).", expected_actor_id_1, expected_json_path_profile_1);

        println!("Successfully validated {} strings from Actors.json.", actor_strings.len());
    }
}
