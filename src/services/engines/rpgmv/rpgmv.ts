import type { GameResourceFile, EngineSettings } from '@/types/engines/base'
import type { ResourceTranslation } from '@/types/shared/translation'
import { RPGMakerBaseEngine } from '@/core/engines/rpg-maker-base'
import * as actorHandler from './data/actors'

/**
 * Implementation of the RPG Maker MV engine.
 * Handles translation of RPG Maker MV game files.
 * 
 * @class RPGMakerMVEngine
 * @extends {RPGMakerBaseEngine}
 */
export class RPGMakerMVEngine extends RPGMakerBaseEngine {
  /**
   * Engine settings for RPG Maker MV
   */
  readonly settings: EngineSettings = {
    name: 'RPG Maker MV',
    version: '1.0.0',
    engineType: 'rpgmv',
    pathConfig: {
      rootDir: '',
      dataDir: 'www/data',
      pluginsDir: 'js/plugins',
      assetsDir: 'img',
      scriptsDir: 'js'
    },
    encoding: 'utf8',
    requiredFiles: ['www/data/Actors.json'],
    translatableFileTypes: ['actors']
  }

  /**
   * Gets the list of required files for RPG Maker MV.
   * These files must exist in the project for it to be considered valid.
   * 
   * @protected
   * @returns {string[]} Array of required file paths
   */
  protected getRequiredFiles(): string[] {
    return this.settings.requiredFiles
  }

  /**
   * Extracts translations from a single file
   * 
   * @param file The file to extract translations from
   * @returns Array of translations
   */
  protected async extractFileTranslations(file: GameResourceFile): Promise<ResourceTranslation[]> {
    switch (file.fileType) {
      case 'Actors':
        return actorHandler.extractTranslations(file)
      default:
        return []
    }
  }

  /**
   * Applies translations to a single file
   * 
   * @param file The file to apply translations to
   * @param translations The translations to apply
   * @returns Updated file with translations applied
   */
  protected async applyFileTranslations(
    file: GameResourceFile,
    translations: ResourceTranslation[]
  ): Promise<GameResourceFile> {
    switch (file.fileType) {
      case 'Actors':
        return actorHandler.applyTranslations(file, translations)
      default:
        return file
    }
  }

  /**
   * Extracts translatable content from all project files.
   * Uses appropriate handlers for each file type.
   * 
   * @param {GameResourceFile[]} files - Array of game resource files to process
   * @returns {Promise<ResourceTranslation[]>} Array of translation targets
   */
  async extractTranslations(files: GameResourceFile[]): Promise<ResourceTranslation[]> {
    return super.extractTranslations(files)
  }

  /**
   * Applies translations back to project files.
   * Uses appropriate handlers for each file type and tracks translation statistics.
   * 
   * @param {GameResourceFile[]} files - Array of game resource files to update
   * @param {ResourceTranslation[]} translations - Array of translations to apply
   * @returns {Promise<GameResourceFile[]>} Updated game resource files with translations applied
   */
  async applyTranslations(
    files: GameResourceFile[],
    translations: ResourceTranslation[]
  ): Promise<GameResourceFile[]> {
    return super.applyTranslations(files, translations)
  }
} 