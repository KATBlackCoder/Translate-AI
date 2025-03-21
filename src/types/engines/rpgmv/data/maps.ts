import { RPGMVBaseData } from '../common';

/**
 * Represents a map in RPG Maker MV
 * Target: data/Map[XXX].json
 * Purpose: Defines all properties of a game map
 */
export interface RPGMVMap extends RPGMVBaseData {
  displayName: string;        // Map display name
  tilesetId: number;         // Tileset ID
  width: number;             // Map width in tiles
  height: number;            // Map height in tiles
  scrollType: number;        // Map scrolling type
  specifyBattleback: boolean; // Whether to use custom battleback
  battleback1Name: string;   // Primary battleback name
  battleback2Name: string;   // Secondary battleback name
  autoplayBgm: boolean;      // Whether to autoplay BGM
  bgm: RPGMVAudioFile;       // Background music
  autoplayBgs: boolean;      // Whether to autoplay BGS
  bgs: RPGMVAudioFile;       // Background sound
  disableDashing: boolean;   // Whether dashing is disabled
  encounterList: RPGMVEncounter[]; // Random encounter list
  encounterStep: number;     // Steps between encounters
  parallaxName: string;      // Parallax background name
  parallaxLoopX: boolean;    // Whether parallax loops horizontally
  parallaxLoopY: boolean;    // Whether parallax loops vertically
  parallaxSx: number;       // Parallax scroll speed X
  parallaxSy: number;       // Parallax scroll speed Y
  note: string;              // Additional notes
  events: RPGMVMapEvent[];   // Map events
}

/**
 * Represents an audio file in RPG Maker MV
 * Target: Various JSON files (Maps, System, etc.)
 * Purpose: Defines audio file properties
 */
export interface RPGMVAudioFile {
  name: string;              // Audio file name
  pan: number;               // Pan position (-100 to 100)
  pitch: number;             // Pitch (50 to 150)
  volume: number;            // Volume (0 to 100)
}

/**
 * Represents a random encounter in RPG Maker MV
 * Target: data/Map[XXX].json (inside encounterList array)
 * Purpose: Defines random encounter properties
 */
export interface RPGMVEncounter {
  enemyId: number;           // Enemy ID
  troopId: number;           // Troop ID
  weight: number;            // Encounter weight
  regionSet: number[];       // Regions where encounter can occur
}

/**
 * Represents a map event in RPG Maker MV
 * Target: data/Map[XXX].json (inside events array)
 * Purpose: Defines event properties and pages
 */
export interface RPGMVMapEvent {
  id: number;                // Event ID
  name: string;              // Event name
  x: number;                 // X coordinate
  y: number;                 // Y coordinate
  pages: RPGMVEventPage[];   // Event pages
}

/**
 * Represents an event page in RPG Maker MV
 * Target: data/Map[XXX].json (inside event pages array)
 * Purpose: Defines event page properties and conditions
 */
export interface RPGMVEventPage {
  conditions: RPGMVEventConditions; // Page conditions
  image: RPGMVEventImage;           // Event image
  moveType: number;                 // Movement type
  moveSpeed: number;                // Movement speed
  moveFrequency: number;            // Movement frequency
  moveRoute: RPGMVMoveRoute;        // Custom movement route
  walkAnime: boolean;               // Whether to animate walking
  stepAnime: boolean;               // Whether to animate stepping
  directionFix: boolean;            // Whether direction is fixed
  through: boolean;                 // Whether to pass through objects
  priorityType: number;             // Priority type
  trigger: number;                  // Trigger type
  list: RPGMVEventCommand[];        // Event commands
}

/**
 * Represents event conditions in RPG Maker MV
 * Target: data/Map[XXX].json (inside event page conditions)
 * Purpose: Defines when an event page is active
 */
export interface RPGMVEventConditions {
  actorId: number;          // Actor ID condition
  actorValid: boolean;      // Whether actor condition is valid
  itemId: number;           // Item ID condition
  itemValid: boolean;       // Whether item condition is valid
  selfSwitchCh: string;     // Self switch condition
  selfSwitchValid: boolean; // Whether self switch condition is valid
  switch1Id: number;        // Switch 1 ID
  switch1Valid: boolean;    // Whether switch 1 condition is valid
  switch2Id: number;        // Switch 2 ID
  switch2Valid: boolean;    // Whether switch 2 condition is valid
  variableId: number;       // Variable ID
  variableValid: boolean;   // Whether variable condition is valid
  variableValue: number;    // Variable value to check
}

/**
 * Represents an event image in RPG Maker MV
 * Target: data/Map[XXX].json (inside event page image)
 * Purpose: Defines event sprite properties
 */
export interface RPGMVEventImage {
  tileId: number;           // Tile ID (if using tile)
  characterName: string;    // Character sprite name
  characterIndex: number;   // Character sprite index
  direction: number;        // Initial direction
  pattern: number;          // Initial pattern
}

/**
 * Represents a move route in RPG Maker MV
 * Target: data/Map[XXX].json (inside event page moveRoute)
 * Purpose: Defines custom movement patterns
 */
export interface RPGMVMoveRoute {
  list: RPGMVMoveCommand[]; // List of movement commands
  repeat: boolean;          // Whether to repeat the route
  skippable: boolean;       // Whether route can be skipped
  wait: boolean;            // Whether to wait for completion
}

/**
 * Represents a move command in RPG Maker MV
 * Target: data/Map[XXX].json (inside move route list)
 * Purpose: Defines a single movement command
 */
export interface RPGMVMoveCommand {
  code: number;             // Command code
  parameters: any[];        // Command parameters
}

/**
 * Represents an event command in RPG Maker MV
 * Target: data/Map[XXX].json (inside event page list)
 * Purpose: Defines a single event command
 */
export interface RPGMVEventCommand {
  code: number;             // Command code
  indent: number;           // Command indentation
  parameters: any[];        // Command parameters
}

/**
 * Type for the Map[XXX].json data files
 * Target: data/Map[XXX].json
 * Purpose: Represents the complete map data structure
 */
export type RPGMVMapData = RPGMVMap; 