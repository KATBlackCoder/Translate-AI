import { RPGMVBaseData, RPGMVTrait, RPGMVEffect } from '../common';

/**
 * Represents an enemy in RPG Maker MV
 * Target: data/Enemies.json
 * Purpose: Defines all properties of an enemy
 */
export interface RPGMVEnemy extends RPGMVBaseData {
  battlerName: string;     // Name of the battle sprite
  battlerHue: number;      // Hue of the battle sprite
  maxHp: number;          // Maximum HP
  maxMp: number;          // Maximum MP
  atk: number;            // Attack power
  def: number;            // Defense power
  mat: number;            // Magic attack power
  mdf: number;            // Magic defense power
  agi: number;            // Agility
  luk: number;            // Luck
  exp: number;            // Experience points given
  gold: number;           // Gold given
  dropItems: RPGMVDropItem[]; // Items that can be dropped
  actions: RPGMVEnemyAction[]; // Enemy's battle actions
  traits: RPGMVTrait[];   // Enemy's special traits
  note: string;           // Additional notes
}

/**
 * Represents a drop item for an enemy
 * Target: data/Enemies.json (inside dropItems array)
 * Purpose: Defines what items an enemy can drop
 */
export interface RPGMVDropItem {
  kind: number;           // Item kind (1: Item, 2: Weapon, 3: Armor)
  dataId: number;         // ID of the item
  denominator: number;    // Drop rate denominator
}

/**
 * Represents a battle action for an enemy
 * Target: data/Enemies.json (inside actions array)
 * Purpose: Defines enemy's battle behavior
 */
export interface RPGMVEnemyAction {
  skillId: number;        // ID of the skill to use
  conditionType: number;  // Condition type (turn, HP, etc.)
  conditionParam1: number; // First condition parameter
  conditionParam2: number; // Second condition parameter
  rating: number;         // Action rating (higher = more likely)
}

/**
 * Type for the Enemies.json data file
 * Target: data/Enemies.json
 * Purpose: Represents the complete enemies data structure
 */
export type RPGMVEnemyData = RPGMVEnemy[]; 