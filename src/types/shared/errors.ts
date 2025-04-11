/**
 * Error Handling Type Definitions
 * 
 * @module types/shared/errors
 * @description Types for handling errors in the translation system.
 * This module defines specialized error interfaces for different translation contexts,
 * all extending from the BaseError interface in core.ts.
 */

import type { BaseError } from '@/types/shared/core'

// ============================================================
// ERROR TYPES
// ============================================================

/**
 * Base translation error
 * 
 * @interface TranslationError
 * @description The foundational error type for all translation-related errors.
 * Extends BaseError to provide consistent error handling across the application.
 * 
 * @extends {BaseError}
 */
export interface TranslationError extends BaseError {}

/**
 * Resource-specific translation error
 * 
 * @interface ResourceTranslationError
 * @description Error that occurs when translating game resources.
 * Contains specific information about which resource failed to translate.
 * 
 * @extends {TranslationError}
 * @property {string} resourceId - Unique identifier of the resource that failed
 * @property {string} field - The specific field within the resource that failed
 * @property {string} file - The file path where the resource is located
 * @property {string} [section] - Optional section within the resource file
 */
export interface ResourceTranslationError extends TranslationError {
  resourceId: string
  field: string
  file: string
  section?: string
}

/**
 * Text-specific translation error
 * 
 * @interface TextTranslationError
 * @description Error that occurs when translating plain text.
 * Contains the text that failed to translate for debugging purposes.
 * 
 * @extends {TranslationError}
 * @property {string} text - The text that failed to translate
 */
export interface TextTranslationError extends TranslationError {
  text: string
}

/**
 * AI-specific translation error
 * 
 * @interface AITranslationError
 * @description Error that occurs when using AI translation services.
 * Contains information about the AI provider and model that failed.
 * 
 * @extends {TranslationError}
 * @property {string} provider - The AI service provider that failed (e.g., 'OpenAI', 'Google')
 * @property {string} [model] - The specific model that was used
 * @property {number} [statusCode] - HTTP status code returned by the API
 */
export interface AITranslationError extends TranslationError {
  provider: string
  model?: string
  statusCode?: number
} 