# Application Architecture: Separation of Concerns

This document outlines the architecture of our Translation AI application, focusing on how we've separated concerns between user preferences, AI functionality, and engine implementation.

## Core Architecture Principles

1. **Separation of Concerns**: Each module has a single, well-defined responsibility
2. **Configuration as Source of Truth**: Default values come from configuration files, not hardcoded in components
3. **Independence Between Modules**: Components can function without tight coupling to others
4. **Unidirectional Data Flow**: Data flows from configuration → settings → services, not in reverse
5. **Clear Dependency Boundaries**: Higher-level modules don't depend on implementation details of lower-level modules
6. **Modular Store Design**: Pinia stores are split into modular components (state, getters, actions)
7. **Dependency Injection**: Services use dependency injection for better testability and flexibility

## Key Architecture Components

### Store Architecture

The application uses a modular store architecture with Pinia, splitting stores into logical components:

**Store Structure:**
```
src/stores/
├── ai/
│   ├── index.ts       # Main store export
│   ├── types.ts       # Type definitions
│   ├── state.ts       # State management
│   ├── getters.ts     # Computed properties
│   ├── actions.ts     # Actions and methods
│   └── constants.ts   # Store constants
├── engines/
│   ├── engine.ts      # Main engine store
│   └── rpgmv.ts       # RPGMV-specific store
└── settings.ts        # User settings store
```

**Benefits:**
- Better code organization
- Easier testing
- Clearer dependencies
- Improved maintainability
- Better type safety

### Configuration Layer

The configuration layer defines application-wide constants, defaults, and factory functions. It serves as the single source of truth for default values.

**Key Files:**
- `src/config/provider/ai/index.ts` - AI provider configuration constants
- `src/config/provider/ai/config-factory.ts` - Factory functions for AI configuration
- `src/config/engines/index.ts` - Engine configuration constants and helpers

**Benefits:**
- Centralized management of default values
- Easy modification of application-wide constants
- Configuration used consistently across the application

### Type Definitions

Types provide contracts between modules and define the shape of data flowing through the system.

**Key Files:**
- `src/types/ai/base.ts` - Basic AI-related types 
- `src/types/ai/config.ts` - AI configuration types
- `src/types/engines/base.ts` - Engine-related types
- `src/types/shared/translation.ts` - Translation-related types

**Benefits:**
- Clear interfaces between modules
- Type safety throughout the application
- Documentation of data structures

### User Preferences/Settings

The settings layer manages user preferences and UI state. It focuses on what the user wants, not how those preferences are implemented.

**Key Files:**
- `src/stores/settings.ts` - User preferences and UI settings

**Responsibilities:**
- Managing user preferences for AI providers, languages, etc.
- Handling UI state like dark mode
- Storing and retrieving settings from localStorage
- Providing validation for UI components

**What it doesn't do:**
- Directly initialize AI providers
- Handle implementation-specific logic
- Contain default values (uses configuration instead)

### Application Services

Service modules implement core functionality using configuration and settings.

**Key Files:**
- `src/stores/ai/` - AI service functionality
- `src/stores/engines/engine.ts` - Engine orchestration
- `src/stores/engines/rpgmv.ts` - RPGMV-specific implementation

**Responsibilities:**
- Implementing business logic
- Performing operations (translation, file processing)
- Maintaining operational state (progress, errors)

**What they don't do:**
- Store user preferences
- Handle UI concerns
- Depend directly on settings store implementation

### Connector Layer

Connectors synchronize between user preferences and service implementations, translating settings into configuration.

**Key Files:**
- `src/composables/useAISettingsConnector.ts` - Connects settings to AI service 
- `src/composables/useEngineSettingsConnector.ts` - Connects settings to engine services

**Responsibilities:**
- Watching for changes in settings
- Converting user preferences to service configuration
- Initializing services with proper configuration

**Benefits:**
- Decoupling between settings and services
- Clear boundary for data transformation
- Single responsibility for settings synchronization

## Data Flow Examples

### AI Configuration Flow

1. Configuration defines default values for AI providers and models
2. Settings store holds user preferences but doesn't initialize providers
3. AI store accepts configuration objects independent of settings
4. Connector watches settings changes and updates AI configuration
5. AI services use their configuration without depending on settings

