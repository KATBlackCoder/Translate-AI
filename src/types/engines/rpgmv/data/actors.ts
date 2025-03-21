import { RPGMVBaseData, RPGMVTrait, RPGMVEquip, RPGMVTranslatableExtended } from '../common';

/**
 * Represents only the translatable fields of an actor
 * Target: Fields that need translation in Actors.json
 * Purpose: Defines which fields should be processed for translation
 */
export interface RPGMVActorTranslatable extends Pick<RPGMVTranslatableExtended, 'name' | 'nickname' | 'profile' | 'note'> {
  // All translatable fields are inherited from RPGMVTranslatableExtended
}

/**
 * Represents a character in RPG Maker MV
 * Target: data/Actors.json
 * Purpose: Defines all properties of a playable character
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
 * Type for the Actors.json data file
 * Target: data/Actors.json
 * Purpose: Represents the complete actors data structure with null first element
 */
export type RPGMVActorData = (RPGMVActor | null)[];