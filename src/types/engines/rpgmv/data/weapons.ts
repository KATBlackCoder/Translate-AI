import { RPGMVBaseData, RPGMVTrait, RPGMVEffect } from '../common';

/**
 * Represents a weapon in RPG Maker MV
 * Target: data/Weapons.json
 * Purpose: Defines all properties of a weapon
 */
export interface RPGMVWeapon extends RPGMVBaseData {
  description: string;      // Weapon description
  iconIndex: number;       // Index in the icon sprite sheet
  wtypeId: number;         // Weapon type ID (e.g., Dagger, Sword)
  price: number;          // Weapon price in shops
  etypeId: number;        // Equipment type ID
  params: number[];       // Weapon parameters (ATK, DEF, etc.)
  traits: RPGMVTrait[];   // Weapon's special traits
  effects: RPGMVEffect[]; // Weapon effects when used
  note: string;           // Additional notes
}

/**
 * Type for the Weapons.json data file
 * Target: data/Weapons.json
 * Purpose: Represents the complete weapons data structure
 */
export type RPGMVWeaponData = RPGMVWeapon[]; 