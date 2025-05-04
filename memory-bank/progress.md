# Game Translator Project: Progress Report

This document tracks the progress of the Game Translator desktop application, detailing completed work, files created/modified, and component interactions.

## Completed Phases

### Phase 1.1: Core Models & Setup (COMPLETE)
- ✅ Implemented core shared types
- ✅ Implemented translation-related types
- ✅ Implemented RPGMV Actors.json data structure
- ✅ Verified project setup

**Expected Results:**
- Tauri project structure properly set up and running
- Core data structures defined with type safety
- Models properly serializable/deserializable with serde
- Foundation ready for domain logic implementation

### Phase 1.2: Engine Detection & File Discovery (COMPLETE)
- ✅ Implemented RPGMV detection logic
- ✅ Implemented file system utilities
- ✅ Created engine detection service
- ✅ Exposed detection command
- ✅ Built frontend file selector UI

**Expected Results:**
- User can select a game folder through the UI
- System automatically detects if folder contains RPGMV game
- File scanner locates Actors.json file within the game directory
- Results displayed in UI with engine type and file paths
- Foundation for multi-file translation discovery established

### Phase 1.3: Translation Domain Logic & Provider Config (COMPLETE)
- ✅ Implemented Actors.json extraction/injection
- ✅ Defined translation provider interface
- ✅ Implemented basic prompt selection logic
- ✅ Created provider config validation service
- ✅ Exposed provider config commands
- ✅ Created provider config UI and persistence

**Expected Results:**
- System can extract translatable text fields from Actors.json with proper IDs/paths
- Provider interface defined for AI translation services
- Prompt selection logic chooses appropriate prompts based on field type
- User can configure Ollama provider settings (endpoint URL, model name)
- Configuration persists between app sessions
- UI provides validation feedback and error handling
- Foundation for translation workflow established

### Phase 1.4: Translation Infrastructure (COMPLETE)
- ✅ Setup Database Schema (Migration): Defined `translation_history` and `glossary` tables, created migration file, updated `lib.rs` to run migrations using `tauri-plugin-sql`.
- ✅ Setup Prompt Loading: Created `resources/prompts/` folder with placeholder files (`name.txt`, etc.), implemented loading function in `infrastructure/resources/prompt.rs`, updated `mod.rs` files.
- ✅ Setup Ollama API Client: Defined request/response structs in `infrastructure/api/ollama/models.rs`, implemented API client in `infrastructure/api/ollama/client.rs` targeting `/api/generate`, added necessary dependencies to `Cargo.toml`, updated `mod.rs` files, added integration tests (ignored by default).

### Phase 1.5: Translation Workflow (IN PROGRESS)
- ⏳ Implementation of Ollama translation provider
- ⏳ Implementation of Actors.json translation service
- ⏳ Implementation of translation command

**Expected Results:**
- Full end-to-end translation workflow for Actors.json
- Text extraction, API translation, and reinjection working
- Backend processes handle errors and retries
- Translation history recorded in database
- Command interface ready for frontend integration

### Phase 1.6: Frontend Translation UI & Integration (PLANNED)
- ⏳ Implementation of translation state management
- ⏳ Implementation of translation composables
- ⏳ Implementation of translation UI
- ⏳ Implementation of history and rollback features

**Expected Results:**
- Complete user experience for translating Actors.json
- UI displays translation progress with status indicators
- Results viewable in table/grid format
- Translation history accessible with rollback capability
- User can translate an entire Actors.json file with a few clicks

---

## Key Files & Folders Created/Modified (Phases 1.1 - 1.4)

This provides a more detailed summary of backend files touched during the initial phases, including module wiring.

**Phase 1.1 (Core Models & Setup):**
- Models:
  - `models/shared/errors.rs`
  - `models/translation/language.rs`
  - `models/translation/provider.rs`
  - `models/game/rpgmv/data/actors.rs`
- Module Wiring:
  - `models/shared/mod.rs`
  - `models/translation/mod.rs`
  - `models/game/rpgmv/data/mod.rs`
  - `models/game/rpgmv/mod.rs`
  - `models/game/mod.rs`
  - `models/mod.rs`

**Phase 1.2 (Engine Detection & File Discovery):**
- Domain:
  - `domain/game/common/engine.rs`
  - `domain/game/rpgmv/engine.rs`
- Infrastructure:
  - `infrastructure/game/fs.rs`
- Application:
  - `application/game/engine_detection.rs`
- Commands:
  - `commands/engine_detection.rs`
- Module Wiring:
  - `domain/game/common/mod.rs`
  - `domain/game/rpgmv/mod.rs`
  - `domain/game/mod.rs`
  - `infrastructure/game/mod.rs`
  - `application/game/mod.rs`
  - `commands/mod.rs`
  - `domain/mod.rs`
  - `infrastructure/mod.rs`
  - `application/mod.rs`
