use std::collections::HashMap;
use std::fs::File;
use std::io::Write;
use std::path::Path;
use zip::write::{FileOptions, ZipWriter};
use zip::CompressionMethod;
use crate::error::CoreError;

pub fn create_zip_archive_from_memory(
    data: &HashMap<String, String>,
    output_zip_path: &Path,
) -> Result<(), CoreError> {
    let file = File::create(output_zip_path)
        .map_err(|e| CoreError::Io(format!("Failed to create ZIP file at {:?}: {}", output_zip_path, e)))?;

    let mut zip_writer = ZipWriter::new(file);
    let options = FileOptions::<'static, ()>::default()
        .compression_method(CompressionMethod::Deflated)
        .unix_permissions(0o755); // Set some default permissions, common for executables/data

    for (relative_path, content_string) in data {
        zip_writer.start_file(relative_path, options)
            .map_err(|e| CoreError::Zip(format!("Failed to start file {} in ZIP: {}", relative_path, e)))?;
        
        zip_writer.write_all(content_string.as_bytes())
            .map_err(|e| CoreError::Io(format!("Failed to write content for {} to ZIP: {}", relative_path, e)))?;
    }

    zip_writer.finish()
        .map_err(|e| CoreError::Zip(format!("Failed to finish ZIP archive: {}", e)))?;

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::io::Read;
    use tempfile::tempdir;
    use zip::ZipArchive;

    #[test]
    fn test_create_and_verify_zip() -> Result<(), String> {
        let dir = tempdir().map_err(|e| format!("Failed to create temp dir: {}", e))?;
        let zip_path = dir.path().join("test_archive.zip");

        let mut data_to_zip = HashMap::new();
        data_to_zip.insert("folder1/file1.txt".to_string(), "Hello from file1".to_string());
        data_to_zip.insert("folder1/folder2/file2.txt".to_string(), "Contents of file2".to_string());
        data_to_zip.insert("file3.json".to_string(), "{\"key\": \"value\"}".to_string());

        create_zip_archive_from_memory(&data_to_zip, &zip_path)
            .map_err(|e| format!("create_zip_archive_from_memory failed: {:?}", e))?;

        // Verify the ZIP was created and contains the correct files and content
        let zip_file = File::open(&zip_path).map_err(|e| format!("Failed to open created ZIP: {}", e))?;
        let mut archive = ZipArchive::new(zip_file).map_err(|e| format!("Failed to read ZIP archive: {}", e))?;

        assert_eq!(archive.len(), 3, "ZIP archive should contain 3 files");

        // Check file1.txt
        {
            let mut file1 = archive.by_name("folder1/file1.txt").map_err(|e| format!("File folder1/file1.txt not found in ZIP: {}",e))?;
            let mut contents1 = String::new();
            file1.read_to_string(&mut contents1).map_err(|e| format!("Failed to read file1: {}", e))?;
            assert_eq!(contents1, "Hello from file1");
        }

        // Check file2.txt
        {
            let mut file2 = archive.by_name("folder1/folder2/file2.txt").map_err(|e| format!("File folder1/folder2/file2.txt not found in ZIP: {}", e))?;
            let mut contents2 = String::new();
            file2.read_to_string(&mut contents2).map_err(|e| format!("Failed to read file2: {}", e))?;
            assert_eq!(contents2, "Contents of file2");
        }

        // Check file3.json
        {
            let mut file3 = archive.by_name("file3.json").map_err(|e| format!("File file3.json not found in ZIP: {}", e))?;
            let mut contents3 = String::new();
            file3.read_to_string(&mut contents3).map_err(|e| format!("Failed to read file3: {}", e))?;
            assert_eq!(contents3, "{\"key\": \"value\"}");
        }

        dir.close().map_err(|e| format!("Failed to close temp dir: {}", e))?;
        Ok(())
    }

    #[test]
    fn test_create_zip_empty_data() -> Result<(), String> {
        let dir = tempdir().map_err(|e| format!("Failed to create temp dir: {}", e))?;
        let zip_path = dir.path().join("empty_archive.zip");
        let empty_data = HashMap::new();

        create_zip_archive_from_memory(&empty_data, &zip_path)
            .map_err(|e| format!("create_zip_archive_from_memory for empty data failed: {:?}", e))?;

        let zip_file = File::open(&zip_path).map_err(|e| format!("Failed to open empty ZIP: {}", e))?;
        let archive = ZipArchive::new(zip_file).map_err(|e| format!("Failed to read empty ZIP archive: {}", e))?;
        assert_eq!(archive.len(), 0, "Empty ZIP archive should contain 0 files");
        
        dir.close().map_err(|e| format!("Failed to close temp dir: {}", e))?;
        Ok(())
    }
} 