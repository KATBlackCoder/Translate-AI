# Architecture Overview

## Purpose
This document provides a high-level overview of the architecture for the Game Translation Desktop App, covering both backend and frontend. It explains the main goals, structure, and how the two layers interact to deliver a seamless, modern translation experience.

---

# Backend

## Purpose
The backend provides all core logic, data processing, and integration for the Game Translation Desktop App, handling game file parsing, translation workflows, AI provider integration, and persistent storage, and exposing a clean API to the frontend via Tauri commands.

## Core Principles
- **Domain-Driven Design (DDD):** Organize code by business domain, not just technical layers
- **Vertical Slices:** Implement features end-to-end, cutting through all layers for rapid delivery and feedback
- **Type Safety:** Strong typing and validation at every layer
- **Clear Boundaries:** Explicit interfaces and minimal coupling between layers

## Directory Structure
```
src-tauri/
├── migrations/           # Database migration SQL files
│   └── ...
├── src/
│   ├── models/           # Data structures: types, validation, errors (no business logic)
│   ├── domain/           # Core business logic (pure, no I/O)
│   ├── infrastructure/   # External system integration (APIs, storage [SQL plugin, Store plugin], config)
│   ├── application/      # Orchestrates workflows, coordinates domain/infrastructure
│   ├── commands/         # Exposes backend features to frontend (Tauri IPC)
│   └── lib.rs            # Library exports, command registration, state setup
│   └── main.rs           # Application entry point
└── resources/            # External resources (prompts, config)
```
- **models/**: Pure data structures, validation, and error types
- **domain/**: Core business logic, rules, and workflows
- **infrastructure/**: Integration with external systems (APIs, file I/O, SQLite via SQL plugin, Settings via Store plugin)
- **application/**: Orchestrates workflows, coordinates domain and infrastructure, manages state
- **commands/**: Exposes backend features to the frontend via Tauri IPC
- **resources/**: External assets (prompts, config) loaded at runtime
- **lib.rs**: Backend wiring, command registration, state setup
- **main.rs**: App entry point

## Backend-Frontend Interaction
- Exposes backend logic to the frontend via Tauri commands (IPC)
- Each command is a Rust function registered with Tauri, callable from the frontend
- Data (requests/results/errors) flows as JSON between frontend and backend
- Enables secure, fast, and native communication without HTTP/REST

## Backend Layers
- **Models:** Pure data structures, validation, and error types (no logic)
- **Domain:** Core business logic, rules, and workflows (no I/O)
- **Infrastructure:** Integration with external systems (APIs, file I/O, SQLite via SQL plugin, Settings via Store plugin)
- **Application:** Orchestrates workflows, coordinates domain and infrastructure, manages state
- **Commands:** Exposes backend features to the frontend via Tauri IPC
- **Resources:** External assets (prompts, config) loaded at runtime

---

# Frontend

## Purpose
The frontend delivers a modern, accessible UI for selecting, translating, and managing game files, providing a seamless user experience and connecting to the backend for all translation and project operations.

## Core Principles
- **Separation of Concerns:** UI, state, logic, and assets are clearly separated
- **Reactivity:** Vue 3 Composition API for modular, reactive code
- **Type Safety:** TypeScript throughout for reliability
- **Scalability:** Structure supports growth and feature addition

## Directory Structure
```
frontend/
├── assets/           # Static assets (images, fonts, etc.)
├── components/       # Vue components (UI building blocks)
├── composables/      # Reusable logic (hooks)
├── layouts/          # App shell layouts
├── pages/            # Route-based views
├── public/           # Public static files
├── stores/           # Pinia stores (state management)
├── modules/          # Nuxt modules/plugins
├── utils/            # Utility functions
├── types/            # TypeScript types/interfaces
├── styles/           # Global and shared styles (TailwindCSS config, etc.)
├── features/         # (Optional) Feature/vertical-slice folders
├── nuxt.config.ts    # Nuxt configuration
└── ...
```
- **assets/**: Static assets (images, fonts, icons)
- **components/**: Reusable UI building blocks (buttons, dialogs, forms)
- **composables/**: Shared logic (hooks, e.g., useTranslation)
- **layouts/**: App shell layouts (main, auth, error)
- **pages/**: Route-based views (one file per route)
- **public/**: Public static files served as-is
- **stores/**: Centralized state management (Pinia)
- **modules/**: Nuxt modules/plugins (i18n, API clients)
- **utils/**: Utility functions
- **types/**: Shared TypeScript types/interfaces
- **styles/**: Global and shared styles (TailwindCSS config)
- **features/**: (Optional) Feature/vertical-slice folders for complex features
- **nuxt.config.ts**: Nuxt configuration file

## Backend-Frontend Interaction
- Calls backend logic using Tauri commands (IPC) instead of HTTP/REST
- Uses JavaScript APIs (e.g., invoke) to trigger Rust functions registered in the backend
- Data (requests/results/errors) flows as JSON between frontend and backend
- Enables fast, secure, and native communication for desktop apps

## Testing
- Comprehensive unit, integration, and E2E tests (Vitest, @nuxt/test-utils, happy-dom)

---

# Vertical Slice Implementation

## What is a Vertical Slice?
A vertical slice is an implementation that cuts through all layers of your architecture to deliver a single complete feature end-to-end. Rather than building each layer horizontally (completing all models before moving to domain logic), you implement just enough of each layer to support a specific feature.

### Benefits
- **Earlier Feedback:** Get real user feedback on complete functionality
- **Risk Reduction:** Identify integration issues early
- **Value Delivery:** Create something immediately useful
- **Learning:** Understand how all layers work together
- **Validation:** Test architectural decisions in practice

### Example Vertical Slice: Single File Translation
- **Feature:** Translate a single RPGMV Actors.json file from English to French using OpenAI.
- **Components Needed:**
  - Frontend: File selection, translation button, status display
  - Commands: Single command handler for file translation
  - Application: Simplified translation service
  - Domain: RPGMV-specific text extraction, OpenAI provider, translation workflow
  - Infrastructure: OpenAI API client, file system operations
  - Models: Content type definitions, RPGMV actor model, basic error types
- **Implementation Flow:**
  1. Define clear boundaries and interfaces
  2. Implement bottom-up: models → domain → infrastructure → application → commands → frontend
  3. Integrate and test end-to-end

---

## Key Interactions Explained

### 1. Data Flow (Top to Bottom)

**Commands → Application**
- Commands receive requests from frontend
- Commands validate input and call appropriate application services
- Example: `commands/translation.rs` calls `application/translation/service.rs`

**Application → Domain & Infrastructure**
- Application services coordinate between domain logic and infrastructure
- Application implements use cases using domain objects
- Example: `application/translation/service.rs` uses both `domain/translation/providers` and `infrastructure/api/ollama`

**Infrastructure → External Systems**
- Infrastructure components handle external interactions
- They encapsulate API calls, file operations, and resource loading
- Example: `infrastructure/api/ollama/client.rs` makes HTTP requests to the Ollama API

**Domain → Models**
- Domain logic operates on model types
- Domain doesn't depend on infrastructure or application
- Example: `domain/translation/prompt/manager.rs` uses `models/translation/prompt.rs`

### 2. Horizontal Interactions

**Translation Domain ↔ Game Domain**
- Translation workflow uses both provider and game engine functionality
- Example: Extracting text from games and sending to translation providers

**API Infrastructure ↔ Storage Infrastructure**
- API clients may use caching provided by storage
- Storage may load configuration needed by API clients