# Recommended Tech Stack: AI Game Translator

This document summarizes the recommended technology stack based on the App Design Document.

## Core Framework

*   **Tauri:** ([https://tauri.app/](https://tauri.app/))
    *   **Reasoning:** Chosen for its ability to create lightweight, fast, cross-platform desktop applications by leveraging the OS's native webview. The Rust backend provides excellent performance, memory safety, and access to system capabilities required for offline AI processing and file system interactions.

## Frontend

*   **Nuxt 3:** ([https://nuxt.com/](https://nuxt.com/))
    *   **Reasoning:** A modern Vue 3 framework offering a great developer experience with features like file-based routing, auto-imports, and Vite for fast development builds. Its convention-over-configuration approach streamlines UI development.
*   **UI Component Library:** Standard `Nuxt UI` library ([https://ui.nuxt.com/](https://ui.nuxt.com/))
    *   **Reasoning:** The official, free, and open-source Nuxt component library built on Tailwind CSS. Provides a comprehensive set of ready-to-use components (Inputs, Selects, Modals, etc.) tailored for Nuxt 3, speeding up UI development and ensuring consistency. Nuxt UI Pro components are explicitly excluded unless a future documented decision is made to incorporate specific Pro features. *Handles Tailwind CSS v4 and `@nuxt/icon` integration automatically.*
*   **Icons (Data):** `@iconify-json/*` (e.g., `@iconify-json/lucide`)
    *   **Reasoning:** Provides local SVG data for Iconify icon sets used by Nuxt UI, ensuring offline availability and performance.
*   **Frontend State Management:** Pinia ([https://pinia.vuejs.org/](https://pinia.vuejs.org/))
    *   **Reasoning:** The official state management library for Vue 3, tightly integrated with Nuxt 3, offering a simple and type-safe way to manage UI state. (Will be implemented using Pinia's Setup Store syntax for alignment with Nuxt 3 and Composition API best practices.)
*   **Internationalization (UI):** `@nuxtjs/i18n` ([https://i18n.nuxtjs.org/](https://i18n.nuxtjs.org/))
    *   **Reasoning (Optional):** For making the application's own interface (buttons, labels, etc.) available in multiple languages.
*   **Utilities (Composables):** `@vueuse/core` ([https://vueuse.org/](https://vueuse.org/))
    *   **Reasoning (Optional):** A collection of essential Vue Composition Utilities for common tasks like keyboard shortcuts, clipboard access, and more, enhancing UX.
*   **Image Optimization:** `@nuxt/image` ([https://image.nuxt.com/](https://image.nuxt.com/))
    *   **Reasoning (Optional):** For optimizing any static images used within the UI, ensuring better performance and smaller asset sizes.

## Backend (Tauri/Rust)

*   **Language:** Rust
    *   **Reasoning:** Required by Tauri, provides performance, safety, and a strong ecosystem for tasks like file I/O, API calls, and potentially integrating offline AI models (via Rust crates or FFI).
*   **Core Tauri Framework:** `tauri` crate
    *   **Reasoning:** The foundational library for the entire application structure and inter-process communication.
*   **Runtime State Management:** `tauri::State` ([https://tauri.app/develop/state-management/](https://tauri.app/develop/state-management/))
    *   **Reasoning:** Tauri's built-in mechanism for managing shared, in-memory state within the Rust backend, accessible across different commands or components.

### Tauri Plugins (for OS integration & features)

*   **Dialogs:** `tauri-plugin-dialog` ([https://tauri.app/plugin/dialog/](https://tauri.app/plugin/dialog/))
    *   **Reasoning (Essential):** For native file open/save dialogs, crucial for selecting game project folders and saving the output `.zip` archive.
*   **Filesystem Access:** `tauri-plugin-fs` ([https://tauri.app/plugin/fs/](https://tauri.app/plugin/fs/))
    *   **Reasoning (Essential):** For reading game project files (e.g., RPG Maker MV `.json` files).
*   **Persistence (Settings/Simple Data):** `tauri-plugin-store` ([https://tauri.app/plugin/store/](https://tauri.app/plugin/store/))
    *   **Reasoning (Highly Recommended):** For storing user settings, API keys, and potentially simple translation history.
*   **Opening Paths/URLs:** `tauri-plugin-opener` ([https://tauri.app/plugin/opener/](https://tauri.app/plugin/opener/))
    *   **Reasoning (Optional but Recommended):** For opening the output folder in the system file explorer or opening web links (e.g., documentation, help).
*   **Notifications (OS Level):** `tauri-plugin-notification` ([https://tauri.app/plugin/notification/](https://tauri.app/plugin/notification/))
    *   **Reasoning (Optional):** Useful for alerting the user about completion of long tasks (like batch translation) or critical errors, even if the app window is not focused.
*   **Logging:** `tauri-plugin-log` ([https://tauri.app/plugin/logging/](https://tauri.app/plugin/logging/))
    *   **Reasoning (Optional):** Provides a robust logging solution (to console, file, OS log) for easier debugging and issue diagnosis.
*   **Application Updates:** `tauri-plugin-updater` ([https://tauri.app/plugin/updater/](https://tauri.app/plugin/updater/))
    *   **Reasoning (Optional but Recommended for Distribution):** Facilitates distributing updates to users.
*   **Database (Advanced History/Data):** `tauri-plugin-sql` ([https://tauri.app/plugin/sql/](https://tauri.app/plugin/sql/))
    *   **Reasoning (Optional):** For more complex or larger-scale data persistence, like extensive translation history requiring querying (e.g., using SQLite).

### Rust Crates (for specific backend logic)

*   **JSON Handling:** `serde` & `serde_json` ([https://crates.io/crates/serde](https://crates.io/crates/serde), [https://crates.io/crates/serde_json](https://crates.io/crates/serde_json))
    *   **Reasoning (Essential):** For serializing and deserializing JSON data, vital for RPG Maker MV project files.
*   **ZIP Archive Creation:** `zip` crate ([https://crates.io/crates/zip](https://crates.io/crates/zip))
    *   **Reasoning (Essential):** For creating the `.zip` archive containing the translated files.
*   **HTTP Client (Online APIs):** `reqwest` ([https://crates.io/crates/reqwest](https://crates.io/crates/reqwest))
    *   **Reasoning (Needed for Online AI):** A popular and robust HTTP client for making API calls to online translation services.
*   **Directory Traversal:** `walkdir` ([https://crates.io/crates/walkdir](https://crates.io/crates/walkdir))
    *   **Reasoning (Recommended):** For efficiently finding and iterating over files within the game project directory.
*   **Async Runtime:** `tokio` ([https://crates.io/crates/tokio](https://crates.io/crates/tokio))
    *   **Reasoning (Often Needed):** Commonly required for asynchronous operations, especially with networking libraries like `reqwest` (if used asynchronously). Tauri itself uses Tokio.
*   **Offline AI Client (Ollama):** `ollama-rs` ([https://crates.io/crates/ollama-rs](https://crates.io/crates/ollama-rs))
    *   **Reasoning (Recommended for Ollama):** A dedicated Rust client library for interacting with the Ollama API, simplifying requests, response handling, and providing typed access to Ollama features over direct `reqwest` calls.
*   **Offline AI (Embedded Option 1):** `rust-bert` ([https://crates.io/crates/rust-bert](https://crates.io/crates/rust-bert))
    *   **Reasoning (Optional):** For integrating and running transformer-based AI models (including translation models) directly within the Rust backend.
*   **Offline AI (Embedded Option 2):** Crate for `ctranslate2` FFI
    *   **Reasoning (Optional):** If opting for the highly optimized `ctranslate2` C++ library, a Rust FFI wrapper crate would be needed.

## AI Translation Engines (Integration Options)

*   **Online APIs:** Google Translate, DeepL, OpenAI (via Rust HTTP clients like `reqwest`).
*   **Offline (Embedded):** `rust-bert` (Rust crate), `ctranslate2` (C++ library via Rust FFI).
*   **Offline (External):** Ollama (via local service, preferably using the `ollama-rs` Rust crate for client interactions).
    *   **Reasoning:** Flexibility is key. The architecture allows integrating various AI engines. The specific choice(s) will depend on user configuration, cost, quality needs, and offline requirements. Initial development might focus on one or two simpler integrations (e.g., one online API, potentially `rust-bert` for offline).

## Initial Target Integration (Game Project Handling)

*   **Engine:** RPG Maker MV
*   **File Format:** `.json` files within the project structure.
    *   **Reasoning:** Defined as the initial scope to provide a concrete starting point for the complex batch translation feature. The backend architecture for this feature should be designed modularly to facilitate the future integration of other game engines and their respective localization file formats.

## Testing Tools (Recommended)

*   **Backend (Rust Unit/Integration):** Rust's built-in testing framework ([https://doc.rust-lang.org/book/ch11-00-testing.html](https://doc.rust-lang.org/book/ch11-00-testing.html))
    *   **Reasoning:** For testing individual Rust functions, modules, and backend integration logic.
*   **Frontend (Nuxt/Vue Unit/Component):** Vitest ([https://vitest.dev/](https://vitest.dev/)) with Vue Test Utils ([https://test-utils.vuejs.org/](https://test-utils.vuejs.org/))
    *   **Reasoning:** Recommended by Nuxt ([https://nuxt.com/docs/getting-started/testing](https://nuxt.com/docs/getting-started/testing)) for testing Vue components and business logic in the frontend.
*   **End-to-End (E2E):** Tauri WebDriver ([https://tauri.app/develop/tests/](https://tauri.app/develop/tests/))
    *   **Reasoning:** Allows for testing the full application flow by simulating user interactions with the compiled Tauri application.
