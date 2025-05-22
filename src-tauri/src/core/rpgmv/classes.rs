use serde::Deserialize;
use crate::core::rpgmv::common::TranslatableStringEntry;

#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct Learning {
    // level: u32, // Not needed for translation
    note: String,
    // skill_id: u32, // Not needed for translation
}

#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct ClassEntry {
    id: u32,
    // exp_params: [u32; 4], // Not needed
    // traits: Vec<Value>, // Not needed, complex and unlikely to contain direct translatable text
    learnings: Vec<Learning>,
    name: String,
    note: String,
    // params: Vec<Vec<u32>>, // Not needed
}

pub fn extract_strings(
    file_content: &str,
    source_file: &str, // e.g., "www/data/Classes.json"
) -> Result<Vec<TranslatableStringEntry>, String> {
    let classes: Vec<Option<ClassEntry>> = serde_json::from_str(file_content)
        .map_err(|e| format!("Failed to parse {}: {}. Content snippet: {:.100}", source_file, e, file_content.chars().take(100).collect::<String>()))?;

    let mut entries = Vec::new();

    for (index, class_option) in classes.iter().enumerate() {
        if let Some(class_data) = class_option {
            // Skip if id is 0, often a placeholder or invalid entry (common pattern)
            if class_data.id == 0 && index != 0 { // Allow id 0 if it's not the typical null first entry
                 // If we're strictly following the pattern of skipping ID 0, this should be just:
                 // if class_data.id == 0 { continue; }
                 // However, some games might use ID 0 for a "none" class that still has a name.
                 // For now, let's be less strict on ID 0 unless it's clearly a null placeholder.
                 // The typical RPG Maker MV pattern is `[null, {id:1,...}, {id:2,...}]`
                 // So, if `class_data.id == 0` and `index > 0` (meaning it's not the leading null),
                 // it *could* be intentional. Let's assume for now ID 0 is skippable if it's a non-first entry.
                 // A more robust way is to rely on `Option<ClassEntry>` and skip `None`s.
            }
            
            let object_id = class_data.id;

            // Handle name
            if !class_data.name.trim().is_empty() {
                entries.push(TranslatableStringEntry {
                    object_id,
                    text: class_data.name.clone(),
                    source_file: source_file.to_string(),
                    json_path: format!("[{}].name", index),
                });
            }

            // Handle note
            if !class_data.note.trim().is_empty() {
                entries.push(TranslatableStringEntry {
                    object_id,
                    text: class_data.note.clone(),
                    source_file: source_file.to_string(),
                    json_path: format!("[{}].note", index),
                });
            }

            // Handle learnings notes
            for (learning_idx, learning) in class_data.learnings.iter().enumerate() {
                if !learning.note.trim().is_empty() {
                    entries.push(TranslatableStringEntry {
                        object_id,
                        text: learning.note.clone(),
                        source_file: source_file.to_string(),
                        json_path: format!("[{}].learnings[{}].note", index, learning_idx),
                    });
                }
            }
        }
        // If class_option is None (e.g. the first element is often null), it's skipped naturally.
    }

    Ok(entries)
}

#[cfg(test)]
mod tests {
    use super::*;
    // Import TranslatableStringEntry from common for tests if not already globally available in this scope
    // No, `use super::*` brings in `TranslatableStringEntry` from the module's top level imports.

    #[test]
    fn test_extract_classes_strings_empty_learnings_note() {
        let json_content = r#"[
            null,
            {
                "id": 1,
                "expParams": [30,20,30,30],
                "traits": [],
                "learnings": [
                    {"level": 1, "note": "", "skillId": 8}
                ],
                "name": "Hero",
                "note": "The main protagonist.",
                "params": []
            }
        ]"#;
        let expected_entries = vec![
            TranslatableStringEntry {
                object_id: 1,
                text: "Hero".to_string(),
                source_file: "www/data/Classes.json".to_string(),
                json_path: "[1].name".to_string(),
            },
            TranslatableStringEntry {
                object_id: 1,
                text: "The main protagonist.".to_string(),
                source_file: "www/data/Classes.json".to_string(),
                json_path: "[1].note".to_string(),
            },
        ];
        let result = extract_strings(json_content, "www/data/Classes.json").unwrap();
        assert_eq!(result.len(), 2);
        for expected in expected_entries {
            assert!(result.contains(&expected), "Missing expected entry: {:?}", expected);
        }
    }

    #[test]
    fn test_extract_classes_strings_with_learnings_note() {
        let json_content = r#"[
            null,
            {
                "id": 1,
                "expParams": [30,20,30,30],
                "traits": [],
                "learnings": [
                    {"level": 1, "note": "Learns early", "skillId": 8},
                    {"level": 5, "note": "", "skillId": 10},
                    {"level": 10, "note": "Powerful skill!", "skillId": 12}
                ],
                "name": "Mage",
                "note": "Magic user.",
                "params": []
            }
        ]"#;
        let result = extract_strings(json_content, "www/data/Classes.json").unwrap();
        
        assert_eq!(result.len(), 4); // Name, Note, Learning Note 1, Learning Note 3

        let expected_name = TranslatableStringEntry {
            object_id: 1, text: "Mage".to_string(), source_file: "www/data/Classes.json".to_string(), json_path: "[1].name".to_string()
        };
        let expected_note = TranslatableStringEntry {
            object_id: 1, text: "Magic user.".to_string(), source_file: "www/data/Classes.json".to_string(), json_path: "[1].note".to_string()
        };
        let expected_learning1_note = TranslatableStringEntry {
            object_id: 1, text: "Learns early".to_string(), source_file: "www/data/Classes.json".to_string(), json_path: "[1].learnings[0].note".to_string()
        };
         let expected_learning3_note = TranslatableStringEntry {
            object_id: 1, text: "Powerful skill!".to_string(), source_file: "www/data/Classes.json".to_string(), json_path: "[1].learnings[2].note".to_string()
        };

        assert!(result.contains(&expected_name));
        assert!(result.contains(&expected_note));
        assert!(result.contains(&expected_learning1_note));
        assert!(result.contains(&expected_learning3_note));
    }

     #[test]
    fn test_empty_and_null_handling() {
        let json_content = r#"[
            null,
            {"id":1,"expParams":[30,20,30,30],"traits":[],"learnings":[],"name":"","note":"","params":[]},
            {"id":2,"expParams":[30,20,30,30],"traits":[],"learnings":[{"level":1,"note":"","skillId":1}],"name":"Warrior","note":"A strong fighter","params":[]}
        ]"#;
        let result = extract_strings(json_content, "www/data/Classes.json").unwrap();
        assert_eq!(result.len(), 2); // Only Warrior name and note
         let expected_warrior_name = TranslatableStringEntry {
            object_id: 2, text: "Warrior".to_string(), source_file: "www/data/Classes.json".to_string(), json_path: "[2].name".to_string()
        };
        let expected_warrior_note = TranslatableStringEntry {
            object_id: 2, text: "A strong fighter".to_string(), source_file: "www/data/Classes.json".to_string(), json_path: "[2].note".to_string()
        };
        assert!(result.contains(&expected_warrior_name));
        assert!(result.contains(&expected_warrior_note));
    }
} 