- Core Wiring:
  - `lib.rs` (Register `detect_engine_and_find_actors` command)

**Phase 1.3 (Translation Domain Logic & Provider Config):**
- Domain:
  - `domain/game/rpgmv/data/actors.rs` (Extraction/Injection logic)
  - `domain/translation/providers/base.rs`
  - `domain/translation/prompt/manager.rs`
- Application:
  - `application/settings/provider_service.rs`
- Commands:
  - `commands/config.rs`
- Module Wiring:
  - `domain/translation/providers/mod.rs`
  - `domain/translation/prompt/mod.rs`
  - `domain/translation/mod.rs`
  - `application/settings/mod.rs`
- Core Wiring:
  - `lib.rs` (Register config commands, Initialize `tauri-plugin-store`)
- Configuration:
  - `Cargo.toml` (Add `tauri-plugin-store`, `url`, `thiserror`)

**Phase 1.4 (Translation Infrastructure - History & API Client):**
- Migrations:
  - `migrations/1_initial_schema.sql`
- Infrastructure:
  - `infrastructure/api/ollama/models.rs`
  - `infrastructure/api/ollama/client.rs`
  - `infrastructure/resources/prompt.rs`
- Resources:
  - `resources/prompts/name.txt`
  - `resources/prompts/nickname.txt`
  - `resources/prompts/profile.txt`
  - `resources/prompts/note.txt`
- Module Wiring:
  - `infrastructure/api/ollama/mod.rs`
  - `infrastructure/api/mod.rs`
  - `infrastructure/resources/mod.rs`
- Core Wiring:
  - `lib.rs` (Initialize `tauri-plugin-sql` with migrations)
- Configuration:
  - `Cargo.toml` (Add `tauri-plugin-sql`, `reqwest`; Correct `thiserror`)

**Phase 1.5 (Translation Workflow - Actors Focus):**
- Application:
  - `application/translation/rpgmv/file_services/actors.rs`
- Module Wiring:
  - `application/translation/rpgmv/file_services/mod.rs`
  - `application/translation/rpgmv/mod.rs`

*(Note: This list includes key implementation files and module setup. Some `mod.rs` files might have been created in earlier phases but updated later.)*

---

## Detailed Implementation

### 1. Models Layer

#### 1.1 Shared Models
- **`models/shared/errors.rs`**: Implemented basic error types for the application

#### 1.2 Translation Models
- **`models/translation/language.rs`**: Created Language enum with Japanese, English, and French variants
- **`models/translation/provider.rs`**: Implemented ProviderConfig struct for Ollama endpoint configuration

#### 1.3 Game Models
- **`models/game/rpgmv/data/actors.rs`**: Implemented full Actor struct mirroring Actors.json file format
  - Added serialization/deserialization support
  - Marked translatable fields: name, nickname, profile, note
- **`models/game/rpgmv/data/mod.rs`**: Export for actors module
- **`models/game/rpgmv/mod.rs`**: Export for data module
- **`models/game/mod.rs`**: Export for rpgmv module

### 2. Domain Layer

#### 2.1 Game Domain
- **`domain/game/common/engine.rs`**: Defined EngineDetector trait with detect() and name() methods
- **`domain/game/rpgmv/engine.rs`**: Implemented RpgmvDetector that checks for www folder and rpg_core.js

#### 2.2 RPG Maker MV Data Operations
- **`domain/game/rpgmv/data/actors.rs`**: Implemented extraction and injection logic
  - Created TranslatableField and Translation structs for data transfer
  - Defined FieldType enum to categorize different text types (Name, Nickname, Profile, Note)
  - Added `#[derive(Copy, Clone)]` to `FieldType` to fix linter error in provider.
  - Added extract_actors_from_file() and inject_actors_to_file() functions
  - Added extract_translatable_fields() to extract all translatable content with IDs
  - Added inject_translations() to apply translations back to the model
  - Added comprehensive test coverage

#### 2.3 Translation Domain
- **`domain/translation/providers/base.rs`**: Defined `TranslationProvider` trait with `translate` and `translate_fields` methods, including `FieldType` parameter for context.
- **`domain/translation/prompt/manager.rs`**: Created prompt management system using `PromptTemplate` and `PromptManager`.
- **`domain/translation/providers/ollama.rs`**: Implemented `TranslationProvider` trait for Ollama:
  - Struct holds `OllamaClient` and `model_name`.
  - `translate` method loads prompts via `infrastructure::resources::prompt::load_prompt_template`, formats them, calls `OllamaClient::generate`, and maps errors.
  - Fixed `no method named to_code found for enum Language` linter error by calling the existing `Language::code()` method during prompt formatting.
  - Fixed `cannot move out of field.field_type` linter error by adding `#[derive(Copy, Clone)]` to `FieldType` enum in `actors.rs`.
  - `translate_fields` method provides basic sequential batching.
  - Replaced mock logic with real implementation using infrastructure components.
  - Updated tests to be integration tests (`#[ignore]`) requiring a running Ollama instance.

