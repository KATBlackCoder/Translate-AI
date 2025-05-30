# AI Game Translator - Frontend Architecture

This document provides a detailed overview of the frontend architecture for the AI Game Translator application. It is built with Nuxt 3 (Vue 3) and interacts with the Rust backend via Tauri.

Refer to the main [Application Architecture Document](@memory-bank/architecture.md) for the overall system design.

## 1. Core Principles & Technologies

*   **Framework:** Nuxt 3 (Vue 3, Vite)
*   **UI Components:** Standard `Nuxt UI` library (built on Tailwind CSS). All components used will be from the free, open-source Nuxt UI set, not Nuxt UI Pro, unless explicitly decided and documented otherwise. Icons are managed via `@nuxt/icon` with local data from `@iconify-json/*` packages (e.g., `@iconify-json/lucide`).
*   **State Management:** `Pinia` is used for managing global and feature-specific frontend state in a type-safe manner. We will be using Pinia's **Setup Store** syntax for defining stores, leveraging the full power of the Composition API.
*   **Routing:** Nuxt 3's file-system based routing.
*   **Auto-Imports:** Leverages Nuxt 3's auto-import capabilities for components, composables, and utilities.

### 1.1 Nuxt Configuration for Tauri Environment

Specific settings in `nuxt.config.ts` are configured to ensure smooth integration and development within the Tauri environment:
*   `ssr: false`: Single Page Application (SPA) mode is typically used for Tauri webviews.
*   `devServer.host`: Configured to be discoverable by Tauri, especially for mobile development if applicable.
*   `vite.clearScreen: false`: Improves Tauri CLI output readability during development.
*   `vite.envPrefix: ['VITE_', 'TAURI_']`: Allows Tauri-specific environment variables to be accessible.
*   `vite.server.strictPort: true`: Ensures a consistent port for Tauri to connect to.
*   Tailwind CSS integration is handled by `@nuxt/ui` to avoid conflicts with manual setups.

## 2. Directory Structure

The frontend follows Nuxt 3 conventions and is organized as follows:

```
.
├── app.vue                   // Main Nuxt app component (holds <NuxtLayout>, <NuxtPage />). <UApp> handles global Nuxt UI context, including for toasts.
├── assets/                   // Global CSS, fonts
│   └── css/
│       └── main.css
├── components/               // Reusable Vue components
│   ├── common/               // General common components (e.g., LanguageSelector.vue - now removed, DataTable.vue - now removed/inlined). This directory may be empty/removed if not actively used.
│   ├── layout/               // Components used in layouts (e.g., Header.vue, AppFooter.vue)
│   ├── project/              // Components for project translation (e.g., ProjectSelector.vue, ProjectStringsReview.vue, ProjectStringsResult.vue)
│   ├── settings/             // Components for settings page (later)
│   └── glossary/             // Components for glossary management (later)
├── composables/              // Reusable Vue Composition API functions (e.g., useTauri.ts, useSettings.ts)
├── layouts/                  // Layout components for pages
│   └── default.vue           // Default layout (includes AppHeader and main page slot)
├── pages/                    // Top-level routes / views (e.g., index.vue, projects.vue, settings.vue)
├── public/                   // Static assets (favicon, etc.)
└── stores/                   // Pinia state management stores (e.g., translation.ts, settings.ts)
```
*(This is a representative structure and will evolve as features are added.)*

### 2.1 Folder and File Descriptions

This section details the purpose of key files and folders within the Nuxt 3 frontend structure.

#### 2.1.1 `app.vue`

The main entry point component for the Nuxt 3 application. It typically contains `<NuxtLayout>` and `<NuxtPage />` to render the current layout and page. It also includes `<UApp>` from Nuxt UI, which provides a global context for features like toast notifications.

#### 2.1.2 `assets/`

Stores uncompiled assets such as global stylesheets, fonts, or images that are processed by Vite during the build.
*   **`css/`**: Contains global CSS files like `main.css` for base styling or utility classes if not fully covered by Tailwind/Nuxt UI.

#### 2.1.3 `components/`

Holds all reusable Vue.js components. These are auto-imported by Nuxt 3.
*   **`common/`**: For general-purpose components. (This directory was previously planned for components like `LanguageSelector.vue` and `DataTable.vue`, which have since been removed or inlined. It may be empty or removed if no broadly common, custom components are currently needed).
*   **`layout/`**: Components specifically used within layout files, such as `Header.vue` (renamed from `AppHeader.vue`) or `AppFooter.vue`.
*   **`project/`**: Components for the project translation feature. This includes:
    *   `ProjectSelector.vue` (renamed from `ProjectTranslator.vue`): Handles project folder selection and initiates automatic string extraction.
    *   `ProjectStringsReview.vue`: Allows users to review extracted strings and configure/start the batch translation process.
    *   `ProjectStringsResult.vue` (renamed from `BatchTranslationControls.vue`): Displays the results of the batch translation, including any errors. Also includes buttons to trigger reconstruction/packaging, saving the ZIP, and showing the saved ZIP in the folder.
*   **`settings/`**: (Future) Components for the application settings page/modal.
*   **`glossary/`**: (Future) Components for the glossary management interface.

#### 2.1.4 `composables/`

Contains Vue Composition API functions (composables) for reusable stateful logic. These are auto-imported.
*   Example: `useTauri.ts` (for wrapping Tauri API calls), `useSettings.ts` (for managing settings).

#### 2.1.5 `layouts/`

Defines layout components for different page structures. Nuxt 3 auto-imports these.
*   **`default.vue`**: The default layout applied to pages unless specified otherwise. It often includes the `AppHeader` and a `<slot />` for page content.

