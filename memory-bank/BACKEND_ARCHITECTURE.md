# Game Translator Architecture: Domain-Driven Approach

## Core Principles
- **Domain Focus**: Organized around business domains rather than technical layers
- **Clear Boundaries**: Explicit interfaces between different domains
- **High Cohesion**: Related functionality grouped together
- **Low Coupling**: Minimal dependencies between domains
- **Explicit Dependencies**: Clear and intentional dependencies
- **Type Safety**: Strong typing across the entire codebase

## Top-Level Directory Structure

```
src-tauri/
├── migrations/               # Database migration SQL files
│   └── ...                   # (e.g., 1_initial_schema.sql)
├── src/                          # Main backend source directory
│   ├── models/                   # Data structures: defines types, validation, and errors (no business logic)
│   │   ├── mod.rs                # Module exports
│   │   ├── shared/               # Common types used across domains
│   │   │   ├── mod.rs            # Module exports
│   │   │   ├── content.rs        # Content types and base structures
│   │   │   └── errors.rs         # Error types and handling
│   │   ├── translation/          # Translation-specific models
│   │   │   ├── mod.rs            # Module exports
│   │   │   ├── language.rs       # Language definitions and capabilities
│   │   │   ├── provider.rs       # Provider configuration
│   │   │   └── prompt.rs         # Prompt template structures
│   │   └── game/                 # Game engine models
│   │       ├── mod.rs            # Module exports
│   │       ├── common/           # Common game types
│   │       │   ├── mod.rs        # Module exports
│   │       │   ├── content.rs    # Game content types
│   │       │   └── metadata.rs   # Metadata structures
│   │       └── [engine-name]/    # Engine-specific data structures (e.g., rpgmv, rpgmz, etc.)
│   │           ├── mod.rs        # Module exports
│   │           ├── common.rs     # Common types for this engine
│   │           └── data/         # Data structures for each engine file type
│   │               ├── mod.rs    # Module exports
│   │               ├── [engine-file-name].rs # Data structure for a specific file (e.g., actors.rs, items.rs)
│   │               └── ...       # Other engine data files
│   ├── domain/                   # Core business logic (no external dependencies)
│   │   ├── common/              # Shared traits, utilities, and abstractions for all domain logic (translation, game, etc.)
│   │   │   ├── mod.rs           # Module exports
│   │   │   ├── traits.rs        # Common domain traits (e.g., Extractor, Injector, Validatable)
│   │   │   └── utils.rs         # Generic helpers and utilities
│   │   ├── translation/          # Translation logic (provider traits, workflow)
│   │   │   ├── mod.rs            # Module exports
│   │   │   ├── providers/        # Provider implementations
│   │   │   │   ├── mod.rs        # Module exports
│   │   │   │   ├── base.rs       # Base provider traits
│   │   │   │   ├── ollama.rs     # Ollama-specific implementation
│   │   │   │   └── ...           # Other providers (future)
│   │   │   ├── prompt/           # Prompt management
│   │   │   │   ├── mod.rs        # Module exports
│   │   │   │   ├── manager.rs    # Prompt loading and management
│   │   │   │   └── templates.rs  # Template handling
│   │   │   └── workflow/         # Translation workflow
│   │   │       ├── mod.rs        # Module exports
│   │   │       ├── pipeline.rs   # Translation pipeline
│   │   │       └── batch.rs      # Batch processing
│   │   └── game/                 # Game processing logic
│   │       ├── mod.rs            # Module exports
│   │       ├── common/           # Game-specific shared logic (engine abstraction, extraction, injection)
│   │       │   ├── mod.rs        # Module exports
│   │       │   ├── engine.rs     # Engine interface
│   │       │   ├── extraction.rs # Generic text extraction (game-specific)
│   │       │   └── injection.rs  # Generic text injection (game-specific)
│   │       └── [engine-name]/    # RPG Maker MV implementation (engine-specific domain root)
│   │           ├── mod.rs        # Module exports
│   │           ├── data/         # File-type-specific logic (extraction, injection)
│   │           │   ├── mod.rs     # Module exports
│   │           │   ├── [engine-file-name].rs  # Extraction and injection for a specific file (e.g., Actors.json, Items.json)
│   │           │   └── ...        # Other file types
│   │           └── ...            # Other engine-wide logic, validation, workflow, etc.
│   ├── infrastructure/           # External system integration (APIs, storage, config)
│   │   ├── mod.rs                # Module exports
│   │   ├── api/                  # External API clients
│   │   │   ├── mod.rs            # Module exports
│   │   │   ├── ollama/           # Ollama API integration
│   │   │   │   ├── mod.rs        # Module exports
│   │   │   │   ├── client.rs     # HTTP client implementation
│   │   │   │   └── models.rs     # API-specific models
│   │   │   └── ...               # Other API clients (future)
│   │   ├── storage/              # Data persistence (SQLite via SQL plugin for complex data, Store plugin for settings, file I/O)
│   │   │   ├── mod.rs            # Module exports
│   │   │   ├── project.rs        # Project storage logic (uses SQLite via frontend plugin calls)
│   │   │   ├── game/             # Game-specific storage logic (uses SQLite via frontend calls, file I/O)
│   │   │   │   ├── mod.rs        # Module exports
│   │   │   │   └── [engine-name].rs # RPGMV file operations (uses SQLite via frontend calls)
│   │   │   └── cache.rs          # Translation cache logic (uses SQLite via frontend calls)
│   │   └── resources/            # Resource loading (prompts, config)
│   │       ├── mod.rs            # Module exports
│   │       ├── prompt.rs         # Loads prompt templates from top-level resources/prompts/
│   │       └── config.rs         # Loads config files from top-level resources/config/
│   ├── application/              # Application services: coordinates workflows between domain and infrastructure
│   │   ├── mod.rs                # Module exports
│   │   ├── translation/          # Translation services: orchestrates extraction, provider calls, and storage for translating files
│   │   │   ├── mod.rs            # Module exports
│   │   │   ├── [engine-name]/    # RPGMV-specific translation workflow
│   │   │   │   ├── mod.rs       # Module exports
│   │   │   │   └── file_services/ # File-type specific application services
│   │   │   │       ├── mod.rs   # Module exports
│   │   │   │       └── actors.rs# Service logic specifically for Actors.json
│   │   │   │       # (Future: items.rs, skills.rs, ...)
│   │   │   ├── queue.rs          # Translation queue management (batch/async jobs)
│   │   │   └── stats.rs          # Translation statistics/progress tracking
│   │   ├── project/              # Project management: handles creation, loading, saving, and import/export of translation projects
│   │   │   ├── mod.rs            # Module exports
│   │   │   ├── service.rs        # Project service (create, load, save, delete)
│   │   │   └── import.rs         # Project import/export logic
│   │   └── settings/             # Settings management: manages app/user settings and validation
│   │       ├── mod.rs            # Module exports
│   │       ├── service.rs        # Settings service (get/set/update settings)
│   │       └── validation.rs     # Settings validation logic
│   ├── commands/                 # Frontend interface: exposes backend functionality to the frontend
│   │   ├── mod.rs                # Module exports
│   │   ├── translation.rs        # Translation commands (Tauri IPC)
│   │   ├── project.rs            # Project management commands
│   │   └── settings.rs           # Settings commands
│   └── lib.rs                    # Library exports (wiring, command registration, state setup)
│   └── main.rs                   # Application entry point
└── resources/                    # External resources (prompts, config)
    ├── prompts/                  # Prompt templates for translation
    │   ├── prompt_dialogue.txt   # Dialogue prompt template
    │   ├── prompt_menu.txt       # Menu prompt template
    │   └── ...                   # Other prompt templates
    └── config/                   # Configuration files
        ├── default.json          # Default config
        └── ...                   # Other config files
```

