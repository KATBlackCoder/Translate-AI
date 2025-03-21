import { RPGMVBaseData, RPGMVTrait, RPGMVEffect } from '../common';

/**
 * Represents an item in RPG Maker MV
 * Target: data/Items.json
 * Purpose: Defines all properties of an item
 */
export interface RPGMVItem extends RPGMVBaseData {
  description: string;      // Item description
  iconIndex: number;       // Index in the icon sprite sheet
  itypeId: number;         // Item type ID (e.g., Regular Item, Key Item)
  price: number;          // Item price in shops
  consumable: boolean;    // Whether the item is consumed on use
  effects: RPGMVEffect[]; // Item effects when used
  traits: RPGMVTrait[];   // Item's special traits
  note: string;           // Additional notes
}

/**
 * Type for the Items.json data file
 * Target: data/Items.json
 * Purpose: Represents the complete items data structure
 */
export type RPGMVItemData = RPGMVItem[];