#### 2.1.6 `pages/`

Contains application views and routes. Nuxt 3 uses a file-system based routing where each `.vue` file in this directory becomes a route.
*   `index.vue`: The main page of the application, now focused on project selection via the `ProjectSelector.vue` component. After successful project selection and string extraction, the application navigates to `/project`.
*   `project.vue`: A dedicated page for the project translation workflow. It conditionally displays `ProjectStringsReview.vue` (if strings are extracted but not yet batch translated) or `ProjectStringsResult.vue` (after a batch translation attempt). It also shows relevant loading or error messages.
*   (Future) `settings.vue`, `glossary.vue`.

#### 2.1.7 `public/`

Stores static assets that are served directly from the root and are not processed by Vite. Ideal for files like `favicon.ico`, `robots.txt`, or manifest files.

#### 2.1.8 `stores/`

Houses Pinia store modules for state management. These are also auto-imported.
*   `settings.ts`: Manages application-wide settings and relatively static selectable options. This includes available `languageOptions` and `engineOptions`. (Future: API keys, default preferences, theme settings).
*   `translation.ts`: Manages the state and actions directly related to performing a translation task, specifically batch translation (loading status, results, errors). (The `TranslatableStringEntry` and `TranslatedStringEntry` interfaces are currently defined here but are candidates for a shared types file.)
*   `project.ts`: Manages state for project selection, game engine detection, string extraction, and the subsequent reconstruction, packaging (ZIP creation), saving, and opening of the translated project. This includes state like `tempZipPath`, `finalZipSavedPath`, `saveZipError`, `openFolderError`, and `isLoadingSaveZip`, as well as actions like `reconstructAndPackageFiles`, `saveProjectZip`, and `showProjectZipInFolder`. Its `$reset()` method clears project-specific state and also calls `$resetBatchState()` in `translation.ts`.
*   (Future) `glossary.ts`.

## 3. Key UI Sections & Global Components (Conceptual)

The application will feature several key UI sections, corresponding to pages and collections of components, as well as global components for overall structure:

*   **Global Layout Components:**
    *   `AppHeader.vue`: Provides the main application header with title and global actions (e.g., settings button).
    *   `layouts/default.vue`: The primary layout wrapping pages, incorporating `AppHeader` and the main content area.
*   **Main Translation Interface:** (`pages/index.vue` is now focused on project selection. The single text translation feature has been removed/deferred.)
    *   Project selection is handled by `ProjectSelector.vue` on `pages/index.vue`.
*   **Project Translation View:** (`pages/project.vue`)
    *   Conditionally displays `ProjectStringsReview.vue` (for reviewing extracted strings and configuring/starting batch translation) or `ProjectStringsResult.vue` (for displaying batch translation results and handling ZIP export/saving).
*   **Glossary Management:** (`pages/glossary.vue` - Later Phase)
    *   Interface to add, edit, and delete glossary terms.
*   **Settings Panel:** (`pages/settings.vue` - Later Phase)
    *   Configuration for AI engines (API keys, model selection for Ollama).
    *   Application preferences (theme, default languages).
*   **History Panel:** (Could be part of the main translation UI or a separate view - TBD)
    *   Display of past translations.

## 4. State Management (Pinia)

Pinia stores will be used to manage:

*   **Store Definition:** All Pinia stores will be defined using the **Setup Store** syntax (i.e., a function that returns an object of reactive properties and methods, similar to Vue 3's `setup()` function). This approach aligns best with Nuxt 3 and the Composition API, offering greater flexibility and composability.

*   **`settings.ts`**: Holds application-level settings and configuration data. This includes lists of available languages (`languageOptions`) and translation engines (`engineOptions`) for selection in the UI. In the future, it will also manage user preferences like API keys, default language selections, themes, etc.
*   **`translation.ts`**: Focuses on the operational aspects of performing a translation. It handles the state for an active batch translation process: loading indicators, storing the translated strings (including any errors per string), and any overall errors from the batch translation command. (The `TranslatableStringEntry` and `TranslatedStringEntry` interfaces are currently defined here but are candidates for a shared types file.)
*   **`project.ts`**: Manages state related to the game project itself: selected folder path, game engine detection results, extracted translatable strings, and any errors during these initial project processing steps. It also handles the state and actions for the output ZIP file: `tempZipPath` (path after backend reconstruction), `finalZipSavedPath` (path after user saves it), `saveZipError`, `openFolderError`, and `isLoadingSaveZip`. It includes actions like `selectProjectFolder`, `extractProjectStrings`, `reconstructAndPackageFiles`, `saveProjectZip`, and `showProjectZipInFolder`. Its `$reset()` method clears its own state and triggers a reset of batch translation state in `translation.ts`, ensuring a clean slate when a new project is chosen.
*   **`glossary.ts`**: (Future) Glossary terms and management state.

## 5. Composables

Custom composables in the `composables/` directory will encapsulate reusable logic:

*   **`useTauri.ts`**: Typed wrappers for `invoke` (typically imported from `@tauri-apps/api/core`) and `listen` to interact with Tauri backend commands and events.
*   **`useSettings.ts`**: Functions for managing and persisting application settings (likely interacting with `tauri-plugin-store` via `useTauri`).
*   Other domain-specific composables as needed.

## 6. UI Component Strategy

*   Primarily use components from `Nuxt UI` for consistency and rapid development.
*   Create custom components in the `components/` directory, organized by feature (e.g., `translation/`, `project/`) or commonality (`