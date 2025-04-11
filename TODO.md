# Game Translation Desktop App TODO

## Project Overview
Desktop application for translating game content from RPG Maker MV using Ollama + Mistral.

## Tech Stack
- Frontend: Vue 3 + TypeScript
- UI: Tailwind CSS + PrimeVue 4
- State: Pinia
- Utils: VueUse
- Routing: Vue Router
- Desktop: Tauri (file system access)
- AI: Ollama + Mistral (local)

## Current Sprint Focus

### 1. Type System Refactoring (Priority: High) ✅
- [x] Create architecture documentation
- [x] Define directory structure
- [x] Establish import patterns
- [x] Implement index.ts files for all modules
- [x] Resolve circular dependencies in @shared
- [x] Update all imports to follow architecture pattern
- [x] Add type documentation
- [x] Implement LanguagePair for language handling
- [x] Remove adult content support

### 2. AI Core Implementation (Priority: High) ✅
- [x] Restructure @core/ai directory
- [x] Update interfaces in @types/ai
- [x] Implement base classes
- [x] Refactor according to SOLID principles
- [x] Apply DRY principles
- [x] Follow YAGNI
- [x] Add error handling
- [x] Refactor base classes for better architecture

### 3. AI Services Implementation (Priority: High) ✅
1. **Provider Implementation**
   - [x] Implement Ollama provider (MVP):
     - [x] Create provider.ts
     - [x] Implement translation.ts
     - [x] Implement prompt.ts
     - [x] Implement cost.ts
     - [x] Add error handling and validation
     - [x] Add unit tests
   - [ ] Future: ChatGPT provider implementation

2. **Provider Factory Implementation** ✅
   - [x] Create provider registration system:
     - [x] Implement provider registry
     - [x] Add provider type mapping
     - [x] Handle provider dependencies
   - [x] Implement provider instantiation:
     - [x] Create factory methods
     - [x] Handle provider configuration
     - [x] Manage provider lifecycle
   - [x] Add configuration handling:
     - [x] Implement config validation
     - [x] Add config transformation
     - [x] Handle environment variables
   - [x] Add provider initialization:
     - [x] Handle provider setup
     - [x] Manage provider lifecycle
     - [x] Handle error recovery
   - [x] Add factory unit tests

3. **Error Handling Implementation** ✅
   - [x] Implement provider-specific error handling:
     - [x] Add Ollama error handling
     - [x] Create error recovery strategies
   - [x] Add error logging system:
     - [x] Implement error logging
     - [x] Add error tracking
     - [x] Create error reports

4. **Testing Implementation** ✅
   - [x] Write unit tests:
     - [x] Test translation services
     - [x] Test prompt services
     - [x] Test cost services
     - [x] Test provider implementations
   - [x] Add integration tests:
     - [x] Test provider factory
     - [x] Test provider switching
     - [x] Test error handling
   - [x] Add end-to-end tests:
     - [x] Test complete translation flow
     - [x] Test error scenarios
     - [x] Test performance

### 4. RPG Maker MV Engine Implementation (Priority: High) ✅
1. **Core Engine Implementation** ✅
   - [x] Create base engine structure:
     - [x] Implement base-engine.ts
     - [x] Add file system access
     - [x] Add project detection
     - [x] Add resource scanning
   - [x] Implement resource management:
     - [x] Add resource types
     - [x] Add resource loading
     - [x] Add resource saving
   - [x] Add error handling:
     - [x] Add engine-specific errors
     - [x] Add validation
     - [x] Add recovery strategies

2. **Service Layer Implementation** ✅
   - [x] Create base service structure:
     - [x] Implement base-engine-service.ts
     - [x] Add file validation
     - [x] Add project validation
     - [x] Add engine detection
   - [x] Implement factory pattern:
     - [x] Create engine factory
     - [x] Add engine registration
     - [x] Handle engine lifecycle
   - [x] Add error handling:
     - [x] Add service-specific errors
     - [x] Add validation
     - [x] Add recovery strategies

3. **Actors Implementation (MVP)** ✅
   - [x] Implement actor system:
     - [x] Add actor types
     - [x] Add actor loading
     - [x] Add actor saving
   - [x] Add actor translation:
     - [x] Add name translation
     - [x] Add description translation
     - [x] Add note translation
   - [x] Add actor validation:
     - [x] Add type checking
     - [x] Add content validation
     - [x] Add format validation

