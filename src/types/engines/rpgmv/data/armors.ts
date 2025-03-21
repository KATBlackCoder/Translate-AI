import { RPGMVBaseData, RPGMVTrait, RPGMVEffect } from '../common';

/**
 * Represents an armor in RPG Maker MV
 * Target: data/Armors.json
 * Purpose: Defines all properties of an armor
 */
export interface RPGMVArmor extends RPGMVBaseData {
  description: string;      // Armor description
  iconIndex: number;       // Index in the icon sprite sheet
  atypeId: number;         // Armor type ID (e.g., Shield, Helmet)
  price: number;          // Armor price in shops
  etypeId: number;        // Equipment type ID
  params: number[];       // Armor parameters (ATK, DEF, etc.)
  traits: RPGMVTrait[];   // Armor's special traits
  effects: RPGMVEffect[]; // Armor effects when used
  note: string;           // Additional notes
}

/**
 * Type for the Armors.json data file
 * Target: data/Armors.json
 * Purpose: Represents the complete armors data structure
 */
export type RPGMVArmorData = RPGMVArmor[]; 