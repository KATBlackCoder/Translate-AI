//! Translation service: coordinates extraction, translation, and storage for Actors.json.
//!
//! Handles all error cases and propagates meaningful errors.

use crate::domain::game::rpgmv::data::actors_extractor::{extract_actors_from_file, ExtractError};
use crate::infrastructure::storage::game::rpgmv::data::actors::{read_actors_json, write_actors_json};
use crate::domain::translation::providers::base::{Provider, ProviderError};
use crate::infrastructure::storage::sqlite::Db;
use std::path::Path;
use thiserror::Error;

/// Errors that can occur in the translation service.
#[derive(Debug, Error)]
pub enum TranslationServiceError {
    #[error("Extraction error: {0}")]
    Extraction(#[from] ExtractError),
    #[error("Provider error: {0}")]
    Provider(#[from] ProviderError),
    #[error("Storage error: {0}")]
    Storage(String),
    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),
    #[error("Serialization error: {0}")]
    Serde(#[from] serde_json::Error),
}

/// Translation service for Actors.json.
pub struct TranslationService<'a, P: Provider + Send + Sync> {
    pub provider: &'a P,
    pub db: &'a Db,
}

impl<'a, P: Provider + Send + Sync> TranslationService<'a, P> {
    /// Translates all actor names in Actors.json and writes the result.
    ///
    /// # Arguments
    /// * `input_path` - Path to the source Actors.json
    /// * `output_path` - Path to write the translated Actors.json
    /// * `from` - Source language code
    /// * `to` - Target language code
    ///
    /// # Errors
    /// Returns TranslationServiceError on failure.
    pub async fn translate_actors_json(&self, input_path: &Path, output_path: &Path, from: &str, to: &str) -> Result<(), TranslationServiceError> {
        // Extract actors
        let mut actors: Vec<crate::models::game::rpgmv::data::actors::Actor> = read_actors_json(input_path)?;
        // Translate each actor's name
        for actor in &mut actors {
            let translated = self.provider.translate(&actor.name, from, to).await?;
            // Optionally: update DB with translation
            self.db.insert_translation(&actor.name, &translated, from, to).await.map_err(|e| TranslationServiceError::Storage(e.to_string()))?;
            actor.name = translated;
        }
        // Write translated actors
        write_actors_json(output_path, &actors)?;
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::tempdir;
    use crate::models::game::rpgmv::data::actors::Actor;
    use async_trait::async_trait;
    use crate::domain::translation::providers::base::ProviderError;
    use std::sync::Arc;
    use tokio;

    struct DummyProvider;
    #[async_trait]
    impl Provider for DummyProvider {
        async fn translate(&self, text: &str, _from: &str, _to: &str) -> Result<String, ProviderError> {
            Ok(format!("{}-translated", text))
        }
    }

    #[tokio::test]
    async fn test_translate_actors_json_success() {
        let dir = tempdir().unwrap();
        let input_path = dir.path().join("Actors.json");
        let output_path = dir.path().join("Actors.translated.json");
        let actors = vec![Actor {
            id: 1,
            name: "Hero".into(),
            ..Default::default()
        }];
        write_actors_json(&input_path, &actors).unwrap();
        let db = Db::connect(&dir.path().join("test.db"), true).await.unwrap();
        let service = TranslationService { provider: &DummyProvider, db: &db };
        service.translate_actors_json(&input_path, &output_path, "en", "es").await.unwrap();
        let translated: Vec<Actor> = read_actors_json(&output_path).unwrap();
        assert_eq!(translated[0].name, "Hero-translated");
    }
} 