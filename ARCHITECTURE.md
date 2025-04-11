# Architecture Documentation

## Overview

This document outlines the architecture of the Game Translation Desktop App, focusing on the core abstractions, type system organization, design principles, and implementation guidelines.

## Design Principles

The architecture follows three core design principles:

### DRY (Don't Repeat Yourself)
- Shared types are defined once in `@shared`
- Common interfaces are defined in base files
- Engine-specific types extend base interfaces
- Error types are standardized across modules
- Language types are shared between AI and engines

### SOLID
1. **Single Responsibility**
   - Each type file has one clear purpose
   - Interfaces are focused and specific
   - Types are grouped by functionality

2. **Open/Closed**
   - Base interfaces allow extension
   - New engines can be added without modification
   - New AI providers can be added without changes

3. **Liskov Substitution**
   - Engine types properly extend base interfaces
   - AI providers follow common interface
   - Shared types maintain consistent behavior

4. **Interface Segregation**
   - Small, focused interfaces
   - Types are split by concern
   - No unnecessary dependencies
   - Large interfaces are broken into smaller ones to avoid circular dependencies

5. **Dependency Inversion**
   - High-level modules depend on abstractions
   - Types define contracts, not implementations
   - Shared types provide common interfaces
   - Dependencies flow in one direction to avoid cycles

### YAGNI (You Aren't Gonna Need It)
- Types are added only when needed
- No speculative type definitions
- Focus on current requirements
- Simple, focused interfaces

## Directory Structure

### @core Directory

The `@core` directory contains the core abstractions for the application. These abstractions define the interfaces and base classes that concrete implementations will use.

#### Files

1. **index.ts**
   - Purpose: Main entry point for core module
   - Contains: Re-exports of all core abstractions
   - Used by: Application code that needs core functionality

