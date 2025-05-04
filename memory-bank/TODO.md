# MVP TODO (Phase 1 - Vertical Slice: Actors.json First)

## Phase 1.1: Core Models & Setup (Actors Focus)
- [x] **Models:** Define core shared types. # [models/shared]
  - [x] `models/shared/errors.rs`: Basic error enum/structs.
- [x] **Models:** Define translation-related types. # [models/translation]
  - [x] `models/translation/language.rs`: Enum for supported languages (JP, EN, FR).
  - [x] `models/translation/provider.rs`: Struct for `ProviderConfig` (Ollama endpoint).
- [x] **Models:** Define RPGMV `Actors.json` data structure. # [models/game/rpgmv/data]
  - [x] `actors.rs`: Full `Actor` struct mirroring `Actors.json`, derive serde, mark translatable fields (name, nickname, profile, note).
  - [x] `mod.rs` files in `models/game/rpgmv/data`, `models/game/rpgmv`, `models/game`: Export actors module.
- [x] **Project Setup:** Ensure basic Tauri project structure is present.

## Phase 1.2: Engine Detection & File Discovery (Actors Focus)
- [x] **Domain:** Implement RPGMV detection logic. # [domain/game/rpgmv]
  - [x] `domain/game/common/engine.rs`: Define `EngineDetector` trait.
  - [x] `domain/game/rpgmv/engine.rs`: Implement `RpgmvDetector` checking `www` folder and `www/js/rpg_core.js`.
- [x] **Infrastructure:** File system utilities. # [infrastructure/game]
  - [x] `infrastructure/game/fs.rs`: Function `path_exists(path)`.
  - [x] `infrastructure/game/fs.rs`: (Optional) Function `find_file_in_project(root, pattern)` e.g., find `Actors.json`.
- [x] **Application:** Service to orchestrate detection and find `Actors.json`. # [application/game]
  - [x] `application/game/engine_detection.rs`: Service using domain logic and infrastructure scanner to detect RPGMV and identify path to `Actors.json`.
- [x] **Commands:** Expose detection/scan. # [commands/]
  - [x] `commands/engine_detection.rs`: Tauri command `detect_engine_and_find_actors(path)` calling the service.
- [x] **Frontend:** Basic file selector UI. # [frontend/]
  - [x] `composables/useEngineDetection.ts`: Composable calling backend command.
  - [x] `components/FileSelector.vue`: UI to select folder, call composable, display detection result.

## Phase 1.3: Translation Domain Logic & Provider Config (Actors Focus)
- [x] **Domain:** Implement `Actors.json` extraction/injection. # [domain/game/rpgmv/data]
  - [x] `domain/game/rpgmv/data/actors.rs`: Implement logic to extract translatable fields (with identifiers like `actors[1].name`) and inject translated text back into the `Actor` model.
- [x] **Domain:** Define core translation provider interface. # [domain/translation]
  - [x] `domain/translation/providers/base.rs`: Define `TranslationProvider` trait (`translate` method).
- [x] **Domain:** Basic prompt selection logic. # [domain/translation/prompt]
  - [x] `domain/translation/prompt/manager.rs`: Simple logic to select prompts (initially just for actor field types).
- [x] **Infrastructure:** Provider config persistence. # [infrastructure/storage]
  - [x] Ensure frontend can save/load config (e.g., Ollama endpoint, model) using the **Tauri Store plugin** (`@tauri-apps/plugin-store`).
- [x] **Application:** Service for provider config (likely minimal or just validation). # [application/settings]
  - [x] `application/settings/provider_service.rs`: Validate provider config if necessary before frontend saves to store.
- [x] **Commands:** Expose config management. # [commands/]
  - [x] `commands/config.rs`: Commands `validate_provider_config` and `get_default_provider_config` for frontend use.
- [x] **Frontend:** UI for provider config. # [frontend/]
  - [x] `stores/providerConfig.ts`: Pinia store.
  - [x] `components/ProviderConfigEditor.vue`: Simple UI to set/save Ollama endpoint.

## Phase 1.4: Translation Infrastructure (History & API Client)
- [x] **Infrastructure:** Translation history persistence. # [infrastructure/storage]
  - [x] Define `translation_history` table schema (SQLite migrations in `lib.rs`). Fields: `id`, `file_path`, `content_path` (e.g., `actors[1].name`), `source_lang`, `target_lang`, `source_text`, `translated_text`, `timestamp`, `status`.
  - [x] Ensure frontend can insert/query history records using the Tauri SQL plugin. (Note: Actual implementation deferred to frontend phase, but backend setup is done)
- [x] **Infrastructure:** Ollama API client. # [infrastructure/api/ollama]
  - [x] `infrastructure/api/ollama/client.rs`: Basic client to send generation request to `/api/generate`.
  - [x] `infrastructure/api/ollama/models.rs`: Structs for Ollama API request/response (`GenerateRequest`, `GenerateResponse`).
- [x] **Infrastructure:** Load prompt templates. # [infrastructure/resources]
  - [x] `resources/prompts/`: Create placeholder prompt files for actor fields (`name.txt`, `nickname.txt`, `profile.txt`, `note.txt`).
  - [x] `infrastructure/resources/prompt.rs`: Function to load prompt content from `resources/`.

