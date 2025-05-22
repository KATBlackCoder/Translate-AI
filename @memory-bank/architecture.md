# AI Game Translator - Architecture Overview

This document outlines the architecture of the AI Game Translator application. It is based on the [App Design Document](translator_app_design_document.md) and the [Recommended Tech Stack](recommended_tech_stack.md).

## 1. Core Philosophy

The application is a specialized desktop tool designed to translate user-facing text content from game project localization files using AI translation engines exclusively. It aims to streamline the game localization workflow, with an initial focus on RPG Maker MV projects.

## 2. High-Level Architecture

The application employs a hybrid architecture leveraging:

*   **Tauri (Core Framework):**
    *   Provides a lightweight, cross-platform desktop application shell.
    *   Uses the OS's native webview for the frontend.
    *   The backend is written in Rust for performance, memory safety, and system access.
*   **Nuxt 3 (Frontend Framework):**
    *   A modern Vue 3 framework for building the user interface.
    *   Utilizes Vite for a fast development experience.

**Communication:** Frontend (JavaScript/Vue) and Backend (Rust) communicate via Tauri's Inter-Process Communication (IPC) mechanism, primarily using `invoke` calls for Rust functions from the frontend.

## 3. Frontend Architecture (Nuxt 3 / Vue 3)

The frontend is a single-page application built with Nuxt 3 (Vue 3) and styled with the standard `Nuxt UI` library. It handles user interaction, presents data, and communicates with the Rust backend via Tauri's IPC mechanism.

Key aspects include:
*   **UI Components:** Leveraging Nuxt UI for pre-built components. Note: Toast notifications (`useToast()`) are rendered globally via Nuxt UI's context (e.g., through `<UApp>`), not requiring an explicit `<UNotifications />` tag in `app.vue`.
*   **State Management:** Pinia for managing UI and application state (using Setup Stores, as detailed in the frontend architecture document).
*   **Routing:** Nuxt 3's file-system based routing for different application views.

For a detailed breakdown of the frontend structure, component design, state management, and directory layout, please refer to the [Frontend Architecture Document](@memory-bank/frontend_architecture.md).

## 4. Backend Architecture (Rust / Tauri)

The backend is developed in Rust and integrated into the desktop application using the Tauri framework. It is responsible for core business logic, file system operations, interactions with AI translation engines (both online APIs and offline models/services like Ollama), game project processing, and secure data management.

Key architectural aspects include:
*   **Command-based Interaction:** Exposes functionalities to the frontend via Tauri commands, which are Rust functions callable from JavaScript.
*   **Modular Design:** Organized into distinct modules for commands, core logic, data models, external service interactions, and utilities to promote separation of concerns and testability.
*   **State Management:** Utilizes `tauri::State` for managing shared, in-memory state within the Rust backend and `tauri-plugin-store` for persistent settings and simple data.
*   **Essential Plugins & Crates:** Leverages Tauri plugins like `tauri-plugin-dialog`, `tauri-plugin-fs`, and core Rust crates like `serde` (for JSON), `reqwest` (for HTTP), and `zip` (for archives).

For a detailed breakdown of the Rust backend's directory structure (`src-tauri/src/`), module responsibilities, data flow, and error handling strategy, please refer to the [Backend Architecture Document](@memory-bank/backend_architecture.md).

## 5. Data Management & Persistence

*   **Application Settings:** Stored using `tauri-plugin-store` (e.g., selected theme, default languages, API keys if applicable).
*   **Translation History:**
    *   **Simple:** Potentially using `tauri-plugin-store` for recent translations.
    *   **Advanced:** `tauri-plugin-sql` (with SQLite) for a more robust, queryable history. (Schema TBD)
*   **Glossary Data:** User-defined source-target text pairs. Storage likely via `tauri-plugin-store` or a dedicated file managed by the app.
*   **Offline AI Models:** If using embedded models, they would be stored in the application's data directory.

## 6. Database Schema

*No specific database schema (e.g., for `tauri-plugin-sql`) has been defined yet. This will be elaborated if and when advanced history or other SQL-dependent features are implemented.*

A potential simple schema for translation history (using SQLite via `tauri-plugin-sql`) might include:

'''sql
-- Example for Translation History
CREATE TABLE IF NOT EXISTS translation_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    source_language TEXT NOT NULL,
    target_language TEXT NOT NULL,
    source_text TEXT NOT NULL,
    translated_text TEXT NOT NULL,
    ai_engine TEXT, -- Identifier for the AI engine used
    project_context TEXT -- Optional: e.g., project name or file name
);

-- Example for Glossary Terms
CREATE TABLE IF NOT EXISTS glossary (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source_language TEXT NOT NULL,
    target_language TEXT NOT NULL,
    source_term TEXT NOT NULL UNIQUE,
    target_term TEXT NOT NULL
);
'''
*(Note: The glossary might be better suited for `tauri-plugin-store` if simplicity is preferred, or if complex querying isn't needed. The SQL example is for consideration.)*

## 7. Modularity and Extensibility

The backend, particularly the game project handling module, will be designed with modularity in mind to facilitate easier integration of support for other game engines and their specific localization file formats in the future.

## 8. Testing Strategy

*   **Backend (Rust):** Unit and integration tests using Rust's built-in testing framework.
*   **Frontend (Nuxt/Vue):** Unit and component tests using Vitest and Vue Test Utils.
*   **End-to-End (E2E):** Tauri WebDriver for testing the full application.
