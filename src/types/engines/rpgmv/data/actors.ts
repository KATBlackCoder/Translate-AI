import { RPGMVBaseData, RPGMVTrait, RPGMVEquip, RPGMVTranslatableExtended } from '../common';

/**
 * Represents only the translatable fields of an actor in RPG Maker MV.
 * This interface is used to identify which fields should be processed for translation.
 * 
 * @interface RPGMVActorTranslatable
 * @extends {Pick<RPGMVTranslatableExtended, 'name' | 'nickname' | 'profile' | 'note'>}
 * 
 * @property {string} name - The character's display name
 * @property {string} nickname - The character's title or nickname
 * @property {string} profile - The character's biography or description
 * @property {string} description - Additional notes or metadata about the character
 */
export interface RPGMVActorTranslatable extends Pick<RPGMVTranslatableExtended, 'name' | 'nickname' | 'profile' | 'note'> {
  // All translatable fields are inherited from RPGMVTranslatableExtended
}

/**
 * Represents a complete character definition in RPG Maker MV.
 * This interface defines all properties of a playable character, including both
 * translatable and non-translatable fields.
 * 
 * @interface RPGMVActor
 * @extends {RPGMVBaseData}
 * 
 * @property {string} nickname - Character's title or nickname
 * @property {string} profile - Character's biography or description
 * @property {string} battlerName - Name of the battle sprite file
 * @property {number} characterIndex - Index in the character sprite sheet
 * @property {string} characterName - Name of the character sprite sheet file
 * @property {number} classId - ID of the character's class
 * @property {RPGMVEquip} equips - Currently equipped items
 * @property {number} faceIndex - Index in the face sprite sheet
 * @property {string} faceName - Name of the face sprite sheet file
 * @property {RPGMVTrait[]} traits - Character's special traits and abilities
 * @property {number} initialLevel - Starting level of the character
 * @property {number} maxLevel - Maximum level the character can reach
 */
export interface RPGMVActor extends RPGMVBaseData {
  // Translatable fields (from RPGMVActorTranslatable)
  nickname: string;    // Character's title
  profile: string;     // Character's biography
  
  // Non-translatable fields
  battlerName: string;      // Name of the battle sprite
  characterIndex: number;   // Index in the character sprite sheet
  characterName: string;    // Name of the character sprite sheet
  classId: number;         // ID of the character's class
  equips: RPGMVEquip;      // Currently equipped items
  faceIndex: number;       // Index in the face sprite sheet
  faceName: string;        // Name of the face sprite sheet
  traits: RPGMVTrait[];    // Character's special traits
  initialLevel: number;    // Starting level
  maxLevel: number;        // Maximum level
}

/**
 * Type definition for the Actors.json data file in RPG Maker MV.
 * The array starts with a null element (index 0) and contains actor data
 * starting from index 1. This matches RPG Maker MV's data structure where
 * actor IDs start from 1.
 * 
 * @type {(RPGMVActor | null)[]}
 */
export type RPGMVActorData = (RPGMVActor | null)[];