# AI Game Translator - Implementation Plan

This document outlines a phased approach to developing the AI Game Translator application, based on the App Design Document and Recommended Tech Stack.
**Note on Phase Completion (Definition of Done):** Each phase aims for a "Robust MVP (Minimum Viable Product)" which includes a functional core, essential error handling for critical paths (no crashes, clear user messages), passing unit/component tests for new functionality, and basic usability for its intended purpose. Highly polished UI, exhaustive edge case handling, and advanced optimizations are generally deferred to Phase 6 or later, unless critical for core functionality.
**Note on Testing:** A hybrid testing strategy will be adopted. Unit tests (Rust) and component/unit tests (Nuxt) will be written concurrently with feature development in Phases 1-6. Phase 7 will then focus on End-to-End (E2E) tests, exploratory testing, and ensuring comprehensive test coverage.

## Phase 1: Project Setup & Core UI Shell

**Goal:** Establish the project structure, install essential dependencies, and create a basic UI shell focused on project translation.
**Definition of Done:** Project initializes, core dependencies are installed, Pinia store for project translation UI state is implemented, and IPC test command works. Basic UI for project selection is in place on `pages/index.vue`.

**Tasks:**

1.  **Initialize Tauri + Nuxt 3 Project:** (Largely complete)
    *   Use `npx nuxi@latest init <project-name>` to create the Nuxt frontend.
    *   Integrate Tauri into the Nuxt project (`npm run tauri init` or `cargo tauri init`).
    *   Configure `tauri.conf.json` with basic app identifier, window title.
    *   Fine-tune `nuxt.config.ts` for optimal Tauri integration (e.g., `ssr: false`, dev server/Vite settings for Tauri) and resolve any initial build/serving issues (e.g., CSS loading, Tailwind setup). (Largely complete)
2.  **Install Core Frontend Dependencies:** (Largely complete)
    *   Standard `Nuxt UI` library (ensuring it handles Tailwind CSS integration, avoiding manual/conflicting setups like a separate `@tailwindcss/vite` plugin if Nuxt UI manages it).
    *   `@iconify-json/*` (select a default set like `@iconify-json/lucide`).
    *   `pinia` / `@pinia/nuxt` (for frontend state management).
3.  **Install Core Backend Dependencies:** (Largely complete)
    *   Essential Tauri Plugins:
        *   `tauri-plugin-dialog`
        *   `tauri-plugin-fs`
        *   `tauri-plugin-store`
        *   `tauri-plugin-opener`
    *   Essential Rust Crates:
        *   `serde`, `serde_json`
        *   `zip`
        *   `walkdir`
        *   `reqwest` (for Phase 2 Ollama & Phase 5 DeepL)
4.  **Basic UI Layout (Nuxt UI):** (Focus on Project Translation)
    *   Create main page layout (`app.vue`, default layout).
    *   Implement initial UI for project selection on `pages/index.vue` using `ProjectSelector.vue`.
    *   (Single text translation UI elements are removed/deferred).
5.  **Basic Frontend State (Pinia):**
    *   Create Pinia store `stores/project.ts` using **Setup Store syntax** for project selection state. (COMPLETE)
    *   (Store for single text translation, `stores/translation.ts`, will be reviewed for removal/refactoring).