## Detailed Structure

### Models Layer
Defines the shape of data and validation rules without business logic.

```
models/
├── shared/               # Common types used across domains
│   ├── mod.rs           # Module exports
│   ├── content.rs       # Content types and base structures
│   └── errors.rs        # Error types and handling
│
├── translation/         # Translation-specific models
│   ├── mod.rs           # Module exports
│   ├── language.rs      # Language definitions and capabilities
│   ├── provider.rs      # Provider configuration
│   └── prompt.rs        # Prompt template structures
│
└── game/                # Game engine models
    ├── mod.rs           # Module exports
    ├── common/          # Common game types
    │   ├── mod.rs       # Module exports
    │   ├── content.rs   # Game content types
    │   └── metadata.rs  # Metadata structures
    │
    └── [engine-name]/    # Engine-specific data structures (e.g., rpgmv, rpgmz, etc.)
        ├── mod.rs         # Module exports
        ├── common.rs      # Common types for this engine
        └── data/          # Data structures for each engine file type
            ├── mod.rs     # Module exports
            ├── [engine-file-name].rs # Data structure for a specific file (e.g., actors.rs, items.rs)
            └── ...        # Other engine data files
```

**Subfolder summaries:**
- `shared/`: Common types and errors used across multiple domains/features. E.g., content IDs, timestamps, shared error types.
- `translation/`: Data types and validation for all translation-related features. E.g., language enums, provider configs, prompt templates.
- `game/`: Data types and validation for game/engine-specific structures. E.g., engine-specific models, common game types, per-engine data files.

