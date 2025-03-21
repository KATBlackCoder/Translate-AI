import { RPGMVBaseData } from '../common';
import { RPGMVEventCommand } from './maps';

/**
 * Represents a troop in RPG Maker MV
 * Target: data/Troops.json
 * Purpose: Defines all properties of a battle troop
 */
export interface RPGMVTroop extends RPGMVBaseData {
  members: RPGMVTroopMember[]; // Troop members
  pages: RPGMVTroopPage[];     // Troop pages
  note: string;                // Additional notes
}

/**
 * Represents a troop member in RPG Maker MV
 * Target: data/Troops.json (inside members array)
 * Purpose: Defines enemy placement in a troop
 */
export interface RPGMVTroopMember {
  enemyId: number;     // Enemy ID
  x: number;          // X position in battle
  y: number;          // Y position in battle
  hidden: boolean;    // Whether enemy is hidden
}

/**
 * Represents a troop page in RPG Maker MV
 * Target: data/Troops.json (inside pages array)
 * Purpose: Defines troop behavior and conditions
 */
export interface RPGMVTroopPage {
  conditions: RPGMVTroopConditions; // Page conditions
  span: number;                     // When the page is active
  list: RPGMVEventCommand[];        // Event commands
}

/**
 * Represents troop conditions in RPG Maker MV
 * Target: data/Troops.json (inside troop page conditions)
 * Purpose: Defines when a troop page is active
 */
export interface RPGMVTroopConditions {
  actorHp: number;           // Actor HP condition
  actorId: number;           // Actor ID condition
  actorValid: boolean;       // Whether actor condition is valid
  enemyHp: number;          // Enemy HP condition
  enemyIndex: number;       // Enemy index condition
  enemyValid: boolean;      // Whether enemy condition is valid
  switchId: number;         // Switch ID condition
  switchValid: boolean;     // Whether switch condition is valid
  turnA: number;           // Turn A condition
  turnB: number;           // Turn B condition
  turnValid: boolean;      // Whether turn condition is valid
}

/**
 * Type for the Troops.json data file
 * Target: data/Troops.json
 * Purpose: Represents the complete troops data structure
 */
export type RPGMVTroopData = RPGMVTroop[]; 