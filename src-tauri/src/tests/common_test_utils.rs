use std::path::Path;
use crate::core::rpgmv::{
    common::TranslatableStringEntry,
    project::extract_translatable_strings_from_project
};

pub fn setup_and_extract_all_strings() -> Vec<TranslatableStringEntry> {
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