```
┌─────────────────┐     ┌───────────────┐     ┌────────────────┐
│  Configuration  │────▶│ Settings Store │────▶│ AI Connector   │
└─────────────────┘     └───────────────┘     └────────────────┘
                                                      │
                                                      ▼
┌─────────────────┐     ┌───────────────┐     ┌────────────────┐
│ Translation UI  │◀────│ AI Store      │◀────│ AI Config      │
└─────────────────┘     └───────────────┘     └────────────────┘
```

### Engine Configuration Flow

1. Configuration defines default engine settings and supported engines
2. Settings store holds user's engine preferences
3. Engine service accepts configuration independent of settings
4. Connector synchronizes engine preferences to engine services
5. Engine services perform operations based on configuration

```
┌─────────────────┐     ┌───────────────┐     ┌────────────────┐
│  Configuration  │────▶│ Settings Store │────▶│ Engine Connect │
└─────────────────┘     └───────────────┘     └────────────────┘
                                                      │
                                                      ▼
┌─────────────────┐     ┌───────────────┐     ┌────────────────┐
│   Project UI    │◀────│ Engine Store  │◀────│ Engine Config  │
└─────────────────┘     └───────────────┘     └────────────────┘
```

## Benefits of This Architecture

### Maintainability

- **Clear Responsibility Boundaries**: Each module has a single, well-defined responsibility
- **Reduced Coupling**: Changes in one module don't require changes in others
- **Centralized Configuration**: Default values and constants are defined in one place
- **Consistent Patterns**: Similar problems are solved in similar ways
- **Modular Stores**: Easier to maintain and test individual store components

### Testability

- **Independent Module Testing**: Each module can be tested in isolation
- **Easier Mocking**: Clear interfaces make mocking dependencies straightforward
- **Predictable Data Flow**: Data flows in a consistent, predictable direction
- **Reduced Test Setup**: Tests don't need to set up the entire application
- **Store Testing**: Each store component can be tested independently

### Extensibility

- **Adding New Providers**: New AI providers can be added without changing settings
- **Adding New Engines**: New game engines can be added with minimal changes
- **Feature Expansion**: New features can be added without disrupting existing ones
- **Alternative UIs**: Different UIs could use the same services with different settings
- **Store Extensions**: Easy to add new store modules or extend existing ones

## Implementation Guidelines

When implementing new features or making changes, follow these guidelines:

1. **Start with Configuration**: Define constants and default values in configuration files
2. **Define Types**: Create or update type definitions to reflect the data structure
3. **Update Services**: Implement functionality in service modules
4. **Connect to Settings**: Use connectors to link user preferences to services
5. **Create UI Components**: Build UI components that use settings for configuration
6. **Use Modular Stores**: Split new stores into state, getters, and actions
7. **Implement DI**: Use dependency injection for better testability

## Common Pitfalls to Avoid

1. **Direct Dependencies**: Don't import settings directly in service modules
2. **Hardcoded Values**: Don't hardcode values that should come from configuration
3. **Bidirectional Dependencies**: Maintain unidirectional flow from settings to services
4. **Mixed Responsibilities**: Keep UI concerns separate from service implementation
5. **Implementation Leakage**: Don't expose implementation details to higher levels
6. **Monolithic Stores**: Avoid putting all store logic in a single file
7. **Tight Coupling**: Use dependency injection to avoid direct dependencies

By following these architecture principles, our application remains maintainable, testable, and extensible as it grows in complexity.

## Configuration Systems

### AI Configuration System

The AI configuration system manages all AI-related settings and provider configurations through a centralized, type-safe approach.

#### Key Components

1. **AIServiceConfig Interface**
   ```typescript
   interface AIServiceConfig {
     sourceLanguage: string;
     targetLanguage: string;
     contentRating: ContentRating;
     provider: AIProviderConfig;
     quality: TranslationQualitySettings;
   }
   ```
   - Combines all AI-related settings into a single configuration object
   - Built on existing types from `base.ts`
   - Provides type safety for all AI operations

