# Games Translatore AI

A powerful desktop application for translating game content using AI, built with Nuxt.js, TypeScript, and Tauri.

## Features

### 🎮 Game Engine Support
- **RPG Maker MV Support**
  - Automatic engine detection
  - Resource file handling
  - Data file parsing
  - Event system support
  - Actor/Item/Skill management

### 🤖 AI Translation
- **Multiple AI Providers**
  - Ollama (local)
  - ChatGPT (API)
  - DeepSeek (API)
  - Extensible provider system

- **Translation Features**
  - Batch translation
  - Quality settings control
  - Cost estimation
  - Token usage tracking
  - Error handling and retry

### ⚙️ Configuration
- **Settings Management**
  - Language pair selection
  - Provider configuration
  - Quality presets
  - API key management
  - Base URL customization

- **Project Settings**
  - Engine-specific settings
  - Resource patterns
  - File exclusions
  - Translation rules
  - Validation rules

### 📊 Monitoring
- **Translation Stats**
  - Success/failure rates
  - Processing time
  - Token usage
  - Cost tracking
  - Quality scores

- **Progress Tracking**
  - Real-time updates
  - Queue management
  - Error reporting
  - Status indicators
  - Export options

## Tech Stack

### Frontend (UI Layer)
- **Framework**: Nuxt.js 3 + TypeScript
- **State**: Pinia
- **UI**: Nuxt UI + TailwindCSS
- **Utils**: VueUse
- **Routing**: Nuxt Router
- **Communication**: Tauri Commands

### Backend (Business Logic)
- **Framework**: Tauri (Rust)
- **AI**: Ollama + Mistral
- **File System**: Rust std::fs
- **Error Handling**: thiserror + anyhow
- **Types**: Rust types with serde
- **Services**: Rust services with async/await

## Project Structure

### Frontend (UI Layer)
```
src/
├── components/          # Vue components
│   ├── project/        # Project-specific components
│   │   ├── translation/ # Translation workflow
│   │   └── settings/   # Settings components
│   └── shared/         # Reusable components
├── composables/        # Nuxt composables
│   ├── useTranslation.ts
│   ├── useSettings.ts
│   └── useCommands.ts
├── stores/           # Pinia stores
│   ├── settings.ts   # Settings store
│   ├── translation.ts # Translation store
│   └── index.ts      # Store exports
├── pages/            # Nuxt pages
│   ├── index.vue     # Home page
│   ├── project/      # Project pages
│   └── settings.vue  # Settings page
├── layouts/          # Nuxt layouts
│   └── default.vue   # Default layout
├── app.vue           # Root component
├── nuxt.config.ts    # Nuxt configuration
└── tsconfig.json     # TypeScript configuration
```

### Backend (Business Logic)
```
src-tauri/
├── src/              # Rust source
│   ├── types/       # Core type definitions
│   │   ├── ai/     # AI types
│   │   ├── engine/ # Engine types
│   │   └── shared/ # Shared types
│   ├── core/        # Core business logic
│   │   ├── ai/     # AI core
│   │   └── engine/ # Engine core
│   ├── services/    # Service implementations
│   │   ├── ai/     # AI services
│   │   └── engine/ # Engine services
│   └── commands/    # Tauri commands
│       ├── ai.rs    # AI commands
│       ├── engine.rs # Engine commands
│       └── mod.rs   # Command exports
├── Cargo.toml       # Rust dependencies
└── tauri.conf.json  # Tauri config
```

## Getting Started

### Prerequisites
- Node.js 18+
- Rust 1.70+
- Ollama (for local AI)

### Installation
1. **Clone Repository**
   ```bash
   git clone https://github.com/yourusername/translation-ai.git
   cd translation-ai
   ```

2. **Install Dependencies**
   ```bash
   # Frontend
   npm install
   
   # Backend
   cargo install tauri-cli
   ```

3. **Start Development**
   ```bash
   npm run tauri dev
   ```

4. **Build Production**
   ```bash
   npm run tauri build
   ```

## Usage

1. **Project Setup**
   - Select game folder
   - Configure engine settings
   - Set up AI provider

2. **Translation Process**
   - Select resources
   - Configure quality
   - Start translation
   - Monitor progress
   - Export results

3. **Advanced Features**
   - Custom prompts
   - Quality presets
   - Batch processing
   - Error recovery
   - Export options

## Development

### Frontend Development
```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Run tests
npm run test

# Generate types
npm run typegen
```

### Backend Development
```bash
# Run Rust tests
cargo test

# Check Rust code
cargo check

# Format Rust code
cargo fmt
```

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

MIT License - see [LICENSE](LICENSE) for details.

## Acknowledgments

- Vue.js team
- Nuxt.js team
- Tauri team
- Ollama team
- All contributors