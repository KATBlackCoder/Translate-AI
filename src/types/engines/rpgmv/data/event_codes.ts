/**
 * Event command codes in RPG Maker MV that contain translatable text
 * Target: Used in Map events, Common events, and Troop events
 * Purpose: Identifies which event commands need translation
 */
export enum RPGMVEventCode {
  // Common Elements (Used across multiple event types)
  // Text and Display
  ShowText = 101,
  ShowChoices = 102,
  InputNumber = 103,
  SelectItem = 104,
  ShowScrollingText = 105,
  ChangeTextOptions = 401,

  // Character/Name Changes
  ChangeName = 303,
  ChangeClass = 304,
  ChangeNickname = 324,
  ChangeProfile = 325,

  // Picture and Animation
  ShowPicture = 231,
  MovePicture = 232,
  RotatePicture = 233,
  TintPicture = 234,
  ErasePicture = 235,
  ShowAnimation = 241,
  ShowBalloonIcon = 245,
  EraseEvent = 246,

  // System Settings
  ChangeMapNameDisplay = 117,
  ChangeTileset = 282,
  ChangeWindowColor = 138,

  // Audio
  ChangeBattleBGM = 132,
  ChangeVictoryME = 133,
  ChangeVehicleBGM = 132,

  // Access Control
  ChangeSaveAccess = 134,
  ChangeMenuAccess = 135,
  ChangeEncounter = 136,
  ChangeFormationAccess = 137,

  // Map-Specific Elements
  // Location and Movement
  TransferPlayer = 201,
  SetVehicleLocation = 202,
  SetEventLocation = 203,
  ScrollMap = 204,
  SetMovementRoute = 205,
  GetOnOffVehicle = 206,
  ChangeTransparency = 211,

  // Battle-Specific Elements
  // Enemy Management
  ChangeEnemyHP = 331,
  ChangeEnemyMP = 332,
  ChangeEnemyTP = 342,
  ChangeEnemyState = 333,
  EnemyRecoverAll = 334,
  EnemyAppear = 335,
  EnemyTransform = 336,
  ShowBattleAnimation = 337,
  ForceAction = 339,

  // Processing Commands
  BattleProcessing = 301,
  ShopProcessing = 302,
  NameInputProcessing = 303,

  // Screen Management
  OpenMenuScreen = 351,
  OpenSaveScreen = 352,
  GameOver = 353,
  ReturnToTitleScreen = 354,

  // Script
  Script = 355
}

/**
 * Helper function to check if an event code contains translatable text
 * @param code The event command code to check
 * @returns Whether the code contains translatable text
 */
export function isTranslatableEventCode(code: number): boolean {
  return code in RPGMVEventCode; //Object.values(RPGMVEventCode).includes(code as RPGMVEventCode);
}

/**
 * Helper function to get the category of an event code
 * @param code The event command code to check
 * @returns The category of the event code
 */
export function getEventCodeCategory(code: RPGMVEventCode): string {
  if (code >= 101 && code <= 105) return 'Text and Display';
  if (code === 401) return 'Text and Display';
  if (code >= 303 && code <= 325) return 'Character/Name Changes';
  if (code >= 231 && code <= 246) return 'Picture and Animation';
  if (code === 117 || code === 282 || code === 138) return 'System Settings';
  if (code === 132 || code === 133) return 'Audio';
  if (code >= 134 && code <= 137) return 'Access Control';
  if (code >= 201 && code <= 211) return 'Location and Movement';
  if (code >= 331 && code <= 339) return 'Enemy Management';
  if (code >= 301 && code <= 303) return 'Processing Commands';
  if (code >= 351 && code <= 354) return 'Screen Management';
  if (code === 355) return 'Script';
  return 'Unknown';
} 