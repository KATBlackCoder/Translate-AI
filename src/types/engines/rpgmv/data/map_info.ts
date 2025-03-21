import { RPGMVBaseData } from '../common';

/**
 * Represents map information in RPG Maker MV
 * Target: data/MapInfos.json
 * Purpose: Defines metadata for all maps in the game
 */
export interface RPGMVMapInfo extends RPGMVBaseData {
  parentId: number;         // Parent map ID (for map hierarchy)
  order: number;            // Display order in map list
  expanded: boolean;        // Whether map is expanded in editor
  scrollX: number;         // Scroll position X in editor
  scrollY: number;         // Scroll position Y in editor
}

/**
 * Type for the MapInfos.json data file
 * Target: data/MapInfos.json
 * Purpose: Represents the complete map info data structure
 */
export type RPGMVMapInfoData = RPGMVMapInfo[]; 