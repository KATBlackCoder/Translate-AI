use std::path::Path;
use crate::domain::game::rpgmv::data::actors_extractor;
use crate::models::game::rpgmv::data::actors::ActorsFile;
 
/// Loads actors from an RPGMV Actors.json file using the domain extractor.
/// Returns a Result with the parsed ActorsFile or a string error for command use.
pub fn load_actors_from_file(path: &Path) -> Result<ActorsFile, String> {
    actors_extractor::extract_actors_from_file(path).map_err(|e| e.to_string())
} 