### 3. Infrastructure Layer

#### 3.1 Game Infrastructure
- **`infrastructure/game/fs.rs`**: Implemented file system utilities
  - Added scan_dir_recursive() function to enumerate files
  - Added path_exists() to check file/directory existence
  - Added find_file_in_project() to locate specific files in project directory

### 4. Application Layer

#### 4.1 Game Application
- **`application/game/engine_detection.rs`**: Created engine detection service
  - Implemented detect_engine_for_folder() to identify RPGMV games
  - Added logic to find Actors.json file
  - Returns structured results with engine type and actors path

#### 4.2 Settings Application
- **`application/settings/provider_service.rs`**: Created provider configuration validation
  - Implemented OllamaProviderConfig with endpoint_url and model_name
  - Created ProviderValidationError for proper error handling
  - Implemented validate_ollama_config() for Ollama-specific validation
  - Created ProviderConfig enum to support multiple provider types
  - Added validate_provider_config() as a generic entry point
  - Added URL validation using the url crate

### 5. Commands Layer

#### 5.1 Engine Detection
- **`commands/engine_detection.rs`**: Created Tauri command for engine detection
  - Implemented detect_engine_and_find_actors command
  - Exposes backend functionality to frontend via Tauri IPC

#### 5.2 Provider Configuration
- **`commands/config.rs`**: Created Tauri commands for provider configuration
  - Implemented validate_provider_config() to validate configurations
  - Implemented get_default_provider_config() to provide sensible defaults
  - Added proper error transformation for frontend consumption

### 6. Integration (lib.rs)
- **`lib.rs`**: Updated to register commands
  - Added invoke_handler for detect_engine_and_find_actors command
  - Added invoke_handler for validate_provider_config command
  - Added invoke_handler for get_default_provider_config command
  - Initialized tauri_plugin_store for saving configuration

### 7. Frontend Layer

#### 7.1 Composables
- **`composables/useEngineDetection.ts`**: Created composable for engine detection
  - Implemented detectEngine() function to call Tauri command
  - Added proper typing and error handling

#### 7.2 Components
- **`components/FileSelector.vue`**: Built file selection UI
  - Added folder selection using Tauri dialog API
  - Integrated with useEngineDetection composable
  - Displays detection results and Actors.json status
  - Emits path and detection results to parent components
  
- **`components/ProviderConfigEditor.vue`**: Created provider configuration UI
  - Built a form for Ollama endpoint URL and model name inputs
  - Added validation feedback and error handling
  - Implemented save and reset functionality
  - Used Nuxt UI components for consistent design (UCard, UFormGroup, UInput, UButton, UAlert)
  - Integrated with providerConfig Pinia store for state management

#### 7.3 Pages
- **`pages/index.vue`**: Updated main page
  - Integrated FileSelector component
  - Added conditional UI for showing game readiness
  - Created placeholder for translation start button

#### 7.4 Stores
- **`stores/providerConfig.ts`**: Implemented Pinia store for provider configuration
  - Created state for config, loading, and error handling
  - Added actions for initializing, saving, validating, and resetting configuration
  - Implemented Tauri Store plugin integration for persistence
  - Added proper type conversion between frontend and backend formats
  - Included error handling and loading states
  - Fixed Tauri v2 API import paths

---

## Component Interactions

### Engine Detection Flow
1. **User Interaction**: User selects a folder in FileSelector component
2. **Frontend to Backend**: useEngineDetection composable calls detect_engine_and_find_actors Tauri command
3. **Command Processing**: commands/engine_detection.rs routes request to application layer
4. **Application Logic**: application/game/engine_detection.rs orchestrates detection:
   - Uses domain/game/rpgmv/engine.rs to detect RPGMV engine
   - Uses infrastructure/game/fs.rs to check files and find Actors.json
5. **Result Handling**: Detection results flow back to frontend
6. **UI Update**: FileSelector displays results, main page shows game readiness

### Provider Configuration Flow
1. **User Interaction**: User fills out form in ProviderConfigEditor component
2. **Form Submission**: User clicks Save button, triggering onSubmit handler
3. **Store Action**: providerConfig store saveConfig action is called
4. **Validation**: Frontend calls backend validation via Tauri command
5. **Backend Validation**: application/settings/provider_service.rs validates configuration
6. **Persistence**: If valid, configuration is saved to Tauri Store
7. **UI Update**: ProviderConfigEditor shows success/error messages

