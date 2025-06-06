# Project Progress - AI Game Translator

Last Updated: {{Current Date/Time}} <!-- Replace with actual date/time -->

## Overall Status:
Phase 1 (Project Setup & Core UI Shell for Project Translation) is complete. Core technology stack is defined, essential frontend/backend dependencies are configured, Tauri plugins are registered, the basic UI shell for project selection is implemented with Pinia state management (`stores/project.ts`), Nuxt configuration is optimized, and Inter-Process Communication (IPC) between frontend and backend is verified. 

**Single-Text Translation Feature (Phase 2 from original plan) has been REMOVED/DEFERRED to prioritize batch project translation.** The backend Ollama client and associated Tauri command (`translate_text_command`) might be reused or adapted if this feature is re-introduced.

**Backend Refactoring Complete:** The Rust backend command structure has been reorganized. Commands are now in the `src-tauri/src/commands/` directory, with modules like `project.rs` and `translation.rs`. The `translate_text_command` has been moved to `commands::translation` and `lib.rs` updated accordingly.

## Completed Milestones:

*   **Documentation & Planning:** (All initial docs created and updated as needed - will be updated again to reflect removal of single-text translation)
    *   Comprehensive **App Design Document** (`@memory-bank/translator_app_design_document.md`).
    *   **Recommended Tech Stack** (`@memory-bank/recommended_tech_stack.md`).
    *   Initial **Implementation Plan** (`@memory-bank/implementation_plan.md`).
    *   **Architecture Overview** (`@memory-bank/architecture.md`).
    *   **Frontend Architecture** (`@memory-bank/frontend_architecture.md`).
    *   Associated Cursor memory bank rules established and updated.

*   **Phase 1: Project Setup & Core UI Shell (Focus on Project Translation - COMPLETE):**
    *   Basic Nuxt 3 project structure established.
    *   **Frontend Dependencies (`package.json`):** Verified, updated, and refined.
    *   **Backend Dependencies & Setup (`src-tauri`):** Core crates and Tauri plugins configured and registered.
    *   **Nuxt Configuration (`nuxt.config.ts`):** Optimized for Tauri integration, resolved CSS loading issues.
    *   **Core UI Implementation (`pages/index.vue`):** UI for project selection via `ProjectSelector.vue` implemented.
    *   **Frontend State Management (Pinia):** `stores/project.ts` created (Setup Stores) and integrated for project workflow. (`stores/translation.ts` to be reviewed/removed).
    *   **IPC Test:** Successfully verified communication between Nuxt frontend and Rust backend (`simple_ipc_test` command).

*   **Phase 2: Core Single-Text Translation (Offline AI - Ollama) (REMOVED/DEFERRED)**
    *   (Details of completed sub-tasks for this phase are now moot as the feature is deferred. The `translate_text_command` and Ollama client in Rust exist but are not currently used by the frontend.)

*   **Backend Code Structure Refactoring (Part of initiating original Phase 3):**
    *   Created `src-tauri/src/commands/mod.rs` to manage command modules.
    *   Created `src-tauri/src/commands/project.rs` for project-related commands.
    *   Created `src-tauri/src/commands/translation.rs`.
    *   Moved `translate_text_command` from `lib.rs` to `commands::translation::translate_text_command`.
    *   Updated `lib.rs` to declare the `commands` module and correctly reference the moved command in the `invoke_handler`.
    *   Updated `implementation_plan.md` to reflect the new `.rs` file naming convention (e.g., `project.rs` instead of `project_commands.rs`).

*   **Frontend Refactoring - Layout & Header (Part of initiating original Phase 3):**
    *   Created `components/AppHeader.vue` with application title and a placeholder settings button.
    *   Created `layouts/default.vue` and integrated `AppHeader.vue` into it, establishing a basic page structure with a header and main content slot.
    *   Refined `layouts/default.vue` to leverage Nuxt 3's auto-import for components (removed explicit `AppHeader` import).

*   **Frontend Refactoring - Page Structure (Part of initiating original Phase 3 - Now Refocused):**
    *   `components/SingleTextTranslator.vue` and its integration into `pages/index.vue` have been removed.
    *   `components/ProjectSelector.vue` (formerly `ProjectTranslator.vue`) created for project selection.
    *   `pages/index.vue` now focuses on `ProjectSelector.vue`.
*   **Original Phase 3, Task 1: Project Selection (Rust & Frontend) (COMPLETE):**
    *   Implemented `select_project_folder_command` in `src-tauri/src/commands/project.rs`.
    *   Created Pinia store `stores/project.ts` (using Setup Store syntax) with state and actions for folder selection.
    *   Connected store to `components/ProjectTranslator.vue` for UI interaction.
