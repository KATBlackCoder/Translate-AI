# Backend Structure Guide

For a full breakdown of the backend architecture, see [BACKEND_ARCHITECTURE.md](mdc:BACKEND_ARCHITECTURE.md).

> All persistent data (projects, jobs, cache) is stored in a local SQLite database using the [Tauri SQL plugin](mdc:https:/v2.tauri.app/plugin/sql).

The backend is organized using Domain-Driven Design principles. Here's a breakdown of the main folders and their key subfolders in [src-tauri/src](mdc:src-tauri/src), including their utilities and purposes:

- **[models/](mdc:src-tauri/src/models)**: Pure data types, validation, and error types. No business logic. Used for type safety and data transfer across the backend.
  - **[shared/](mdc:src-tauri/src/models/shared)**: Common types, content, and error definitions used across domains. Utility: Centralizes reusable types and error handling.
  - **[translation/](mdc:src-tauri/src/models/translation)**: Language, provider, and prompt models for translation features. Utility: Defines the structure of translation-related data.
  - **[game/](mdc:src-tauri/src/models/game)**: Game engine models. Utility: Structures for representing game data.
    - **[common/](mdc:src-tauri/src/models/game/common)**: Shared game types and metadata. Utility: Abstracts common game concepts for reuse.
    - **[[engine-name]/](mdc:src-tauri/src/models/game/[engine-name])**: Engine-specific data structures (e.g., rpgmv). Utility: Models for a specific engine's files and resources.

- **[domain/](mdc:src-tauri/src/domain)**: Core business logic and rules. No external dependencies. Implements the "what" and "how" of the app's features.
  - **[translation/](mdc:src-tauri/src/domain/translation)**: Provider traits/implementations, prompt management, translation workflow. Utility: Implements translation logic and provider abstraction.
    - **[providers/](mdc:src-tauri/src/domain/translation/providers)**: Implementations for different AI/LLM providers. Utility: Encapsulates provider-specific logic.
  - **[game/](mdc:src-tauri/src/domain/game)**: Engine interface, extraction/injection, and game-specific logic. Utility: Handles game data processing and transformation.
    - **[common/](mdc:src-tauri/src/domain/game/common)**: Engine abstraction, extraction, and injection logic. Utility: Provides generic logic for all supported engines.
    - **[[engine-name]/](mdc:src-tauri/src/domain/game/[engine-name])**: Engine-specific parsing, extraction, injection, and validation (e.g., rpgmv). Utility: Handles file operations and validation for a specific engine.

**[infrastructure/](mdc:src-tauri/src/infrastructure)**: Handles all external systems: APIs, file I/O, storage, and resource loading. Adapters between domain  and the outside world.
  - **[api/](mdc:src-tauri/src/infrastructure/api)**: API clients for external services (Ollama, etc.). Utnages HTTP requests and responses to AI providers.
  - **[storage/](mdc:src-tauri/srctorage)**: Project/game storage and translation cache, all imping SQLite via the [Tauri SQL plugin](mdc:https:/v2.tauri.app/plugin/sql). Utility: Handles persistent data storage and caching.
  - **[resources/](mdc:src-tauri/src/infrastructure/resources)**: Prompt/config file loading and resource management. Utility: Loads and manages external resources needed by the app.

- **[application/](mdc:src-tauri/src/application)**: Orchestrates workflows and coordinates between domain and infrastructure. Implements use cases, manages state, and exposes high-level services.
  - **[translation/](mdc:src-tauri/src/application/translation)**: Translation services, queue management, and statistics. Utility: Coordinates translation operations and tracks progress/stats.
  - **[[engine-name]/](mdc:src-tauri/src/application/translation/[engine-name])**: Engine-specific translation workflow coordination (e.g., rpgmv).
    - **[file_services/](mdc:src-tauri/src/application/translation/[engine-name]/file_services)**: Services for specific engine file types.
      - `[file-type].rs`: Service logic for a specific file type (e.g., `Actors.json`).
  - **[project/](mdc:src-tauri/src/application/project)**: Project management logic.
  - **[settings/](mdc:src-tauri/src/application/settings)**: Settings management logic.

- **[commands/](mdc:src-tauri/src/commands)**: Tauri/IPC interface for frontend-backend communication. Validates input, routes requests to the application layer, and serializes responses. Utility: Entry point for frontend requests.

- **[migrations/](mdc:src-tauri/migrations)**: Contains `.sql` files defining database schema changes (migrations). Utility: Manages database schema evolution.

- **[resources/](mdc:src-tauri/resources)**: External files such as prompt templates and config files. Supports localization, customization, and user-provided data. Utility: Stores non-code assets for runtime use.

- **[lib.rs](mdc:src-tauri/src/lib.rs) / [main.rs](mdc:src-tauri/src/main.rs)**: Rust entry points and exports. Bootstraps the app and wires everything together. Utility: Application startup and module exports.

Each folder and subfolder has a single, clear responsibility and utility, keeping the codebase clean, testable, and easy to extend.

---

## Folder Interaction

The backend folders interact in a layered, inward-flowing way:

- **Frontend** sends requests to **[commands/](mdc:src-tauri/src/commands)**
- **commands/** validates input and calls **[application/](mdc:src-tauri/src/application)**
- **application/** orchestrates workflows, coordinating **[domain/](mdc:src-tauri/src/domain)** logic and **[infrastructure/](mdc:src-tauri/src/infrastructure)** services
- **domain/** contains pure business logic, operating on types from **[models/](mdc:src-tauri/src/models)**
- **infrastructure/** handles all external integrations (APIs, storage, resources)
- **models/** provides the data types used everywhere
- Results and responses flow back up the same path

**Dependency direction:** dependencies flow inward (infra → domain → application → commands), never the other way around.

This structure keeps logic isolated, dependencies clear, and the codebase easy to reason about and extend.









