// src/services/engines/rpgmv/rpgmv-engine-service.ts
import { BaseEngineService } from '../base-engine-service'
import type { 
  EngineValidation, 
  GameResourceFile, 
  EngineSettings 
} from '@/types/engines/base'
import type { ResourceTranslation } from '@/types/shared/translation'
import { join } from '@tauri-apps/api/path'

// Reuse actor handlers
import * as actorHandler from './data/actors'

/**
 * Service implementation for RPG Maker MV engine
 * Focuses on actor translations for the initial implementation
 */
export class RPGMVEngineService extends BaseEngineService {
  /**
   * Engine settings for RPG Maker MV
   */
  readonly settings: EngineSettings = {
    name: 'RPG Maker MV',
    version: '1.6.2',
    engineType: 'rpgmv',
    pathConfig: {
      rootDir: '',
      dataDir: 'www/data',
      pluginsDir: 'js/plugins',
      assetsDir: 'img',
      scriptsDir: 'js'
    },
    encoding: 'utf8',
    requiredFiles: [
      'www/data/Actors.json',
      'www/data/System.json',
      'www/js/rpg_core.js'
    ],
    translatableFileTypes: [
      'Actors'
    ]
  }
  
  /**
   * Get signature files for engine detection
   * We only need system.json to identify RPG Maker MV
   */
  protected getSignatureFiles(): string[] {
    return ['www/js/rpg_core.js']
  }
  
/**
 * Additional validation for RPG Maker MV projects
 */
  protected async validateEngineSpecific(projectPath: string): Promise<EngineValidation> {
    try {
    // Check for rpg_core.js to confirm it's a valid RPG Maker MV project
    const corePath = await join(projectPath, 'www/js/rpg_core.js')
    const coreExists = await this.fileValidator.checkPathExists(corePath)
    
    if (!coreExists.success || !coreExists.data) {
      return {
        isValid: false,
        errors: ['Missing RPG Maker MV core engine file (rpg_core.js)'],
        missingFiles: ['www/js/rpg_core.js']
      }
    }
    
    // Still check System.json structure for game data validation
    const systemPath = await join(projectPath, 'www/data/System.json')
    const result = await this.fileValidator.readJsonFile(systemPath)
    
    if (!result.success || !result.data) {
      return {
        isValid: false,
        errors: ['Invalid System.json file'],
        missingFiles: []
      }
    }
    
    // Verify System.json has expected structure
    const system = result.data
    if (!system.gameTitle) {
      return {
        isValid: false,
        errors: ['System.json is not a valid RPG Maker MV file'],
        missingFiles: []
      }
    }
    
    return {
      isValid: true,
      errors: [],
      missingFiles: []
    }
  } catch (error) {
    return {
      isValid: false,
      errors: [`RPG Maker MV validation error: ${error instanceof Error ? error.message : String(error)}`],
      missingFiles: []
    }
  }
}
  
  /**
   * Extract translations from a file
   * Delegates to specific handlers based on file type
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
   * Apply translations to a file
   * Delegates to specific handlers based on file type
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
   * Read project files
   * Override to only read required files for the focused implementation
   */
  async readProject(projectPath: string): Promise<GameResourceFile[]> {
    try {
      // For our focused implementation, we only care about Actors.json
      const actorsPath = await join(projectPath, 'www/data/Actors.json')
      const result = await this.fileValidator.readJsonFile(actorsPath)
      
      if (!result.success || !result.data) {
        throw new Error(result.error?.message || 'Failed to read Actors.json')
      }
      
      // Return just the actors file for now
      return [{
        dir: 'www/data',
        path: 'www/data/Actors.json',
        fileType: 'Actors',
        content: result.data
      }]
    } catch (error) {
      throw new Error(`Error reading RPG Maker MV project: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
}