*   **Original Phase 3, Task 2: RPG Maker MV Project Detection (Rust Backend) (COMPLETE):**
    *   Core detection logic moved to `core::game_detection` module.
    *   `select_project_folder_command` returns path and detection result.
    *   Frontend store and component updated to handle and display detection status.
*   **Original Phase 3, Task 3: File Parsing & String Extraction (Rust Backend) (COMPLETE):**
    *   The `extract_project_strings_command` is defined in `commands/project.rs` and registered.
    *   RPG Maker MV parsing module structure implemented in `src-tauri/src/core/rpgmv/`.
    *   All planned RPG Maker MV JSON file parsers (`Actors`, `Items`, `Armors`, `Weapons`, `Skills`, `Enemies`, `CommonEvents`, `Troops`, `System`, `MapXXX`, `MapInfos`, `Classes`, `States`) and associated refactorings for string extraction are implemented. (`Tilesets.json` parsing deferred).
    *   The core dispatch logic in `src-tauri/src/core/rpgmv/project.rs` (function `extract_translatable_strings_from_project`) now correctly calls all individual file parsers.
    *   **Integration Testing for Parsers (COMPLETE):**
        *   All Rust integration tests for individual RPG Maker MV JSON file types (`Actors.json`, `Armors.json`, `Classes.json`, `CommonEvents.json`, `Enemies.json`, `Items.json`, `MapInfos.json`, `MapXXX.json`, `Skills.json`, `States.json`, `System.json`, `Troops.json`, `Weapons.json`) have been successfully refactored into separate files under `src-tauri/src/tests/integration/`.
        *   The common helper function `setup_and_extract_all_strings` has been centralized in `src-tauri/src/tests/common_test_utils.rs`.
        *   All 18 tests are confirmed PASSING after these refactorings.

## Current Focus (Effectively New Phase 2):

