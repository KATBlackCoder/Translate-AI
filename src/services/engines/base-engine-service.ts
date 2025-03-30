// src/services/engines/base-engine-service.ts
import type { 
    EngineType, 
    EngineValidation, 
    GameResourceFile, 
    EngineSettings 
  } from '@/types/engines/base'
  import type { ResourceTranslation } from '@/types/shared/translation'
  import { useValidateFile } from '@/composables/useValidateFile'
  
  /**
   * Base service for engine operations.
   * Provides a unified interface for working with different game engines.
   */
  export abstract class BaseEngineService {
    protected readonly fileValidator = useValidateFile()
    
    /**
     * Engine settings including name, version, and configuration
     */
    abstract readonly settings: EngineSettings
    
    /**
     * Get the engine type identifier
     */
    getEngineType(): EngineType {
      return this.settings.engineType
    }
    
    /**
     * Get the display name of the engine
     */
    getEngineName(): string {
      return this.settings.name
    }
    
    /**
     * Get the engine version
     */
    getEngineVersion(): string {
      return this.settings.version
    }
    
    /**
     * Validate a project folder for this engine
     * Checks if required files are present
     */
    async validateProject(projectPath: string): Promise<EngineValidation> {
      const errors: string[] = []
      const requiredFiles = this.settings.requiredFiles
      
      try {
        // Verify the required files exist
        const result = await this.fileValidator.validateRequiredFiles(
          projectPath, 
          requiredFiles
        )
        
        if (!result.success) {
          return {
            isValid: false,
            errors: [result.error?.message || 'Failed to validate project files'],
            missingFiles: []
          }
        }
        
        const missingFiles = result.data || []
        
        // Check if any required files are missing
        if (missingFiles.length > 0) {
          errors.push(`Missing required files: ${missingFiles.join(', ')}`)
          return {
            isValid: false,
            errors,
            missingFiles
          }
        }
        
        // Perform engine-specific validation
        return await this.validateEngineSpecific(projectPath)
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        return {
          isValid: false,
          errors: [`Validation error: ${message}`],
          missingFiles: []
        }
      }
    }
    
    /**
     * Engine-specific validation logic
     * Can be overridden by subclasses to add additional validation
     */
    protected async validateEngineSpecific(projectPath: string): Promise<EngineValidation> {
      // Default implementation considers the project valid if all required files are present
      return {
        isValid: true,
        errors: [],
        missingFiles: []
      }
    }
    
    /**
     * Read project files from the specified path
     */
    async readProject(projectPath: string): Promise<GameResourceFile[]> {
      try {
        const result = await this.fileValidator.readJsonFiles(
          projectPath,
          this.settings.requiredFiles
        )
        
        if (!result.success || !result.data) {
          throw new Error(result.error?.message || 'Failed to read project files')
        }
        
        // Convert to GameResourceFile format
        return result.data.map(file => ({
          dir: this.getFileDirectory(file.path),
          path: file.path,
          fileType: this.getFileType(file.path),
          content: file.content
        }))
      } catch (error) {
        throw new Error(`Error reading project: ${error instanceof Error ? error.message : String(error)}`)
      }
    }
    
    /**
     * Extract translatable content from project files
     */
    async extractTranslations(files: GameResourceFile[]): Promise<ResourceTranslation[]> {
      const translations: ResourceTranslation[] = []
      
      for (const file of files) {
        if (this.shouldProcessFile(file)) {
          const fileTranslations = await this.extractFileTranslations(file)
          translations.push(...fileTranslations)
        }
      }
      
      return translations
    }
    
    /**
     * Extract translations from a specific file
     * To be implemented by concrete services
     */
    protected abstract extractFileTranslations(file: GameResourceFile): Promise<ResourceTranslation[]>
    
    /**
     * Apply translations back to project files
     */
    async applyTranslations(
      files: GameResourceFile[], 
      translations: ResourceTranslation[]
    ): Promise<GameResourceFile[]> {
      const updatedFiles = [...files]
      
      for (let i = 0; i < updatedFiles.length; i++) {
        const file = updatedFiles[i]
        
        if (this.shouldProcessFile(file)) {
          const fileTranslations = translations.filter(t => t.file === file.path)
          
          if (fileTranslations.length > 0) {
            updatedFiles[i] = await this.applyFileTranslations(file, fileTranslations)
          }
        }
      }
      
      return updatedFiles
    }
    
    /**
     * Apply translations to a specific file
     * To be implemented by concrete services
     */
    protected abstract applyFileTranslations(
      file: GameResourceFile, 
      translations: ResourceTranslation[]
    ): Promise<GameResourceFile>
    
    /**
     * Check if this engine can process the given project path
     * Used for engine detection
     */
    async matchesEngineSignature(projectPath: string): Promise<boolean> {
      try {
        // Check for required files that would identify this engine type
        const result = await this.fileValidator.validateRequiredFiles(
          projectPath, 
          this.getSignatureFiles()
        )
        
        if (!result.success) return false
        
        // If none of the signature files are missing, we have a match
        return (result.data?.length || 0) === 0
      } catch {
        return false
      }
    }
    
    /**
     * Get the files that uniquely identify this engine type
     * Used for engine detection
     */
    protected getSignatureFiles(): string[] {
      // Default implementation uses required files
      // Can be overridden by subclasses
      return this.settings.requiredFiles
    }
    
    /**
     * Check if a file should be processed based on settings
     */
    protected shouldProcessFile(file: GameResourceFile): boolean {
      // Basic validation
      if (!file.content) {
        return false
      }
      
      // Check if file type is supported
      if (!this.settings.translatableFileTypes.includes(file.fileType)) {
        return false
      }
      
      return true
    }
    
    /**
     * Get the directory part of a file path
     */
    protected getFileDirectory(path: string): string {
      const parts = path.split('/')
      return parts.length > 1 ? parts.slice(0, -1).join('/') : ''
    }
    
    /**
     * Get the file type from a path
     */
    protected getFileType(path: string): string {
      const fileName = path.split('/').pop() || ''
      const parts = fileName.split('.')
      return parts[0]
    }
  }