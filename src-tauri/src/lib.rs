mod commands;
mod application;
mod models;
mod domain;
mod infrastructure;

use commands::engine_detection::detect_engine_and_find_actors;
use commands::config::{validate_provider_config, get_default_provider_config};
use tauri_plugin_sql::{Migration, MigrationKind};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Define the database connection URL
    let db_url = "sqlite:game_translator.db".to_string();

    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
        .invoke_handler(tauri::generate_handler![
            detect_engine_and_find_actors,
            validate_provider_config,
            get_default_provider_config
        ])
        .plugin(tauri_plugin_sql::Builder::default()
            .add_migrations(&db_url, vec![
                Migration {
                    version: 1,
                    description: "create_initial_tables",
                    sql: include_str!("../migrations/1_initial_schema.sql"),
                    kind: MigrationKind::Up,
                }
                // Add more migrations here later, e.g., version 2, 3, ...
            ])
            .build()
        )
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            
            // It's often good practice to ensure the database migrations run on setup
            // if not using preload in tauri.conf.json. However, `add_migrations` 
            // combined with `Database::load` on the frontend OR preload should handle this.
            // We'll rely on preload or frontend load for now.
            /* 
            let app_handle = app.handle().clone();
            let db_url_clone = db_url.clone();
            tauri::async_runtime::spawn(async move {
                match tauri_plugin_sql::Builder::default()
                    .add_migrations(&db_url_clone, MIGRATIONS.to_vec())
                    .build()
                    .initialize(&app_handle)
                    .await 
                {
                    Ok(db) => { 
                        // Optional: Pre-connect or perform initial setup if needed 
                        // let conn = db.get(&db_url_clone).await;
                    },
                    Err(e) => {
                        eprintln!("Database initialization error: {}", e);
                    }
                }
            });
            */
            
            Ok(())
        })
        // Register all Tauri commands
        .run(tauri::generate_context!()) // Ensure this uses the correct context path
        .expect("error while running tauri application");
}
