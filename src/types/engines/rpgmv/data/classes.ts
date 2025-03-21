import { RPGMVBaseData, RPGMVTrait } from '../common';

/**
 * Represents a character class in RPG Maker MV
 * Target: data/Classes.json
 * Purpose: Defines all properties of a character class
 */
export interface RPGMVClass extends RPGMVBaseData {
  expParams: number[];           // Experience curve parameters
  traits: RPGMVTrait[];         // Class's special traits
  learnings: RPGMVClassLearning[]; // Skills learned at specific levels
  description: string;          // Class description
  note: string;                 // Additional notes
}

/**
 * Represents a skill learning entry for a class
 * Target: data/Classes.json (inside learnings array)
 * Purpose: Defines when a class learns a specific skill
 */
export interface RPGMVClassLearning {
  level: number;    // Level at which the skill is learned
  skillId: number;  // ID of the skill to learn
  note: string;     // Additional notes about learning
  message: string;  // Message shown when skill is learned
}

/**
 * Type for the Classes.json data file
 * Target: data/Classes.json
 * Purpose: Represents the complete classes data structure
 */
export type RPGMVClassData = RPGMVClass[];