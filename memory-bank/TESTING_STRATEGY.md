# Game Translator Testing Strategy

This document outlines the testing strategy for the Game Translation Desktop App, covering all layers of the application, testing methodologies, and phase-specific testing approaches.

## Testing Philosophy

- **Test-Driven Development (TDD)** when possible: write tests before implementation
- **Coverage-Driven Testing**: ensure critical paths are covered
- **Pyramid Approach**: more unit tests, fewer integration tests, fewest E2E tests
- **Realistic Data**: use real-world game files for testing when possible
- **Cross-Platform Verification**: ensure tests pass on all target platforms (Windows, macOS, Linux)

## Testing Layers

### 1. Backend (Rust) Tests

**Libraries & Tools:**
- **`cargo test`**: Built-in Rust testing framework
- **`mockall`**: For mocking in Rust tests
- **`rstest`**: For parameterized tests
- **`assert_fs`**: For file system testing
- **Tauri Mock Runtime**: Tauri's built-in mock runtime for testing without native webview dependencies

**Test Types:**
- **Unit Tests**: Test individual functions and methods in isolation
- **Integration Tests**: Test interactions between modules
- **Validation Tests**: Test domain models against valid/invalid inputs
- **Command Tests**: Test Tauri commands with the mock runtime

**Location:**
- Unit tests: Co-located with source files (`mod tests { ... }` at bottom of file)
- Integration tests: `src-tauri/tests/` directory

**Running Tests:**
```bash
# Run all backend tests
cd src-tauri
cargo test

# Run specific test
cargo test test_name

# Run tests in a specific module
cargo test module::
```

