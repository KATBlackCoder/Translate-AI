# Translation AI

A TypeScript-based application for translating RPG Maker MV game content. The project provides a structured way to extract, translate, and reapply translations to RPG Maker MV game files using various AI providers.

## Core Features

- Extract translatable content from RPG Maker MV game files
- Manage translations with context and tracking
- Apply translations back to game files
- Validate RPG Maker MV project structure
- Support for multiple game engines (currently focused on RPG Maker MV)
- Support for multiple AI providers (Ollama, ChatGPT, DeepSeek)
- Content rating system for handling NSFW content

## Project Structure

### Engine System

The project uses an engine-based architecture to support different game engines:

- `GameEngine` interface defines the contract for game engine implementations
- `RPGMakerMVEngine` implements translation support for RPG Maker MV games
- Each engine handles:
  - Project validation
  - File reading
  - Translation extraction
  - Translation application

### AI Provider System

The application implements a flexible AI provider system:

- `AIProvider` interface defines the contract for all AI providers
- `BaseProvider` implements common functionality (caching, rate limiting, retries)
- Specialized providers for:
  - `OllamaProvider`: Local Ollama AI models
  - `ChatGPTProvider`: OpenAI's ChatGPT models
  - `DeepSeekProvider`: DeepSeek AI models
- Content rating support across all providers
- Quality scoring for translations

### Data Types

#### RPG Maker MV Types

- `RPGMVActorData`: Array structure for actor data (with null first element)
- `RPGMVActor`: Individual actor properties (name, profile, etc.)
- `RPGMVBaseData`: Common properties across all data types
- Additional types for items, skills, classes, etc.

#### Translation Types

- `TranslationTarget`: Structure for translation entries
- `EngineFile`: Represents game data files
- `EngineValidation`: Project validation results

#### AI Types

- `AIProviderConfig`: Configuration for AI providers
- `AIModelPreset`: Model settings and capabilities
- `ContentRating`: Content appropriateness rating ('sfw'/'nsfw')
- `PromptType`: Different types of translation prompts

### File Structure

```
src/
├── engines/           # Game engine implementations
├── types/            # TypeScript type definitions
│   ├── engines/      # Engine-specific types
│   ├── ai/           # AI provider types
│   └── shared/       # Shared type definitions
├── composables/      # Vue.js composables
│   └── providers/    # AI provider composables
├── stores/          # Pinia state management
├── services/        # Service implementations
│   └── providers/   # AI provider implementations
└── config/          # Configuration and settings
    └── provider/    # AI provider configuration
```

## Key Components

### RPG Maker MV Engine

- Handles RPG Maker MV specific file structure
- Manages actor translations with proper context
- Supports multiple translatable fields:
  - Name
  - Nickname
  - Profile
  - Notes

### AI Provider System

- Abstract base provider with shared functionality
- Provider-specific implementations
- Content rating validation
- Translation quality scoring
- Centralized error handling
- Configurable model presets

### File Management

- Validates required game files
- Reads JSON data files
- Maintains file structure integrity
- Handles file system errors gracefully

### Translation Flow

1. Validate project structure
2. Read game data files
3. Extract translatable content
4. Process translations with configured AI provider
5. Apply translations back to files

## Development

- Built with TypeScript for type safety
- Uses Vue.js with Composition API
- State management with Pinia
- UI components with PrimeVue
- Desktop integration with Tauri
- Unit testing with Vitest

## Project Goals

- Provide accurate game content translation
- Maintain game file integrity
- Support multiple game engines
- Support multiple AI providers
- Ensure content appropriateness with rating system
- Ensure type safety throughout the application
- Deliver a user-friendly translation workflow 
