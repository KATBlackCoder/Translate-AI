# App Design Document (MVP - Phase 1)

## Purpose & Goals (MVP)
The initial goal (MVP) is to enable users to translate the text content of all standard RPG Maker MV data files (including `Actors.json`, `Items.json`, `Skills.json`, `MapXXX.json`, `CommonEvents.json`, `System.json`, etc.) between Japanese and English/French using local AI (Ollama/Mistral). The app should provide an interface for selecting a game folder, detecting RPGMV, initiating translation for supported files, and viewing results with per-string status and history/rollback.

---

## Target Users & Use Cases (MVP Focus)
While the long-term vision serves broader users, the MVP specifically targets:
- **Indie game devs/Modders/Fans:** Who need to translate the text content across multiple RPGMV data files from Japanese to English or French.

---

## Core Features (MVP Scope)
- Folder selection and engine detection (strictly for RPGMV: checks for `www` folder and `www/js/rpg_core.js` file).
- AI-powered translation (Ollama/Mistral) focusing on per-string translation of specified fields across multiple RPGMV data files (e.g., Actors, Items, Skills, Maps, CommonEvents, System, etc.). Context is provided to the AI via tailored prompts specific to the field type.
- Progress, status, and error reporting: Reports status/errors per-string for all processed files; failed strings are skipped after 3 retries, allowing the overall job to complete.
- Persistent translation history: Implements per-string translation history & rollback via SQLite for all translated content.
- Modern, accessible UI (Nuxt UI 3, TailwindCSS 4) for the multi-file translation workflow (select folder -> translate -> view results).
- Multi-language content support: Supports translating game content between selected languages (JP→EN/FR); the application UI itself is English-only in MVP.

---

## High-Level Architecture (Foundation for MVP & Beyond)
- **Backend:** Rust + Tauri, DDD, vertical slices, SQLite for storage, Ollama interface.
- **Frontend:** Vue 3 + Nuxt 3, Nuxt UI 3, Pinia, TailwindCSS 4.
- **Vertical Slices:** The MVP feature (Actors.json translation) is implemented end-to-end.
- **Type Safety:** TypeScript (frontend) and Rust (backend).

---

## Key Design Decisions (MVP Context)
- **Tauri:** Chosen for native performance and cross-platform needs, suitable from MVP onwards.
- **Rust + Vue:** Modern stack providing safety and productivity for the MVP workflow.
- **SQLite:** Lightweight storage for MVP history/config (via Tauri SQL plugin).
- **Ollama:** Flexible AI options, starting with Ollama for local-first MVP.

---

## Testing (MVP)
- Unit/Integration tests (Vitest) for frontend logic, components, and backend mocks.
- E2E tests (Playwright) covering the MVP user journey (select RPGMV folder, translate supported files, view results).

---

## Tech Stack (For MVP)

This project uses the following stack for the MVP implementation:

---

### Backend
- **Tauri**: Desktop app shell and backend wiring.
- **Rust**: Backend logic.
- **SQLite**: Storage for MVP history/config (via Tauri SQL plugin).
- **serde**: JSON handling.
- **thiserror**: Error handling.

### Frontend
- **Vue 3**: UI framework.
- **Nuxt 3**: Vue framework.
- **Nuxt UI 3**: Component library.
- **Pinia**: State management.
- **TailwindCSS 4**: Styling.
- **TypeScript**: Language.
- **@nuxt/test-utils**: Nuxt testing utilities.
- **vitest**: Test runner.
- **@vue/test-utils**: Vue component testing utilities.
- **happy-dom**: Test DOM environment.

### AI/Translation
- **Ollama**: Local AI provider interface.
- **Mistral**: Initial local LLM model (via Ollama).

###  Other
- **@vitejs/plugin-vue**: Vue SFC support in tests.
- **tempfile**: Temp file handling in Rust tests.

---