6.  **Test IPC:** (Complete)
    *   Created a simple `simple_ipc_test` Tauri command in Rust.
    *   Invoked it successfully from the Nuxt frontend (`translationStore`'s `handleTranslate` action), verifying Inter-Process Communication with data passing and response handling.

**(End of Phase 1)**

## Phase 2: Core Single-Text Translation (Offline AI - Ollama) (REMOVED/DEFERRED)

**This phase is currently removed from the immediate plan to focus on batch project translation. Functionality may be re-introduced later.**

(Original tasks for Phase 2 are removed for brevity)

## Phase 3: RPG Maker MV Project Translation (Batch) (Now effectively Phase 2 - Current Phase)

**Goal:** Implement the workflow for selecting an RPG Maker MV project, extracting text, batch translating (using Ollama initially), and saving as a ZIP, with simple progress indication.
**Definition of Done:** User can select an RPG Maker MV project, detection logic works, JSON files are parsed, strings are extracted and batch translated using Ollama. **Successful manual testing of this entire workflow (extraction and batch translation) confirms functionality and basic usability.** Translated files are correctly reconstructed and saved into a ZIP archive preserving the full relative path (e.g., `www/data/file.json`). A simple indeterminate progress indicator is shown during batch processing. Essential error handling for project detection, file parsing, and ZIP creation is implemented. Unit/integration tests for backend logic are written and passing.

**Tasks:**

1.  **Project Selection (Rust & Frontend):**
    *   **1.1. Frontend UI Element:** Add a "Select Project Folder" button to `pages/index.vue`, possibly within a new UI section/card dedicated to "Project Translation."
    *   **1.2. Backend Tauri Command:** 
        *   Create a new Rust function named `select_project_folder_command` in `src-tauri/src/commands/project.rs`, annotated with `#[tauri::command]`.
        *   The function signature should accept `app_handle: tauri::AppHandle`.
        *   **Folder Structure for Commands:** To maintain a clean and scalable backend codebase, create a dedicated directory `src-tauri/src/commands/`. Within this directory, organize commands into logical modules. For example:
            *   `src-tauri/src/commands/project.rs`: This file will house commands related to project selection, detection, and processing.
            *   `src-tauri/src/commands/translation.rs`: This file will house commands related to text translation (like the one created in Phase 2).
            *   Other command-related modules can be added here as needed (e.g., `glossary.rs`, `settings.rs`).
        *   **Update `src-tauri/src/lib.rs`:** Modify `src-tauri/src/lib.rs` to declare the new `commands` module and its submodules (e.g., `pub mod commands;` and inside `commands/mod.rs` or directly in `lib.rs`: `pub mod project; pub mod translation;`).
        *   The `select_project_folder_command` should be implemented within `src-tauri/src/commands/project.rs`.
        *   This command will use the `app_handle` to access the dialog plugin: `app_handle.dialog().file().pick_folder().await` (or the closest available asynchronous method for picking a single folder).
        *   The command should return the selected folder path as `Result<Option<String>, String>` (e.g., `Ok(Some(path_string))`, `Ok(None)` if cancelled, or `Err(error_message)` if an unexpected issue occurs, though simple cancellation usually results in `Ok(None)`).
    *   **1.3. Pinia Store Action:**
        *   Create a new action in an appropriate Pinia store (e.g., `stores/project.ts` or initially in `stores/translation.ts`). This store should be implemented using Pinia's **Setup Store syntax** for consistency with existing stores (like `stores/translation.ts`).
        *   This action will be called when the "Select Project Folder" button is clicked.
    *   **1.4. Connect Frontend to Backend:**
        *   The new Pinia store action will use `invoke()` to call the backend Tauri command for project selection.
        *   It will handle the response (the selected folder path), for now, by logging it to the console or storing it in the Pinia state.
2.  **RPG Maker MV Project Detection (Rust):**
    *   A Tauri command (e.g., `detect_rpg_maker_mv_project_command` in `src-tauri/src/commands/project.rs`) will be exposed to the frontend, taking a folder path as input.
    *   The core detection logic itself should reside in a separate module within `src-tauri/src/core/` (e.g., `src-tauri/src/core/game_detection.rs`). This promotes better separation of concerns, testability, and allows the `select_project_folder_command` to also utilize this core logic directly after a folder is picked.
    *   The logic will implement the two-tier detection:
        *   **Primary:** Check for `Game.rpgproject` file.
        *   **Fallback:** Check for `www/data` structure.
    *   The core function will return a descriptive type (e.g., an enum like `RpgMakerDetectionResult`) indicating the outcome. The Tauri command will wrap this for frontend communication.
    *   The `select_project_folder_command` (from Task 1.2) should be updated to call this core detection logic and return both the path and the detection result to the frontend.
3.  **File Parsing & String Extraction (Rust):**
    *   A new Tauri command, e.g., `extract_project_strings_command`, will be created in `src-tauri/src/commands/project.rs`. It will take the project path as input. This command will be a thin wrapper around core logic, calling `core::rpgmv::project::extract_translatable_strings_from_project(...)`.
    *   **Core RPGMV Logic (`src-tauri/src/core/rpgmv/`):**
        *   This directory will encapsulate all core logic specific to RPG Maker MV projects.
        *   **`project.rs` (Orchestrator):**
            *   This module (`core::rpgmv::project`) is the main entry point for RPGMV project operations.
            *   It will use the `walkdir` crate to iterate through the `www/data/` subdirectory of the project path.
            *   It will identify RPG Maker MV `.json` files (e.g., `Actors.json`, `Items.json`, `MapXXX.json`, `CommonEvents.json`, `System.json`, etc.).
            *   For each identified file, it will read its content and call specialized parsing functions from its sibling modules within `src-tauri/src/core/rpgmv/` (e.g., `actors::extract_strings(...)`, `items::extract_strings(...)`). (This dispatch logic is now fully implemented and active).
        *   **`common.rs`:**
            *   This module (`core::rpgmv::common`) will house common data structures (like the `TranslatableStringEntry` struct) and shared helper functions specific to RPG Maker MV JSON structures, used by `project.rs` and other parser modules.
        *   **Specific Parsers (e.g., `actors.rs`, `items.rs`, `maps.rs`):**
            *   Individual Rust modules for each specific RPG Maker MV JSON file type (e.g., `core::rpgmv::actors`, `core::rpgmv::items`).
            *   Each specific parser module will contain functions to:
                *   Parse its specific JSON file type (using `serde_json` on the content provided by `project.rs`).
                *   Extract all translatable string fields from their known JSON structures, including the object's own `id` field (e.g., `actor.id`).
                *   (Later, in Task 6) Inject translated strings back into a copy of the original JSON structure.
            *   For `MapXXX.json` files, the `maps.rs` module will handle parsing event commands.
    *   **Data Structure for Return (`core/rpgmv/common.rs`):** The `extract_translatable_strings_from_project` function (in `core::rpgmv::project`) should return a `Result<Vec<TranslatableStringEntry>, String>`. The `TranslatableStringEntry` struct should be defined in `core/rpgmv/common.rs`:
        ```rust
        #[derive(serde::Serialize, Debug)] // Add Deserialize if needed later
        pub struct TranslatableStringEntry {
            pub object_id: u32,               // The ID from the JSON object itself (e.g., actor.id)
            pub text: String,                 // The actual string to be translated
            pub source_file: String,          // Relative path to the file, e.g., "www/data/Actors.json"
            pub json_path: String,            // A string representing the path within the JSON, e.g., "[1].name"
        }
        ```
    *   **Error Handling:** Implement robust error handling for file I/O (likely in orchestrator), JSON parsing failures (in specific parsers), and unexpected data structures, returning a clear error message to the frontend if the process cannot complete.
    *   **Testing of Initial Parsers (Actors.json, Items.json):** (COMPLETE) Successfully tested with a sample RPG Maker MV project. Verification confirmed correct extraction of `object_id`, `text`, `source_file`, and `json_path`. No errors were encountered during testing.
    *   **Armors.json Parser:** (IMPLEMENTED) Parser for `Armors.json` implemented and integrated.
    *   **Status of Initial Parsers:** Parsers for `Actors.json`, `Items.json`, `Armors.json`, `Weapons.json`, `Skills.json`, and `Enemies.json` are implemented. The parser for `CommonEvents.json` has been implemented with a focus on core text-displaying event commands (101, 401, 102, 105), deferring more complex command extraction for later. The `Troops.json` parser is now also implemented, extracting troop names and processing simplified event commands from troop pages. The `EventCommand` struct has been centralized in `core::rpgmv::common`.
    *   **Refactoring Initiative (Generic Parser):** A generic parsing mechanism using the `RpgMvDataObject` trait and `extract_strings_from_json_array` function has been introduced in `core::rpgmv::common.rs`. `Actors.json`, `Armors.json`, `Items.json`, `Weapons.json`, `Skills.json`, and `Enemies.json` parsers have now all been refactored to use this generic approach. This significantly reduces code duplication for these similar file types.
    *   **System.json Parser:** Implemented a dedicated parser in `core::rpgmv::system.rs` for `System.json`, handling its unique object structure. This extracts various global game terms, including game title, currency, type definitions, and all entries within the `terms` object (basic, commands, params, messages). A comment has also been added to this file to clarify the handling of RPG Maker MV placeholders (e.g., `%1`, `%2`) for translators.
    *   **MapXXX.json Parser:** Implemented parser in `src-tauri/src/core/rpgmv/maps.rs` for `MapXXX.json` files. Extracts event `name`s, and text from relevant event commands (101, 401, 102, 105) within event pages. Logic for identifying map files and dispatching them is added to `project.rs`. Integrated into `mod.rs`. The `displayName` field extraction has been temporarily removed to address issues with empty values and will be revisited if necessary.
    *   **Refactoring (Event Command Logic):** A shared helper function `extract_translatable_strings_from_event_command_list` was added to `core::rpgmv::common.rs`. Parsers `common_events.rs`, `troops.rs`, and `maps.rs` have been refactored to use this helper, centralizing event command text extraction.
    *   **MapInfos.json Parser:** Implemented parser in `src-tauri/src/core/rpgmv/map_infos.rs` for `MapInfos.json`. Extracts map `name` for each entry. Integrated into `project.rs`.
    *   **Classes.json Parser:** Implemented parser in `src-tauri/src/core/rpgmv/classes.rs`. Extracts class `name`, `note`, and `learnings[].note` fields. Integrated into `project.rs`. Linter issues resolved by refactoring to not use `RpgMvDataObject` trait and directly constructing `TranslatableStringEntry`.
    *   **States.json Parser:** Implemented parser in `src-tauri/src/core/rpgmv/states.rs`. Extracts state `name`, `note`, and `message1`-`message4` fields. Integrated into `mod.rs` and `project.rs`. Linter issues resolved by refactoring to not use `RpgMvDataObject` trait and directly constructing `TranslatableStringEntry`.
    *   **Completion of Core Parsing Logic (Phase 3, Task 3):** The entire "File Parsing & String Extraction (Rust)" task, including all core parsing logic (individual file parsers and the main orchestrator in `core::rpgmv::project.rs`) and comprehensive integration testing, is **COMPLETE**.
4.  **Frontend for Batch Workflow (Refactored & COMPLETE - End-to-end workflow manually tested and stable):**
    *   **Define `TranslatableStringEntry` & `TranslatedStringEntry` Interfaces (Frontend):** (COMPLETE - Currently defined in `stores/translation.ts`, consider moving to a shared types file).
    *   **Create `stores/settings.ts` (Pinia Store):**
        *   Manages application-wide settings and selectable options. (COMPLETE)
        *   Provides `languageOptions` and `engineOptions`. (COMPLETE)
        *   (Future: API keys, default preferences, theme settings).
    *   **Update `stores/project.ts` (Pinia Store):**
        *   Focuses on project selection, game engine detection, and string extraction state and actions. (COMPLETE)
        *   `$reset()` method clears project state and calls `$resetBatchState()` in `translationStore`. (COMPLETE)
    *   **Update `stores/translation.ts` (Pinia Store):**
        *   Focuses on the operational aspects of batch translation (state for loading, results, errors, and the `performBatchTranslation` action). (COMPLETE)
        *   `$resetBatchState()` method clears batch translation state. (COMPLETE)
        *   (Currently also defines `TranslatableStringEntry` & `TranslatedStringEntry` interfaces).
    *   **Update `components/project/ProjectStringsReview.vue` (Vue Component):
        *   Uses `projectStore` for `extractedStrings`.
        *   Uses `settingsStore` for `languageOptions` and `engineOptions`.
        *   Uses `translationStore` for `isLoadingBatchTranslation` and to call `performBatchTranslation`.
        *   (COMPLETE)
    *   **Update `components/project/ProjectStringsResult.vue` (Vue Component):
        *   Uses `translationStore` for `batchTranslatedStrings` and `batchTranslationError`.
        *   (COMPLETE)
    *   **Update `pages/project.vue` (Vue Page):
        *   Conditionally displays `ProjectStringsReview.vue` or `ProjectStringsResult.vue` based on state from `projectStore` (for extracted strings) and `translationStore` (for batch results/errors).
        *   (COMPLETE)
    *   (Other sub-tasks like `pages/index.vue` and `components/project/ProjectSelector.vue` updates remain COMPLETE as per their last state and are not directly affected by the `settingsStore` introduction, beyond their child `ProjectStringsReview.vue` being updated).
    *   **Manual Testing Summary:** The end-to-end workflow involving project selection, string extraction, review UI (`ProjectStringsReview.vue`), batch translation initiation via Ollama, and results display (`ProjectStringsResult.vue`) has been manually tested. The core functionality is verified, and the UI/UX is deemed acceptable for this stage. Minor UI polish and performance considerations for very large batches (>1000 strings with Ollama) are noted for future enhancements (Phase 6).
5.  **Batch Translation Logic (Rust):** (COMPLETE - Details omitted for brevity, no changes to Rust logic itself in this refactor)
    *   **Frontend Store Logic (Now split between `stores/project.ts` and `stores/translation.ts`):** (Updated as described above)
    *   **Frontend UI Logic (Handled by `ProjectStringsReview.vue` and `ProjectStringsResult.vue` on `pages/project.vue`):** (Updated as described above)
6.  **Reconstruct Translated Files (Rust):**
    *   **Goal:** To take the batch-translated strings, read the original game files, inject these translations into the correct places within the JSON structures (in memory, non-destructively), and produce the final translated JSON content as strings in memory, ready for ZIP packaging.
    *   **Sub-Task 6.1: Define `TranslatedStringEntryFromFrontend` Struct (Rust):**
        *   Define the struct in `src-tauri/src/models/translation.rs` to match the data structure sent from the frontend (includes `objectId`, `text` (original), `sourceFile`, `jsonPath`, `translatedText`, and `error` option). (COMPLETE)
    *   **Sub-Task 6.2: Implement `reconstruct_translated_project_files` Tauri Command (Rust):**
        *   Create in `src-tauri/src/commands/project.rs`.
        *   Accepts `project_path` and `Vec<TranslatedStringEntryFromFrontend>`.
        *   Groups translations by `source_file`.
        *   For each file: reads original content, then calls core reconstruction logic (Sub-Task 6.3) - *currently a placeholder call*.
        *   Returns a `HashMap<String, String>` of {relative_file_path: translated_json_string} - *currently with placeholder content*.
        *   Add command to `lib.rs` invoke_handler. (COMPLETE - Basic command structure with placeholder logic)
    *   **Sub-Task 6.3: Implement Core Reconstruction Logic Dispatcher (Rust):**
        *   Create `reconstruct_file_content` function in `src-tauri/src/core/rpgmv/project.rs`.
        *   Takes original JSON string, `relative_file_path`, and relevant `Vec<&TranslatedStringEntryFromFrontend>`.
        *   Dispatches to specific file-type reconstructor (Sub-Task 6.4) based on `relative_file_path`. (COMPLETE - Dispatcher implemented; specific reconstructor calls are placeholders returning `CoreError::Unimplemented`)
        *   Define `CoreError` enum in `src-tauri/src/error.rs` and register `error.rs` in `lib.rs`. (COMPLETE)
    *   **Sub-Task 6.4: Implement Specific Reconstructor Functions (Rust):**
        *   For each RPGMV file type module (e.g., `core/rpgmv/actors.rs`), add a `reconstruct_<filetype>_json` function.
        *   Parses original JSON string to mutable `serde_json::Value`.
        *   Uses `object_id` and `json_path` from each `TranslatedStringEntryFromFrontend` to locate and update fields in the `Value` (leveraging the `update_value_at_path` helper from Sub-Task 6.5 where applicable).
        *   If translation failed (error present), inserts original text back.
        *   Serializes modified `Value` back to a JSON string.
        *   Status:
            *   `Actors.json`: COMPLETE (includes `note` field, uses `update_value_at_path` helper, unit tests passed).
            *   `Items.json`: COMPLETE (uses `update_value_at_path` helper, unit tests passed).
            *   `Armors.json`: COMPLETE (uses `update_value_at_path` helper, unit tests passed).
            *   `Weapons.json`: COMPLETE (uses `update_value_at_path` helper, unit tests passed).
            *   `Skills.json`: COMPLETE (uses `update_value_at_path` helper, unit tests passed).
            *   `Enemies.json`: COMPLETE (uses `update_value_at_path` helper, unit tests passed).
            *   `CommonEvents.json`: COMPLETE (uses `update_value_at_path` for name, `reconstruct_event_command_list` helper for list, unit tests passed).
            *   `Troops.json`: COMPLETE (uses `update_value_at_path` for name, `reconstruct_event_command_list` helper for pages, unit tests passed).
            *   `System.json`: COMPLETE (uses `update_value_at_path` helper for all fields, unit tests passed).
            *   `MapInfos.json`: COMPLETE (uses `update_value_at_path` helper for name, unit tests passed).
            *   `Classes.json`: COMPLETE (uses `update_value_at_path` helper for name, note, and learnings notes, unit tests passed).
            *   `States.json`: COMPLETE (uses `update_value_at_path` helper for name, note, and messages, unit tests passed).
            *   `MapXXX.json`: COMPLETE (uses `update_value_at_path` for event names, `reconstruct_event_command_list` helper for event command lists, unit tests passed).
            *   All planned reconstructors complete (`Tilesets.json` reconstruction deferred as its parsing was deferred).
    *   **Sub-Task 6.5: Implement `serde_json::Value` Navigation/Update Helper (Rust):**
        *   Develop a helper function (e.g., `update_value_at_path` in `src-tauri/src/utils/json_utils.rs`).
        *   This function will take a mutable `serde_json::Value`, a `json_path` string, and the new text.
        *   It will parse the `json_path` (dot notation for objects, brackets for arrays) and navigate/update the `Value`.
        *   (COMPLETE - Initial version with basic path handling and tests implemented in `utils/json_utils.rs`)
    *   **Sub-Task 6.6: Implement `reconstruct_event_command_list` Helper (Rust):**
        *   (COMPLETE - Helper function in `core/rpgmv/common.rs` for reconstructing event command lists, used by relevant reconstructors.)
7.  **ZIP Archive Creation (Rust):** (COMPLETE)
    *   `zip` crate (`zip = "4.0.0"`) was already in `src-tauri/Cargo.toml`.
    *   Created `src-tauri/src/services/zip_service.rs` and declared module in `services/mod.rs` (and `services` in `lib.rs`).
    *   Implemented `create_zip_archive_from_memory(data: &HashMap<String, String>, output_zip_path: &Path) -> Result<(), CoreError>` in `zip_service.rs`:
        *   Uses `zip::ZipWriter` and `zip::CompressionMethod::Deflated`.
        *   Iterates through `data`, using keys as relative paths (e.g., `www/data/Actors.json`) and values as content to write into the ZIP.
        *   Ensures preservation of the full relative path within the ZIP (Option A: no top-level project folder in ZIP).
    *   Updated the `reconstruct_translated_project_files` Tauri command in `src-tauri/src/commands/project.rs`:
        *   Obtains the `HashMap<String, String>` of reconstructed translated files.
        *   Uses a fixed temporary output path for the ZIP file (`src-tauri/target/translated_project_output.zip`).
        *   Calls `services::zip_service::create_zip_archive_from_memory`.
        *   Returns the path to the created ZIP file to the frontend.
    *   Basic unit tests for `zip_service.rs` implemented and passing.
8.  **Save & Show Output (Frontend & Rust):**
    *   **Frontend UI & State:**
        *   In `ProjectStringsResult.vue` (or a similar results component on `pages/project.vue`), add an "Export Translated Project" button.
        *   This button is enabled only after the `reconstruct_translated_project_files` command successfully returns the temporary ZIP path.
        *   Store the temporary ZIP path in `translationStore`.
        *   Add a new state property in `translationStore` for the final saved ZIP path (e.g., `finalZipSavedPath: Ref<string | null>`).
        *   Add a "Show in Folder" button, enabled only after `finalZipSavedPath` is set.
    *   **Backend `save_zip_archive_command` (Rust):**
        *   Create a new command `save_zip_archive_command` in `src-tauri/src/commands/project.rs`.
        *   Takes `app_handle: tauri::AppHandle` and `temp_zip_path: String` as input.
        *   Uses `app_handle.dialog().file().save_file().add_filter("zip", &["zip"]).show().await` to prompt the user for a save location and filename (suggest a default like `translated_project.zip`).
        *   If the user selects a path:
            *   Move the ZIP file from `temp_zip_path` to the user-selected path using `std::fs::rename`. Consider error handling if rename fails (e.g., across different filesystems, might need copy then delete).
            *   Return `Ok(Some(final_path_string))`.
        *   If the user cancels, return `Ok(None)`.
        *   If an error occurs, return `Err(CoreError::Io(...))`.
    *   **Frontend Logic for Saving:**
        *   When "Export Translated Project" is clicked, the frontend calls `save_zip_archive_command` with the temporary ZIP path from `translationStore`.
        *   On success (`Ok(Some(path))`), update `translationStore.finalZipSavedPath` with the returned path and show a success toast.
        *   On cancellation (`Ok(None)`), do nothing or show a gentle notification.
        *   On error, show an error toast.
    *   **Backend `open_folder_command` (Rust):**
        *   Create a new command `open_folder_command` in `src-tauri/src/commands/project.rs`.
        *   Takes `app_handle: tauri::AppHandle` and `folder_path: String` (this will be the directory containing the saved ZIP) as input.
        *   Uses `app_handle.opener().open(folder_path)` to open the containing folder in the system's file explorer. (Note: `tauri-plugin-opener` opens paths, so ensure you pass the directory, not the file path itself, if you want to reveal the file in its folder).
        *   Alternatively, if `tauri-plugin-shell`'s `open` is more appropriate for revealing a file, that could be used (e.g., `app_handle.shell().open(file_path_to_reveal, None)`). Check plugin capabilities.
        *   Return `Result<(), String>` for error reporting.
        *   **Frontend Logic for Showing:**
            *   When "Show in Folder" is clicked, the frontend gets the directory of `translationStore.finalZipSavedPath`.
            *   Calls `open_folder_command` with this directory path.
            *   Handle potential errors with a toast.
        *   **Temporary File Cleanup (Rust - Optional but Recommended):**
            *   Consider deleting the temporary ZIP file from `src-tauri/target/` after it's successfully moved or if the user cancels/an error occurs before moving.

## Phase 4: Glossary Feature

**Goal:** Allow users to define custom translations that override AI (pre-check mechanism).
**Definition of Done:** User can manage glossary entries (add, retrieve, edit, delete). The glossary is applied correctly for both single-text and batch translations (using Ollama), and UI indicates when a glossary translation was used. Essential error handling for glossary operations is implemented. Unit/integration tests for backend logic are written and passing.

**Tasks:**

1.  **Glossary Data Management (Rust & `tauri-plugin-store`):**
    *   Define data structure for glossary entries (source text, target text, source lang ISO code, target lang ISO code).
    *   Tauri commands (in a new `src-tauri/src/commands/glossary.rs` module, which needs to be declared in `lib.rs` or `commands/mod.rs`) to add, retrieve, edit, delete glossary entries using `tauri-plugin-store`.
2.  **Glossary UI (Frontend):**
    *   Settings page/modal section for managing glossary entries (CRUD operations).
3.  **Integrate Glossary (Option A - Pre-check) (Rust):**
    *   Modify AI calling logic (the single-text translation command, located in `src-tauri/src/commands/translation.rs`, used by Phase 2 and Phase 3):
        *   Before sending text to AI (Ollama), check if an exact match exists in the glossary for the current source/target language pair.
        *   If yes, use glossary translation and do NOT call AI.
4.  **UI Indication for Glossary Usage (Frontend):**
    *   During the batch review step (or for single translations if a review step is added), clearly indicate if a translation came directly from the glossary.

## Phase 5: Integrate DeepL Online AI API

**Goal:** Add support for DeepL as an online AI translation engine option, including formality selection and robust error handling.
**Definition of Done:** User can select DeepL as the translation engine. DeepL translations work for single text and batch. Formality options are available for supported languages. Common DeepL API errors (auth, quota, rate limits) are handled with clear user messages. The app's internal glossary is still applied correctly before calling DeepL. Unit/integration tests for DeepL client are written.

**Tasks:**

1.  **Implement DeepL API Client (Rust):**
    *   Implement Rust functions to make API calls to the DeepL API using `reqwest`.
    *   Handle the DeepL API key (this will be configured by the user in Phase 6, but the Rust client needs to accept it as a parameter, possibly read from `tauri-plugin-store` if set).
    *   Implement formality parameter based on user selection for supported languages.
    *   Parse the DeepL API's JSON response to extract the translated text.
    *   Implement handling for common DeepL error codes (e.g., 400, 403-Key, 429-RateLimit, 456-Quota, 5xx-ServerErrors) returning user-friendly messages.
2.  **Adapt AI Interface (Rust):**
    *   Modify or extend the AI translation Tauri command(s) (in `src-tauri/src/commands/translation.rs`) to accept an engine choice (e.g., "ollama" or "deepl"). This might involve a new parameter or separate commands.
    *   Based on the choice, route the request to either the Ollama client (from Phase 2) or the new DeepL client.
3.  **UI for Engine Selection (Frontend):**
    *   Add UI elements (e.g., in a settings panel or a dropdown menu near the main translation controls) for the user to select their preferred translation engine (Ollama or DeepL).
    *   This choice should be stored (e.g., in Pinia state, persisted via `tauri-plugin-store`) and passed to the backend translation command.
    *   If DeepL is selected and the target language supports formality, show formality selection UI.

## Phase 6: Enhancements, Polish & Core UX Plugins

**Goal:** Improve usability, add more settings, implement deferred UX features (determinate progress, batch cancellation, Ollama model selection), and integrate key UX plugins.
**Definition of Done:** Specified enhancements are implemented and functional.

**Tasks:**

1.  **Translation History:**
    *   Store recent translations. If custom commands are needed (e.g., for complex queries with `tauri-plugin-sql`), they would reside in a new `src-tauri/src/commands/history.rs` module (to be declared). Otherwise, `tauri-plugin-store` might be used directly or via existing commands.
    *   UI panel to view, search, and reuse past translations.
2.  **User Settings UI:**
    *   Dedicated settings page/modal for:
        *   API Key management (for DeepL).
        *   Default source/target languages.
        *   Theme selection (Light/Dark - Nuxt UI provides this).
        *   Ollama Model Selection: UI to list and select from user's available Ollama models. This might require a backend Tauri command (e.g., in a new `src-tauri/src/commands/settings.rs` or `translation.rs`) to proxy the `GET /api/tags` request to Ollama if direct frontend calls are not preferred or if backend processing/caching is involved. Other backend settings commands would also go into `settings.rs`.
        *   (Future: Other offline engine settings if added).
    *   **Component Structure:** The settings UI will be organized into logical components such as:
        *   `SettingEngines.vue`: For selecting the AI translation engine (e.g., Ollama, DeepL) and configuring engine-specific settings like API keys.
        *   `SettingModels.vue`: For managing engine-specific model choices (e.g., selecting from available Ollama models).
        *   `SettingLanguages.vue`: For setting default source and target languages.
        *   (Potential) `SettingAppearance.vue`: For theme selection and other visual preferences.
3.  **Batch Process UX Enhancements:**
    *   Implement a **determinate progress indicator** (e.g., progress bar, percentage complete) for batch translation, requiring backend-to-frontend progress updates (e.g., via Tauri events).
    *   Implement a **cancellation feature** for ongoing batch translation processes. This would likely involve a new Tauri command or modification to existing commands in `src-tauri/src/commands/project.rs`.
    *   **Display Per-File String Counts:** After project string extraction, display a summary showing how many translatable strings were extracted from each processed game file. This involves backend logic to count strings per file and return this summary, and frontend UI to present it.
    *   **Implement Field-Specific Translation Prompts:** Enhance the AI translation logic to use different prompt templates based on the `json_path` (or derived field type like 'name', 'description', 'dialogue') of the text being translated. This will improve contextual accuracy.
        *   Prompt templates will be stored as individual text files (e.g., `name.txt`, `description.txt`, `default.txt`) within a `src-tauri/resources/prompts/` directory.
        *   The Rust backend (e.g., in `src-tauri/src/services/ollama_client.rs` or a dedicated prompt module) will use the `include_str!` macro to embed these prompt files at compile time.
        *   Logic will be implemented to select the appropriate loaded prompt template based on the field context and then format it with the necessary translation details (source/target language, text).
        *   **Identified Initial Prompt Categories (to be refined):** `Name` (for actors, items, skills), `Description` (items, skills), `Profile` (actors), `Nickname` (actors), `Note` (generic notes, needs careful handling of tags/code), `Dialogue` (event text), `ChoiceOption` (event choices), `SystemTerm` (UI text, system messages), `BattleMessage` (skill/item usage messages), and a `Default` prompt.
4.  **Integrate Optional Frontend Libraries:**
    *   `@vueuse/core` for keyboard shortcuts (e.g., Ctrl+Enter to translate) and clipboard copy.
    *   `@nuxtjs/i18n` if UI translation is prioritized.
5.  **Integrate Optional Backend Plugins:**
    *   `tauri-plugin-notification` for batch completion/errors.
    *   `tauri-plugin-log` for robust logging.
6.  **UI/UX Refinements (General):**
    *   Improve general loading states and error message consistency.
    *   Further refine user feedback mechanisms.
7.  **Application Updates (`tauri-plugin-updater`):**
    *   Set up server-side manifest and update packages.
    *   Configure and implement update checks and installation flow.

## Phase 7: Testing

**Goal:** Ensure application quality and reliability through comprehensive E2E testing, exploratory testing, and test coverage review.
**Definition of Done:** E2E tests for critical workflows pass. Exploratory testing is completed. Test coverage gaps are reviewed and addressed where critical.

**Tasks:**

1.  **End-to-End (E2E) Tests (Tauri WebDriver):**
    *   Cover critical user workflows:
        *   Single text translation (Ollama & DeepL, including formality with DeepL).
        *   RPG Maker MV project translation (full flow: select, detect, parse, batch translate, glossary application, ZIP).
        *   Glossary management.
        *   Settings changes (API key, default languages, Ollama model selection).
2.  **Exploratory Testing:**
    *   Manually test the application across different scenarios, inputs, and edge cases.
    *   Assess overall usability and user experience.
3.  **Test Coverage Review & Gap Filling:**
    *   Review coverage reports from unit/component tests (from Phases 1-6).
    *   Identify and implement tests for any critical uncovered areas.
4.  **Final System/Platform Testing (if multiple target platforms):**
    *   Test the packaged application on Windows, macOS, and Linux if feasible.


## Future Phases (Beyond MVP)

*   Support for other game engines (Unreal, Unity, Godot, etc.).
*   Support for other/more advanced offline AI models (e.g., embedded `rust-bert` or `ctranslate2`).
*   Advanced placeholder/variable recognition and preservation.
*   Real-time translation as user types.
*   Plugin system for users to add custom engine support or AI providers.
*   More sophisticated offline model management (in-app downloads, updates for embedded models).

This plan is a high-level guide and can be adjusted as development progresses. 