4. **Testing Implementation**
   - [ ] Write unit tests:
     - [ ] Test engine core
     - [ ] Test resource management
     - [ ] Test actor system
   - [ ] Add integration tests:
     - [ ] Test file system access
     - [ ] Test project detection
     - [ ] Test resource scanning
   - [ ] Add end-to-end tests:
     - [ ] Test complete actor translation flow
     - [ ] Test error scenarios
     - [ ] Test performance

### 5. UI Implementation (Priority: High)
1. **Project Management**
   - [ ] Create project selection screen
   - [ ] Add project validation
   - [ ] Implement project settings
   - [ ] Add project export

2. **Translation Interface**
   - [ ] Create translation dashboard
   - [ ] Add resource selection
   - [ ] Implement translation preview
   - [ ] Add translation editing
   - [ ] Implement batch translation

3. **Settings Interface**
   - [ ] Add AI provider settings
   - [ ] Implement language selection
   - [ ] Add translation options
   - [ ] Implement theme settings

4. **Testing Implementation**
   - [ ] Write unit tests:
     - [ ] Test components
     - [ ] Test stores
     - [ ] Test composables
   - [ ] Add integration tests:
     - [ ] Test user flows
     - [ ] Test error handling
     - [ ] Test performance
   - [ ] Add end-to-end tests:
     - [ ] Test complete user journey
     - [ ] Test error scenarios
     - [ ] Test performance

## Completed Work

### AI Core Implementation Progress
- ✅ Created base directory structure with proper organization
- ✅ Implemented all base classes with clear responsibilities:
  - `base-error.ts`: Centralized error handling with AIErrorFactory
  - `base-cost.ts`: Cost estimation functionality
  - `base-prompt.ts`: Prompt management with DRY implementation
  - `base-translation.ts`: Basic translation functionality
  - `advanced-language-provider.ts`: Advanced language features
  - `base-provider.ts`: Main provider using composition over inheritance
  - `openai-base-provider.ts`: Base for OpenAI-compatible providers
- ✅ Applied SOLID principles throughout:
  - Single Responsibility: Each class has one purpose
  - Open/Closed: All classes are open for extension
  - Liskov Substitution: Proper inheritance hierarchy
  - Interface Segregation: Focused interfaces
  - Dependency Inversion: Depend on abstractions
- ✅ Implemented DRY principles:
  - Centralized common functionality
  - Created reusable helper methods
  - Eliminated code duplication
- ✅ Added comprehensive error handling:
  - Created AIErrorFactory for standardized errors
  - Implemented proper error propagation
  - Added validation methods
- ✅ Used composition over inheritance in BaseAIProvider:
  - Made capabilities optional (translation, cost estimation, prompt management)
  - Added capability checking methods
  - Delegated to specialized components
- ✅ Created OpenAI base provider:
  - Extends BaseAIProvider for OpenAI-specific functionality
  - Manages OpenAI client creation and configuration
  - Provides validation for OpenAI-specific settings
  - Supports both OpenAI and Ollama providers using OpenAI API format

### Engine Implementation Progress
- ✅ Created core engine structure:
  - `base-engine.ts`: Core engine interface and base implementation
  - `base-engine-service.ts`: Service layer with file operations
  - `factory.ts`: Engine factory for instance management
- ✅ Implemented RPG Maker MV engine:
  - `rpgmv-engine-service.ts`: Concrete implementation
  - `actors.ts`: Actor data handling
- ✅ Applied SOLID principles:
  - Single Responsibility: Clear separation of core and service
  - Open/Closed: Extensible engine system
  - Liskov Substitution: Proper inheritance chain
  - Interface Segregation: Focused interfaces
  - Dependency Inversion: Depend on abstractions
- ✅ Added comprehensive error handling:
  - Engine-specific validation
  - File system error handling
  - Project validation
- ✅ Implemented factory pattern:
  - Engine registration system
  - Instance management
  - Lifecycle handling

### Type System Progress
- ✅ Created comprehensive type system:
  - Core types for AI and Engine
  - Shared types for common functionality
  - Specific types for RPG Maker MV
- ✅ Implemented proper type exports:
  - Index files for all modules
  - Clear type hierarchies
  - Proper type documentation
- ✅ Added type safety:
  - Strict TypeScript configuration
  - Proper type guards
  - Comprehensive type checking

### Service Implementation Progress
- ✅ Implemented AI services:
  - Ollama provider with all required features
  - Provider factory for instance management
  - Error handling and recovery
- ✅ Implemented Engine services:
  - RPG Maker MV engine with file operations
  - Engine factory for instance management
  - Project validation and detection
