# Translation AI

A powerful AI-powered translation tool for game engine content, built with Vue 3, TypeScript, and Pinia.

## Features

- 🎮 **Game Engine Support**
  - RPGMV support out of the box
  - Extensible architecture for adding more engines
  - Automatic engine detection
  - Engine-specific file handling

- 🤖 **AI Translation**
  - Multiple AI provider support (Ollama, ChatGPT, DeepSeek)
  - Batch translation capabilities
  - Quality settings control
  - Cost estimation
  - Content rating system

- ⚙️ **Smart Configuration**
  - User-friendly settings
  - Default configurations
  - Persistent preferences
  - Type-safe configuration
  - Engine-specific validation

- 🎯 **Project Management**
  - Engine file pattern detection
  - Resource file handling
  - Translation progress tracking
  - Error handling and recovery
  - File integrity maintenance

## Tech Stack

- **Frontend**: Vue 3 + TypeScript
- **State Management**: Pinia
- **UI Framework**: Vue 3 + TailwindCSS
- **Build Tool**: Vite
- **Package Manager**: npm

## Project Structure

```
src/
├── components/     # Vue components
├── composables/    # Vue composables
├── config/        # Configuration files
├── core/          # Core functionality
├── services/      # Service implementations
├── stores/        # Pinia stores
├── types/         # TypeScript types
└── views/         # Page components
```

## Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Build for Production**
   ```bash
   npm run build
   ```

## Usage

1. **Select Game Folder**
   - Click "Select Game Folder"
   - Choose your game's root directory
   - The app will automatically detect the game engine

2. **Configure Translation**
   - Select source and target languages
   - Choose AI provider and model
   - Adjust quality settings
   - Review cost estimation

3. **Start Translation**
   - Review detected files
   - Start batch translation
   - Monitor progress
   - Review results

## Architecture

The application follows a clean architecture pattern with:

- **Modular Stores**: Split into state, getters, and actions
- **Dependency Injection**: For better testability
- **Configuration System**: Centralized settings management
- **Type Safety**: Full TypeScript coverage
- **Unidirectional Data Flow**: Clear data movement patterns

See [ARCHITECTURE.md](ARCHITECTURE.md) for detailed architecture documentation.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Vue.js team for the amazing framework
- Pinia team for state management
- All contributors and users