2. **ai/**
   - Purpose: Contains AI-related base classes and interfaces
   - Contains:
     - `index.ts`: Exports AI base classes and interfaces
     - `base/`: Base implementations (HOW)
       - `base-provider.ts`: Generic base provider
       - `openai-base-provider.ts`: OpenAI-specific base provider
       - `base-translation.ts`: Base translation implementation
       - `base-prompt.ts`: Base prompt implementation
       - `base-cost.ts`: Base cost implementation
       - `base-error.ts`: Error handling with AIErrorFactory
   - Used by: AI provider implementations

3. **engines/**
   - Purpose: Contains game engine-related base classes
   - Contains:
     - `index.ts`: Exports engine base classes
     - `base-engine.ts`: Generic base engine
   - Used by: Game engine implementations

### @services Directory

The `@services` directory contains concrete implementations of the core abstractions. These implementations provide the actual functionality for the application.

#### Files

1. **providers/**
   - Purpose: Contains AI provider implementations
   - Contains:
     - `index.ts`: Exports all provider implementations
     - `ollama-provider.ts`: Ollama provider implementation
     - `chatgpt-provider.ts`: ChatGPT provider implementation
   - Used by: Application code that needs AI providers

2. **initializers/**
   - Purpose: Contains provider initialization logic
   - Contains:
     - `index.ts`: Exports all initializers
     - `openai-initializer.ts`: OpenAI API format initializer
   - Used by: Provider implementations

3. **ai/**
   - Purpose: Contains AI service implementations
   - Contains:
     - `translation/`: Translation implementations
       - `index.ts`: Exports all translation implementations
       - `chatgpt-translation.ts`: ChatGPT translation implementation
       - `ollama-translation.ts`: Ollama translation implementation
     - `prompt/`: Prompt implementations
       - `index.ts`: Exports all prompt implementations
       - `chatgpt-prompt.ts`: ChatGPT prompt implementation
       - `ollama-prompt.ts`: Ollama prompt implementation
     - `cost/`: Cost implementations
       - `index.ts`: Exports all cost implementations
       - `chatgpt-cost.ts`: ChatGPT cost implementation
       - `ollama-cost.ts`: Ollama cost implementation
   - Used by: Provider implementations

4. **factory.ts**
   - Purpose: Creates provider instances
   - Contains: Provider factory implementation
   - Used by: Application code that needs provider instances

### @utils Directory

The `@utils` directory contains utility functions and classes that are used across the application. These utilities provide common functionality that can be used by both core and implementation code.

#### Files

1. **index.ts**
   - Purpose: Main entry point for utils module
   - Contains: Re-exports of all utilities
   - Used by: Application code that needs utility functions

2. **ai/**
   - Purpose: Contains AI-specific utilities
   - Contains:
     - `index.ts`: Exports AI utilities
     - `retry.ts`: Retry mechanism for API calls
     - `rate-limiter.ts`: Rate limiting for API calls
     - `cache.ts`: Caching for API responses
   - Used by: AI provider implementations

3. **common/**
   - Purpose: Contains common utilities used across the application
   - Contains:
     - `index.ts`: Exports common utilities
     - Various utility files for common functionality
   - Used by: Multiple modules across the application

### @types Directory

The `@types` directory contains type definitions that are used across the application. These types provide a common foundation for the application's type system.

#### @shared Directory

The `@shared` directory contains type definitions that are used across multiple modules. These types provide a common foundation for the application's type system.

##### Files

1. **core.ts**
   - Purpose: Defines core shared types used across the application
   - Contains: Base interfaces and types for common functionality
   - Used by: Multiple modules across the application

2. **languages.ts**
   - Purpose: Defines language-related types used throughout the application
   - Contains: Language codes, language information, and language pairs
   - Used by: Translation services, UI components, and configuration

3. **resources.ts**
   - Purpose: Defines types for resource management
   - Contains: Resource-related interfaces and type definitions
   - Used by: Resource handling implementations

4. **ai.ts**
   - Purpose: Defines AI-specific shared types
   - Contains: AI-related interfaces and type definitions
   - Used by: AI implementations

5. **errors.ts**
   - Purpose: Defines standardized error types
   - Contains: Error interfaces and type definitions
   - Used by: Error handling implementations

#### @ai Directory

The `@ai` directory contains type definitions for AI-related functionality. These types are used across the application to ensure type safety and consistency when working with AI providers.

##### Files

1. **index.ts**
   - Purpose: Serves as the main entry point for all AI-related types
   - Contains: Re-exports of types from @shared and @ai
   - Used by: Application code that needs AI types

2. **provider.ts**
   - Purpose: Defines the core AI provider interface and related types
   - Contains: 
     - `AIProvider` interface
     - Provider metadata types
     - Error message types
     - Provider configuration types
   - Used by: AI provider implementations

3. **prompt.ts**
   - Purpose: Defines prompt-related interfaces and types
   - Contains: Prompt interfaces and prompt-related type definitions
   - Used by: AI prompt implementations

4. **store.ts**
   - Purpose: Defines types for AI state management
   - Contains: State interfaces, action types, and store-related type definitions
   - Used by: AI state management implementation

5. **config.ts**
   - Purpose: Defines configuration types for AI providers
   - Contains: 
     - Provider-specific configuration types
     - Model configuration types
     - Settings and options types
   - Used by: AI provider configuration implementations

#### @engines Directory

The `@engines` directory contains type definitions for game engine-specific functionality. These types define the structure and requirements for different game engines.

##### Files

1. **index.ts**
   - Purpose: Serves as the main entry point for all engine-related types
   - Contains: Re-exports of types from @shared and @engines
   - Used by: Application code that needs engine types

2. **base.ts**
   - Purpose: Defines the base interface for all game engines
   - Contains: Core engine interfaces and common types
   - Used by: All engine implementations

3. **translator.ts**
   - Purpose: Defines types for engine-specific translation
   - Contains: Translation interfaces and engine-specific types
   - Used by: Engine translation implementations

4. **rpgmv/**
   - Purpose: Contains RPG Maker MV specific types
   - Contains: 
     - `index.ts`: Re-exports all RPGMV types
     - `common.ts`: Common RPGMV types
     - `data/`: RPGMV data structure types
   - Used by: RPG Maker MV implementation

## Dependency Management

### Circular Dependency Prevention

The architecture actively prevents circular dependencies through several strategies:

1. **Unidirectional Dependencies**
   - Dependencies flow in one direction: `core.ts` → `languages.ts` → `errors.ts` → `resources.ts` → `ai.ts`
   - Each file only depends on files "above" it in the hierarchy
   - No file depends on files "below" it

2. **Base Types in Core**
   - Fundamental types are defined in `core.ts`
   - Other files import from `core.ts` but not vice versa
   - `BaseError` in `core.ts` provides common error properties

3. **Interface Segregation**
   - Large interfaces are broken into smaller, focused ones
   - `ResourceTranslationError` contains resource properties directly instead of referencing `ResourceTranslation`
   - `AITranslationError` is defined in `ai.ts` to avoid circular references

4. **Type-Only Imports**
   - All imports use `import type` to prevent runtime circular dependencies
   - This allows TypeScript to resolve type references even with circular imports

### Dependency Structure

The `@shared` directory follows this dependency structure:

```
core.ts (base types)
   ↓
languages.ts (depends on core)
   ↓
errors.ts (depends on core)
   ↓
resources.ts (depends on core)
   ↓
ai.ts (depends on core and resources)
```

This structure ensures:
- Clear ownership of types
- Predictable change propagation
- Easier testing and maintenance
- No circular dependencies
- Language types are shared between AI and engines
- Configuration uses shared language types

## Import Patterns

The architecture follows a strict module-based import pattern to maintain clean dependencies and encapsulation.

### Module Structure

Each module (`@ai`, `@engines`) should have its own `index.ts` file that acts as the single entry point for all exports. This file:
- Re-exports types from `@shared` that the module needs
- Exports module-specific types
- Controls what is publicly available from the module

The `@shared` directory is special and does not need an index.ts file because:
- It contains the base types that other modules build upon
- It should never be imported directly by application code
- All shared types should be re-exported through module-specific index files

Example structure:
```
@engines/
  ├── index.ts           # Single entry point, re-exports everything
  ├── base.ts            # Base engine interfaces
  ├── translator.ts      # Translation interfaces
  └── rpgmv/             # RPGMV specific types
      ├── index.ts       # RPGMV module entry point
      └── types.ts       # RPGMV specific types

@shared/                 # No index.ts needed
  ├── core.ts            # Core shared types
  ├── languages.ts       # Language-related types
  ├── resources.ts       # Resource types
  ├── ai.ts              # AI-specific shared types
  └── errors.ts          # Error types
```

### Import Rules

1. **Module Internal Imports**
```typescript
// ✅ DO: Import from module's index
import type { ResourceTranslation } from '@/types/engines'
import type { AIProvider } from '@/types/ai'

// ❌ DON'T: Import directly from @shared
import type { ResourceTranslation } from '@/types/shared/resources'
import type { ErrorType } from '@/types/shared/errors'
```

2. **Cross-Module Imports**
```typescript
// ✅ DO: Import from other module's index
import type { GameEngine } from '@/types/engines'
import type { AIProvider } from '@/types/ai'

// ❌ DON'T: Import from specific files
import type { GameEngine } from '@/types/engines/base'
import type { AIProvider } from '@/types/ai/provider'
```

3. **Shared Types Access**
```typescript
// ✅ DO: Access shared types through module indexes
import type { ResourceTranslation } from '@/types/engines'
import type { BatchOptions } from '@/types/ai'

// ❌ DON'T: Import directly from @shared
import type { ResourceTranslation } from '@/types/shared/resources'
import type { BatchOptions } from '@/types/shared/core'
```

### Benefits

1. **Clean Dependencies**
   - Each module has clear dependencies
   - Dependencies are managed through index files
   - Easy to track what each module uses
   - Clear separation between shared and module-specific types

2. **Better Encapsulation**
   - Implementation details are hidden
   - Only public types are exposed
   - Changes to internal structure don't affect other modules
   - Shared types are accessed through a controlled interface

3. **Single Source of Truth**
   - Each type has one clear export point
   - No duplicate type definitions
   - Easy to find where types come from
   - Shared types are defined once but accessed through modules

4. **Easier Maintenance**
   - Changes to shared types only need to be updated in index files
   - Refactoring is simpler with clear dependencies
   - Better control over type visibility
   - Clear upgrade path when shared types change

### Example Implementation

```typescript
// @engines/index.ts
export type { ResourceTranslation } from '@/types/shared/resources'
export type { BatchOptions } from '@/types/shared/core'
export type { GameEngine } from './base'
export type { RPGMVEngine } from './rpgmv'

// @engines/base.ts
import type { ResourceTranslation, BatchOptions } from '.'

// @engines/rpgmv/index.ts
export type { RPGMVEngine } from './types'
export type { GameEngine } from '..'

// @engines/rpgmv/types.ts
import type { GameEngine, ResourceTranslation } from '..'
```

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