import { RPGMVBaseData } from '../common';
import { RPGMVEventCommand } from './maps';

/**
 * Represents a common event in RPG Maker MV
 * Target: data/CommonEvents.json
 * Purpose: Defines all properties of a common event
 */
export interface RPGMVCommonEvent extends RPGMVBaseData {
  trigger: number;           // Event trigger type
  switchId: number;          // Switch ID for trigger
  list: RPGMVEventCommand[]; // Event commands
}

/**
 * Type for the CommonEvents.json data file
 * Target: data/CommonEvents.json
 * Purpose: Represents the complete common events data structure
 */
export type RPGMVCommonEventData = RPGMVCommonEvent[]; 