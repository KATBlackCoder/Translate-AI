import type {
  ResourceTranslation,
  GameResourceFile,
  EngineValidation,
  GameEngine,
  EngineSettings,
  EngineType,
} from "@/types/engines";
import { useValidateFile } from "@/composables/useValidateFile";
/**
 * Base class for all game engines
 */
export abstract class BaseGameEngine implements GameEngine {
  protected readonly fileValidator = useValidateFile();

  abstract readonly settings: EngineSettings;

  /**
   * Gets the engine type from settings
   */
  getEngineType(): EngineType {
    return this.settings.engineType;
  }

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
   * Gets the resource file type from a path
   */
  getResourceFileType(filePath: string): string {
    return filePath.split("/").pop()?.split(".")[0].toLowerCase() || "";
  }

  /**
   * Gets the file type from a path
   */
  protected getFileType(path: string): string {
    const fileName = path.split("/").pop() || "";
    const parts = fileName.split(".");
    return parts[0];
  }

  /**
   * Gets the directory part of a file path
   */
  protected getFileDirectory(path: string): string {
    const parts = path.split("/");
    return parts.length > 1 ? parts.slice(0, -1).join("/") : "";
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
   * Get the files that uniquely identify this engine type
   * Used for engine detection
   */
  protected getSignatureFiles(): string[] {
    // Default implementation uses required files
    // Can be overridden by subclasses
    return this.settings.requiredFiles;
  }

  /**
   * Checks if a file should be processed based on settings
   */
  protected shouldProcessFile(file: GameResourceFile): boolean {
    if (!file.content) {
      return false;
    }

    if (!this.settings.translatableFileTypes.includes(file.fileType)) {
      return false;
    }

    return true;
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
  abstract extractTranslations(
    files: GameResourceFile[]
  ): Promise<ResourceTranslation[]>;

  /**
   * Applies translations back to files
   */
  abstract applyTranslations(
    files: GameResourceFile[],
    translations: ResourceTranslation[]
  ): Promise<GameResourceFile[]>;

  /**
   * Engine-specific validation logic
   * Can be overridden by subclasses to add additional validation
   */
  protected async validateEngineSpecific(
    projectPath: string
  ): Promise<EngineValidation> {
    // Default implementation considers the project valid if all required files are present
    return {
      isValid: true,
      errors: [],
      missingFiles: [],
    };
  }

  /**
   * Extracts translations from a specific file
   */
  protected abstract extractFileTranslations(
    file: GameResourceFile
  ): Promise<ResourceTranslation[]>;

  /**
   * Applies translations to a specific file
   */
  protected abstract applyFileTranslations(
    file: GameResourceFile,
    translations: ResourceTranslation[]
  ): Promise<GameResourceFile>;
}
