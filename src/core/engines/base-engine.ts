import type { 
  GameResourceFile, 
  EngineValidation, 
  GameEngine,
  EngineSettings
} from '@/types/engines/base'
import type { ResourceTranslation } from '@/types/shared/translation'

/**
 * Base class for all game engines
 */
export abstract class BaseGameEngine implements GameEngine {
  abstract readonly settings: EngineSettings

  /**
   * Gets the engine name from settings
   */
  getEngineName(): string {
    return this.settings.name;
  }

  /**
   * Gets the engine version from settings
   */
  getEngineVersion(): string {
    return this.settings.version;
  }

  /**
   * Gets the file type from a path
   */
  getResourceFileType(filePath: string): string {
    return filePath.split('/').pop()?.split('.')[0].toLowerCase() || '';
  }

  /**
   * Gets the full path for a file relative to the data directory
   */
  protected getPath(relativePath: string): string {
    return `${this.settings.pathConfig.dataDir}/${relativePath}`;
  }
  
  /**
   * Gets the file encoding based on settings
   */
  protected getEncoding(): string {
    return this.settings.encoding;
  }

  /**
   * Validates if a directory contains a valid project
   */
  abstract validateProject(path: string): Promise<EngineValidation>;

  /**
   * Reads all project files
   */
  abstract readProject(path: string): Promise<GameResourceFile[]>;

  /**
   * Extracts translatable content
   */
  abstract extractTranslations(files: GameResourceFile[]): Promise<ResourceTranslation[]>;

  /**
   * Applies translations back to files
   */
  abstract applyTranslations(
    files: GameResourceFile[], 
    translations: ResourceTranslation[]
  ): Promise<GameResourceFile[]>;

  /**
   * Checks if a file should be processed based on settings
   */
  protected shouldProcessFile(file: GameResourceFile): boolean {
    // Basic validation
    if (!file.content) {
      return false;
    }
    
    // Check if file type is supported
    if (!this.settings.translatableFileTypes.includes(file.fileType)) {
      return false;
    }
    
    return true;
  }
}