*   **RPG Maker MV Project Translation (Batch) - (Formerly Phase 3)**
    *   **Task 4: Frontend for Batch Workflow (Refactored - Core Structure COMPLETE):**
        *   `stores/settings.ts` created to manage `languageOptions` and `engineOptions`. **(COMPLETE)**.
        *   `stores/project.ts` focuses on project selection, detection, string extraction, navigation, and now also manages the state and actions for the final ZIP output (reconstruction, packaging, saving, opening folder). Its `$reset()` calls `translationStore.$resetBatchState()`. Imports types from `~/types/project.ts` and `~/types/translation.ts`. **(COMPLETE)**.
        *   `stores/translation.ts` now focuses solely on the batch translation operation (state for loading, results, errors) and its specific reset. Imports types from `~/types/translation.ts`. **(COMPLETE)**.
        *   Created `types/` directory to house shared TypeScript interfaces/types. **(COMPLETE)**
            *   `types/translation.ts` created with `SourceStringData` (formerly `TranslatableStringEntry`) and `WorkingTranslation` (formerly `TranslatedStringEntry`) interfaces.
            *   `types/project.ts` created with `RpgMakerDetectionResultType`.
            *   `types/setting.ts` created with `LanguageOption` and `EngineOption` interfaces (moved from `stores/settings.ts`). **(COMPLETE)**
        *   `pages/index.vue` uses `ProjectSelector.vue`. **(COMPLETE)**.
        *   `ProjectSelector.vue` triggers extraction via `projectStore`. **(COMPLETE)**.
        *   `ProjectStringsReview.vue` uses `projectStore` for strings, `settingsStore` for options, and `translationStore` for batch action/state. **(COMPLETE)**.
        *   `ProjectStringsResult.vue` uses `translationStore` for results, and `projectStore` for ZIP output actions/state. **(COMPLETE)**.
        *   `pages/project.vue` orchestrates review/results using all three stores as needed. **(COMPLETE)**.
    *   **Task 5: Batch Translation Logic (Manual Testing & Refinement - COMPLETE):**
        *   Successfully completed manual testing of the end-to-end project selection, string extraction, review, batch translation (Ollama), and results display workflow with the refactored UI components.
        *   Core functionality is verified. UI/UX is deemed acceptable for this stage.
        *   Minor UI polish (e.g., transitions, disabling more elements during loading) noted for future enhancement (Phase 6).
        *   Error handling for Ollama unavailability and invalid project paths confirmed.
        *   Performance observation: Ollama translation can become slow when processing a very large number of strings (e.g., >1000). This will be a consideration for future optimization (Phase 6 or later).
        *   Some specific error conditions (e.g., individual string translation errors, corrupted project files) were not tested due to lack of specific test data but can be addressed later if encountered or during more targeted testing phases.
    *   **Task 6: Reconstruct Translated Files (Rust):**
        *   **Sub-Task 6.1: Define `WorkingTranslation` (formerly `TranslatedStringEntryFromFrontend`) Struct (Rust) - COMPLETE**
        *   **Sub-Task 6.2: Implement `reconstruct_translated_project_files` Tauri Command (Rust) - COMPLETE - Basic command structure with placeholder logic**
        *   **Sub-Task 6.3: Implement Core Reconstruction Logic Dispatcher (Rust) - COMPLETE - Dispatcher implemented; specific reconstructor calls are placeholders returning `CoreError::Unimplemented`**
        *   Sub-Task 6.4: Implement Specific Reconstructor Functions (Rust)
            *   `Actors.json` reconstructor: COMPLETE (includes `note` field, uses `update_value_at_path` helper, unit tests passed)
            *   `Items.json` reconstructor: COMPLETE (uses `update_value_at_path` helper, unit tests passed)
            *   `Armors.json` reconstructor: COMPLETE (uses `update_value_at_path` helper, unit tests passed)
            *   `Weapons.json` reconstructor: COMPLETE (uses `update_value_at_path` helper, unit tests passed)
            *   `Skills.json` reconstructor: COMPLETE (uses `update_value_at_path` helper, unit tests passed)
            *   `Enemies.json` reconstructor: COMPLETE (uses `update_value_at_path` helper, unit tests passed)
            *   `CommonEvents.json` reconstructor: COMPLETE (uses `update_value_at_path` for name, `reconstruct_event_command_list` helper for list, unit tests passed)
            *   `Troops.json` reconstructor: COMPLETE (uses `update_value_at_path` for name, `reconstruct_event_command_list` helper for pages, unit tests passed)
            *   `System.json` reconstructor: COMPLETE (uses `update_value_at_path` helper for all fields, unit tests passed)
            *   `MapInfos.json` reconstructor: COMPLETE (uses `update_value_at_path` helper for name, unit tests passed)
            *   `Classes.json` reconstructor: COMPLETE (uses `update_value_at_path` helper for name, note, and learnings notes, unit tests passed)
            *   `States.json` reconstructor: COMPLETE (uses `update_value_at_path` helper for name, note, and messages, unit tests passed)
            *   `MapXXX.json` reconstructor: COMPLETE (uses `update_value_at_path` for event names, `reconstruct_event_command_list` helper for event command lists, unit tests passed)
            *   All planned reconstructors complete (`Tilesets.json` reconstruction deferred as its parsing was deferred).
        *   **Sub-Task 6.5: Implement `serde_json::Value` Navigation/Update Helper (Rust) - COMPLETE - Initial version with basic path handling and tests implemented in `utils/json_utils.rs`**
        *   **Sub-Task 6.6: Implement `reconstruct_event_command_list` Helper (Rust) - COMPLETE - Helper function in `core/rpgmv/common.rs` for reconstructing event command lists, used by `CommonEvents.json` and future event-based files.**
        *   **Sub-Task 6.7: Refactor Reconstruction Logic (Rust) - COMPLETE**
            *   Added generic `reconstruct_json_generically` function to `core/rpgmv/common.rs`.
            *   Added generic `reconstruct_object_array_by_id` function to `core/rpgmv/common.rs`.
            *   Added generic `reconstruct_object_array_by_path_index` function to `core/rpgmv/common.rs`.
            *   Refactored the following files to use the new common reconstruction functions:
                *   `actors.rs` (uses `reconstruct_object_array_by_id`)
                *   `items.rs` (uses `reconstruct_object_array_by_id`)
                *   `armors.rs` (uses `reconstruct_object_array_by_id`)
                *   `weapons.rs` (uses `reconstruct_object_array_by_id`)
                *   `skills.rs` (uses `reconstruct_object_array_by_id`)
                *   `enemies.rs` (uses `reconstruct_object_array_by_id`)
                *   `classes.rs` (uses `reconstruct_object_array_by_path_index`)
                *   `map_infos.rs` (uses `reconstruct_object_array_by_path_index`)
                *   `states.rs` (uses `reconstruct_object_array_by_path_index`)
                *   `system.rs` (uses `reconstruct_json_generically`)
            *   The following files retain their specific reconstruction logic (which internally use `reconstruct_event_command_list` helper where appropriate) due to their more complex, nested structures:
                *   `common_events.rs`
                *   `troops.rs`
                *   `maps.rs`
            *   The main dispatcher `core::rpgmv::project::reconstruct_file_content` correctly calls the refactored or specific reconstruction functions. All relevant unit tests are passing.
        *   **Sub-Task 6.8: Implement `reconstruct_translated_project_files` Tauri Command (Rust) - COMPLETE - Basic command structure with placeholder logic**
        *   **Sub-Task 6.9: Implement Core Reconstruction Logic Dispatcher (Rust) - COMPLETE - Dispatcher implemented; specific reconstructor calls are placeholders returning `CoreError::Unimplemented`**
        *   Sub-Task 6.10: Implement Specific Reconstructor Functions (Rust)
            *   `Actors.json` reconstructor: COMPLETE (includes `note` field, uses `update_value_at_path` helper, unit tests passed)
            *   `Items.json` reconstructor: COMPLETE (uses `update_value_at_path` helper, unit tests passed)
            *   `Armors.json` reconstructor: COMPLETE (uses `update_value_at_path` helper, unit tests passed)
            *   `Weapons.json` reconstructor: COMPLETE (uses `update_value_at_path` helper, unit tests passed)
            *   `Skills.json` reconstructor: COMPLETE (uses `update_value_at_path` helper, unit tests passed)
            *   `Enemies.json` reconstructor: COMPLETE (uses `update_value_at_path` helper, unit tests passed)
            *   `CommonEvents.json` reconstructor: COMPLETE (uses `update_value_at_path` for name, `reconstruct_event_command_list` helper for list, unit tests passed)
            *   `Troops.json` reconstructor: COMPLETE (uses `update_value_at_path` for name, `reconstruct_event_command_list` helper for pages, unit tests passed)
            *   `System.json` reconstructor: COMPLETE (uses `update_value_at_path` helper for all fields, unit tests passed)
            *   `MapInfos.json` reconstructor: COMPLETE (uses `update_value_at_path` helper for name, unit tests passed)
            *   `Classes.json` reconstructor: COMPLETE (uses `update_value_at_path` helper for name, note, and learnings notes, unit tests passed)
            *   `States.json` reconstructor: COMPLETE (uses `update_value_at_path` helper for name, note, and messages, unit tests passed)
            *   `MapXXX.json` reconstructor: COMPLETE (uses `update_value_at_path` for event names, `reconstruct_event_command_list` helper for event command lists, unit tests passed)
            *   All planned reconstructors complete (`Tilesets.json` reconstruction deferred as its parsing was deferred).
        *   **Sub-Task 6.11: Implement `serde_json::Value` Navigation/Update Helper (Rust) - COMPLETE - Initial version with basic path handling and tests implemented in `utils/json_utils.rs`**
        *   **Sub-Task 6.12: Implement `reconstruct_event_command_list` Helper (Rust) - COMPLETE - Helper function in `core/rpgmv/common.rs` for reconstructing event command lists, used by `CommonEvents.json` and future event-based files.**
        *   **Sub-Task 6.13: Refactor Backend Data Structures & Parsers/Reconstructors (Rust) - COMPLETE**
            *   Renamed `TranslatableStringEntry` to `SourceStringData` and `TranslatedStringEntryFromFrontend` to `WorkingTranslation` in `models/translation.rs`.
            *   All RPG Maker MV file parser modules in `core/rpgmv/` (actors, armors, classes, common_events, enemies, items, map_infos, maps, skills, states, system, troops, weapons) and the main `core/rpgmv/project.rs` dispatcher have been updated to use these new structs and their fields.
            *   Associated unit tests for all parsers and reconstructors have been updated and are passing. This includes resolving all linter errors in integration test files (e.g., `actors_test.rs`, `common_test_utils.rs`, `enemies_test.rs`, etc.) and shared test utilities stemming from the rename of `TranslatableStringEntry` to `SourceStringData` and its field `text` to `original_text`.
            *   Generic reconstruction helpers in `core/rpgmv/common.rs` (`reconstruct_json_generically`, `reconstruct_object_array_by_id`, `reconstruct_object_array_by_path_index`) now correctly use `WorkingTranslation`.
            *   The main dispatcher `core::rpgmv::project::reconstruct_file_content` correctly calls the refactored or specific reconstruction functions using `WorkingTranslation`.
    *   **Task 7: ZIP Archive Creation (Rust): COMPLETE**
        *   Implemented ZIP creation using the `zip` crate (`zip = "4.0.0"` already in `Cargo.toml`).
        *   Created `src-tauri/src/services/zip_service.rs` with `create_zip_archive_from_memory` function.
        *   Unit tests for `zip_service.rs` are passing.
        *   `create_zip_archive_from_memory` takes `HashMap<String, String>` (relative_path: content) and output path.
        *   ZIP structure is Option A (no top-level project folder, `www/data/...` directly at ZIP root).
        *   Updated `reconstruct_translated_project_files` command in `commands/project.rs` to use this service.
        *   Command outputs ZIP to a fixed path (`src-tauri/target/translated_project_output.zip`) for now.
    *   **Task 8: Save & Show Output (Frontend & Rust): COMPLETE**
        *   Frontend UI in `ProjectStringsResult.vue` enables "Save Project ZIP" and "Show in Folder" buttons, interacting with `projectStore`.
        *   Pinia store `stores/project.ts` (formerly `stores/translation.ts` for this part) now manages state (`tempZipPath`, `finalZipSavedPath`, `saveZipError`, `openFolderError`, `isLoadingSaveZip`) and actions (`saveProjectZip`, `showProjectZipInFolder`).
        *   Backend `save_zip_archive_command` in `commands/project.rs` uses `tauri-plugin-dialog` for user to select save destination and moves the ZIP.
        *   Backend `open_folder_command` in `commands/project.rs` uses `tauri-plugin-opener` to show the ZIP in the file explorer.
        *   Error handling and user feedback via toasts are implemented for these operations.

