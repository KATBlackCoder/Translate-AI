import type { GameEngine, EngineFile, EngineValidation, TranslationTarget } from '@/types/engines/base'
import type { RPGMVActorData, RPGMVActor, RPGMVActorTranslatable } from '@/types/engines/rpgmv'
import { useValidateFile } from '@/composables/useValidateFile'

export class RPGMakerMVEngine implements GameEngine {
  readonly name = 'RPG Maker MV'
  readonly version = '1.0.0'

  private readonly requiredFiles = [
    'data/Actors.json'
  ]

  private readonly validatePath = '/www/data'
  private readonly fs = useValidateFile()

  private readonly translatableFields: Record<keyof RPGMVActorTranslatable, {
    field: string,
    context: string
  }> = {
    name: {
      field: 'name',
      context: 'ActorCharacter Name'
    },
    nickname: {
      field: 'nickname',
      context: 'ActorCharacter Title'
    },
    profile: {
      field: 'profile',
      context: 'ActorCharacter Bio'
    },
    note: {
      field: 'note',
      context: 'ActorCharacter Notes'
    }
  }

  /**
   * Validates if a directory contains a valid RPG Maker MV project
   * Checks for required files and folder structure
   */
  async validateProject(path: string): Promise<EngineValidation> {
    const errors: string[] = []

    // Check if data folder exists
    const { data: dataFolderExists, error: folderError } = await this.fs.checkPathExists(path + this.validatePath)
    
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

    // Check required files
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
      // Get the last part of the path for type checking
      const type = file.path.split('/').pop()?.split('.')[0].toLowerCase()
      switch (type) {
        case 'actors':
          translations.push(...this.extractActorTranslations(file))
          break
      }
    }

    return translations
  }

  /**
   * Extracts translatable content from Actors.json
   */
  private extractActorTranslations(file: EngineFile): TranslationTarget[] {
    const actors = file.content as RPGMVActorData
    const translations: TranslationTarget[] = []
    
    // Skip the first null element and process the rest
    for (let i = 1; i < actors.length; i++) {
      const actor = actors[i]
      if (!actor) continue // Skip null/undefined entries
      // Extract each translatable field
      (Object.keys(this.translatableFields) as Array<keyof RPGMVActorTranslatable>).forEach(key => {
        const value = actor[key]
        if (typeof value === 'string' && value !== '') {
          translations.push({
            key: `${actor.id}`,
            field: key,
            source: value,
            target: '',
            context: `${this.translatableFields[key].context}`,
            file: file.path
          })
        }
      })
    }
    
    return translations
  }

  /**
   * Applies translations back to project files
   */
  applyTranslations(files: EngineFile[], translations: TranslationTarget[]): EngineFile[] {
    return files.map(file => {
      // Get the last part of the path for type checking
      const type = file.path.split('/').pop()?.split('.')[0].toLowerCase()
      const fileTranslations = translations.filter(t => t.file === file.path)
      switch (type) {
        case 'actors':
          return this.applyActorTranslations(file, fileTranslations)
        default:
          return file
      }
    })
  }

  /**
   * Applies translations back to actor file
   */
  private applyActorTranslations(file: EngineFile, translations: TranslationTarget[]): EngineFile {
    const actors = file.content as RPGMVActorData
    const updatedActors = [...actors] as RPGMVActorData
    translations.forEach(translation => {
      const index = parseInt(translation.key)
      const field = translation.field as keyof RPGMVActorTranslatable
      
      if (index > 0 && updatedActors[index] && translation.target && field in this.translatableFields) {
        const updatedActor: RPGMVActor = {
          ...updatedActors[index]!,
          [field]: translation.target
        }
        updatedActors[index] = updatedActor
      }
    })

    return {
      ...file,
      content: updatedActors
    }
  }

} 