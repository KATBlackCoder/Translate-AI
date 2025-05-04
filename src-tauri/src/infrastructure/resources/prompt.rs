//!
//! Loads prompt templates from the `src-tauri/resources/prompts/` directory.
//!
//! Uses `include_str!` to embed the prompt content directly into the binary
//! at compile time.

use log::warn;

/// Loads the content of a specific prompt template file.
///
/// # Arguments
///
/// * `prompt_name` - The simple name of the prompt (e.g., "name", "profile", "note")
///                   corresponding to the filename in `resources/prompts/`.
///
/// # Returns
///
/// Returns the content of the prompt file as a static string slice (`&'static str`).
/// Returns an empty string and logs a warning if the `prompt_name` is not recognized.
pub fn load_prompt_template(prompt_name: &str) -> &'static str {
    match prompt_name {
        "name" => include_str!("../../../resources/prompts/name.txt"),
        "nickname" => include_str!("../../../resources/prompts/nickname.txt"),
        "profile" => include_str!("../../../resources/prompts/profile.txt"),
        "note" => include_str!("../../../resources/prompts/note.txt"),
        // Add cases for other prompts as they are created (e.g., "dialogue")
        _ => {
            warn!("Attempted to load unknown prompt template: {}", prompt_name);
            "" // Return empty string for unknown prompts
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_load_known_prompts() {
        assert!(!load_prompt_template("name").is_empty());
        assert!(load_prompt_template("name").contains("actor name"));

        assert!(!load_prompt_template("nickname").is_empty());
        assert!(load_prompt_template("nickname").contains("actor nickname"));

        assert!(!load_prompt_template("profile").is_empty());
        assert!(load_prompt_template("profile").contains("actor profile"));

        assert!(!load_prompt_template("note").is_empty());
        assert!(load_prompt_template("note").contains("actor note"));
    }

    #[test]
    fn test_load_unknown_prompt() {
        // Should return empty string and not panic (warning will be logged)
        assert_eq!(load_prompt_template("unknown_prompt"), "");
    }
}
