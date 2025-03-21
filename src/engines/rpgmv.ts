import type { 
  GameEngine, 
  EngineFile, 
  EngineValidation, 
  TranslationTarget,
  TranslatedText
} from '@/types/engines/base'
import { useValidateFile } from '@/composables/useValidateFile'
import { join } from '@tauri-apps/api/path'
import * as actorHandler from './rpgmv/actors'
import { FileHandler, createStats, updateStats, getFileType } from './rpgmv/base'

export class RPGMakerMVEngine implements GameEngine {
  readonly name = 'RPG Maker MV'
  readonly version = '1.0.0'

  private readonly requiredFiles = [
    'www/data/Actors.json'
  ]

  private readonly validatePath = 'www/data'
  private readonly fs = useValidateFile()

  // Register file handlers
  private readonly handlers: FileHandler[] = [
    {
      type: 'actors',
      extractTranslations: actorHandler.extractTranslations,
      applyTranslations: actorHandler.applyTranslations
    }
  ]

  /**
   * Validates if a directory contains a valid RPG Maker MV project
   * Checks for required files and folder structure
   */
  async validateProject(path: string): Promise<EngineValidation> {
    const errors: string[] = []

    // Check if data folder exists
    const fullPath = await join(path, this.validatePath)
    const { data: dataFolderExists, error: folderError } = await this.fs.checkPathExists(fullPath)
    if (folderError) {
      errors.push(`Error checking data folder: ${folderError.message}`)
      return {
        isValid: false,
        requiredFiles: this.requiredFiles,
        errors
      }
    }

    if (!dataFolderExists) {
      errors.push('Data folder not found')
      return {
        isValid: false,
        requiredFiles: this.requiredFiles,
        errors
      }
    }

    // Check required files with proper path joining
    const { data: missingFiles, error: validationError } = await this.fs.validateRequiredFiles(path, this.requiredFiles)
    
    if (validationError) {
      errors.push(`Error validating files: ${validationError.message}`)
    } else if (missingFiles && missingFiles.length > 0) {
      errors.push(...missingFiles.map(file => `Required file not found: ${file}`))
    }

    return {
      isValid: errors.length === 0,
      requiredFiles: this.requiredFiles,
      errors
    }
  }

  /**
   * Reads all project files and returns their contents
   */
  async readProject(path: string): Promise<EngineFile[]> {
    const { data: files, error } = await this.fs.readJsonFiles(path, this.requiredFiles)
    
    if (error || !files) {
      throw new Error(`Error reading project files: ${error?.message || 'Unknown error'}`)
    }

    return files.map(file => ({
      path: file.path,
      type: file.path.split('/').pop()?.replace('.json', '') || '',
      content: file.content
    }))
  }

  /**
   * Extracts translatable content from all project files
   */
  extractTranslations(files: EngineFile[]): TranslationTarget[] {
    const translations: TranslationTarget[] = []

    for (const file of files) {
      const handler = this.handlers.find(h => h.type === getFileType(file))
      if (handler) {
        translations.push(...handler.extractTranslations(file))
      }
    }

    return translations
  }

  /**
   * Applies translations back to project files
   */
  applyTranslations(files: EngineFile[], translations: TranslatedText[]): EngineFile[] {
    const stats = createStats()

    const processedFiles = files.map(file => {
      const handler = this.handlers.find(h => h.type === getFileType(file))
      if (!handler) return file

      const fileTranslations = translations.filter(t => t.file === file.path)
      updateStats(stats, fileTranslations)
      
      return handler.applyTranslations(file, fileTranslations)
    })

    return processedFiles
  }
} 