**Summary:**
- The Models Layer defines all data structures, validation rules, and error types used across the backend.
- This layer contains no business logic or side effects—just pure types and validation.
- It enables type safety, validation, and clear contracts between all layers (domain, infrastructure, application, commands).
- By centralizing data definitions, it ensures consistency and maintainability throughout the codebase.

**Purpose**: 
- Define data structures with minimal dependencies
- Establish core types used throughout the application
- Provide validation rules but no business logic
- Enable type safety across domains

**Note:**
- Each `[engine-file-name].rs` struct should include **all fields** from the original game data file, not just the translatable ones. This ensures correct parsing, validation, and round-trip serialization.
- Use `#[derive(serde::Serialize, serde::Deserialize)]` on these structs so they can be easily read from and written to JSON (or other formats) using the serde crate.
- `Serialize` lets you turn a Rust struct into JSON; `Deserialize` lets you turn JSON into a Rust struct.

**Details on key utilities:**
- `shared/content.rs`: Defines generic, reusable types for content IDs, text blocks, and metadata that are used across multiple domains (e.g., ContentId, ContentBlock, ContentMetadata). These types are not specific to translation or games, but provide a foundation for representing and referencing content everywhere in the backend.
- `translation/prompt.rs`: Defines the structure for prompt templates and variables used to instruct LLM/AI translation providers. Prompts may differ by provider, so this module is designed to be flexible and extensible for different prompt styles and requirements.
- `game/common/content.rs`: Provides shared types for representing game content elements (like names, descriptions, or IDs) that are common to many game data files (actors, items, etc.) and engines. This enables consistent modeling and validation of game content across the codebase.

### Domain Layer
Contains core business logic without external dependencies.

```
domain/
├── common/              # Shared traits, utilities, and abstractions for all domain logic (translation, game, etc.)
│   ├── mod.rs           # Module exports
│   ├── traits.rs        # Common domain traits (e.g., Extractor, Injector, Validatable)
│   └── utils.rs         # Generic helpers and utilities
├── translation/         # Translation logic (provider traits, workflow)
│   ├── mod.rs           # Module exports
│   ├── providers/       # Provider implementations
│   │   ├── mod.rs      # Module exports
│   │   ├── base.rs     # Base provider traits
│   │   ├── ollama.rs   # Ollama-specific implementation
│   │   └── ...         # Other providers (future)
│   │
│   ├── prompt/          # Prompt management
│   │   ├── mod.rs      # Module exports
│   │   ├── manager.rs  # Prompt loading and management
│   │   └── templates.rs # Template handling
│   │
│   └── workflow/        # Translation workflow
│       ├── mod.rs      # Module exports
│       ├── pipeline.rs # Translation pipeline
│       └── batch.rs    # Batch processing
│
└── game/                # Game processing logic
    ├── mod.rs           # Module exports
    ├── common/          # Game-specific shared logic (engine abstraction, extraction, injection)
    │   ├── mod.rs       # Module exports
    │   ├── engine.rs    # Engine interface
    │   ├── extraction.rs # Generic text extraction (game-specific)
    │   └── injection.rs  # Generic text injection (game-specific)
    │
    └── [engine-name]/    # RPG Maker MV implementation (engine-specific domain root)
        ├── mod.rs         # Module exports
        ├── data/          # File-type-specific logic (extraction, injection)
        │   ├── mod.rs     # Module exports
        │   ├── [engine-file-name].rs  # Extraction and injection for a specific file (e.g., Actors.json, Items.json)
        │   └── ...        # Other file types
        └── ...            # Other engine-wide logic, validation, workflow, etc.
```

**Note:**
- `domain/common/` is **only** for logic, traits, and utilities shared across all domain logic (translation, game, etc.).
- `domain/game/common/` is **strictly** for logic shared only by game engines and file types.
- **Do not nest domain-specific common folders (like `domain/common/game/`) inside the global common folder.** This keeps boundaries clear and prevents confusion.

