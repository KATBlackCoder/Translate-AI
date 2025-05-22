# Translator App - App Design Document

## 1. Introduction

This document outlines the design and architecture for a desktop translator application built using Tauri and Nuxt 3. The application's purpose is to act as a specialized tool that uses **AI translation engines exclusively** to translate **user-facing text content** (such as dialogues, UI strings, item names, descriptions) typically extracted from **game project localization files**. It aims to streamline the localization process for game development by providing a simple and fast translation experience for these specific text segments. It is **not** intended for translating non-text assets, game engine source code, or general documents.

## 2. Goals

*   **Primary Goal:** Provide quick and accurate **AI-powered translation** of **structured text segments** (e.g., dialogues, UI labels, item names/descriptions) extracted from **game localization files**.
*   **Secondary Goals:**
    *   Offer **offline AI translation capabilities** for these text segments.
    *   Simple and intuitive user interface.
    *   Cross-platform compatibility (Windows, macOS, Linux).
    *   **Configurable Performance/Resource Usage:** Allow users to make trade-offs between translation speed/quality and system resource consumption (RAM/VRAM), especially when selecting offline AI engines or their settings.
    *   User-configurable settings (e.g., default languages, themes).
    *   History of translations.

## 3. Architecture

*   **Framework:** Tauri ([https://tauri.app/](https://tauri.app/))
    *   Utilizes the OS's native webview, leading to significantly smaller application bundles compared to Electron-based apps.
    *   Rust backend provides memory safety, thread safety, and performance benefits.
    *   Manages the main application window, system interactions, and backend logic.
*   **Frontend:** Nuxt 3 ([https://nuxt.com/](https://nuxt.com/))
    *   Vue 3-based framework focused on developer experience and performance.
    *   Uses Vite for Hot Module Replacement (HMR) during development and optimized production builds.
    *   **Convention-over-configuration:** Features like file-based routing (`pages/` directory) and auto-imports (`components/`, `composables/` directories) simplify development.
    *   UI Components: Standard `Nuxt UI` library. This refers to the free, open-source set of components provided by Nuxt UI. Nuxt UI Pro components will not be used unless a specific need arises and is explicitly documented as a change to the tech stack.
    *   State Management: Pinia (built-in and recommended for Nuxt 3) ([https://pinia.vuejs.org/introduction.html](https://pinia.vuejs.org/introduction.html)). We will use Pinia's Setup Store syntax.
*   **Backend (Tauri Core Plugin / Rust):**
    *   Handles communication between the Nuxt frontend and Rust (Inter-Process Communication - IPC) via Tauri's `invoke` mechanism.
    *   Manages translation engine interactions (API calls or local model execution).
    *   Handles application state persistence using Tauri plugins (e.g., `tauri-plugin-store`, `tauri-plugin-sql`).
    *   Manages runtime (in-memory) state within Rust using Tauri's managed state (`tauri::State`) ([https://tauri.app/develop/state-management/](https://tauri.app/develop/state-management/)) when needed beyond frontend state.
    *   Integrates system-level features (e.g., global hotkeys, notifications) potentially using dedicated Tauri plugins.
*   **Translation Engine:**
    *   **Online:** Integrate with existing translation APIs (e.g., Google Translate API, DeepL API, LibreTranslate, **OpenAI API (GPT models)**). Requires API key management and consideration of cost vs. quality/features (OpenAI may offer higher quality but at a higher cost).
    *   **Offline:** Explore options like:
        *   **Embedded Models:** Using pure Rust crates (e.g., `rust-bert`) or bindings to optimized C++ libraries (e.g., `ctranslate2` via FFI). This requires integrating the model logic directly into the Tauri app, adding build complexity (especially FFI) and increasing application size, but results in a self-contained application potentially optimized for lower resource usage.
        *   **External Service (Ollama):** Interacting with a locally running Ollama instance via its REST API ([http://localhost:11434](http://localhost:11434)). The Tauri backend makes HTTP requests to Ollama, instructing it to use a suitable LLM for translation. This simplifies the Tauri backend code but introduces a significant external dependency (user must install/run Ollama), relies on general LLMs (quality/speed may vary from dedicated NMT models), and has high resource demands (RAM/VRAM).
    *   A hybrid approach (e.g., preferring embedded offline but falling back to online or Ollama) could be implemented. Potential strategies include:
        *   **User Selection:** Explicit choice of engine per task via UI controls.
        *   **Automatic Fallback:** Attempt primary engine (e.g., offline), fallback to secondary (e.g., online) on error or incompatibility *before starting the task or if the primary engine fails completely during a batch*. 
        *   **Conditional Logic:** Pre-defined rules (e.g., specific engines for certain language pairs, different engines for batch vs. single translation).
    *   **Runtime Constraint:** Regardless of the strategy, once a specific translation task (single segment or batch) begins with a selected/determined engine, that engine must be used consistently throughout that task. Switching engines mid-task is not permitted.

## 4. UI/UX Design

*   **Layout:**
    *   Two main text areas: one for input, one for output.
    *   Language selection dropdowns/buttons above each text area.
    *   A "Translate" button.
    *   A "Swap Languages" button.
    *   Optional: A history panel/sidebar.
    *   Settings accessible via a menu or dedicated icon.
*   **Theme:** Clean, minimal design. Potentially offer light/dark modes.
*   **Responsiveness:** While primarily a desktop app, ensure the UI adapts reasonably if the window is resized.

## 5. Features

*   **Core Translation:**
    *   Input text segment (e.g., a single dialogue line, item name) in the source language text area.
    *   Select source and target languages.
    *   Click "Translate" to display the translation in the target language text area.
    *   Automatic language detection for the source language (optional, depends on engine).
    *   **Potential:** Ability to load/process structured data files (e.g., JSON, CSV, YAML key-value pairs) and translate values while preserving keys/structure (Advanced Feature).
*   **Language Selection:**
    *   Dropdown menus or searchable lists for selecting source and target languages.
    *   Remember recently used or favorite languages.
*   **Text Area Features:**
    *   Clear button for input/output areas.
    *   Copy button for the output area.
    *   Character/word count display (optional).
*   **Translation History:**
    *   Store recent translation pairs locally.
    *   Allow users to view, search, and reuse past translations.
    *   Option to clear history.
*   **Settings:**
    *   API Key management (if using online APIs).
    *   Default source/target language selection.
    *   Theme selection (Light/Dark/System).
    *   Offline mode toggle (if implemented).
    *   Offline model management (download/selection, if applicable).
*   **Potential Advanced Features:**
    *   Text-to-Speech for input/output (Low Priority given the focus on text segments).
    *   Global hotkey for quick translation pop-up (Potentially useful for translating selected text snippets from other apps).
    *   Placeholder/Variable recognition and preservation (e.g., ensuring `{playerName}` isn't translated).
    *   **Terminology/Glossary Support:** Allow users to define a list of exact source text -> target text pairs for specific language combinations. **Mechanism (Option A - Pre-check):** Before sending text to the AI, the app checks for an exact match in the glossary for the source/target language pair. If found, the glossary's target text is used directly, and the AI is **not** called for this segment. The UI should indicate when a translation originated from the glossary (see Review step in Batch Translation).
    *   **Game Project Translation (Batch):** Implement a workflow targeting game localization files:
        1.  User points the application to a game project's root directory.
        2.  App attempts to automatically detect the game engine. **Initial focus: RPG Maker MV.** Identification logic:
            *   **Primary:** Check for the existence of a `Game.rpgproject` file in the project root.
            *   **Fallback (if no `Game.rpgproject`):** Check for the existence of a `www` subdirectory in the project root, and then for a `data` subdirectory within that `www` folder (i.e., `PROJECT_ROOT/www/data`).
        3.  Based on detection, the app attempts to locate and parse known localization file formats. **Initial focus: RPG Maker MV `.json` files** (e.g., found within `www/data/Actors.json`, `www/data/Items.json`, etc., identifying translatable string values within the JSON structure).
        4.  App extracts translatable text segments, potentially displaying them with context (keys, filenames).
        5.  User confirms/selects segments, chooses source/target languages, and selects the AI engine.
        6.  App iterates, translates selected values (applying glossary rules - *Mechanism TBD, see step 5 below*), possibly showing progress.
        7.  (Optional) User reviews/edits translations side-by-side.
        8.  User saves results by **creating a `.zip` archive containing the translated files, preserving the original relative directory structure within the archive** (e.g., `translated_project.zip` containing `data/Actors.json` with translated content). This avoids modifying the original project directly.
        9.  **Error Handling:** If engine detection fails or a required file cannot be parsed correctly, the process stops, and a clear error message is presented to the user.
        10. **Review/Edit (Optional but Recommended):** After translation, the app presents the original text alongside the generated translations. **Translations sourced directly from the glossary (due to exact match) should be clearly indicated as such (e.g., with an icon or label).** Users can review and manually edit any translation before saving.
    *   **Terminology/Glossary Support:** Allow users to define a list of exact source text -> target text pairs for specific language combinations. **Mechanism (Option A - Pre-check):** Before sending text to the AI, the app checks for an exact match in the glossary for the source/target language pair. If found, the glossary's target text is used directly, and the AI is **not** called for this segment. The UI should indicate when a translation originated from the glossary (see Review step in Batch Translation).
    *   ~~OCR integration (translate text from images).~~ (Out of Scope)

## 6. Data Management

*   **Settings:** Store user preferences in a configuration file managed securely by the Tauri backend, likely using the official `tauri-plugin-store` ([https://tauri.app/plugin/store/](https://tauri.app/plugin/store/)).
*   **History:** Store translation history locally. Options include:
    *   Using `tauri-plugin-store` for simplicity if data size is manageable.
    *   Using SQLite via the `tauri-plugin-sql` ([https://tauri.app/plugin/sql/](https://tauri.app/plugin/sql/)) accessed from the Tauri backend for more complex querying or larger datasets.
*   **Offline Models:** Store downloaded models in the application's platform-specific data directory, managed via Tauri's filesystem APIs (potentially using `tauri-plugin-fs`).
*   **Resource Consumption:** Ollama and the LLMs it runs are very resource-intensive (RAM/VRAM), potentially conflicting with the low resource consumption goal.
*   **API Costs/Limits:** Online translation APIs often have usage limits and costs. Need clear handling of API keys and potential errors. **Different providers (Google, DeepL, OpenAI) have varying pricing models and potential quality differences that need evaluation.**
*   **Game Project Handling (Batch Mode):**
    *   **Engine Detection:** Reliably auto-detecting game engines can be challenging. **Initial focus on RPG Maker MV simplifies this, but expanding requires handling diverse project structures.**
    *   **Localization Format Parsing:** Different engines/setups use diverse formats. **Initial focus on RPG Maker MV `.json` files requires robust JSON parsing and identification of translatable fields. Expansion requires supporting XML, CSV, PO, proprietary formats etc.**
    *   **Data Writing:** Writing translated data back correctly is critical. **The `.zip` archive approach mitigates the risk of corrupting the original project, but users still need to manually extract and replace files.**
    *   **Error Handling:** Clear reporting on detection/parsing failures is crucial.
*   **Cross-Platform Consistency:** Ensuring UI, build processes (especially with C++/FFI), Ollama interaction, and **RPG Maker MV project file handling** behave consistently across different operating systems.
*   **Performance:** Ensuring the application remains responsive during translation, considering IPC overhead, model inference time, online API latency, **and potentially slow file I/O when parsing large game projects**.
*   **Packaging Size:** Embedded offline models significantly increase bundle size. Using Ollama keeps the *app* size small, but the *system requirement* (Ollama + models) is large.
*   **IPC Overhead:** Designing efficient communication between the Nuxt frontend and the Tauri Rust backend is crucial for responsiveness.

## 7. Build & Deployment

*   Standard Tauri build process (`npm run tauri build` or `cargo tauri build`).
*   Leverages Tauri's ability to bundle the Nuxt frontend (compiled to static assets) and the Rust backend into a single executable or installer.
*   Benefits from Tauri's use of the system webview, resulting in smaller final package sizes.
*   Generate platform-specific installers/packages (Windows .msi/.exe, macOS .dmg/.app, Linux .deb/.AppImage) using Tauri's built-in bundler.
*   Consider CI/CD pipeline for automated builds and releases (e.g., GitHub Actions).

## 8. Risks and Challenges

*   **Offline Translation:**
    *   **Embedded:** Implementing reliable/performant offline translation via embedded models is complex (FFI, model management, performance tuning).
    *   **Ollama Dependency:** Relying on Ollama means the app won't work unless the user has Ollama installed, running, and configured with appropriate models. Requires user guidance for setup.
    *   **Model Size/Performance:** Both embedded models and Ollama models can be large. Inference performance needs careful consideration for responsiveness. General LLMs via Ollama might be slower than specialized NMT models.
    *   **Resource Consumption:** Ollama and the LLMs it runs are very resource-intensive (RAM/VRAM), potentially conflicting with the low resource consumption goal.
*   **API Costs/Limits:** Online translation APIs often have usage limits and costs. Need clear handling of API keys and potential errors. **Different providers (Google, DeepL, OpenAI) have varying pricing models and potential quality differences that need evaluation.**
*   **Game Project Handling (Batch Mode):**
    *   **Engine Detection:** Reliably auto-detecting game engines can be challenging. **Initial focus on RPG Maker MV simplifies this, but expanding requires handling diverse project structures.**
    *   **Localization Format Parsing:** Different engines/setups use diverse formats. **Initial focus on RPG Maker MV `.json` files requires robust JSON parsing and identification of translatable fields. Expansion requires supporting XML, CSV, PO, proprietary formats etc.**
    *   **Data Writing:** Writing translated data back correctly is critical. **The `.zip` archive approach mitigates the risk of corrupting the original project, but users still need to manually extract and replace files.**
    *   **Error Handling:** Clear reporting on detection/parsing failures is crucial.
*   **Cross-Platform Consistency:** Ensuring UI, build processes (especially with C++/FFI), Ollama interaction, and **RPG Maker MV project file handling** behave consistently across different operating systems.
*   **Performance:** Ensuring the application remains responsive during translation, considering IPC overhead, model inference time, online API latency, **and potentially slow file I/O when parsing large game projects**.
*   **Packaging Size:** Embedded offline models significantly increase bundle size. Using Ollama keeps the *app* size small, but the *system requirement* (Ollama + models) is large.
*   **IPC Overhead:** Designing efficient communication between the Nuxt frontend and the Tauri Rust backend is crucial for responsiveness.

## 9. Future Considerations

*   Plugin system for adding new translation engines or features.
*   Integration with other applications (e.g., system-wide translation via accessibility APIs).
*   Improved offline model management (updates, multiple models).
*   Real-time translation as the user types.

## 10. References

*   **Tauri:** [https://tauri.app/](https://tauri.app/)
*   **Nuxt 3:** [https://nuxt.com/](https://nuxt.com/)
*   **Tauri Quick Start:** [https://tauri.app/start/](https://tauri.app/start/)
*   **Nuxt 3 Introduction:** [https://nuxt.com/docs/getting-started/introduction](https://nuxt.com/docs/getting-started/introduction)
*   **Tauri Store Plugin:** [https://tauri.app/plugin/store/](https://tauri.app/plugin/store/)
*   **Tauri SQL Plugin:** [https://tauri.app/plugin/sql/](https://tauri.app/plugin/sql/)
*   **Tauri State Management:** [https://tauri.app/develop/state-management/](https://tauri.app/develop/state-management/)
*   **Pinia:** [https://pinia.vuejs.org/introduction.html](https://pinia.vuejs.org/introduction.html)
*   **VueUse Core:** [https://vueuse.org/](https://vueuse.org/)
*   **Nuxt Image:** [https://image.nuxt.com/](https://image.nuxt.com/)
*   **Nuxt i18n:** [https://i18n.nuxtjs.org/](https://i18n.nuxtjs.org/)
*   **Tauri Testing Guide:** [https://tauri.app/develop/tests/](https://tauri.app/develop/tests/)
*   **Nuxt Testing Guide:** [https://nuxt.com/docs/getting-started/testing](https://nuxt.com/docs/getting-started/testing)
*   **Rust Book - Testing:** [https://doc.rust-lang.org/book/ch11-00-testing.html](https://doc.rust-lang.org/book/ch11-00-testing.html)
*   **Vitest:** [https://vitest.dev/](https://vitest.dev/)
*   **Vue Test Utils:** [https://test-utils.vuejs.org/](https://test-utils.vuejs.org/) 