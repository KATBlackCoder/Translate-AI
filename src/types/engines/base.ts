import type { ResourceTranslation } from '@/types/shared/translation'

/**
 * Supported game engine types
 */
export type EngineType = 'rpgmv' // | 'rpgmz' | 'renpy' | 'unity'

/**
 * Configuration for engine file paths and directories
 * 
 * @interface PathConfiguration
 * @property {string} rootDir - Root directory of the game project
 * @property {string} dataDir - Directory containing game data files
 * @property {string} [pluginsDir] - Optional directory for game plugins/extensions
 * @property {string} [assetsDir] - Optional directory for game assets (images, audio, etc)
 * @property {string} [scriptsDir] - Optional directory containing game scripts
 */
export interface PathConfiguration {
  rootDir: string
  dataDir: string
  pluginsDir?: string
  assetsDir?: string
  scriptsDir?: string
}

/**
 * Common settings for all game engines
 */
export interface EngineSettings {
  name: string
  version: string
  engineType: EngineType
  pathConfig: PathConfiguration
  encoding: string
  requiredFiles: string[]
  requiredPlugins?: string[]
  translatableFileTypes: string[]
}

/**
 * A file resource from a game that can be translated
 */
export interface GameResourceFile {
  dir: string                     // Directory containing the file
  path: string                    // Full path to the file
  fileType: string                // Single file type for this specific file
  content: unknown                // The actual file content
}

/**
 * Represents the validation result for a game engine project.
 */
export interface EngineValidation {
  isValid: boolean
  missingFiles: string[]         // Files that are required but missing
  missingPlugins?: string[]      // Plugins that are required but missing
  errors: string[]               // Validation error messages
  warnings?: string[]            // Non-critical issues
}

/**
 * Base interface for all game engine implementations.
 */
export interface GameEngine {
  /**
   * Engine settings including name and version
   */
  readonly settings: EngineSettings

  /**
   * Gets the engine name from settings
   */
  getEngineName(): string

  /**
   * Gets the engine version from settings
   */
  getEngineVersion(): string

  /**
   * Gets the file type from a path
   */
  getResourceFileType(filePath: string): string

  /**
   * Validates if a project folder is valid for this engine.
   * Checks for required files and project structure.
   * 
   * @param {string} path - The path to the project folder
   * @returns {Promise<EngineValidation>} The validation result
   */
  validateProject(path: string): Promise<EngineValidation>

  /**
   * Reads all translatable files from the project.
   * 
   * @param {string} path - The path to the project folder
   * @param {object} options - Optional reading options
   * @param {boolean} options.includeDependencies - Whether to analyze and include dependencies
   * @returns {Promise<GameResourceFile[]>} Array of files containing translatable content
   */
  readProject(path: string): Promise<GameResourceFile[]>

  /**
   * Extracts translatable content from files.
   * 
   * @param {GameResourceFile[]} files - Array of files to extract translations from
   * @param {object} options - Optional extraction options
   * @param {boolean} options.useRelatedContext - Whether to use related files for context
   * @returns {Promise<ResourceTranslation[]>} Array of translation targets
   */
  extractTranslations(
    files: GameResourceFile[]
  ): Promise<ResourceTranslation[]>

  /**
   * Applies translations back to the original files.
   * 
   * @param {GameResourceFile[]} files - Original files to update
   * @param {ResourceTranslation[]} translations - Array of translations to apply
   * @param {object} options - Optional application options
   * @param {boolean} options.updateRelatedFiles - Whether to update related files if needed
   * @returns {Promise<GameResourceFile[]>} Updated files with translations applied
   */
  applyTranslations(
    files: GameResourceFile[], 
    translations: ResourceTranslation[]
  ): Promise<GameResourceFile[]>
}