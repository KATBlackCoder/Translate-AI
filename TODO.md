# Game Translation Desktop App TODO

## Project Overview
Desktop application for translating game content from various game engines (initially RPG Maker MV) using AI tools (Ollama + Mistral).

## Tech Stack
- Frontend: Vue 3 + TypeScript
- UI: Tailwind CSS + PrimeVue 4
- State: Pinia
- Utils: VueUse
- Routing: Vue Router
- Desktop: Tauri (file system access)
- AI: Ollama + Mistral (local)

## Current Sprint Focus

### 1. AI Configuration System (Priority: High)
- [x] Review and document existing types
- [x] Create AIServiceConfig interface
- [x] Create configuration factory
- [x] Update AI store
- [x] Create settings connector
- [x] Update translation store
- [ ] Testing
  - [ ] Config factory tests
  - [ ] AIServiceConfig interface tests
  - [ ] Store tests
  - [ ] Settings connector tests
- [ ] Migration
  - [ ] Update components
  - [ ] Test updated components
  - [ ] Remove deprecated code
- [ ] Performance optimization
  - [ ] Profile configuration updates
  - [ ] Optimize settings watching
  - [ ] Add debouncing if needed

### 2. Engine Configuration System (Priority: High)
- [ ] Review and document existing types
- [ ] Create EngineServiceConfig interface
- [ ] Create engine configuration factory
- [ ] Update engine store
- [ ] Create engine settings connector
- [ ] Update project store
- [ ] Testing
- [ ] Migration
- [ ] Performance optimization

### 3. Core Features (Priority: High)
- [ ] Translation Memory System
  - [ ] Database setup
  - [ ] CRUD operations
  - [ ] Search functionality
  - [ ] Import/Export
- [ ] Quality Checks
  - [ ] Confidence scoring
  - [ ] Length validation
  - [ ] Format preservation
  - [ ] Named entity preservation
- [ ] Backup System
  - [ ] Automatic backups
  - [ ] Backup restoration
  - [ ] Backup management

### 4. UI/UX Improvements (Priority: Medium)
- [ ] Drag & drop support
  - [ ] Project import
  - [ ] File upload
- [ ] Keyboard shortcuts
  - [ ] Navigation
  - [ ] Actions
  - [ ] Settings
- [ ] Progress indicators
  - [ ] Detailed progress
  - [ ] ETA calculation
  - [ ] Resource usage

## MVP Features Status

### 1. Project Setup ✅
- [x] Initialize Tauri + Vue project
- [x] Configure Tailwind CSS
- [x] Set up PrimeVue components
- [x] Configure Pinia
- [x] Set up Vue Router

### 2. Core UI Components ⏳
- [x] Main layout with sidebar navigation
- [x] Project selection/creation screen
- [x] Game file import interface
- [x] Translation workspace
- [x] Settings panel
- [ ] Drag & drop zone

### 3. RPG Maker MV Support ⏳
- [x] File parser
- [x] JSON data extraction
- [x] Text content identification
- [ ] Translation memory system

### 4. AI Integration ⏳
- [x] Ollama setup
- [x] Translation API wrapper
- [x] Prompt management
- [x] Multi-provider support
- [ ] Translation quality checks

### 5. State Management ⏳
- [x] Project store
- [x] Translation store
- [x] Settings store
- [x] UI state store
- [ ] Settings persistence

### 6. File Operations ⏳
- [x] Project file reading
- [x] Translation file generation
- [ ] Backup system
- [x] Export functionality

## Future Improvements

### Phase 1 (Next Release)
- [ ] Additional Game Engine Support
  - [ ] RPG Maker MZ
  - [ ] RPG Maker ACE
  - [ ] WolfRPG
  - [ ] Bakin
- [ ] File System Enhancements
  - [ ] File watching
  - [ ] Concurrent operations
  - [ ] Progress tracking
  - [ ] Operation queuing
- [ ] Engine System Improvements
  - [ ] Hot-reload support
  - [ ] Custom engine UI
  - [ ] Validation rules editor
- [ ] AI Provider Improvements
  - [ ] OpenAI token management
  - [ ] Custom model selection
  - [ ] Performance metrics
  - [ ] Cost estimation

### Phase 2 (Future)
- [ ] Advanced Translation Memory
  - [ ] Context-aware suggestions
  - [ ] Fuzzy matching
  - [ ] Terminology management
- [ ] Advanced File System
  - [ ] Distributed operations
  - [ ] System events
  - [ ] Operation hooks
- [ ] Advanced Engine Features
  - [ ] Custom handlers
  - [ ] Plugin system
  - [ ] Version management
- [ ] AI Enhancements
  - [ ] Model fine-tuning
  - [ ] Domain adaptation
  - [ ] Quality scoring
  - [ ] Post-editing

### Phase 3 (Long-term)
- [ ] API Integrations
  - [ ] DeepL
  - [ ] Google Translate
  - [ ] Custom APIs
- [ ] Plugin System
  - [ ] Provider plugins
  - [ ] Quality check plugins
  - [ ] Format plugins
- [ ] Advanced Features
  - [ ] Binary file support
  - [ ] Custom formats
  - [ ] Format conversion
- [ ] Testing Suite
  - [ ] File system tests
  - [ ] Engine tests
  - [ ] Translation tests
- [ ] Performance
  - [ ] Memory optimization
  - [ ] Caching strategies
  - [ ] Background processing
- [ ] Offline Mode
  - [ ] Local models
  - [ ] Cache management
  - [ ] Sync queue
- [ ] Analytics
  - [ ] Translation metrics
  - [ ] Quality metrics
  - [ ] Cost tracking
  - [ ] Performance monitoring

## Development Guidelines
1. Follow TypeScript best practices
2. Use Vue 3 Composition API with `<script setup>`
3. Implement proper error handling
4. Write unit tests for critical components
5. Document all major functions and components
6. Follow the established file structure

## File Structure
```
src/
├── assets/
├── components/
│   ├── common/
│   ├── layout/
│   ├── project/
│   └── translation/
├── stores/
│   ├── ai/
│   ├── engines/
│   └── settings/
├── views/
├── router/
├── types/
└── utils/
```

## Getting Started
1. Clone the repository
2. Install dependencies: `npm install`
3. Start development server: `npm run tauri dev`
4. Build for production: `npm run tauri build`

## Priority Levels
- High: Critical for current sprint
- Medium: Important but not blocking
- Low: Nice to have 