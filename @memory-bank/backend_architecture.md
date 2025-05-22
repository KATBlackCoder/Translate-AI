# AI Game Translator - Backend Architecture (Rust/Tauri)

This document provides a detailed overview of the Rust backend architecture for the AI Game Translator application, housed within the `src-tauri/src/` directory. It complements the main [Application Architecture Document](@memory-bank/architecture.md) and the [Frontend Architecture Document](@memory-bank/frontend_architecture.md).

## 1. Core Principles & Technologies

*   **Language:** Rust
*   **Framework:** Tauri (for desktop application shell and IPC)
*   **Async Runtime:** Tokio (leveraged by Tauri and for async operations like HTTP requests)
*   **Error Handling:** Custom error types (`error.rs`) for consistent error propagation and frontend communication.
*   **Modularity:** Emphasis on separating concerns: Tauri-specific command handlers, core business logic, data models, and external service interactions.

## 2. Directory Structure (`src-tauri/src/`)

The proposed structure for the `src-tauri/src/` directory is as follows:

```plaintext
src/
├── main.rs             // Main binary entry point (often minimal, calls lib::run())
├── lib.rs              // Library entry point; tauri::Builder setup, plugin registration, invoke_handler
│
├── commands/           // Tauri commands exposed to the frontend
│   ├── mod.rs          // Module declarations for commands/
│   ├── translation.rs // Commands for text translation (single, batch)
│   ├── project.rs   // Commands for game project interactions (detection, parsing, selection)
│   └── settings.rs  // Commands for application settings (example)
│
├── core/               // Core business logic, ideally Tauri-agnostic
│   ├── mod.rs
│   ├── game_detection.rs // Logic for detecting game engines (e.g., RPG Maker MV)
│   ├── rpgmv/                 // Sub-module for all RPGMV specific core logic
│   │   ├── mod.rs             // Declares project, common, actors, items etc.
│   │   ├── project.rs         // Orchestrator for RPG Maker MV project file parsing & operations
│   │   ├── common.rs          // Common structs/functions for RPGMV parsing (e.g., TranslatableStringEntry)
│   │   ├── actors.rs          // Parser for Actors.json
│   │   ├── items.rs           // Parser for Items.json
│   │   ├── armors.rs          // Parser for Armors.json
│   │   ├── weapons.rs         // Parser for Weapons.json
│   │   ├── skills.rs          // Parser for Skills.json
│   │   ├── enemies.rs         // Parser for Enemies.json
│   │   ├── common_events.rs   // Parser for CommonEvents.json
│   │   ├── troops.rs          // Parser for Troops.json
│   │   ├── system.rs          // Parser for System.json
│   │   ├── maps.rs            // Parser for MapXXX.json files
│   │   ├── map_infos.rs       // Parser for MapInfos.json
│   │   ├── classes.rs         // Parser for Classes.json
│   │   ├── states.rs          // Parser for States.json
│   │   └── (other_file_type.rs ...)
│   ├── translation_engine.rs // Traits/structs for AI translation engines (Future)
│   └── glossary_manager.rs // Glossary application logic (Future)
│
├── models/             // Data structures (structs, enums) shared across backend
│   ├── mod.rs
│   ├── app_settings.rs   // Application settings structure
│   ├── translation.rs    // Translation request/response structs
│   └── project_data.rs   // Game project data representation
│
├── services/           // Interaction with external APIs or complex OS tasks
│   ├── mod.rs
│   ├── ollama_client.rs // Client for Ollama API
│   └── zip_service.rs    // ZIP archive creation/management
│
├── state/              // Definitions for Tauri managed state (`tauri::State`)
│   ├── mod.rs
│   └── app_state.rs      // Example: AppConfigState
│
├── utils/              // Utility functions and helpers
│   ├── mod.rs
│   └── file_helpers.rs // File I/O, path manipulation helpers
│
└── error.rs            // Custom error types and conversions
```
*(This structure is a starting point and will evolve.)*

### 2.1 Folder and File Descriptions

This section details the purpose of key files and folders within the `src-tauri/src/` backend structure.

#### 2.1.1 `main.rs`
Minimal application entry point. Its primary role is typically to call a `run()` function defined in `lib.rs`.

#### 2.1.2 `lib.rs`
Central hub for Tauri application setup. Initializes `tauri::Builder`, registers essential Tauri plugins (e.g., `tauri-plugin-store`, `tauri-plugin-dialog`, `tauri-plugin-fs`), and, importantly, configures the `.invoke_handler()` with all `#[tauri::command]` functions defined in the `commands/` modules. It also declares the top-level modules of the backend crate (e.g., `commands`, `core`, `services`).

