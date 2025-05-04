# Game Translator Frontend Architecture: Modern Nuxt 3 Approach

> Note: The backend uses SQLite for all persistent storage (projects, jobs, cache, etc.). All data sent to and from the backend is ultimately stored in a local SQLite database via Tauri.

## Core Principles
- **Separation of Concerns**: UI, state, logic, and assets are clearly separated
- **Reactivity**: Leverage Vue 3's Composition API for reactive, modular code
- **Type Safety**: Use TypeScript throughout for reliability
- **Scalability**: Structure supports growth and feature addition
- **Performance**: Lazy loading, code splitting, and efficient state management
- **Consistency**: Shared design system (Nuxt UI) and utility-first CSS (TailwindCSS)
- **UI Library**: Uses Nuxt UI as the primary component library for cohesive, modern interfaces
- **Multi-language/i18n**: Supports translation between multiple languages using Nuxt's i18n module and composables

## Top-Level Directory Structure

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
├── features/         # (Optional) Feature/vertical-slice folders (see below)
├── nuxt.config.ts    # Nuxt configuration
└── ...
```

## Feature/Vertical Slice Structure (Optional)
- For complex features, group all related files in `features/<feature-name>/` (e.g., `features/translation/`)
- Each feature folder can contain its own components, composables, store, types, and tests
- Example:
  ```
  features/translation/
    ├── components/
    ├── composables/
    ├── store.ts
    ├── types.ts
    └── tests/
  ```
- This approach keeps vertical slices cohesive and easy to maintain as the app grows

## Layers & Folders

### Components
- **Purpose**: Encapsulate UI elements (buttons, dialogs, forms, etc.)
- **Pattern**: Atomic Design (atoms, molecules, organisms) or feature-based grouping
- **Best Practice**: Build UI using Nuxt UI components for consistency and rapid development; keep components focused and reusable
- **Customization**: Extend or theme Nuxt UI 3 components as needed for your app's branding and UX

### Composables
- **Purpose**: Share logic across components (e.g., useTranslation, useGameData)
- **Pattern**: Vue 3 Composition API hooks
- **Best Practice**: Prefix with `use`, keep side-effect free if possible

### Stores
- **Purpose**: Centralized state management (Pinia)
- **Pattern**: One store per domain (e.g., translation, project, settings)
- **Best Practice**: Use actions for async logic, keep state serializable

### Pages
- **Purpose**: Route-based views, each file = one route
- **Pattern**: Organize by feature or workflow
- **Best Practice**: Minimal logic, delegate to components/composables

### Layouts
- **Purpose**: App shells (main, auth, error, etc.)
- **Pattern**: One layout per major app section
- **Best Practice**: Use slots for flexibility

### Modules
- **Purpose**: Nuxt modules/plugins (e.g., i18n, API clients, error handling)
- **Pattern**: Isolate integration logic
- **Best Practice**: Keep modules stateless, use Nuxt hooks

### Assets & Styles
- **Purpose**: Nuxt UI themes/tokens, TailwindCSS config, images, fonts, icons, global styles
- **Pattern**: Organize by type or feature
- **Best Practice**: Use Nuxt UI for design tokens/themes and TailwindCSS for utility classes; keep global styles minimal

### Types & Utils
- **Purpose**: Shared TypeScript types and utility functions
- **Pattern**: Group by domain or feature
- **Best Practice**: Export only what's needed, document types

## Data Flow Example (Vertical Slice)
1. User interacts with a UI component (e.g., clicks Translate)
2. Component calls a composable (e.g., `useTranslation`)
3. Composable dispatches an action to a Pinia store (e.g., `translationStore.translate()`)
4. Store performs async logic (calls Tauri backend API via Nuxt module)
5. Backend processes request, persists/returns data
6. Store updates state, composable reacts, UI updates

## Key Benefits
- **Fast iteration**: Hot module reload, modular code
- **Maintainability**: Clear folder boundaries, type safety
- **Testability**: Logic in composables/stores is easy to test
- **UI Consistency**: Shared components and design tokens via Nuxt UI

## Testing
- Use [Nuxt's official testing guide](https://nuxt.com/docs/getting-started/testing) for all frontend tests
- Unit/component tests: vitest + @vue/test-utils + happy-dom + @vitejs/plugin-vue
- End-to-end tests: Vitest with @nuxt/test-utils/e2e and Playwright integration
- Mock Tauri APIs for frontend integration tests

**Example setup:**
```bash
npm i --save-dev @nuxt/test-utils vitest @vue/test-utils happy-dom @vitejs/plugin-vue
```

**Example unit/component test:**
```ts
// @vitest-environment nuxt
import { mountSuspended } from '@nuxt/test-utils/runtime'
import MyComponent from '~/components/MyComponent.vue'

test('renders correctly', async () => {
  const wrapper = await mountSuspended(MyComponent)
  expect(wrapper.text()).toContain('expected text')
})
```

**Example E2E test:**
```ts
import { describe, test } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils/e2e'

describe('My E2E test', async () => {
  await setup({ /* options */ })

  test('should render home page', async () => {
    const html = await $fetch('/')
    expect(html).toContain('Welcome')
  })
})
```

## TODO
- Add feature-specific folder structure if needed (e.g., `features/`)
- Document API client integration pattern
- Add example of TailwindCSS config and usage
- Expand on testing strategy for frontend
- Add accessibility (a11y) audit
- Add Vitest/Playwright setup and usage examples
