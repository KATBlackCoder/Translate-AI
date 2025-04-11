/**
 * AI-Specific Translation Type Definitions
 * 
 * @module types/shared/ai
 * @description Types for AI-powered translation.
 * This module defines interfaces and types for working with AI translation services,
 * including prompt management, translation requests, and service contracts.
 */

import type { 
  PromptType, 
  Translatable,
  TranslationResult,
  BatchOptions,
  BaseError
} from '@/types/shared/core'
import type { 
  ResourceTranslation
} from '@/types/shared/resources'
import type {
  LanguageCode
} from '@/types/shared/languages'

// ============================================================
// PROMPT TYPES
// ============================================================

/**
 * Prompt for AI translation
 * 
 * @interface TranslationPrompt
 * @description Structure for AI model prompts, containing both system and user instructions.
 * Used to guide the AI model's behavior during translation.
 * 
 * @property {string} system - System-level instructions for the AI model
 * @property {string} user - User-provided instructions or context
 */
export interface TranslationPrompt {
  /** System-level instructions for the AI model */
  system: string
  
  /** User-provided instructions or context */
  user: string
}

/**
 * Configuration for different content type prompts
 * 
 * @typedef {Record<PromptType, TranslationPrompt>} PromptConfig
 * @description Maps content types to their specific prompt configurations.
 * Allows for specialized prompting based on the type of content being translated.
 */
export type PromptConfig = Record<PromptType, TranslationPrompt>

// ============================================================
// AI-SPECIFIC TYPES
// ============================================================

/**
 * Translation request for AI providers
 * 
 * @interface TranslationRequest
 * @description Input parameters for a translation operation.
 * Contains all necessary information for an AI service to perform translation.
 * 
 * @property {string} text - Text to be translated
 * @property {LanguageCode} sourceLanguage - Source language code (ISO)
 * @property {LanguageCode} targetLanguage - Target language code (ISO)
 * @property {string} [context] - Optional context to improve translation accuracy
 * @property {PromptType} [contentType] - Optional type of content being translated
 */
export interface TranslationRequest {
  /** Text to be translated */
  text: string
  
  /** Source language code (ISO) */
  sourceLanguage: LanguageCode
  
  /** Target language code (ISO) */
  targetLanguage: LanguageCode
  
  /** Optional context to improve translation accuracy */
  context?: string
  
  /** Optional type of content being translated */
  contentType?: PromptType
}

/**
 * Text translation model
 * 
 * @interface TextTranslation
 * @description Represents a piece of text with an identifier for tracking.
 * Extends the base Translatable interface with an ID field.
 * 
 * @extends {Translatable}
 * @property {string} id - Unique identifier for the text
 */
export interface TextTranslation extends Translatable {
  id: string
}

/**
 * AI-specific translation result
 * 
 * @typedef {TranslationResult<TextTranslation>} TextTranslationResult
 * @description Type alias for translation results specific to text translations.
 * Contains the translated texts, statistics, and any errors encountered.
 */
export type TextTranslationResult = TranslationResult<TextTranslation>

/**
 * AI translation options
 * 
 * @interface AITranslationOptions
 * @description Extends TranslationRequest with batch operation options.
 * Combines translation parameters with batch processing configuration.
 * 
 * @extends {TranslationRequest}
 * @extends {BatchOptions}
 */
export interface AITranslationOptions extends TranslationRequest, BatchOptions {}

/**
 * AI-specific error
 * 
 * @interface AITranslationError
 * @description Error that occurs when using AI translation services.
 * Contains information about the AI provider and model that failed.
 * 
 * @extends {BaseError}
 * @property {string} provider - The AI service provider that failed (e.g., 'OpenAI', 'Google')
 * @property {string} [model] - The specific model that was used
 * @property {number} [statusCode] - HTTP status code returned by the API
 */
export interface AITranslationError extends BaseError {
  provider: string
  model?: string
  statusCode?: number
}

/**
 * AI translation service
 * 
 * @interface AITranslationService
 * @description Interface for AI-powered translation services.
 * Defines the contract that all AI translation providers must implement.
 * 
 * @property {Function} translateText - Method to translate individual text
 * @property {Function} translateResources - Method to translate game resources
 * @property {boolean} isReady - Whether the service is ready to perform translations
 */
export interface AITranslationService {
  /**
   * Translate individual text
   * 
   * @param {string} text - The text to translate
   * @param {AITranslationOptions} [options] - Optional translation parameters
   * @returns {Promise<string>} The translated text
   */
  translateText: (
    text: string, 
    options?: AITranslationOptions
  ) => Promise<string>
  
  /**
   * Translate game resources
   * 
   * @param {ResourceTranslation[]} resources - Array of resources to translate
   * @param {AITranslationOptions} [options] - Optional translation parameters
   * @returns {Promise<TranslationResult<ResourceTranslation>>} Translation results
   */
  translateResources: (
    resources: ResourceTranslation[],
    options?: AITranslationOptions
  ) => Promise<TranslationResult<ResourceTranslation>>
  
  /**
   * Whether the service is ready to perform translations
   * 
   * @property {boolean} isReady - Indicates if the service is initialized and ready
   */
  isReady: boolean
} 