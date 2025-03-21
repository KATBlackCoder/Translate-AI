/**
 * Common types used across all RPG Maker MV data files
 * These interfaces are shared between different data types
 */

/**
 * Core translatable fields that appear across multiple RPG Maker MV files
 * Target: All data files that contain translatable content
 * Purpose: Defines the standard translatable fields used throughout the game
 */
export interface RPGMVTranslatableCore {
  name: string;         // Display name (actors, classes, items, etc.)
  description?: string; // Description text (items, skills, etc.)
  note?: string;        // Developer notes/tags (can contain translatable content)
  message?: string;     // Message text (events, skills, etc.)
  help?: string;        // Help/tooltip text (skills, items, etc.)
}

/**
 * Extended translatable fields for more specific content types
 * Target: Files with additional translatable content
 * Purpose: Defines optional translatable fields for specific content types
 */
export interface RPGMVTranslatableExtended extends RPGMVTranslatableCore {
  nickname?: string;    // Character titles/nicknames
  profile?: string;     // Character profiles/biographies
  flavor?: string;      // Flavor text/lore
  command?: string;     // Menu commands/options
  success?: string;     // Success messages
  failure?: string;     // Failure messages
  usage?: string;       // Usage instructions
  requirements?: string; // Requirements text
}

/**
 * Base interface for all RPG Maker MV data objects
 * Target: All data files (Actors.json, Classes.json, etc.)
 * Purpose: Defines common properties found in all data objects
 */
export interface RPGMVBaseData {
    id?: number;      // Unique identifier for the data object
    name: string;    // Display name of the object
    note?: string;    // Additional notes/description
  }
  
  /**
   * Represents a trait in RPG Maker MV
   * Target: Used in Actors.json, Classes.json, Skills.json, etc.
   * Purpose: Defines special properties or behaviors
   */
  export interface RPGMVTrait {
    code: number;    // Trait type (e.g., Element Resistance, State Resistance)
    dataId: number;  // Specific ID for the trait
    value: number;   // Trait value or strength
  }
  
  /**
   * Represents equipment slots for actors
   * Target: Actors.json
   * Purpose: Defines what equipment is equipped in each slot
   * Format: [weaponId, shieldId, headId, bodyId, accessoryId]
   */
  export type RPGMVEquip = number[];
  
  /**
   * Interface for translatable content
   * Target: All text content in the game
   * Purpose: Defines structure for content that needs translation
   */
  export interface RPGMVTranslatable {
    name: string;        // Primary text to translate
    description?: string; // Optional description
    note?: string;       // Optional notes
  }
  
  /**
   * Generic interface for RPG Maker MV data files
   * Target: All JSON data files
   * Purpose: Defines the structure of data files (array with null first element)
   */
  export interface RPGMVDataFile<T> {
    [key: number]: T | null;
  }
  
  /**
   * Represents an effect in RPG Maker MV
   * Target: Skills.json, Items.json
   * Purpose: Defines what happens when a skill/item is used
   */
  export interface RPGMVEffect {
    code: number;    // Effect type (e.g., HP Recovery, State Change)
    dataId: number;  // Specific ID for the effect
    value1: number;  // Primary value (e.g., HP amount, state ID)
    value2: number;  // Secondary value (e.g., variance, probability)
  }