*   **Phase 4: Glossary Feature (New Current Focus)**
    *   **Task 1: Glossary Data Management (Rust & `tauri-plugin-store`): IN PROGRESS**
        *   Detailed planning complete with the following approach:
            *   **Data Structure Design:** Will create `GlossaryEntry` (with unique ID, source/target text, language codes, timestamps) and `NewGlossaryEntryData` structs in a new `models/glossary.rs` file.
            *   **Storage Strategy:** Will use `tauri-plugin-store` to persist a `Vec<GlossaryEntry>` under a single key.
            *   **Command Structure:** Will implement four Tauri commands in a new `commands/glossary.rs` file:
                *   `add_glossary_entry_command` - Creates a new entry with a UUID and timestamps.
                *   `get_glossary_entries_command` - Retrieves all entries or an empty Vec.
                *   `update_glossary_entry_command` - Updates an existing entry by ID.
                *   `delete_glossary_entry_command` - Removes an entry by ID.
            *   **Implementation Status:** Initial planning phase complete, implementation pending.
        *   **Revised Approach:** The glossary will be used to enhance AI prompts rather than for exact-match replacements. This is more practical for real-world translation needs, especially for languages like Japanese where conjugation and sentence structure make exact matches rare.
            *   **Prompt Enhancement:** Glossary entries will be searched for relevant terms that appear within the source text, and these will be added to the AI prompt as specific translation guidelines.
            *   **Example:** For terms like "マンコ -> pussy", the AI will be explicitly instructed to use this translation when the term appears in any context, ensuring consistent and accurate handling of sensitive or specialized terminology.
            *   **Benefits:** This approach handles slang, vulgar terms, game-specific terminology, and cultural references more effectively, even when they appear in various forms or within larger sentences.

