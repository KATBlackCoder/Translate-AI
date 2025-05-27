use serde_json::Value;
use crate::error::CoreError; // Using our existing CoreError

/// Updates a `serde_json::Value` at a given path string.
/// The path string uses dot notation for object fields and brackets for array indices (e.g., "fieldName.arrayName[0].nestedField").
pub fn update_value_at_path(
    root: &mut Value,
    path_str: &str,
    new_text: &str,
) -> Result<(), CoreError> {
    let mut parts = path_str.split('.');
    let first_part = parts.next().ok_or_else(|| CoreError::Custom(format!("Empty path string provided to update_value_at_path")))?;
    
    let mut current_value = root;

    // Handle the first part separately because it might be the only part
    let (key, index) = parse_path_segment(first_part)?;

    // If there are more parts, we navigate. Otherwise, we update directly.
    let mut remaining_parts = parts.peekable();
    if remaining_parts.peek().is_none() { // This is the last segment
        return set_value_at_segment(current_value, key, index, new_text);
    }

    // Navigate through the path
    current_value = navigate_to_segment(current_value, key, index)?;

    while let Some(part_str) = remaining_parts.next() {
        let (key, index) = parse_path_segment(part_str)?;
        if remaining_parts.peek().is_none() { // Last segment, time to update
            return set_value_at_segment(current_value, key, index, new_text);
        } else { // Still navigating
            current_value = navigate_to_segment(current_value, key, index)?;
        }
    }
    
    // Should not be reached if path_str is valid and leads to a settable location.
    // This might happen if path_str is just "" or only contains navigators without a final field.
    Err(CoreError::Custom(format!("Path '{}' did not lead to a settable terminal value.", path_str)))
}

/// Parses a path segment like "fieldName" or "arrayName[index]" into key and optional index.
fn parse_path_segment(segment_str: &str) -> Result<(&str, Option<usize>), CoreError> {
    if segment_str.ends_with("]") {
        if let Some(bracket_start) = segment_str.rfind('[') {
            let key_part = &segment_str[..bracket_start];
            let index_str = &segment_str[bracket_start + 1..segment_str.len() - 1];
            let index = index_str.parse::<usize>().map_err(|_| {
                CoreError::Custom(format!("Invalid array index in path segment: {}", segment_str))
            })?;
            Ok((key_part, Some(index)))
        } else {
            Err(CoreError::Custom(format!("Mismatched brackets in path segment: {}", segment_str)))
        }
    } else {
        Ok((segment_str, None)) // It's a simple object key
    }
}

/// Navigates to a mutable Value reference based on key and optional index.
pub fn navigate_to_segment<'a>(
    current_value: &'a mut Value,
    key: &str,
    index: Option<usize>,
) -> Result<&'a mut Value, CoreError> {
    let target_val = if key.is_empty() { // If key is empty, we are operating on current_value directly (likely an array index)
        current_value
    } else {
        current_value
            .get_mut(key)
            .ok_or_else(|| CoreError::Custom(format!("Key '{}' not found in JSON object", key)))?
    };

    if let Some(idx) = index {
        target_val
            .get_mut(idx)
            .ok_or_else(|| CoreError::Custom(format!("Index {} out of bounds for key '{}'", idx, key)))
    } else {
        Ok(target_val)
    }
}

/// Sets the value at the final segment of a path.
fn set_value_at_segment(
    current_value: &mut Value,
    key: &str,
    index: Option<usize>,
    new_text: &str,
) -> Result<(), CoreError> {
    let final_target = if key.is_empty() {
        current_value
    } else {
        current_value
            .get_mut(key)
            .ok_or_else(|| CoreError::Custom(format!("Key '{}' not found for setting value", key)))?
    };

    if let Some(idx) = index {
        if let Some(arr_val) = final_target.get_mut(idx) {
            *arr_val = Value::String(new_text.to_string());
            Ok(())
        } else {
            Err(CoreError::Custom(format!("Index {} out of bounds for key '{}' when setting value", idx, key)))
        }
    } else {
        // If it's an object field, `final_target` is already the mutable reference to the field's value.
        *final_target = Value::String(new_text.to_string());
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    #[test]
    fn test_update_simple_field() {
        let mut data = json!({ "name": "Alice", "age": 30 });
        update_value_at_path(&mut data, "name", "Bob").unwrap();
        assert_eq!(data["name"], "Bob");
    }

    #[test]
    fn test_update_nested_field() {
        let mut data = json!({
            "details": {
                "city": "Wonderland",
                "job": "Adventurer"
            }
        });
        update_value_at_path(&mut data, "details.city", "Oz").unwrap();
        assert_eq!(data["details"]["city"], "Oz");
    }

    #[test]
    fn test_update_array_element() {
        let mut data = json!({
            "items": ["sword", "shield"]
        });
        update_value_at_path(&mut data, "items[0]", "axe").unwrap();
        assert_eq!(data["items"][0], "axe");

        update_value_at_path(&mut data, "items[1]", "helmet").unwrap();
        assert_eq!(data["items"][1], "helmet");
    }

    #[test]
    fn test_update_nested_array_element() {
        let mut data = json!({
            "user": {
                "tags": ["friendly", "active"],
                "profiles": [
                    { "type": "main", "handle": "user123" },
                    { "type": "secondary", "handle": "user_alt" }
                ]
            }
        });
        update_value_at_path(&mut data, "user.tags[1]", "super_active").unwrap();
        assert_eq!(data["user"]["tags"][1], "super_active");

        update_value_at_path(&mut data, "user.profiles[0].handle", "master_user").unwrap();
        assert_eq!(data["user"]["profiles"][0]["handle"], "master_user");
    }

    #[test]
    fn test_path_not_found_key() {
        let mut data = json!({ "name": "Alice" });
        let result = update_value_at_path(&mut data, "profile.bio", "New Bio");
        assert!(result.is_err());
        if let Err(CoreError::Custom(msg)) = result {
            assert!(msg.contains("Key 'profile' not found"));
        } else {
            panic!("Expected Custom error for key not found");
        }
    }

    #[test]
    fn test_path_not_found_index() {
        let mut data = json!({ "items": ["one"] });
        let result = update_value_at_path(&mut data, "items[2]", "three");
        assert!(result.is_err());
         if let Err(CoreError::Custom(msg)) = result {
            assert!(msg.contains("Index 2 out of bounds"));
        } else {
            panic!("Expected Custom error for index out of bounds");
        }
    }
    
    #[test]
    fn test_empty_path() {
        let mut data = json!({ "name": "Alice" });
        let result = update_value_at_path(&mut data, "", "test");
        assert!(result.is_err());
    }

    #[test]
    fn test_update_root_if_array() { // Path like "[0]"
        let mut data = json!(["first", "second"]);
        update_value_at_path(&mut data, "[0]", "not_first").unwrap();
        assert_eq!(data[0], "not_first");
    }
    
    #[test]
    fn test_update_root_if_object_direct_field() { // Path like "field" on root object
        let mut data = json!({ "field": "value"});
        update_value_at_path(&mut data, "field", "new_value").unwrap();
        assert_eq!(data["field"], "new_value");
    }
} 