### Translation Data Flow (Implemented Components)
1. **Data Extraction**: domain/game/rpgmv/data/actors.rs extracts translatable fields
2. **Prompt Selection**: domain/translation/prompt/manager.rs selects appropriate prompts
3. **Provider Interface**: domain/translation/providers/base.rs defines how translation providers should work
4. **Translation Processing**: (Not yet implemented) Provider will translate text using the prompts
5. **Result Injection**: domain/game/rpgmv/data/actors.rs injects translations back into the model

---

## Technical Challenges & Solutions

### Serialization for Tauri Commands
When integrating the engine detection function with Tauri commands in lib.rs, we encountered an error:
```
the method `async_kind` exists for reference `&impl Future<Output = Result<EngineDetectionResult, String>>`, but its trait bounds were not satisfied
```

**Root Cause**: The `EngineDetectionResult` struct was not properly serializable for Tauri's IPC mechanism.

**Solution**: Added `#[derive(Serialize)]` to the `EngineDetectionResult` struct in application/game/engine_detection.rs:
```rust
#[derive(Serialize)]
pub struct EngineDetectionResult {
    pub engine: Option<String>,
    pub error: Option<String>,
    pub actors_path: Option<PathBuf>,
}
```

This allowed Tauri to properly serialize the result for transmission to the frontend JavaScript environment.

### TypeScript Errors in Pinia Store (`providerConfig.ts`)
While implementing the Pinia store (`stores/providerConfig.ts`) to manage provider configuration and interact with the Tauri Store plugin, several TypeScript errors occurred:

*   **Type Mismatch**: A custom `ProviderStore` interface was created, but its method signatures (specifically the return type of `get`) didn't perfectly match the actual `Store` type imported from `@tauri-apps/plugin-store`.
*   **Nullability Issues**: The TypeScript compiler flagged potential errors where `store.value` (the ref holding the Store instance) might be `null` when its methods (`.get()`, `.set()`) were called, even within `try...catch` blocks where it was assigned.
*   **`any` Type**: The custom interface used `any`, which bypasses type safety.

**Root Cause**: Incorrectly defining a custom interface instead of using the official type from the plugin, and the compiler needing explicit confirmation that the store ref was non-null before use.

**Solution**:
1.  Removed the redundant custom `ProviderStore` interface.
2.  Imported the official `Store` type using `import type { Store } from '@tauri-apps/plugin-store';`.
3.  Updated the `store` ref type to `ref<Store | null>(null)`.
4.  Added explicit `null` checks (`if (!store.value) ...`) before accessing `store.value.get()` or `store.value.set()` within the action methods (`init`, `saveConfig`, `resetToDefaults`).
5.  Refined error message handling in `validateConfig` to better capture errors from the backend `invoke` call.

This resolved the type errors and ensured the store logic correctly handles the asynchronous loading and potential null state of the Tauri Store instance.

### Tauri v2 API Import Path Changes
While implementing the provider configuration store, we encountered errors with the Tauri invoke API import path:

**Root Cause**: Used the outdated Tauri v1 import path `import { invoke } from '@tauri-apps/api/tauri'` instead of the correct Tauri v2 path.

**Solution**: Updated the import to use the correct Tauri v2 path: `import { invoke } from '@tauri-apps/api/core'` as per the [official Tauri documentation](https://tauri.app/develop/calling-rust/).

This fixed the TypeScript import errors and ensured compatibility with Tauri v2's new module structure.

### Nuxt UI Color Naming Conventions
When implementing the ProviderConfigEditor component, TypeScript errors occurred related to color prop values:

**Root Cause**: Used generic color names like "green", "red", "yellow" instead of the semantic color names required by Nuxt UI components.

**Solution**: Updated all color props to use the Nuxt UI semantic color system:
- Changed "green" to "success"
- Changed "red" to "error"
- Changed "yellow" to "warning"
- Changed "gray" to "neutral"

This resolved the TypeScript errors and ensured proper styling according to the Nuxt UI design system.

---

## Next Steps

- Begin Phase 1.5 (Translation Workflow):
  - **Priority 1: Implement Ollama `TranslationProvider`** - **DONE**
    - Create `src-tauri/src/domain/translation/providers/ollama.rs`. - DONE
    - Define `OllamaProvider` struct. - DONE
    - Implement `TranslationProvider` trait for the struct, using the `OllamaClient` and prompt loading infrastructure. - DONE
  - **Priority 2: Implement `Actors.json` Translation Service** - **NEXT**
    - Create `src-tauri/src/application/translation/rpgmv/file_services/actors.rs`.
    - Implement service logic to coordinate extraction, translation (using `OllamaProvider`), and history saving.
  - **Priority 3: Implement Translation Command**
    - Create `src-tauri/src/commands/translation.rs`.
    - Define `translate_actors` command to trigger the `actors_service`.
