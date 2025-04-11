# Type System Organization

## Directory Structure

```
src/
├── core/                  # Core abstractions only
│   ├── index.ts          # Main entry point for core
│   ├── ai/
│   │   ├── index.ts      # Exports AI base classes and interfaces
│   │   └── base/         # Base implementations (HOW)
│   │       ├── base-provider.ts # Generic base provider
│   │       ├── openai-base-provider.ts # OpenAI-specific base provider
│   │       ├── base-translation.ts # Base translation implementation
│   │       ├── base-prompt.ts # Base prompt implementation
│   │       ├── base-cost.ts # Base cost implementation
│   │       └── base-error.ts # Error handling
│   └── engines/
│       ├── index.ts      # Exports engine base classes
│       └── base-engine.ts # Generic base engine
├── services/             # Concrete implementations
│   ├── providers/        # Provider implementations
│   │   ├── index.ts      # Exports all provider implementations
│   │   ├── ollama-provider.ts # Ollama provider implementation
│   │   └── chatgpt-provider.ts # ChatGPT provider implementation
│   ├── initializers/     # Provider initialization
│   │   ├── index.ts      # Exports all initializers
│   │   └── openai-initializer.ts # OpenAI API format initializer
│   ├── ai/               # AI service implementations
│   │   ├── translation/  # Translation implementations
│   │   │   ├── index.ts  # Exports all translation implementations
│   │   │   ├── chatgpt-translation.ts # ChatGPT translation implementation
│   │   │   └── ollama-translation.ts # Ollama translation implementation
│   │   ├── prompt/       # Prompt implementations
│   │   │   ├── index.ts  # Exports all prompt implementations
│   │   │   ├── chatgpt-prompt.ts # ChatGPT prompt implementation
│   │   │   └── ollama-prompt.ts # Ollama prompt implementation
│   │   └── cost/         # Cost implementations
│   │       ├── index.ts  # Exports all cost implementations
│   │       ├── chatgpt-cost.ts # ChatGPT cost implementation
│   │       └── ollama-cost.ts # Ollama cost implementation
│   └── factory.ts        # Provider factory
├── utils/                # Utilities outside of core
│   ├── index.ts          # Exports all utilities
│   ├── ai/               # AI-specific utilities
│   │   ├── index.ts      # Exports AI utilities
│   │   ├── retry.ts      # Retry mechanism
│   │   ├── rate-limiter.ts # Rate limiting
│   │   └── cache.ts      # Caching utilities
│   └── common/           # Common utilities
│       ├── index.ts      # Exports common utilities
│       └── ...           # Other utility files
└── types/                 # Type definitions only
    ├── ai/               # AI interfaces (WHAT)
    │   ├── index.ts      # Re-exports all AI types
    │   ├── provider.ts   # Provider interfaces
    │   ├── prompt.ts     # Prompt interfaces
    │   ├── store.ts      # Store types
    │   └── config.ts     # Configuration types
    ├── engines/          # Engine interfaces
    │   ├── index.ts      # Re-exports all engine types
    │   ├── base.ts       # Base engine interfaces
    │   ├── translator.ts # Translator interfaces
    │   └── rpgmv/        # RPG Maker MV specific types
    └── shared/           # Shared type definitions
        ├── core.ts       # Core shared types
        ├── languages.ts  # Language-related types
        ├── resources.ts  # Resource-related types
        ├── ai.ts         # AI-related shared types
        └── errors.ts     # Error types
```

## Type System Rules

1. **Module Organization**
   - Core abstractions are in the `core` directory
   - Type definitions are in the `types` directory
   - Utilities are in the `utils` directory
   - Concrete implementations are in the `services` directory
   - Each domain has its own type directory (`ai`, `engines`)
   - Shared types are in the `shared` directory
   - Each module has an `index.ts` that re-exports types

2. **Import Patterns**
   - Never import directly from `@shared`
   - Always import through module index files
   - Example: `import type { LanguageCode } from '@/types/ai'` (not from `@/types/shared/languages`)
   - Import utilities from `@utils` directory
   - Example: `import { RetryManager } from '@/utils/ai/retry'`
   - Import services from `@services` directory
   - Example: `import { ChatGPTProvider } from '@/services/providers/chatgpt-provider'`

3. **Type Definitions**
   - Core types are in `shared/core.ts`
   - Language types are in `shared/languages.ts`
   - Resource types are in `shared/resources.ts`
   - AI-specific shared types are in `shared/ai.ts`
   - Error types are in `shared/errors.ts`
   - AI-specific types are in `ai/*.ts`
   - Engine-specific types are in `engines/*.ts`

4. **Design Principles**
   - **DRY**: Shared types are defined once in `@shared`
   - **SOLID**: Each type file has one clear purpose
   - **YAGNI**: Types are added only when needed

5. **Dependency Flow**
   - Dependencies flow in one direction: `core.ts` → `languages.ts` → `errors.ts` → `resources.ts` → `ai.ts`
   - Each file only depends on files "above" it in the hierarchy
   - No file depends on files "below" it

6. **Language Handling**
   - Use `LanguagePair` instead of separate source/target language parameters
   - Import language types from module indexes, not directly from `@shared`
   - Example: `import type { LanguagePair } from '@/types/ai'`

7. **Type Consistency**
   - Use the same types across modules for similar concepts
   - For example, both AI and engine modules use `LanguagePair` for language pairs
   - Avoid duplicating type definitions across modules

## Implementation Roadmap

### AI Core Implementation
1. **Interfaces**
   - Define contracts for providers, translation, prompts, and costs
   - Ensure interfaces are focused and specific
   - Follow interface segregation principle
   - Make interfaces provider-agnostic

2. **Base Classes**
   - Implement common functionality in base classes
   - Create OpenAI API format base provider
   - Implement base translation, prompt, and cost classes
   - Ensure base classes are extensible
   - Implement error handling with AIErrorFactory

3. **Factory Pattern**
   - Create provider factory for instantiation
   - Implement provider registration system
   - Handle provider configuration
   - Provide provider access

4. **Utilities**
   - Evaluate existing utilities
   - Determine which utilities should be moved to core
   - Create new utilities for common functionality
   - Implement proper dependency injection

5. **Error Handling**
   - Create error hierarchy
   - Add error recovery strategies
   - Implement logging system
   - Standardize error types

### AI Services Implementation
1. **Provider Services**
   - Implement ChatGPT provider
   - Implement Ollama provider
   - Ensure providers follow OpenAI API format
   - Handle provider-specific functionality
   - Extend OpenAIBaseProvider for OpenAI-compatible providers

2. **Initializers**
   - Create OpenAI API format initializer
   - Handle API key validation
   - Handle model validation
   - Handle client initialization

3. **Service Implementations**
   - Implement translation services
   - Implement prompt services
   - Implement cost estimation services
   - Ensure services are provider-specific

4. **Integration Tests**
   - Test ChatGPT provider
   - Test Ollama provider
   - Test provider switching
   - Test error handling

### Engine Implementation
1. **Base Engine**
   - Uses `@engines/base.ts` interface
   - Implements common engine functionality
   - Handles engine lifecycle
   - Manages engine state

2. **Engine Factory**
   - Creates engine instances
   - Manages engine registration
   - Handles engine configuration
   - Provides engine access

### Utility Implementation
1. **AI Utilities**
   - Retry mechanism for API calls
   - Rate limiting for API requests
   - Caching for API responses
   - Error handling for API failures

2. **Common Utilities**
   - File system operations
   - Data transformation
   - Validation functions
   - Helper methods