2. **Configuration Factory**
   - Located in `src/config/provider/ai/config-factory.ts`
   - Provides two main functions:
     - `createDefaultAIConfig()`: Creates default configuration
     - `buildAIConfigFromSettings()`: Builds config from user settings
   - Handles validation and error cases
   - Ensures consistent configuration across the application

3. **Settings Connector**
   - Located in `src/composables/useAISettingsConnector.ts`
   - Synchronizes user settings with AI configuration
   - Handles updates and cleanup
   - Provides error handling and validation

#### Data Flow
```
┌─────────────────┐     ┌───────────────┐     ┌────────────────┐
│  Configuration  │────▶│ Settings Store │────▶│ AI Connector   │
└─────────────────┘     └───────────────┘     └────────────────┘
                                                      │
                                                      ▼
┌─────────────────┐     ┌───────────────┐     ┌────────────────┐
│ Translation UI  │◀────│ AI Store      │◀────│ AI Config      │
└─────────────────┘     └───────────────┘     └────────────────┘
```

### Engine Configuration System

The Engine configuration system manages game engine-specific settings and capabilities through a similar centralized approach.

#### Key Components

1. **EngineServiceConfig Interface**
   ```typescript
   interface EngineServiceConfig {
     engineType: EngineType;
     metadata: EngineMetadata;
     config: EngineConfig;
     filePatterns: string[];
     supportedFormats: string[];
   }
   ```
   - Combines all engine-related settings
   - Built on existing types from `base.ts`
   - Provides type safety for engine operations

2. **Configuration Factory**
   - Located in `src/config/engines/config-factory.ts`
   - Provides two main functions:
     - `createDefaultEngineConfig()`: Creates default configuration
     - `buildEngineConfigFromSettings()`: Builds config from user settings
   - Handles validation and error cases
   - Ensures consistent configuration across engines

3. **Settings Connector**
   - Located in `src/composables/useEngineSettingsConnector.ts`
   - Synchronizes user settings with engine configuration
   - Handles updates and cleanup
   - Provides error handling and validation

#### Data Flow
```
┌─────────────────┐     ┌───────────────┐     ┌────────────────┐
│  Configuration  │────▶│ Settings Store │────▶│ Engine Connect │
└─────────────────┘     └───────────────┘     └────────────────┘
                                                      │
                                                      ▼
┌─────────────────┐     ┌───────────────┐     ┌────────────────┐
│   Project UI    │◀────│ Engine Store  │◀────│ Engine Config  │
└─────────────────┘     └───────────────┘     └────────────────┘
```

### Benefits of Configuration Systems

1. **Type Safety**
   - All configurations are fully typed
   - Compile-time checking of configuration validity
   - Runtime validation of configuration values

2. **Centralized Management**
   - Single source of truth for all settings
   - Consistent configuration across components
   - Easy to modify and extend

3. **Separation of Concerns**
   - User settings separate from service configuration
   - Clear boundaries between UI and business logic
   - Easy to test and maintain

4. **Extensibility**
   - Easy to add new providers or engines
   - Simple to modify configuration structure
   - Flexible for future changes

### Implementation Guidelines

1. **Creating New Configurations**
   - Start with existing types from `base.ts`
   - Create new interface extending base types
   - Implement factory functions
   - Add validation and error handling

2. **Using Configurations**
   - Always use factory functions to create configs
   - Validate configurations before use
   - Handle errors appropriately
   - Use type guards when necessary

3. **Updating Configurations**
   - Use connectors for settings changes
   - Validate updates before applying
   - Handle cleanup properly
   - Maintain backward compatibility

4. **Testing**
   - Test factory functions
   - Test validation logic
   - Test error cases
   - Test with edge cases

### Common Pitfalls

1. **Direct Settings Access**
   - Avoid accessing settings directly in services
   - Always use configuration objects
   - Use connectors for updates

2. **Missing Validation**
   - Always validate configurations
   - Handle invalid cases gracefully
   - Provide clear error messages

3. **Incomplete Cleanup**
   - Clean up watchers and subscriptions
   - Handle component unmounting
   - Release resources properly

4. **Type Inconsistency**
   - Keep types in sync with base types
   - Update types when base types change
   - Document type dependencies