## Next Major Goals (Adjusted from Implementation Plan):

1.  **Complete Phase 4: Glossary Feature**
    *   Task 1: Glossary Data Management (Rust) - In Progress
    *   Task 2: Glossary UI (Frontend)
    *   Task 3: Integrate Glossary with AI Prompting (replacing the pre-check mechanism)
    *   Task 4: UI Indication for Glossary Term Usage
2.  **Phase 5: Integrate DeepL Online AI API**
3.  **Phase 6: Enhancements, Polish & Core UX Plugins**

## Pending Clarifications / Blockers:
*   User feedback on testing integration within the implementation plan.
*   Answers to outstanding questions (ZIP Path Preservation, DeepL Specifics, Definition of Done).
*   Confirmation of local Ollama setup (Ollama running, `mistral` model pulled) - *Still relevant for batch translation via Ollama*.

## Future Enhancements/Considerations (Deferred from earlier phases):
*   Address double line break issue from Ollama for Japanese translations (deferred from original Phase 2, still relevant if Ollama is used for batch).
*   **Evolve AI Prompting (Phase 6 Plan):** The current generic AI prompt (seen in `ollama_client.rs`) is planned to be significantly enhanced in Phase 6. This involves implementing a system for dynamically selecting field-specific prompt templates (from `src-tauri/resources/prompts/`) based on text context (e.g., `json_path`) to improve contextual translation accuracy before sending requests to the AI engine.
*   (Re-introduction of Single-Text Translation feature can be considered later if desired).
*   Detailed UI component structure for the Settings page (Phase 6 of implementation plan) to include `SettingEngines.vue`, `SettingModels.vue`, `SettingLanguages.vue`, and potentially `SettingAppearance.vue` for better organization of user configurations.
