# Project Roadmap

> **Note:** After completing the MVP (Phase 1), questions, planning, and discussion will continue for the next phases (Phase 2, Phase 3, etc.), so the roadmap is for the full project lifecycle, not just MVP.

This roadmap outlines the planned development phases, major features, and future enhancements for the Game Translation Desktop App. It is a living document and will evolve as the project grows.

---

## Phase 1: MVP (Vertical Slice)

- **Translatable File Schema**
  - For each translatable file type (Actors, Items, Skills, Maps, CommonEvents, System, etc.), a canonical sample or schema of the original file will always be provided to ensure robust extraction, reinjection, and tests.
  - Only the explicitly translatable fields are modified; all other fields and the exact structure must be preserved for each file type.

- **Translation History & Rollback**
  - Implemented using a generic, future-proof SQLite schema: file_id, content_id, field, source_text, translated_text, language_from, language_to, created_at, approved, user_id (optional).
  - Rollback is per-string: users can restore previous translations for any individual string, not just the whole file.
  - Before each new translation, the original text is saved; after translation, the result is shown to the user for approval. The user can directly edit the translated text in the UI before confirming. If approved, the (possibly edited) translation is saved as a reference for future glossary/translation memory.

- **Provider Configuration**
  - Provider configuration (Ollama endpoint, etc.) is global for the MVP (one provider active at a time, user-chosen before translation), and is stored in SQLite.
  - Users cannot switch providers at runtime. There will be a basic config editor (text fields for endpoint, maybe a provider dropdown).

- **Engine Detection**
  - Uses a hybrid approach: for RPGMV, the app checks for a 'www' folder in the root, then for 'data' and 'js' folders inside 'www', required files in 'data' (e.g., Actors.json), and 'rpg_core.js' in 'js'.
  - The structure for engine detection will be similar for all engines, with each engine having its own detection method but following this layered, extensible pattern.

- **Error Handling**
  - If a translation fails for a string, the app will retry 3 times, then skip and report the error for that string. The user can later re-translate failed strings individually, leveraging the rollback/history system.
  - If Actors.json (or any translatable file) is malformed or missing required fields, the app will error out with a clear message and will not modify the file. The app will validate the file structure before making changes.

- **UI/UX**
  - The MVP UI will be built from the written description only; there is no wireframe or Figma.
  - The app UI itself does NOT need to be localized for MVP—only the translation direction for game content is required. UI localization will be revisited after MVP.
  - The UI must support user selection of target language (EN or FR).
  - The UI must show per-string status/progress/errors inline, with errors shown next to each failed string, and a live progress bar/percentage.
  - After translation, the result is shown to the user for approval/editing before confirming (MVP might show results grouped by file or a unified list).

- **Multi-File Translation Support**
  - Translate text content across multiple RPGMV data files (Actors, Items, Skills, Weapons, Armors, Enemies, States, Troops, MapInfos, Maps, CommonEvents, System, Tilesets) between multiple languages using the Ollama provider.
  - Only Japanese→English and Japanese→French are supported for MVP.
  - End-to-end flow: folder selection, engine detection, extraction from multiple files, translation, reinjection, UI, and error handling.
  - User can select a folder, see engine detected, translate all supported files, and get results with real-time, per-string progress and error reporting.

- **Testing**
  - Vitest (with @tauri-apps/api/mocks) will be used for unit/integration tests (frontend logic, composables, Pinia stores, Vue components, and IPC/backend mocking).
  - Playwright will be used for E2E tests covering the full user journey (frontend + backend, real user flows in the desktop app).
  - Integration tests will use real Ollama endpoints (not mocks or sandboxes), since Ollama is free to use.

- **Docs**
  - All architecture, design, and implementation docs up to date.

---

## Phase 2: Expansion (Engines & Advanced Features)
- **Batch Translation & Job Management**
  - Improve handling of large projects with better background processing, job queuing, and status reporting.
- **Project Management**
  - Create, load, and manage translation projects
  - View translation history
  - Adjust project settings
- **Multiple Engines**
  - Add support for more game engines (RPG Maker MZ, VX Ace, etc.)
  - Generalize extraction/injection logic for engine-agnostic support
- **Provider Selection**
  - Support multiple AI providers (e.g., other local models via Ollama)
  - Provider selection, configuration, and comparison

---

## Phase 3: Advanced Features & Enhancements
- **Glossary/Termbase Management** (custom term translations)
- **Translation Memory** (reuse previous translations)
- **Quality Assurance Tools** (untranslated checks, length, placeholders)
- **Human-in-the-Loop Review** (review/edit/approve AI translations)
- **Multiple Output Formats** (CSV, XLIFF, etc.)
- **Plugin/Extensibility System** (third-party engines/providers)
- **Provider Benchmarking/Comparison** (compare speed/quality/cost)
- **Provider Auto-Fallback** (automatic failover between providers)
- **Custom Prompt Editing** (user-editable AI prompts)
- **UI/UX Enhancements** (dark mode, theming, drag-and-drop, onboarding)
- **Advanced Filtering/Search** (powerful search and filter tools)
- **Cloud Sync/Backup** (save projects to the cloud)
- **Multi-user Collaboration** (real-time or async collaboration)
- **Role-based Access Control** (permissions for teams)
- **CLI Tool & API/Webhooks** (automation and integration)
- **Continuous Integration (CI) Support** (automated testing/builds)
- **Full UI Localization** (app available in multiple languages)
- **Advanced Accessibility Audits** (deep a11y testing)
- **Incremental/Partial File Updates** (efficient updates)
- **On-device Model Support** (use local LLMs without cloud)
- **Mobile/Desktop Parity** (PWA or native app for mobile)
- Features are implemented, tested, documented, and validated with user feedback

---

## Ongoing Quality & Documentation
- **Code Quality** (enforce idiomatic Rust/TypeScript, code reviews, and linting)
- **Testing** (maintain high test coverage and accessibility standards)
- **Documentation** (keep all docs up to date as features land)
- **User Feedback** (regularly collect and incorporate user feedback)

---

## Vision / Long-term Goals
- Become the go-to tool for AI-powered translation of RPG Maker and similar game engines
- Support a wide range of file formats, engines, and AI providers
- Enable collaborative, high-quality, and accessible game localization workflows for solo devs and teams 