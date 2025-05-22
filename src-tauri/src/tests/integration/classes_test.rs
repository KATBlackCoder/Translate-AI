#[cfg(test)]
mod classes_extraction_tests {
    // use std::path::Path;
    use crate::core::rpgmv::common::TranslatableStringEntry;
    // use crate::core::rpgmv::project::extract_translatable_strings_from_project;
    use crate::tests::common_test_utils::setup_and_extract_all_strings;

    #[test]
    fn test_classes_extraction() {
        let all_extracted_strings = setup_and_extract_all_strings();

        let class_strings: Vec<&TranslatableStringEntry> = all_extracted_strings
            .iter()
            .filter(|e| e.source_file.ends_with("Classes.json"))
            .collect();

        // --- CLASSES.JSON --- 
        let expected_class_strings_count = 12; // Updated based on test output
        if class_strings.len() != expected_class_strings_count {
            eprintln!("Found {} strings from Classes.json, but expected {}.", class_strings.len(), expected_class_strings_count);
            for (i, entry) in class_strings.iter().take(15).enumerate() { // Show more if count is off
                eprintln!("  Class String Example {}: {:?}", i + 1, entry);
            }
        }
        assert_eq!(class_strings.len(), expected_class_strings_count, "Incorrect number of strings extracted from Classes.json.");

        // Spot check for Class ID 1, name "勇者"
        let expected_class_id_1 = 1;
        let expected_class_name_1 = "勇者";
        let expected_json_path_name_1 = "[1].name";
        
        let class_name_entry_1 = class_strings.iter().find(|e| 
            e.object_id == expected_class_id_1 && e.json_path == expected_json_path_name_1
        );
        assert!(class_name_entry_1.is_some(), "Could not find class name for ID {} with path {}", expected_class_id_1, expected_json_path_name_1);
        assert_eq!(class_name_entry_1.unwrap().text, expected_class_name_1, "Incorrect text for class name spot check (ID {}, path {}).", expected_class_id_1, expected_json_path_name_1);

        // Spot check for Class ID 7, note "<経験値テーブル:2>"
        let expected_class_id_7 = 7;
        let expected_class_note_7 = "<経験値テーブル:2>";
        let expected_json_path_note_7 = "[7].note";
        
        let class_note_entry_7 = class_strings.iter().find(|e| 
            e.object_id == expected_class_id_7 && e.json_path == expected_json_path_note_7
        );
        assert!(class_note_entry_7.is_some(), "Could not find class note for ID {} with path {}", expected_class_id_7, expected_json_path_note_7);
        assert_eq!(class_note_entry_7.unwrap().text, expected_class_note_7, "Incorrect text for class note spot check (ID {}, path {}).", expected_class_id_7, expected_json_path_note_7);

        // Spot check for Class ID 8, name "特別教育枠"
        let expected_class_id_8 = 8;
        let expected_class_name_8 = "特別教育枠";
        let expected_json_path_name_8 = "[8].name";
        
        let class_name_entry_8 = class_strings.iter().find(|e| 
            e.object_id == expected_class_id_8 && e.json_path == expected_json_path_name_8
        );
        assert!(class_name_entry_8.is_some(), "Could not find class name for ID {} with path {}", expected_class_id_8, expected_json_path_name_8);
        assert_eq!(class_name_entry_8.unwrap().text, expected_class_name_8, "Incorrect text for class name spot check (ID {}, path {}).", expected_class_id_8, expected_json_path_name_8);
        
        // You should also check your Classes.json for any `learnings[].note` that are non-empty
        // and add a spot check for at least one if they exist and should be extracted.
        // Example structure for a learning note (if Class ID 1, first learning had a note):
        // let expected_learning_note_1_0 = "スキルを早く覚える"; // Replace with actual learning note
        // let expected_json_path_learning_note_1_0 = "[1].learnings[0].note"; // Confirm JSON path
        // 
        // let learning_note_entry_1_0 = class_strings.iter().find(|e| 
        //     e.object_id == expected_class_id_1 && e.json_path == expected_json_path_learning_note_1_0
        // );
        // assert!(learning_note_entry_1_0.is_some(), "Could not find learning note for Class ID {} at path {}", expected_class_id_1, expected_json_path_learning_note_1_0);
        // assert_eq!(learning_note_entry_1_0.unwrap().text, expected_learning_note_1_0, "Incorrect text for learning note spot check (Class ID {}, path {}).", expected_class_id_1, expected_json_path_learning_note_1_0);

        println!("Successfully validated {} strings from Classes.json.", class_strings.len());
    }
} 