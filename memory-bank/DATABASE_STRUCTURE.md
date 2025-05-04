# Game Translator Database Structure

This document outlines the SQLite database structure for the Game Translation Desktop App, detailing the schema design, tables, relationships, and migration approach.

## Overview

The application uses SQLite for persistent storage, accessed via the Tauri SQL plugin (`tauri-plugin-sql`). For the MVP, the database primarily stores detailed translation history (`translation_history`) and a curated glossary of approved translations (`glossary`).

## Database Location

- **Development**: In development mode, the database file is created at `sqlite:game_translator.db` in the project root.
- **Production**: In production, the database is stored in the platform-specific app data directory:
  - **Windows**: `%APPDATA%\GameTranslatore\game_translator.db`
  - **macOS**: `~/Library/Application Support/GameTranslatore/game_translator.db` 
  - **Linux**: `~/.config/GameTranslatore/game_translator.db`

## Schema Design Principles

1. **Simple is Better**: Use straightforward schemas without unnecessary complexity for MVP
2. **Forward Compatible**: Design for future expansion (e.g., project management, stats)
3. **Atomic Records**: Store atomic/individual records for maximum flexibility
4. **Minimal Redundancy**: Minimize redundant data while maintaining query performance
5. **No Circular References**: Avoid circular foreign key relationships

## Tables

### 1. `translation_history`

Stores individual translation records with metadata for tracking, analysis, and rollback capabilities.

```sql
CREATE TABLE IF NOT EXISTS translation_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    -- Context of the text
    file_path TEXT NOT NULL,           -- Path relative to game root (e.g., "data/Actors.json")
    content_path TEXT NOT NULL,        -- Unique identifier within the file (e.g., "actors[1].name")
    -- Translation details
    source_lang TEXT NOT NULL,         -- Source language code (e.g., "ja")
    target_lang TEXT NOT NULL,         -- Target language code (e.g., "en")
    source_text TEXT NOT NULL,         -- Original text before this operation
    translated_text TEXT NOT NULL,     -- Text after this operation (from AI or user edit)
    -- Metadata for this specific translation event
    provider TEXT NOT NULL,            -- Provider used for *this* translation (e.g., "ollama")
    model TEXT NOT NULL,               -- Model used for *this* translation (e.g., "mistral")
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- When this history record was created
    -- Outcome of this specific operation
    status TEXT NOT NULL CHECK(status IN ('success', 'error', 'edited')), -- 'success': AI ok. 'error': AI fail. 'edited': User modified/approved.
    error_message TEXT,                -- Details if status is 'error'
    -- Link to the approved glossary version (if any)
    glossary_id INTEGER,               -- Optional: References the ID in the 'glossary' table that this entry corresponds to (if approved)
    FOREIGN KEY (glossary_id) REFERENCES glossary(id) ON DELETE SET NULL -- If glossary entry is deleted, just nullify the link here
);

-- Indices for common lookups
CREATE INDEX idx_history_lookup ON translation_history(file_path, content_path); -- Find history for a specific game text
CREATE INDEX idx_history_timestamp ON translation_history(timestamp DESC);     -- Show recent history
CREATE INDEX idx_history_glossary_link ON translation_history(glossary_id);  -- Find history related to a glossary entry
```

#### Key Fields Explained:

- **`content_path`**: Identifies the specific text element within the file using a path-like notation (e.g., `actors[1].name`, `items[5].description`).
- **`status`**: Can be one of:
  - `success`: AI translation completed successfully.
  - `error`: AI translation failed.
  - `edited`: User manually edited/approved the translation.
- **`glossary_id`**: Links to the corresponding entry in the `glossary` table once a translation for a specific `source_text`/`lang_pair` is approved.

### 2. `glossary`

Stores the single, user-approved "correct" translation for a given source text and language pair. This is queried *before* attempting a new AI translation to reuse validated work.

```sql
CREATE TABLE IF NOT EXISTS glossary (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source_lang TEXT NOT NULL,         -- Source language code
    target_lang TEXT NOT NULL,         -- Target language code
    source_text TEXT NOT NULL,         -- The original source text
    target_text TEXT NOT NULL,         -- The single, approved translation for this pair
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- When this entry was first created/approved
    last_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- When this specific translation was last updated/re-approved
);

-- Ensures only one approved translation exists per source text/language pair
CREATE UNIQUE INDEX idx_glossary_unique ON glossary(source_lang, target_lang, source_text);

-- Index for quick lookups when checking for existing translations
CREATE INDEX idx_glossary_lookup ON glossary(source_text, source_lang, target_lang);
```

## Migrations

Migrations are defined in `src-tauri/src/lib.rs` using the Tauri SQL plugin's migration system. This ensures the database schema is created and updated correctly across application versions.

```rust
// Example migration implementation in lib.rs
.plugin(tauri_plugin_sql::Builder::default()
    .add_migrations("sqlite:game_translator.db", vec![
        Migration {
            version: 1,
            description: "Create history and glossary tables",
            sql: include_str!("../migrations/1_initial_schema.sql"), // Contains CREATE TABLE for history and glossary
            kind: MigrationKind::Up,
        },
        // Future migrations would be added here (e.g., adding projects table)
    ])
    .build()
)
```

## Accessing the Database

The database is primarily accessed from the frontend using the `@tauri-apps/plugin-sql` package:

```typescript
import { Database } from '@tauri-apps/plugin-sql'

// Connect to the database
const db = await Database.load('sqlite:game_translator.db')

// Example query
const history = await db.select(
  'SELECT * FROM translation_history WHERE file_path = ? ORDER BY timestamp DESC LIMIT 10',
  [filePath]
)

// Example glossary lookup
const glossaryEntry = await db.select(
  'SELECT target_text FROM glossary WHERE source_text = ? AND source_lang = ? AND target_lang = ?',
  [sourceText, sourceLang, targetLang]
)

// Example glossary insert/update (requires frontend upsert logic)
await db.execute(
  'INSERT INTO glossary (source_lang, target_lang, source_text, target_text, last_updated_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP) ON CONFLICT(source_lang, target_lang, source_text) DO UPDATE SET target_text=excluded.target_text, last_updated_at=CURRENT_TIMESTAMP',
  [sourceLang, targetLang, sourceText, approvedText]
)
```

## Schema Evolution

As the application evolves, new tables or columns may be required. The approach is:

1. Create a new migration file with the schema changes (e.g., adding `translation_projects` table).
2. Add the migration to the builder in `lib.rs`.
3. Update this documentation to reflect the changes.
4. Add any necessary frontend code to utilize the new schema elements.

## Performance Considerations

- Keep queries focused and efficient.
- Use appropriate indexes for common query patterns (`translation_history` lookups, `glossary` lookups).
- Consider transaction batching for bulk operations (e.g., inserting many history records).
- Clean up or archive old history records periodically if performance degrades.
- Use prepared statements (handled automatically by the plugin) for repeated queries.

## Future Expansion

The schema can be expanded later:

1. **Project Management**: Add `translation_projects` and `translation_files` tables, link via `project_id`.
2. **Statistics**: Add `translation_statistics` table.
3. **User Management**: Add `user_id` fields if multi-user functionality is added.
4. **Terminology**: Add tables for custom glossaries (distinct from the auto-built `glossary` table).
5. **Quality Metrics**: Add tables to track translation quality and user feedback. 