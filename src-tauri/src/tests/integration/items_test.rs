#[cfg(test)]
mod items_extraction_tests {
    // use std::path::Path;
    use crate::core::rpgmv::common::TranslatableStringEntry;
    // use crate::core::rpgmv::project::extract_translatable_strings_from_project;
    use crate::tests::common_test_utils::setup_and_extract_all_strings;

    #[test]
    fn test_items_extraction() {
        let all_extracted_strings = setup_and_extract_all_strings();

        let item_strings: Vec<&TranslatableStringEntry> = all_extracted_strings
            .iter()
            .filter(|e| e.source_file.ends_with("Items.json"))
            .collect();

        // --- ITEMS.JSON --- 
        let expected_item_strings_count = 37; 
        if item_strings.len() != expected_item_strings_count {
            eprintln!("Found {} strings from Items.json, but expected {}.", item_strings.len(), expected_item_strings_count);
            for (i, entry) in item_strings.iter().take(15).enumerate() { // Show some examples
                eprintln!("  Item String Example {}: {:?}", i + 1, entry);
            }
        }
        assert_eq!(item_strings.len(), expected_item_strings_count, "Incorrect number of strings extracted from Items.json.");

        // Spot check for Item ID 1, name "ポーション"
        let expected_item_id_1 = 1;
        let expected_item_name_1 = "ポーション";
        let expected_json_path_name_1 = "[1].name";
        
        let item_name_entry_1 = item_strings.iter().find(|e| 
            e.object_id == expected_item_id_1 && e.json_path == expected_json_path_name_1
        );
        assert!(item_name_entry_1.is_some(), "Could not find item name for ID {} with path {}", expected_item_id_1, expected_json_path_name_1);
        assert_eq!(item_name_entry_1.unwrap().text, expected_item_name_1, "Incorrect text for item name (ID {}, path {}).", expected_item_id_1, expected_json_path_name_1);

        // Spot check for Item ID 6, name "牢屋の鍵"
        let expected_item_id_6 = 6;
        let expected_item_name_6 = "牢屋の鍵";
        let expected_json_path_name_6 = "[6].name";

        let item_name_entry_6 = item_strings.iter().find(|e| 
            e.object_id == expected_item_id_6 && e.json_path == expected_json_path_name_6
        );
        assert!(item_name_entry_6.is_some(), "Could not find item name for ID {} with path {}", expected_item_id_6, expected_json_path_name_6);
        assert_eq!(item_name_entry_6.unwrap().text, expected_item_name_6, "Incorrect text for item name (ID {}, path {}).", expected_item_id_6, expected_json_path_name_6);

        // Spot check for Item ID 6, note (with newlines)
        let expected_item_note_6 = "<拡張説明:\n捕まった人達がいる牢の鍵\nかなり頑丈にできている。>";
        let expected_json_path_note_6 = "[6].note";

        let item_note_entry_6 = item_strings.iter().find(|e| 
            e.object_id == expected_item_id_6 && e.json_path == expected_json_path_note_6
        );
        assert!(item_note_entry_6.is_some(), "Could not find item note for ID {} with path {}", expected_item_id_6, expected_json_path_note_6);
        assert_eq!(item_note_entry_6.unwrap().text, expected_item_note_6, "Incorrect text for item note (ID {}, path {}).", expected_item_id_6, expected_json_path_note_6);

        // Spot check for Item ID 10, name "アドレナリン"
        let expected_item_id_10 = 10;
        let expected_item_name_10 = "アドレナリン";
        let expected_json_path_name_10 = "[10].name";

        let item_name_entry_10 = item_strings.iter().find(|e| 
            e.object_id == expected_item_id_10 && e.json_path == expected_json_path_name_10
        );
        assert!(item_name_entry_10.is_some(), "Could not find item name for ID {} with path {}", expected_item_id_10, expected_json_path_name_10);
        assert_eq!(item_name_entry_10.unwrap().text, expected_item_name_10, "Incorrect text for item name (ID {}, path {}).", expected_item_id_10, expected_json_path_name_10);
        
        // Spot check for Item ID 10, note (with newlines and full-width space)
        let expected_item_note_10 = "<拡張説明:興奮剤\n痛みなどが消える。\nただし一時的なもの。\n抵抗力+1000\u{3000}最大抵抗力-20>"; // Includes \u{3000} for the full-width space
        let expected_json_path_note_10 = "[10].note";

        let item_note_entry_10 = item_strings.iter().find(|e| 
            e.object_id == expected_item_id_10 && e.json_path == expected_json_path_note_10
        );
        assert!(item_note_entry_10.is_some(), "Could not find item note for ID {} with path {}", expected_item_id_10, expected_json_path_note_10);
        assert_eq!(item_note_entry_10.unwrap().text, expected_item_note_10, "Incorrect text for item note (ID {}, path {}).", expected_item_id_10, expected_json_path_note_10);

        // Remember to check for 'description' fields if they exist and are non-empty in your Items.json
        // Example (if Item ID 1 had a description):
        // let expected_item_description_1 = "HPを少し回復する";
        // let expected_json_path_description_1 = "[1].description";
        // let item_description_entry_1 = item_strings.iter().find(|e| 
        // e.object_id == expected_item_id_1 && e.json_path == expected_json_path_description_1
        // );
        // assert!(item_description_entry_1.is_some(), "Could not find item description for ID {} with path {}", expected_item_id_1, expected_json_path_description_1);
        // assert_eq!(item_description_entry_1.unwrap().text, expected_item_description_1, "Incorrect text for item description (ID {}, path {}).", expected_item_id_1, expected_json_path_description_1);

        println!("Successfully validated {} strings from Items.json.", item_strings.len());
    }
} 