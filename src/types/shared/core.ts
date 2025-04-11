/**
 * Core Translation Type Definitions
 * 
 * @module types/shared/core
 * @description Fundamental types for the translation system.
 * This module contains the base types and interfaces used throughout the application
 * for handling translations, errors, and service operations.
 */

// ============================================================
// CORE TYPES
// ============================================================

/**
 * Types of content requiring specialized translation
 * 
 * @typedef {('dialogue' | 'menu' | 'items' | 'skills' | 'name')} PromptType
 * @description Enum-like type representing different categories of game content
 * that may require specialized translation approaches.
 * 
 * - 'dialogue': Character conversations and narrative text
 * - 'menu': UI elements, buttons, and navigation text
 * - 'items': In-game items, equipment, and consumables
 * - 'skills': Abilities, spells, and combat-related text
 * - 'name': Character names, locations, and proper nouns
 */
export type PromptType = 'dialogue' | 'menu' | 'items' | 'skills' | 'name'

/**
 * Base interface for translatable content
 * 
 * @interface Translatable
 * @description Represents any piece of text that can be translated.
 * This is the foundation for all translatable content in the application.
 * 
 * @property {string} source - The original text to be translated
 * @property {string} target - The translated text (empty before translation)
 * @property {string} [context] - Optional context to help with accurate translation
 * @property {PromptType} [promptType] - Optional content type for specialized translation
 */
export interface Translatable {
  source: string
  target: string
  context?: string
  promptType?: PromptType
}

/**
 * Token usage statistics
 * 
 * @interface TokenUsage
 * @description Tracks token consumption for AI translation operations.
 * Tokens are the basic units of text processed by language models.
 * 
 * @property {number} prompt - Number of tokens used in the prompt
 * @property {number} completion - Number of tokens used in the generated response
 * @property {number} total - Total tokens used (prompt + completion)
 */
export interface TokenUsage {
  prompt: number
  completion: number
  total: number
}

/**
 * Translation statistics
 * 
 * @interface TranslationStats
 * @description Comprehensive statistics for translation operations.
 * Used for tracking performance, costs, and success rates.
 * 
 * @property {number} totalTokens - Total tokens consumed across all translations
 * @property {number} totalCost - Estimated cost in currency units (e.g., USD)
 * @property {number} [averageConfidence] - Average confidence score of translations (0-1)
 * @property {number} failedCount - Number of failed translation attempts
 * @property {number} successCount - Number of successful translations
 * @property {number} [totalProcessingTime] - Total time spent processing in milliseconds
 * @property {number} [lastTranslationTime] - Timestamp of the most recent translation
 */
export interface TranslationStats {
  totalTokens: number
  totalCost: number
  averageConfidence?: number
  failedCount: number
  successCount: number
  totalProcessingTime?: number
  lastTranslationTime?: number
}

/**
 * Translation metadata
 * 
 * @interface TranslationMeta
 * @description Additional information about a translation operation.
 * Provides context and quality metrics for individual translations.
 * 
 * @property {number} processingTime - Time taken to process the translation in milliseconds
 * @property {number} [qualityScore] - Optional quality assessment score (0-1)
 */
export interface TranslationMeta {
  processingTime: number
  qualityScore?: number
}

/**
 * Batch operation options
 * 
 * @interface BatchOptions
 * @description Configuration options for batch translation operations.
 * Controls how multiple translations are processed and handled.
 * 
 * @property {number} [batchSize] - Number of items to process in each batch
 * @property {number} [retryCount] - Maximum number of retry attempts for failed items
 * @property {number} [timeout] - Maximum time to wait for each batch in milliseconds
 * @property {boolean} [continueOnError] - Whether to continue processing if errors occur
 */
export interface BatchOptions {
  batchSize?: number
  retryCount?: number
  timeout?: number
  continueOnError?: boolean
}

/**
 * Base error interface
 * 
 * @interface BaseError
 * @description Standardized error representation for the translation system.
 * Provides consistent error handling across different components.
 * 
 * @property {string} error - Error message describing what went wrong
 * @property {number} [retryCount] - Number of retry attempts made so far
 */
export interface BaseError {
  error: string
  retryCount?: number
}

/**
 * Translation result
 * 
 * @interface TranslationResult
 * @description Complete result of a translation operation.
 * Contains the translations, statistics, and any errors encountered.
 * 
 * @template T - Type parameter extending Translatable
 * @property {T[]} translations - Array of translated items
 * @property {TranslationStats} stats - Statistics about the translation operation
 * @property {BaseError[]} [errors] - Optional array of errors encountered
 */
export interface TranslationResult<T> {
  translations: T[]
  stats: TranslationStats
  errors?: BaseError[]
}

/**
 * Translation service
 * 
 * @interface TranslationService
 * @description Interface for services that can perform translations.
 * Defines the contract that all translation providers must implement.
 * 
 * @template T - Type parameter extending Translatable
 * @property {Function} translateBatch - Method to translate multiple items
 * @property {boolean} isReady - Whether the service is ready to accept translations
 */
export interface TranslationService<T extends Translatable> {
  translateBatch: (
    items: T[],
    options?: BatchOptions
  ) => Promise<TranslationResult<T>>
  isReady: boolean
} 