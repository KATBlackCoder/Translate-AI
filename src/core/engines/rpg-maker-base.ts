import type { GameResourceFile, EngineValidation } from '@/types/engines/base'
import type { ResourceTranslation } from '@/types/shared/translation'
import { BaseGameEngine } from './engine-base'
import { useValidateFile } from '@/composables/useValidateFile'
import { join } from '@tauri-apps/api/path'
import { getFileDirectory, getFileType } from '@/utils/ressource'

/**
 * Base class for all RPG Maker engines (MV, MZ, etc.).
 * Provides common functionality for handling RPG Maker game files and translations.
 */
export abstract class RPGMakerBaseEngine extends BaseGameEngine {
  protected readonly fs = useValidateFile()

  /**
   * Gets the list of required files for this RPG Maker engine.
   * These files must exist in the project for it to be considered valid.
   */
  protected abstract getRequiredFiles(): string[]

  /**
   * Validates if a directory contains a valid RPG Maker project.
   * Checks for required files and folder structure.
   */
  async validateProject(path: string): Promise<EngineValidation> {
    const errors: string[] = []
    const requiredFiles = this.getRequiredFiles()
    const missingFiles: string[] = []

    // Check if data folder exists
    const fullPath = await join(path, this.settings.pathConfig.dataDir)
    const { data: dataFolderExists, error: folderError } = await this.fs.checkPathExists(fullPath)
    
    if (folderError) {
      errors.push(`Error checking data folder: ${folderError.message}`)
      return {
        isValid: false,
        missingFiles: requiredFiles,
        errors
      }
    }

    if (!dataFolderExists) {
      errors.push('Data folder not found')
      return {
        isValid: false,
        missingFiles: requiredFiles,
        errors
      }
    }

    // Check required files with proper path joining
    const { data: foundMissingFiles, error: validationError } = 
      await this.fs.validateRequiredFiles(path, requiredFiles)
    
    if (validationError) {
      errors.push(`Error validating files: ${validationError.message}`)
    } else if (foundMissingFiles && foundMissingFiles.length > 0) {
      missingFiles.push(...foundMissingFiles)
      errors.push(...foundMissingFiles.map(file => `Required file not found: ${file}`))
    }

    return {
      isValid: errors.length === 0,
      missingFiles,
      errors
    }
  }

  /**
   * Reads all project files and returns their contents.
   */
  async readProject(path: string): Promise<GameResourceFile[]> {
    const requiredFiles = this.getRequiredFiles()
    const { data: files, error } = await this.fs.readJsonFiles(path, requiredFiles)
    
    if (error || !files) {
      throw new Error(`Error reading project files: ${error?.message || 'Unknown error'}`)
    }
    return files.map(file => ({
      dir: getFileDirectory(file.path),
      path: file.path,
      fileType: getFileType(file.path),
      content: file.content
    }))
  }

  /**
   * Extracts translatable content from all project files.
   */
  async extractTranslations(files: GameResourceFile[]): Promise<ResourceTranslation[]> {
    const translations: ResourceTranslation[] = []

    for (const file of files) {
      if (!this.shouldProcessFile(file)) continue
      
      const extractedTranslations = await this.extractFileTranslations(file)
      translations.push(...extractedTranslations)
    }
    return translations
  }

  /**
   * Extract translations from a single file.
   * To be implemented by specific engine implementations.
   */
  protected abstract extractFileTranslations(file: GameResourceFile): Promise<ResourceTranslation[]>;

  /**
   * Applies translations back to project files.
   */
  async applyTranslations(
    files: GameResourceFile[], 
    translations: ResourceTranslation[]
  ): Promise<GameResourceFile[]> {
    return Promise.all(files.map(async file => {
      if (!this.shouldProcessFile(file)) return file

      const fileTranslations = translations.filter(t => t.file === file.path)
      if (fileTranslations.length === 0) return file

      return await this.applyFileTranslations(file, fileTranslations)
    }))
  }

  /**
   * Apply translations to a single file.
   * To be implemented by specific engine implementations.
   */
  protected abstract applyFileTranslations(
    file: GameResourceFile, 
    translations: ResourceTranslation[]
  ): Promise<GameResourceFile>;
}