**Tauri Mock Runtime:**
According to the [official Tauri testing documentation](https://tauri.app/develop/tests/), Tauri provides a mock runtime that allows testing without executing native webview libraries. This is particularly useful for unit and integration tests that focus on logic rather than UI interactions.

### 2. Frontend (Vue/TypeScript) Tests

**Libraries & Tools:**
- **Vitest**: Test runner compatible with Nuxt 3
- **@vue/test-utils**: Vue component testing
- **happy-dom**: DOM environment for testing
- **@nuxt/test-utils**: Official Nuxt test helpers
- **@tauri-apps/api/mocks**: For mocking Tauri API calls in frontend tests

**Test Types:**
- **Unit Tests**: Individual functions, composables, stores
- **Component Tests**: Vue components in isolation
- **Snapshot Tests**: Component rendering stability
- **Mock Tests**: External API interactions

**Location:**
- Tests in a `__tests__` directory adjacent to the files being tested
- Or in a top-level `tests` directory if preferred for organization

**Configuration (Nuxt):**
```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'happy-dom',
    include: ['**/*.{test,spec}.{js,ts,jsx,tsx}'],
    deps: {
      inline: ['@nuxt/test-utils'],
    },
  },
  resolve: {
    alias: {
      '~': fileURLToPath(new URL('./', import.meta.url)),
      '@': fileURLToPath(new URL('./', import.meta.url)),
    },
  },
})
```

**Running Tests:**
```bash
# Run all frontend tests
npm test

# Run tests with UI
npm run test:ui

# Run tests in watch mode
npm run test:watch
```

**Nuxt Component Testing Example:**
```ts
// @vitest-environment nuxt
import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import MyComponent from '~/components/MyComponent.vue'

describe('MyComponent', async () => {
  it('renders properly', async () => {
    const wrapper = await mountSuspended(MyComponent, {
      props: {
        // component props
      }
    })
    
    expect(wrapper.text()).toContain('Expected Text')
  })
})
```

### 3. End-to-End (E2E) Tests

**Libraries & Tools:**
- **Playwright**: Modern E2E testing framework with multi-browser support
- **@nuxt/test-utils/e2e**: Nuxt integration with Playwright
- **Vitest**: Test runner for the E2E tests
- **WebDriver**: For Tauri-specific end-to-end testing

**Test Types:**
- **User Flow Tests**: Complete user journeys
- **Cross-Browser Tests**: Verify on multiple browsers
- **Visual Regression Tests**: UI consistency checks

**Location:**
- `tests/e2e/` directory in project root

**Configuration (Nuxt E2E with Playwright):**
```ts
// tests/e2e.spec.ts
import { fileURLToPath } from 'node:url'
import { describe, expect, test } from 'vitest'
import { setup, $fetch, createPage } from '@nuxt/test-utils/e2e'

describe('E2E', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('../', import.meta.url)),
    browser: true, 
    // Use a basic server to serve Nuxt content while running E2E tests
    server: true,
  })

  test('renders page', async () => {
    const page = await createPage('/')
    const html = await page.innerHTML('body')
    expect(html).toContain('Expected content')
  })
})
```

**WebDriver for Tauri:**
Tauri provides WebDriver support for end-to-end testing, as mentioned in the [Tauri testing documentation](https://tauri.app/develop/tests/). This allows testing the complete application on both desktop (except macOS) and mobile platforms.

**Running Tests:**
```bash
# Run all E2E tests
npm run test:e2e

# Run specific E2E test
npm run test:e2e -- tests/e2e/specificTest.spec.ts
```

## Testing Strategy by Phase

### Phase 1.1: Core Models & Setup

**Backend Tests:**
- **Model Serialization**: Test JSON serialization/deserialization of all models
  - Verify `Actor` struct serializes/deserializes correctly
  - Test with real RPGMV Actors.json samples
- **Validation Rules**: Test validation logic in models

**Example (Rust):**
```rust
#[test]
fn test_actor_serialization() {
    let json = r#"{"id":1,"name":"Hero","nickname":"Brave","profile":"A brave warrior."}"#;
    let actor: Actor = serde_json::from_str(json).unwrap();
    
    assert_eq!(actor.id, 1);
    assert_eq!(actor.name, "Hero");
    
    let serialized = serde_json::to_string(&actor).unwrap();
    assert!(serialized.contains("\"name\":\"Hero\""));
}
```

### Phase 1.2: Engine Detection & File Discovery

**Backend Tests:**
- **Engine Detection**: Test RPGMV detection with valid/invalid game directories
- **File Utilities**: Test file scanning/finding functions
- **Error Handling**: Test error cases (missing files, invalid formats)
- **Tauri Commands**: Test the `detect_engine_and_find_actors` command using the Tauri mock runtime

**Frontend Tests:**
- **FileSelector Component**: Test user interactions and prop/event handling
- **useEngineDetection Composable**: Test API call flow with mocked results

**E2E Tests:**
- **Folder Selection Flow**: Test the complete flow from folder selection to results display

**Example (Rust, Engine Detection):**
```rust
#[test]
fn test_rpgmv_detector_valid_game() {
    let temp = assert_fs::TempDir::new().unwrap();
    // Create mock RPGMV directory structure
    temp.child("www").create_dir().unwrap();
    temp.child("www/js").create_dir().unwrap();
    temp.child("www/data").create_dir().unwrap();
    temp.child("www/js/rpg_core.js").write_str("// mock content").unwrap();
    
    let detector = RpgmvDetector;
    assert!(detector.detect(temp.path()));
}
```

**Example (Vue Component Test with Nuxt Test Utils):**
```ts
// @vitest-environment nuxt
import { describe, it, expect, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import FileSelector from '~/components/FileSelector.vue'

describe('FileSelector', async () => {
  it('emits path when folder selected', async () => {
    // Mock Tauri dialog API
    vi.mock('@tauri-apps/api/dialog', () => ({
      open: vi.fn().mockResolvedValue('/path/to/game')
    }))
    
    const wrapper = await mountSuspended(FileSelector)
    await wrapper.find('button').trigger('click')
    
    expect(wrapper.emitted('update:path')).toBeTruthy()
    expect(wrapper.emitted('update:path')[0][0]).toBe('/path/to/game')
  })
})
```

### Phase 1.3: Provider Config

**Backend Tests:**
- **Config Validation**: Test provider config validation with valid/invalid inputs
- **Command Interface**: Test Tauri commands for validation and defaults

**Frontend Tests:**
- **Store Tests**: Test providerConfig store actions, loading, error handling
- **ProviderConfigEditor Component**: Test form validation, submission, feedback
- **Persistence**: Test store persistence with mocked Tauri Store plugin

**E2E Tests:**
- **Config Workflow**: Test complete flow of setting and saving provider config

**Example (Provider Config Store Test with Nuxt & Tauri Mocks):**
```ts
import { setActivePinia, createPinia } from 'pinia'
import { useProviderConfigStore } from '~/stores/providerConfig'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock Tauri APIs
vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn()
}))
vi.mock('@tauri-apps/plugin-store', () => ({
  load: vi.fn()
}))

describe('providerConfigStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })
  
  it('initializes with default values', () => {
    const store = useProviderConfigStore()
    expect(store.config).toBeNull()
    expect(store.isInitialized).toBe(false)
  })
  
  it('validates config properly', async () => {
    const { invoke } = await import('@tauri-apps/api/core')
    vi.mocked(invoke).mockResolvedValue(undefined)
    
    const store = useProviderConfigStore()
    const result = await store.validateConfig({
      type: 'ollama',
      config: { endpoint_url: 'http://localhost:11434', model_name: 'mistral' }
    })
    
    expect(result).toBe(true)
    expect(invoke).toHaveBeenCalledWith('validate_provider_config', expect.any(Object))
  })
})
```

## Test Mocking Strategies

### Mocking Tauri APIs

According to the [Tauri documentation](https://tauri.app/develop/tests/), Tauri provides official mocking utilities for testing. Using these along with Vitest's mocking capabilities:

**Frontend Tests:**
```ts
// Import Tauri mocks - Modern approach 
import { invoke } from '@tauri-apps/api/core'
import { mockIPC } from '@tauri-apps/api/mocks'

beforeAll(() => {
  // Set up mocks before tests
  mockIPC((cmd, args) => {
    if (cmd === 'detect_engine_and_find_actors') {
      return { 
        engine: 'rpgmv', 
        actors_path: '/path/to/Actors.json' 
      }
    }
    return null
  })
})

// Or using Vitest's vi.mock for more control
vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn().mockImplementation((cmd, args) => {
    if (cmd === 'detect_engine_and_find_actors') {
      return Promise.resolve({ 
        engine: 'rpgmv', 
        actors_path: '/path/to/Actors.json' 
      })
    }
    return Promise.resolve(null)
  })
}))

// Mock dialog
vi.mock('@tauri-apps/api/dialog', () => ({
  open: vi.fn().mockResolvedValue('/path/to/folder')
}))

// Mock Store plugin
vi.mock('@tauri-apps/plugin-store', () => ({
  load: vi.fn().mockImplementation(() => {
    return Promise.resolve({
      get: vi.fn().mockImplementation((key) => {
        if (key === 'config') {
          return Promise.resolve({ type: 'ollama', config: { endpoint_url: 'http://test', model_name: 'test' } })
        }
        return Promise.resolve(null)
      }),
      set: vi.fn().mockResolvedValue(undefined),
      save: vi.fn().mockResolvedValue(undefined)
    })
  })
}))
```

### Mocking Backend Dependencies

**Using mockall for Rust:**
```rust
use mockall::predicate::*;
use mockall::mock;

// Create mock
mock! {
    FileSystem {
        fn path_exists(&self, path: &Path) -> bool;
        fn find_file(&self, root: &Path, pattern: &str) -> Option<PathBuf>;
    }
}

#[test]
fn test_engine_detection_with_mock_fs() {
    let mut mock_fs = MockFileSystem::new();
    mock_fs.expect_path_exists()
        .with(predicate::function(|p: &&Path| p.ends_with("www/js/rpg_core.js")))
        .returning(|_| true);
    
    let detector = RpgmvDetector::new(Box::new(mock_fs));
    assert!(detector.detect(Path::new("/fake/path")));
}
```

## Test Data Management

### Test Data Organization

```
src-tauri/
└── tests/
    └── test_data/
        ├── rpgmv/
        │   ├── valid_game/         # Complete valid RPGMV game structure
        │   │   ├── www/
        │   │   │   ├── data/
        │   │   │   │   └── Actors.json
        │   │   │   └── js/
        │   │   │       └── rpg_core.js
        │   │   └── package.json
        │   ├── invalid_game/       # Invalid game structure
        │   │   └── www/
        │   │       └── data/       # Missing js folder
        │   └── game_files/         # Individual test files
        │       ├── Actors.json
        │       ├── Items.json
        │       └── ...
        └── translation/
            ├── history/
            │   └── sample_history.json
            └── prompts/
                └── sample_prompts.json
```

### Platform-Independent Path Handling

```rust
// Use std::path::PathBuf for cross-platform paths
let test_data_path = PathBuf::from(env!("CARGO_MANIFEST_DIR"))
    .join("tests")
    .join("test_data")
    .join("rpgmv")
    .join("valid_game");

// For temporary test directories
let temp_dir = tempfile::tempdir().unwrap();
let temp_path = temp_dir.path();
```

## Continuous Integration Testing

- **GitHub Actions**: Automated testing on push/PR using [tauri-action](https://github.com/tauri-apps/tauri-action) for CI/CD integration
- **Matrix Testing**: Test on multiple platforms (Windows, macOS, Linux)
- **Coverage Reports**: Generate and track test coverage
- **WebDriver Integration**: Setup WebDriver for automated E2E testing in CI

**Example GitHub Actions workflow:**
```yaml
name: Test

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    strategy:
      matrix:
        platform: [windows-latest, macos-latest, ubuntu-latest]
    
    runs-on: ${{ matrix.platform }}
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18
          
      - name: Install Rust
        uses: actions-rs/toolchain@v1
        with:
          toolchain: stable
          
      - name: Install dependencies
        run: npm ci
        
      - name: Install Ubuntu dependencies
        if: matrix.platform == 'ubuntu-latest'
        run: |
          sudo apt-get update
          sudo apt-get install -y libgtk-3-dev libwebkit2gtk-4.0-dev libappindicator3-dev librsvg2-dev patchelf
          
      - name: Run Rust tests
        run: cd src-tauri && cargo test
        
      - name: Run frontend tests
        run: npm test
```

## Testing Conventions

### Naming Conventions

- **Backend Tests**: `test_<function_name>_<scenario>`
- **Frontend Tests**: `<component/function>.<scenario>.test.ts`
- **E2E Tests**: `<feature>.<journey>.spec.ts`

### Documentation

- Document test setup/teardown requirements
- Document any test data dependencies
- Explain the purpose of complex tests

### Key Test Categories

1. **Smoke Tests**: Basic functionality verification
2. **Functional Tests**: Feature correctness
3. **Error Cases**: Proper error handling
4. **Edge Cases**: Boundary conditions
5. **Performance Tests**: Speed and resource usage (where relevant)
6. **Cross-Platform Tests**: OS-specific behavior verification

## Phase-Specific Testing Roadmap

### Immediate Focus (For Completed Phases)

1. **Setup Test Infrastructure**:
   - Configure Vitest for frontend according to Nuxt guidelines
   - Set up Tauri mock runtime for backend tests
   - Set up test data for backend tests
   - Create mock implementations

2. **Phase 1.1-1.3 Tests**:
   - Model serialization/validation tests
   - Engine detection tests
   - File utility tests
   - Provider config validation tests
   - UI component tests for FileSelector and ProviderConfigEditor
   - Store tests for providerConfig
   - Basic E2E tests for completed workflows

### Upcoming (For Phase 1.4+)

1. **Phase 1.4 Tests**:
   - SQLite schema and migration tests
   - History data access tests
   - Ollama API client tests
   - Prompt template loading tests

2. **Phase 1.5 Tests**:
   - Translation provider tests
   - End-to-end translation workflow tests
   - Error handling and retry logic tests

3. **Phase 1.6 Tests**:
   - UI component tests for translation interface
   - Store tests for translation state management
   - History UI component tests
   - E2E tests for complete translation workflow 