# Project Vision & Long-Term Goals

This document outlines the broader vision and long-term goals for the Game Translation Desktop App, extending beyond the initial MVP (Phase 1).

## Overarching Vision
- Become the go-to tool for AI-powered translation of RPG Maker and similar game engines.
- Support a wide range of file formats, engines, and AI providers.
- Enable collaborative, high-quality, and accessible game localization workflows for solo developers and teams.

## Future Architecture & Scalability
- The core architecture (DDD, vertical slices) is designed with future extensibility in mind, aiming to easily incorporate support for additional game engines (e.g., RPG Maker MZ, VX Ace) and file types (e.g., Maps, Items) in later phases.
- Generalize extraction/injection logic for engine-agnostic support where possible.

## Key Future Features (Post-MVP Roadmap Summary)

### Phase 2: Expansion
- **Batch Translation:** Process multiple RPGMV files concurrently.
- **Multiple File Types:** Support more RPGMV files (Maps, Items, etc.).
- **Project Management:** Create, load, manage projects; view history; adjust settings. (Will likely involve reintroducing `translation_projects` and `translation_files` tables in the database).
- **Multiple Engines:** Add support for other RPG Maker versions (MZ, VX Ace).
- **Provider Selection:** Support and configure multiple AI providers simultaneously.

### Phase 3: Advanced Features & Enhancements
- **Glossary/Termbase & Translation Memory:** Improve consistency and reuse translations. (Enhance the `glossary` table or add dedicated TM tables).
- **QA Tools:** Checks for untranslated text, length consistency, etc.
- **Human-in-the-Loop Review:** Workflow for reviewing/editing AI output.
- **Multiple Output Formats:** Export translations (CSV, XLIFF).
- **Plugin System:** Allow third-party engines/providers.
- **Provider Benchmarking & Fallback:** Compare and automatically switch providers.
- **Custom Prompts:** Allow users to customize AI prompts. (May involve moving prompts to a database table).
- **UI/UX Enhancements:** Dark mode, themes, drag-and-drop, onboarding.
- **Advanced Filtering/Search:** For managing large translation projects.
- **Cloud Sync/Backup & Collaboration:** For teams and project safety.
- **CLI Tool & API:** Enable automation and integration.
- **Detailed Statistics:** Track provider performance, costs, etc. (Will likely involve reintroducing `translation_statistics` table).
- **Full UI Localization:** Make the app UI itself multilingual.
- **On-device Model Support:** Use local LLMs without external services.

*(See `ROADMAP.md` for full details on phases)* 