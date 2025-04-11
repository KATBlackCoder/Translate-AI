// src/services/engines/base-engine-service.ts
import type {
  EngineValidation,
  GameResourceFile,
  ResourceTranslation,
} from "@/types/engines";
import { BaseGameEngine } from "@/core/engines/base-engine";

/**
 * Base service for engine operations.
 * Provides a unified interface for working with different game engines.
 */
export abstract class BaseEngineService extends BaseGameEngine {
  /**
   * Validate a project folder for this engine
   * Checks if required files are present
   */
  async validateProject(projectPath: string): Promise<EngineValidation> {
    const errors: string[] = [];
    const requiredFiles = this.settings.requiredFiles;

    try {
      // Verify the required files exist
      const result = await this.fileValidator.validateRequiredFiles(
        projectPath,
        requiredFiles
      );

      if (!result.success) {
        return {
          isValid: false,
          errors: [result.error?.message || "Failed to validate project files"],
          missingFiles: [],
        };
      }

      const missingFiles = result.data || [];

      // Check if any required files are missing
      if (missingFiles.length > 0) {
        errors.push(`Missing required files: ${missingFiles.join(", ")}`);
        return {
          isValid: false,
          errors,
          missingFiles,
        };
      }

      // Perform engine-specific validation
      return await this.validateEngineSpecific(projectPath);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        isValid: false,
        errors: [`Validation error: ${message}`],
        missingFiles: [],
      };
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
      );

      if (!result.success || !result.data) {
        throw new Error(
          result.error?.message || "Failed to read project files"
        );
      }

      // Convert to GameResourceFile format
      return result.data.map((file) => ({
        dir: this.getFileDirectory(file.path),
        path: file.path,
        fileType: this.getFileType(file.path),
        content: file.content,
      }));
    } catch (error) {
      throw new Error(
        `Error reading project: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * Extract translatable content from project files
   */
  async extractTranslations(
    files: GameResourceFile[]
  ): Promise<ResourceTranslation[]> {
    const translations: ResourceTranslation[] = [];

    for (const file of files) {
      if (this.shouldProcessFile(file)) {
        const fileTranslations = await this.extractFileTranslations(file);
        translations.push(...fileTranslations);
      }
    }

    return translations;
  }

  /**
   * Apply translations back to project files
   */
  async applyTranslations(
    files: GameResourceFile[],
    translations: ResourceTranslation[]
  ): Promise<GameResourceFile[]> {
    const updatedFiles = [...files];

    for (let i = 0; i < updatedFiles.length; i++) {
      const file = updatedFiles[i];

      if (this.shouldProcessFile(file)) {
        const fileTranslations = translations.filter(
          (t) => t.file === file.path
        );

        if (fileTranslations.length > 0) {
          updatedFiles[i] = await this.applyFileTranslations(
            file,
            fileTranslations
          );
        }
      }
    }

    return updatedFiles;
  }

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
      );

      if (!result.success) return false;

      // If none of the signature files are missing, we have a match
      return (result.data?.length || 0) === 0;
    } catch {
      return false;
    }
  }
}
