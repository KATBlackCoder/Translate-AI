import { RPGMVBaseData, RPGMVTrait, RPGMVEffect } from '../common';

/**
 * Represents a state in RPG Maker MV
 * Target: data/States.json
 * Purpose: Defines all properties of a state (status effect)
 */
export interface RPGMVState extends RPGMVBaseData {
  description: string;      // State description
  iconIndex: number;       // Index in the icon sprite sheet
  restriction: number;     // Action restriction (0: None, 1: Attack enemy, 2: Attack ally, 3: Attack self)
  priority: number;        // Priority in state list
  removeAtBattleEnd: boolean; // Whether state is removed after battle
  removeByRestriction: boolean; // Whether state is removed by restriction
  autoRemovalTiming: number; // When state is automatically removed
  minTurns: number;       // Minimum turns before removal
  maxTurns: number;       // Maximum turns before removal
  removeByDamage: boolean; // Whether state is removed by damage
  chanceByDamage: number; // Chance to remove by damage
  removeByWalking: boolean; // Whether state is removed by walking
  stepsToRemove: number;  // Steps needed to remove state
  message1: string;       // Message when state is added
  message2: string;       // Message when state is removed
  note: string;           // Additional notes
}

/**
 * Type for the States.json data file
 * Target: data/States.json
 * Purpose: Represents the complete states data structure
 */
export type RPGMVStateData = RPGMVState[]; 