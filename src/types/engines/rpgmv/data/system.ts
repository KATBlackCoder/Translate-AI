/**
 * Represents game terms and messages
 * Target: data/System.json (inside terms object)
 * Purpose: Defines game terminology and UI text
 */
export interface RPGMVTerms {
  basic: { [key: string]: string };     // Basic game terms
  commands: { [key: string]: string };  // Command names
  params: string[];                     // Parameter names
  messages: { [key: string]: string };  // System messages
}

/**
 * Represents the game's system data in RPG Maker MV
 * Target: data/System.json
 * Purpose: Defines core game settings and text
 */
export interface RPGMVSystem {
  gameTitle: string;           // Game title
  locale: string;              // Game locale
  menuCommands: string[];      // Menu command names
  currencyUnit: string;        // Currency unit name
  elements: string[];          // Element names
  equipTypes: string[];       // Equipment type names
  commands: RPGMVCommand[];    // Command names
  attackAnimation: number;     // Default attack animation ID
  skillAnimation: number;      // Default skill animation ID
  weaponAnimation: number;     // Default weapon animation ID
  weaponImage: number;         // Default weapon image ID
  weaponImageId: number;       // Default weapon image ID
  floorNumber: number;         // Default floor number
  currencyIcon: number;        // Currency icon index
  currencyBack: number;        // Currency background index
  windowTone: number[];       // Window tone color
  advanced: RPGMVSystemAdvanced; // Advanced system settings
  terms: RPGMVTerms;          // Game terms and messages
}

/**
 * Represents a command in the game
 * Target: data/System.json (inside commands array)
 * Purpose: Defines command names and settings
 */
export interface RPGMVCommand {
  name: string;               // Command name
  symbol: string;             // Command symbol
  enabled: boolean;           // Whether command is enabled
  ext: number;                // Extended parameter
}

/**
 * Represents advanced system settings
 * Target: data/System.json (inside advanced object)
 * Purpose: Defines additional game settings
 */
export interface RPGMVSystemAdvanced {
  gameId: number;             // Game ID
  screenWidth: number;        // Screen width
  screenHeight: number;       // Screen height
  uiAreaWidth: number;        // UI area width
  uiAreaHeight: number;       // UI area height
  numberFontFilename: string; // Number font filename
  fallbackFonts: string[];    // Fallback font names
  mainFontFilename: string;   // Main font filename
  mainFontSize: number;       // Main font size
  windowPadding: number;      // Window padding
  windowOpacity: number;      // Window opacity
}

/**
 * Type for the System.json data file
 * Target: data/System.json
 * Purpose: Represents the complete system data structure
 */
export type RPGMVSystemData = RPGMVSystem; 