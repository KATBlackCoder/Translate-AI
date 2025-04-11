/**
 * Engine-Specific Translation Interfaces
 * 
 * This file defines interfaces for engine-specific translation operations.
 * It extends the base ResourceTranslator interface with engine-specific functionality.
 */

import type { 
  ResourceTranslator,
  ResourceTranslation, 
  ResourceTranslationResult,
  BatchOptions,
  LanguagePair
} from '@/types/engines'

/**
 * Engine-specific resource translator
 * 
 * Extends the base ResourceTranslator with engine-specific translation capabilities.
 */
export interface EngineResourceTranslator extends ResourceTranslator {
  /**
   * Translates resources using the engine's specific translation approach
   * 
   * @param resources - Resources to translate
   * @param languagePair - Source and target language pair
   * @param options - Batch operation options
   * @returns Promise resolving to the translation result
   */
  translateResources(
    resources: ResourceTranslation[],
    languagePair: LanguagePair,
    options?: BatchOptions
  ): Promise<ResourceTranslationResult>
  
  /**
   * Validates if a resource can be translated by this engine
   * 
   * @param resource - Resource to validate
   * @returns True if the resource can be translated
   */
  canTranslateResource(resource: ResourceTranslation): boolean
  
  /**
   * Gets the file type for a resource
   * 
   * @param resource - Resource to get the file type for
   * @returns The file type for the resource
   */
  getResourceFileType(resource: ResourceTranslation): string
} 