use crate::application::translation::actors_service;
use crate::models::game::rpgmv::data::actors::ActorsFile;

/// Loads actors from an RPGMV Actors.json file at the given path.
/// Returns the parsed ActorsFile or an error string.
#[tauri::command]
pub async fn load_actors(path: String) -> Result<ActorsFile, String> {
    let path = std::path::Path::new(&path);
    actors_service::load_actors_from_file(path)
} 