**Summary:**
- The Domain Layer is the heart of your backend. It contains all core business logic, rules, and workflows that define your app's features.
- This layer is **pure**: no infrastructure code (no HTTP, DB, file I/O), no application orchestration, and no frontend/backend interface code.
- It is split into cross-domain shared logic (`common/`), engine-agnostic game logic (`game/common/`), and engine-specific logic (`game/[engine-name]/`).
- Implements traits, interfaces, validation, transformation, and workflow logic—everything that makes your app unique.
- This layer is highly testable, reusable, and independent of how data is stored, retrieved, or presented.

**Purpose**:
- Implement core business logic with no external dependencies
- Define domain-specific operations and transformations
- Encapsulate complex business rules
- Provide high-level abstractions for the application layer
- Maintain independence from infrastructure concerns
- **domain/common/** is for traits/utilities shared across all domain logic (translation, game, etc.).
- **domain/game/common/** is for logic shared only by game engines and file types.
- **Engine-specific domain roots** (like [engine-name]/) coordinate all logic for that engine, while file-type-specific logic (extraction, injection) lives in dedicated files in the data/ subfolder for clarity and scalability.

**Rationale for this structure:**
- Keeps all shared abstractions and helpers in one place (`common/`), making code reuse and cross-domain logic easy.
- Keeps all game-specific shared logic in `game/common/` for engine/file-type reuse.
- Keeps all extractors/injectors for RPGMV file types (actors, items, maps, etc.) organized in one place (`data/`), making the codebase easier to navigate and extend.
- [engine-name]/ can also contain engine-wide logic, validation, or workflows that operate across multiple file types.
- This separation matches DDD best practices and keeps the domain layer modular, testable, and future-proof.

### Pluggable Engine Detection and File Parsing

To support future expansion (multiple engines and file types), the domain layer uses a pluggable, trait-based approach for engine detection and file parsing. This enables new engines or file types to be added by simply implementing a trait, without modifying core logic or workflows.

**Why:**
- Keeps engine/file-specific logic isolated and testable
- Makes it trivial to add support for new engines or file formats
- Fits DDD and vertical slice patterns

**Example:**
```rust
/// Trait for engine detection logic
pub trait EngineDetector {
    fn detect(&self, game_dir: &Path) -> bool;
    fn name(&self) -> &'static str;
}

/// RPGMV implementation
pub struct RpgmvDetector;
impl EngineDetector for RpgmvDetector {
    fn detect(&self, game_dir: &Path) -> bool {
        // check for www/data/Actors.json, www/js/rpg_core.js, etc.
    }
    fn name(&self) -> &'static str { "RPG Maker MV" }
}

// Add more detectors as needed (e.g., for RPGMZ, VX Ace, etc.)

/// Trait for file parsing
pub trait FileParser {
    fn parse(&self, file: &Path) -> Result<ParsedContent, Error>;
    fn file_type(&self) -> &'static str;
}
```

**Usage:**
- Keep a list of `EngineDetector` implementations and run them in order to detect the engine.
- Same for `FileParser`—register parsers for each file type/engine.
- Adding a new engine or file type = just add a new struct that implements the trait.

This approach keeps the codebase clean, extensible, and future-proof for new engines and file types.

### Infrastructure Layer
Handles integration with external systems and dependencies.

```
infrastructure/
├── api/                 # External API clients
│   ├── mod.rs           # Module exports
│   ├── ollama/          # Ollama API integration
│   │   ├── mod.rs      # Module exports
│   │   ├── client.rs   # HTTP client implementation
│   │   └── models.rs   # API-specific models
│   │
│   └── ...              # Other API clients (future)
│
├── storage/             # Data persistence (SQLite via SQL plugin for complex data, Store plugin for settings, file I/O)
│   ├── mod.rs           # Module exports
│   ├── project.rs       # Project storage logic (uses SQLite via frontend plugin calls)
│   ├── game/            # Game-specific storage logic (uses SQLite via frontend calls, file I/O)
│   │   ├── mod.rs       # Module exports
│   │   └── [engine-name].rs # RPGMV file operations (uses SQLite via frontend calls)
│   └── cache.rs         # Translation cache logic (uses SQLite via frontend calls)
│
└── resources/           # Resource loading (prompts, config)
    ├── mod.rs           # Module exports
    ├── prompt.rs        # Loads prompt templates from top-level resources/prompts/
    └── config.rs        # Loads config files from top-level resources/config/
```

**Purpose**:
- Implement interfaces to external systems
- Handle network communication, file I/O, and persistence (using Tauri SQL plugin for structured data like history/cache, Tauri Store plugin for simple key-value settings)
- Encapsulate infrastructure concerns away from business logic
- Provide adapters between domain logic and external systems
- Manage resource loading and configuration

**Prompt Templates Location:**
- All prompt templates (e.g., `name.txt`, `dialogue.txt`) are stored in the top-level `resources/prompts/` directory, not in the Rust source tree.
- The loader code in `infrastructure/resources/prompt.rs` is responsible for loading these files from `resources/prompts/` at runtime using relative paths and `include_str!`.
- This keeps non-code assets separate from backend code, making updates and localization easier.

**SQLite Database File Location:**
- **Development:** If you use a relative path like `sqlite:mydb.sqlite`, the file is created in the project root (where you run the app).
- **Production (recommended):** Store the SQLite file in a platform-specific app data directory:
  - **Windows:** `%APPDATA%/<YourAppName>/mydb.sqlite`
  - **macOS:** `~/Library/Application Support/<YourAppName>/mydb.sqlite`
  - **Linux:** `~/.config/<YourAppName>/mydb.sqlite`
- **How to control the location:** Use Tauri's `tauri::api::path::BaseDirectory` to resolve the correct directory. The Tauri SQL plugin resolves paths relative to `AppConfig` by default, but you can specify an absolute path if needed.
- **Example:**
  ```ts
  // This will create the DB in the app config directory by default
  const db = await Database.load('sqlite:mydb.sqlite');
  ```
- For portability and user data safety, always set the path explicitly for production builds.

**Reference:**
- [Tauri SQL Plugin Guide: Database Path](https://v2.tauri.app/plugin/sql/)

**Database interaction is primarily handled by the frontend using the `@tauri-apps/plugin-sql` library.** The backend (`lib.rs`) initializes the plugin and defines migrations. Direct backend database access using `sqlx` is rare and should only be used for backend-internal tasks not involving frontend requests.

### Application Layer
Coordinates between domains and provides application services.

```
application/
├── translation/         # Translation services: orchestrates extraction, provider calls, and storage for translating files
│   ├── mod.rs           # Module exports
│   ├── [engine-name]/   # RPGMV-specific translation workflow
│   │   ├── mod.rs       # Module exports
│   │   └── file_services/ # File-type specific application services
│   │       ├── mod.rs   # Module exports
│   │       └── actors.rs# Service logic specifically for Actors.json
│   │       # (Future: items.rs, skills.rs, ...)
│   ├── queue.rs         # Translation queue management (batch/async jobs)
│   └── stats.rs         # Translation statistics/progress tracking
│
├── project/             # Project management: handles creation, loading, saving, and import/export of translation projects
│   ├── mod.rs           # Module exports
│   ├── service.rs       # Project service (create, load, save, delete)
│   └── import.rs        # Project import/export logic
│
└── settings/            # Settings management: manages app/user settings and validation
    ├── mod.rs           # Module exports
    ├── service.rs       # Settings service (get/set/update settings)
    └── validation.rs    # Settings validation logic
```

**Purpose:**
- Orchestrate workflows and use cases by coordinating domain logic and infrastructure
- Manage application state, progress, and error propagation
- Expose high-level services for the commands layer (frontend interface)
- Implement multi-step processes (e.g., extract → translate → save)
- Keep orchestration logic out of domain and infrastructure

**Subfolders:**
- `translation/`: All translation-related workflows, queue management, and stats
- `project/`: Project lifecycle management (create, load, save, import/export)
- `settings/`: App/user settings management and validation

**What does NOT go here:**
- No business rules (that's domain)
- No direct DB/file I/O (that's infrastructure)
- No frontend/IPC code (that's commands)

**Summary:**
The Application Layer is the workflow and use-case coordinator. It glues together domain logic and infrastructure, manages state, and exposes high-level services for the frontend to use. All app features and flows are implemented here, keeping the rest of the backend clean and modular.

### Commands Layer
Provides the interface between frontend and backend.

```
commands/
├── mod.rs               # Module exports
├── translation.rs       # Translation commands (Tauri IPC)
├── project.rs           # Project management commands
└── settings.rs          # Settings commands
```

**Purpose**:
- Expose backend functionality to the frontend
- Handle serialization/deserialization of command payloads
- Validate command inputs
- Route commands to appropriate application services
- Return structured responses to the frontend

### Resources Directory
Contains external resources needed by the application.

```
resources/
├── prompts/             # Prompt templates for translation
│   ├── prompt_dialogue.txt # Dialogue prompt template
│   ├── prompt_menu.txt     # Menu prompt template
│   └── ...                 # Other prompt templates
│
└── config/              # Configuration files
    ├── default.json     # Default config
    └── ...              # Other config files
```

**Purpose**:
- Store external resources separate from code
- Maintain prompt templates and configuration
- Allow for easy updates without recompilation
- Support localization and customization

## Key Benefits of This Architecture

1. **Domain Focus**
   - Organizes code around business domains rather than technical layers
   - Makes domain concepts explicit in the code structure
   - Improves discoverability and maintainability

2. **Clear Boundaries**
   - Explicit interfaces between domains
   - Dependencies flow inward (infrastructure → domain → application → commands)
   - Easier to reason about and test

3. **Flexibility**
   - Easy to add new features within existing domains
   - Simple to extend with new domains
   - Clear paths for evolution

4. **Testability**
   - Domain logic can be tested without external dependencies
   - Infrastructure concerns are isolated for easier mocking
   - Application services can be tested with domain mocks

5. **Performance**
   - Efficient data flow through the system
   - Clear separation between heavy calculations and UI concerns
   - Enables optimized resource usage

## Testing
- Use Rust's built-in test framework for unit and integration tests
- For Tauri backend, use [Tauri's official mocking tools](https://v2.tauri.app/develop/tests/mocking/) to simulate IPC and backend commands
- Validate API contracts between frontend and backend
- Ensure all core domain logic, infrastructure, and application services are covered by tests

## TODO
- Set up Rust unit and integration tests for all core modules
- Add Tauri mockIPC tests for backend command handlers
- Validate API contracts with frontend

## Data Flow

1. Frontend sends command through Tauri
2. Command handler validates input and calls application service
3. Application service coordinates domain objects and infrastructure
4. Domain logic processes the data
5. Results flow back through application to command handler
6. Command handler returns structured response to frontend

## Error Handling

- **Models**: Validation errors (invalid data structures)
- **Domain**: Business rule errors (invalid operations)
- **Infrastructure**: External system errors (API failures, file I/O issues)
- **Application**: Coordination errors (workflow issues)
- **Commands**: Input validation errors (invalid payloads)

## Development Guidelines

1. Keep models as pure data structures
2. Place business logic in the domain layer
3. Use infrastructure for external system integration
4. Implement use cases in the application layer
5. Keep commands thin and focused on the frontend interface
6. Maintain clear dependencies flowing inward

### Implementation Notes

- Each phase builds on the previous one
- Early phases focus on structural elements
- Later phases focus on features and integration
- Testing should happen throughout all phases
- Refactoring may be necessary as the understanding of the domain evolves
- Consider implementing vertical slices (complete features through all layers) for faster feedback
- All persistent data (projects, jobs, cache) is stored in a local SQLite database using the **Tauri SQL plugin**.

## Component Interactions

This section illustrates how different parts of the architecture interact with each other.

### Folder Interaction Diagram

```
Frontend (Vue/Nuxt)
        │
        ▼
  [Tauri Bridge]
        │
        ▼
┌───────────────────────────────┐
│         commands/            │           <-- Handles Input/Output with Frontend
└───────┬──────────────────────┘
        │ Calls ▼
┌───────────────────────────────┐
│       application/           │           <-- Orchestrates Use Cases
└───────┬──────────────────────┘
        │ Calls ▼                 │ Uses ▼ (often via Domain Traits)
┌──────────────────────┐   ┌────────────────────────┐
│       domain/        │──▶│    infrastructure/     │
│  - Core Logic        │   │ - External Systems     │
│  - Interfaces/Traits │   │ - DB, API, Filesystem  │
│  (e.g., Translator)  │   │ - Implements Interfaces│
└─────────┬────────────┘   └──────────┬─────────────┘
          │ Uses ▼                    │ Uses ▼
          └────────────┬──────────────┘
                       │
                       ▼
                ┌─────────────┐
                │   models/   │              <-- Data Structures
                └─────────────┘

Legend:
- ▼: Represents a direct call or usage flow.
- ▶: Represents a dependency. Infrastructure depends on abstractions (like traits or interfaces) defined in the Domain and Models layers. Infrastructure implements these abstractions.
- `Application` layer coordinates use cases by calling `Domain` layer methods and `Infrastructure` layer implementations (often accessed via `Domain` traits).
- Dependencies generally flow towards `models`. The `Domain` layer should not depend on `Infrastructure`, `Application`, or `Commands`.
```