## Phase 1.5: Translation Workflow (Backend End-to-End - Actors Focus)
- [x] **Domain:** Implement Ollama translation provider. # [domain/translation/providers]
  - [x] `domain/translation/providers/ollama.rs`: Implement `TranslationProvider` trait using the infrastructure client.
- [ ] **Application:** Orchestrate `Actors.json` translation. # [application/translation/rpgmv/file_services]
  - [ ] `application/translation/rpgmv/file_services/actors.rs`: Service dedicated to `Actors.json` to:
    - Load/parse `Actors.json`.
    - Extract strings using domain logic.
    - Loop through strings: select prompt, call provider (handle retries), save to history DB.
    - Handle errors per-string.
    - Aggregate results/status.
    - Inject translated strings back into model.
    - Return modified Actor data (or save file directly).
- [ ] **Commands:** Expose `Actors.json` translation workflow. # [commands/]
  - [ ] `commands/translation.rs`: Tauri command `translate_actors(path, source_lang, target_lang)` calling the `actors_service`.

## Phase 1.6: Frontend Translation UI & Integration (Actors Focus)
- [ ] **Frontend:** State management for Actors translation. # [frontend/stores]
  - [ ] `stores/translation.ts`: Pinia store for Actors progress, results, errors.
- [ ] **Frontend:** Composable for Actors translation workflow. # [frontend/composables]
  - [ ] `composables/useTranslation.ts`: Call `translate_actors` command, update store.
- [ ] **Frontend:** Integrate Actors translation into main UI. # [frontend/pages]
  - [ ] Update main page (`pages/index.vue`): Add button/logic to trigger Actors translation via composable.
  - [ ] Display progress bar for Actors translation.
  - [ ] Display results table/view for Actors (Source, Translation, Status).
- [ ] **Frontend:** Translation history display and rollback UI (for Actors history). # [frontend/]
  - [ ] `composables/useHistory.ts`: Composable to fetch Actors history.
  - [ ] `components/HistoryViewer.vue`: Display Actors history, add button for rollback.
- [ ] **Commands:** Backend support for history/rollback. # [commands/]
  - [ ] `commands/history.rs`: Command `get_translation_history(filter_options)`.
  - [ ] `commands/history.rs`: Command `rollback_translation(history_id)`.
- [ ] **Application:** Service logic for rollback. # [application/translation]
    - Implement logic to fetch a history record and update `Actors.json` with the rolled-back text.

## Phase 1.7: Testing & Documentation (Actors Slice)
- [ ] **Testing:** Write unit/integration tests for Actors backend logic.
- [ ] **Testing:** Write unit/component tests for Actors frontend workflow.
- [ ] **Testing:** Write E2E tests (Playwright) for the Actors user flow.
- [ ] **Docs:** Update `progress.md` reflecting Actors slice completion.

## Phase 1.8: Multi-File Expansion
- [ ] **Models:** Define all *other* RPGMV data structures. # [models/game/rpgmv/data]
    - [ ] `items.rs`, `skills.rs`, `weapons.rs`, `armors.rs`, `enemies.rs`, `states.rs`, `system.rs`, `tilesets.rs`, `map_infos.rs`, `common_events.rs`, `troops.rs`, `map.rs`, `events.rs`.
    - [ ] Update `mod.rs` files.
- [ ] **Domain:** Implement extraction/injection for all *other* file types. # [domain/game/rpgmv/data]
  - [ ] Create corresponding `.rs` files in `domain/game/rpgmv/data/`.
  - [ ] Implement logic for Items, Skills, Maps, CommonEvents, System, etc.
- [ ] **Infrastructure:** Update file discovery. # [infrastructure/game]
  - [ ] Enhance `fs.rs` or `detection_service` to find *all* translatable files, not just `Actors.json`.
- [ ] **Application:** Refactor/Create multi-file translation service. # [application/translation/rpgmv]
  - [ ] Create/update `translation_service.rs` to handle multiple file types.
    - Iterate through identified files, load/parse, extract.
    - Aggregate strings, translate, inject.
    - Save all modified files.
- [ ] **Commands:** Update translation command. # [commands/]
  - [ ] Modify/replace `translate_actors` with `translate_project_files(root_path, ...)` targeting the new service.
- [ ] **Frontend:** Adapt UI for multi-file results. # [frontend/]
  - [ ] Update store (`translation.ts`) to handle potentially large, multi-file results.
  - [ ] Update composable (`useTranslation.ts`) to call new command.
  - [ ] Update results view (pagination, filtering, grouping by file?).
  - [ ] Update history view to handle history from multiple files.
- [ ] **Infrastructure:** Add necessary prompt templates. # [infrastructure/resources]
  - [ ] Add prompt files for Items, Skills, etc. to `resources/prompts/`.
- [ ] **Testing:** Add tests for new file types and the multi-file workflow.
- [ ] **Docs:** Update `progress.md` upon completing multi-file expansion.
- [ ] **Docs:** Ensure all `memory-bank` docs reflect the final MVP state.
