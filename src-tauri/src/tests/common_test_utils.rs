use std::path::Path;
use crate::models::translation::SourceStringData;
use crate::core::rpgmv::project::extract_translatable_strings_from_project;
use std::fs::{self, File};
use std::io::Write;
use std::path::{PathBuf};
use tempfile::TempDir;

pub fn setup_and_extract_all_strings() -> Vec<SourceStringData> {
    let base_dir = Path::new(env!("CARGO_MANIFEST_DIR"));
    let project_path = base_dir.join("src").join("tests").join("fixtures").join("SampleRpgMvProject");
    assert!(project_path.exists(), "Sample project path does not exist: {:?}. CARGO_MANIFEST_DIR was: {:?}", project_path, base_dir);
    let data_path = project_path.join("www").join("data");
    assert!(data_path.exists(), "Sample project www/data directory does not exist at: {:?}", data_path);
    let project_path_str = project_path.to_str().expect("Path to string conversion failed");
    let result = extract_translatable_strings_from_project(project_path_str);
    assert!(result.is_ok(), "Extraction failed: {:?}", result.err());
    result.unwrap()
}

/// Sets up a temporary test project directory by copying a fixture project.
/// 
/// # Arguments
/// * `test_project_subpath` - The subpath within `src/tests/fixtures/` to the test project (e.g., "test_projects/rpg_mv_project_1").
/// * `specific_files_to_copy` - A slice of relative paths (from the `test_project_subpath/www/data`) of specific JSON files to copy.
///                              If empty, attempts to copy the entire `www/data` directory.
///
/// # Returns
/// A tuple containing:
///   - `TempDir`: The temporary directory object (will be cleaned up on drop).
///   - `PathBuf`: The absolute path to the root of the copied test project in the temp directory.
///   - `Vec<SourceStringData>`: Strings extracted *only* from the specified `specific_files_to_copy` 
///                            relative to the new temp project root, or all strings if `specific_files_to_copy` was empty.
pub fn setup_project_and_extract_strings(
    test_project_subpath: &str,
    specific_files_to_extract_from: &[&str], // e.g. ["www/data/Actors.json", "www/data/Items.json"]
                                             // These paths are relative to the *original* test project fixture root for extraction filtering,
                                             // but extraction itself runs on the temp copy.
    target_file_for_extraction_command: &str // The single file name to target for extraction, e.g. "Actors.json"
) -> (TempDir, PathBuf, Vec<SourceStringData>) {
    let base_dir = Path::new(env!("CARGO_MANIFEST_DIR"));
    let original_project_fixture_path = base_dir.join("src").join("tests").join("fixtures").join(test_project_subpath);

    assert!(original_project_fixture_path.exists(), "Original project fixture path does not exist: {:?}", original_project_fixture_path);

    let temp_dir = TempDir::new().expect("Failed to create temp dir");
    let temp_project_root = temp_dir.path().join(
        original_project_fixture_path.file_name().unwrap_or_else(|| Path::new("temp_project").as_os_str())
    );
    fs::create_dir_all(&temp_project_root).expect("Failed to create temp project root");

    // Copy specified files or the whole www/data directory
    let original_data_dir = original_project_fixture_path.join("www").join("data");
    let temp_data_dir = temp_project_root.join("www").join("data");
    fs::create_dir_all(&temp_data_dir).expect("Failed to create temp www/data dir");

    if specific_files_to_extract_from.is_empty() {
        panic!("specific_files_to_extract_from cannot be empty in this version of the helper. Specify at least one file like \"www/data/Actors.json\"");
    }
    
    for file_relative_to_fixture_root in specific_files_to_extract_from {
        // file_relative_to_fixture_root is like "www/data/Actors.json"
        let original_file_path = original_project_fixture_path.join(file_relative_to_fixture_root);
        let file_name = original_file_path.file_name().expect("Could not get file name from relative path");
        let temp_file_path = temp_data_dir.join(file_name);
        
        if original_file_path.exists() {
            fs::copy(&original_file_path, &temp_file_path).expect(&format!("Failed to copy {:?} to {:?}", original_file_path, temp_file_path));
        } else {
            // Create an empty file if it doesn't exist in fixture, to simulate a minimal project structure for parsing tests
            // This might be useful if a test only cares about one file and doesn't want to copy everything.
            // However, our RPGMV parser expects a www/data structure, so just copying is better.
            panic!("Specified file to copy does not exist in fixture: {:?}", original_file_path);
        }
    }

    let _temp_project_root_str = temp_project_root.to_str().expect("Temp project path to string failed");
    
    // Extract strings from the single target file within the temp project
    let single_file_to_extract_path_relative_to_temp_project = Path::new("www").join("data").join(target_file_for_extraction_command);
    let absolute_path_to_target_file_in_temp = temp_project_root.join(&single_file_to_extract_path_relative_to_temp_project);

    let file_content = fs::read_to_string(&absolute_path_to_target_file_in_temp)
        .expect(&format!("Failed to read target file for extraction from temp dir: {:?}", absolute_path_to_target_file_in_temp));

    let mut extracted_strings = Vec::new();
    let extraction_result = match target_file_for_extraction_command {
        "Actors.json" => crate::core::rpgmv::actors::extract_strings(&file_content, single_file_to_extract_path_relative_to_temp_project.to_str().unwrap()),
        "Armors.json" => crate::core::rpgmv::armors::extract_strings(&file_content, single_file_to_extract_path_relative_to_temp_project.to_str().unwrap()),
        "Classes.json" => crate::core::rpgmv::classes::extract_strings(&file_content, single_file_to_extract_path_relative_to_temp_project.to_str().unwrap()),
        "CommonEvents.json" => crate::core::rpgmv::common_events::extract_strings(&file_content, single_file_to_extract_path_relative_to_temp_project.to_str().unwrap()),
        "Enemies.json" => crate::core::rpgmv::enemies::extract_strings(&file_content, single_file_to_extract_path_relative_to_temp_project.to_str().unwrap()),
        "Items.json" => crate::core::rpgmv::items::extract_strings(&file_content, single_file_to_extract_path_relative_to_temp_project.to_str().unwrap()),
        "MapInfos.json" => crate::core::rpgmv::map_infos::extract_strings(&file_content, single_file_to_extract_path_relative_to_temp_project.to_str().unwrap()),
        // For Maps, the name includes digits like Map001.json
        s if s.starts_with("Map") && s.ends_with(".json") && s != "MapInfos.json" => crate::core::rpgmv::maps::extract_strings(&file_content, single_file_to_extract_path_relative_to_temp_project.to_str().unwrap()),
        "Skills.json" => crate::core::rpgmv::skills::extract_strings(&file_content, single_file_to_extract_path_relative_to_temp_project.to_str().unwrap()),
        "States.json" => crate::core::rpgmv::states::extract_strings(&file_content, single_file_to_extract_path_relative_to_temp_project.to_str().unwrap()),
        "System.json" => crate::core::rpgmv::system::extract_strings(&file_content, single_file_to_extract_path_relative_to_temp_project.to_str().unwrap()),
        "Troops.json" => crate::core::rpgmv::troops::extract_strings(&file_content, single_file_to_extract_path_relative_to_temp_project.to_str().unwrap()),
        "Weapons.json" => crate::core::rpgmv::weapons::extract_strings(&file_content, single_file_to_extract_path_relative_to_temp_project.to_str().unwrap()),
        _ => panic!("Unsupported target_file_for_extraction_command: {}", target_file_for_extraction_command),
    };

    match extraction_result {
        Ok(mut strings) => extracted_strings.append(&mut strings),
        Err(e) => panic!("Extraction failed for {}: {}", target_file_for_extraction_command, e),
    }

    (temp_dir, temp_project_root, extracted_strings)
} 