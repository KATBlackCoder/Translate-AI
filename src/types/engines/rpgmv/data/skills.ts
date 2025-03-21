import { RPGMVBaseData, RPGMVTrait, RPGMVEffect } from '../common';

/**
 * Represents a skill in RPG Maker MV
 * Target: data/Skills.json
 * Purpose: Defines all properties of a skill
 */
export interface RPGMVSkill extends RPGMVBaseData {
  description: string;      // Skill description
  iconIndex: number;       // Index in the icon sprite sheet
  message1: string;        // Message shown when skill is used
  message2: string;        // Message shown when skill hits
  mpCost: number;         // MP cost to use the skill
  tpCost: number;         // TP cost to use the skill
  stypeId: number;        // Skill type ID (e.g., Physical, Magical)
  baseDamage: number[];   // Base damage parameters
  effects: RPGMVEffect[]; // Skill effects
  traits: RPGMVTrait[];   // Skill's special traits
  occasion: number;       // When the skill can be used
  scope: number;          // Target scope (single, all, etc.)
  speed: number;          // Skill speed
  successRate: number;    // Base success rate
  repeats: number;        // Number of hits
  tpGain: number;        // TP gained from using the skill
  hitType: number;       // Hit type (physical, magical, certain)
  animationId: number;   // ID of the skill animation
}

/**
 * Type for the Skills.json data file
 * Target: data/Skills.json
 * Purpose: Represents the complete skills data structure
 */
export type RPGMVSkillData = RPGMVSkill[]; 