#### 2.1.3 `commands/`
This module and its submodules house all functions directly invokable by the frontend via Tauri's IPC. These functions are annotated with `#[tauri::command]`.
*   They should act as a thin layer, validating inputs and delegating complex business logic to `core/` modules or `services/`.
*   They handle the conversion of results and errors into types that can be serialized and sent to the frontend.
*   **Submodules:**
    *   `translation.rs`: Commands for text translation (e.g., `translate_text_command`).
    *   `project.rs`: Commands for game project interactions (e.g., `select_project_folder_command`, `detect_rpg_maker_mv_project_command`).
    *   `settings.rs`: (Future) Commands for application settings.

#### 2.1.4 `core/`
Contains the heart of the application's business logic. This code should be, as much as possible, independent of Tauri-specific APIs to enhance testability and reusability.
*   **Submodules:**
    *   `game_detection.rs`: Implements logic to detect different game engines. For example, `detect_rpg_maker_mv` checks for RPG Maker MV specific files/folders. This can be called by specific game project handlers like `core::rpgmv::project`.
    *   `rpgmv/`: This subdirectory houses all core logic related to RPG Maker MV projects. It acts as a self-contained unit for RPGMV processing.
        *   `mod.rs`: Declares the public interface and sub-modules of `core::rpgmv` (e.g., makes `project.rs` contents accessible).
        *   `project.rs`: This is the main entry point or orchestrator for RPG Maker MV project-level operations. It handles tasks like directory traversal (using `walkdir`) for `www/data` and delegates the parsing of specific file types to its sibling parser modules.
        *   `common.rs`: Contains shared data structures (like `TranslatableStringEntry`, `EventCommand`) and common utility functions (like `extract_strings_from_json_array` for generic array parsing, and `extract_translatable_strings_from_event_command_list` for event processing) used by multiple RPGMV file parsers within the `core::rpgmv` module.
        *   `actors.rs`, `items.rs`, `armors.rs`, `weapons.rs`, `skills.rs`, `enemies.rs`: These parsers utilize the generic `extract_strings_from_json_array` helper from `common.rs` by implementing the `RpgMvDataObject` trait for their specific data structures.
        *   `common_events.rs`, `troops.rs`, `maps.rs`: These parsers handle more complex structures, including event lists, and use the `extract_translatable_strings_from_event_command_list` helper from `common.rs`.
        *   `system.rs`, `map_infos.rs`, `classes.rs`, `states.rs`: These parsers have unique structures or specific extraction logic. They directly parse their respective JSON files and construct `TranslatableStringEntry` items without using the `RpgMvDataObject` trait or the generic array parser, though they still use the `TranslatableStringEntry` struct from `common.rs`.
    *   `translation_engine.rs`: (Future) Defines traits or enums for interacting with different AI translation services.
    *   `glossary_manager.rs`: (Future) Implements glossary lookup and application logic.

#### 2.1.5 `models/`
Defines data structures (structs and enums) used throughout the backend. These are often annotated with `serde::{Serialize, Deserialize}` for IPC and file I/O.
*   **Example Files:**
    *   `app_settings.rs`: Struct representing user-configurable application settings.
    *   `translation.rs`: Structs for translation requests/responses.
    *   `project_data.rs`: Structs for representing parsed game project data (e.g., `RpgMakerDetectionResult` could conceptually be here if not in `core/game_detection.rs`, though for enums tightly coupled with a function, keeping them co-located is also fine).

#### 2.1.6 `services/`
Contains modules responsible for interacting with external services or performing complex OS-level tasks that are distinct enough to warrant separation.
*   **Submodules:**
    *   `ollama_client.rs`: Handles communication with a local Ollama instance.
    *   `zip_service.rs`: (Future) Encapsulates logic for creating ZIP archives.

#### 2.1.7 `state/`
Defines structs that will be managed by Tauri as shared state (`tauri::State`). This allows different parts of the Rust backend (e.g., different commands) to share data or configurations.
*   **Example Files:**
    *   `app_state.rs`: Example for storing `AppConfigState`.

#### 2.1.8 `utils/`
A collection of general-purpose utility functions that don't belong to a specific domain module but are used across the backend.
*   **Example Files:**
    *   `file_helpers.rs`: For common file operations.

#### 2.1.9 `error.rs`
Defines a custom `Error` enum for the application. This allows for consistent error handling and reporting.
*   It should implement `From<OtherError>` for common error types (e.g., `std::io::Error`, `serde_json::Error`, `reqwest::Error`) to simplify error propagation with the `?` operator.
*   It must implement `serde::Serialize` to be sendable to the frontend via Tauri commands.

## 3. Data Flow (Conceptual for a Command)

1.  Frontend calls a Tauri command (e.g., `invoke('translate_text', { text: 'Hello' })`).
2.  The corresponding function in a `commands/` submodule is executed.
3.  The command function may validate input, then call functions in `core/` or `services/`.
4.  Core/service logic performs operations, possibly using `models/` for data representation and `utils/` for helpers.
5.  Results or errors (mapped to the custom `error.rs` type) are returned to the command function.
6.  The command function returns the result/error to the frontend.

This modular structure aims to keep the codebase organized, maintainable, and testable as the application grows in complexity. 