- ✅ Added comprehensive testing:
  - Unit tests for all components
  - Integration tests for services
  - End-to-end tests for critical paths

## File Structure
```
src/
├── core/                              # Core abstractions only
│   ├── ai/                           # AI core implementations
│   │   ├── index.ts                  # Exports AI base classes
│   │   └── base/                     # Base implementations (HOW)
│   │       ├── base-provider.ts      # Base provider implementation
│   │       ├── base-translation.ts   # Base translation implementation
│   │       ├── base-prompt.ts        # Base prompt implementation
│   │       ├── base-cost.ts          # Base cost implementation
│   │       ├── base-error.ts         # Error handling
│   │       ├── openai-base-provider.ts # Base for OpenAI-compatible providers
│   │       └── advanced-language-provider.ts # Advanced language features
│   │
│   └── engines/                      # Engine core implementations
│       ├── index.ts                  # Exports engine base classes
│       └── base/                     # Base implementations (HOW)
│           ├── base-engine.ts        # Base engine implementation
│           └── base-error.ts         # Error handling
│
├── services/                         # Concrete implementations
│   ├── ai/                          # AI service implementations
│   │   ├── ollama/                  # Ollama provider implementations
│   │   │   ├── provider.ts          # Ollama provider
│   │   │   ├── translation.ts       # Ollama translation service
│   │   │   ├── prompt.ts            # Ollama prompt service
│   │   │   └── cost.ts              # Ollama cost service
│   │   │
│   │   ├── chatgpt/                 # ChatGPT provider implementations
│   │   │   ├── provider.ts          # ChatGPT provider
│   │   │   ├── translation.ts       # ChatGPT translation service
│   │   │   ├── prompt.ts            # ChatGPT prompt service
│   │   │   └── cost.ts              # ChatGPT cost service
│   │   │
│   │   └── factory.ts               # Provider factory and initialization
│   │
│   └── engines/                     # Engine service implementations
│       ├── base-engine-service.ts   # Base service implementation
│       ├── factory.ts               # Engine factory
│       └── rpgmv/                   # RPG Maker MV implementation
│           ├── rpgmv-engine-service.ts # RPG Maker MV service
│           └── data/                # Data handlers
│               └── actors.ts        # Actor data handling
│
├── types/                           # Type definitions only
│   ├── ai/                         # AI interfaces (WHAT)
│   │   ├── index.ts                # Re-exports all AI types
│   │   ├── provider.ts             # Provider interfaces
│   │   ├── prompt.ts               # Prompt interfaces
│   │   ├── store.ts                # Store types
│   │   └── config.ts               # Configuration types
│   │
│   ├── engines/                    # Engine interfaces
│   │   ├── index.ts                # Re-exports all engine types
│   │   ├── base.ts                 # Base engine interfaces
│   │   ├── translator.ts           # Translator interfaces
│   │   └── rpgmv/                  # RPG Maker MV specific types
│   │
│   └── shared/                     # Shared type definitions
│       ├── core.ts                 # Core shared types
│       ├── languages.ts            # Language-related types
│       ├── resources.ts            # Resource-related types
│       ├── ai.ts                   # AI-related shared types
│       └── errors.ts               # Error types
│
└── utils/                          # Shared utilities
    ├── ai/
    │   ├── retry.ts
    │   ├── rate-limiter.ts
    │   └── cache.ts
    └── common/
        └── ...
```

## Development Guidelines
1. Follow TypeScript best practices
2. Use Vue 3 Composition API with `<script setup>`
3. Implement proper error handling
4. Write unit tests for critical components
5. Document all major functions and components
6. Follow the established file structure
7. Use module index files for all exports
8. Never import directly from @shared
9. Follow SOLID principles
   - Single Responsibility: Each class has one purpose
   - Open/Closed: Open for extension, closed for modification
   - Liskov Substitution: Subclasses can replace base classes
   - Interface Segregation: Use focused interfaces
   - Dependency Inversion: Depend on abstractions, not concretions
10. Apply DRY principles
    - Don't repeat code
    - Centralize common functionality
    - Create reusable components
11. Follow YAGNI
    - Start with minimal implementations
    - Add features only when needed
    - Avoid premature optimization

## Getting Started
1. Clone the repository
2. Install dependencies: `npm install`
3. Start development server: `npm run tauri dev`
4. Build for production: `npm run tauri build`

## Priority Levels
- High: Critical for MVP
- Medium: Important but not blocking
- Low: Nice to have 