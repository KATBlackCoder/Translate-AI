-- Migration: 1
-- Description: Create history and glossary tables

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

-- =============================================================================

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