// src/types/shared/translation.ts

// ------- BASE TRANSLATION TYPES ----------

/**
 * Base interface for a translatable text pair
 * @property id - Unique identifier for the text pair
 * @property source - Original text in source language
 * @property target - Translated text in target language
 * @property context - Optional context information to aid translation
 */
export interface TextPair {
  id: string
  source: string
  target: string
  context?: string
}

/**
 * Metadata about the translation process
 * @property processingTime - Time taken to process the translation in milliseconds
 * @property qualityScore - Optional quality assessment score
 * @property contentRating - Optional content rating classification
 */
export interface TranslationMeta {
  processingTime: number
  qualityScore?: number
  contentRating?: 'general' | 'teen' | 'mature' | 'adult'
}

/**
 * Statistics for translation operations
 * @property totalTokens - Total number of tokens processed
 * @property totalCost - Total cost of the translation operation
 * @property averageConfidence - Average confidence score across all translations
 * @property failedCount - Number of failed translation attempts
 * @property successCount - Number of successful translations
 * @property totalProcessingTime - Total time taken for the entire operation
 */
export interface TranslationStats {
  totalTokens: number
  totalCost: number
  averageConfidence: number
  failedCount: number
  successCount: number
  totalProcessingTime: number
}

// ------- GAME TRANSLATION TYPES ----------

/**
 * A game resource translation target
 * @extends TextPair
 * @property field - The specific field within the resource being translated
 * @property file - Path to the file containing the resource
 * @property resourceId - Optional identifier for the specific resource
 * @property section - Optional section within the file
 */
export interface ResourceTranslation extends TextPair {
  field: string
  file: string
  resourceId?: string
  section?: string
}

/**
 * Result of a game translation operation
 * @property translations - Array of completed resource translations
 * @property stats - Optional statistics about the translation operation
 * @property errors - Optional array of error messages
 */
export interface ResourceTranslationResult {
  translations: ResourceTranslation[]
  stats?: TranslationStats
  errors?: string[]
}

// ------- AI TRANSLATION TYPES ----------

/**
 * Types of prompts for different content
 * Specifies the category of content being translated to optimize the translation process
 */
export type ContentType = 'general' | 'dialogue' | 'menu' | 'items' | 'skills' | 'name' | 'adult'

/**
 * Prompt for AI translation with system and user instructions
 * @property system - System-level instructions for the AI model
 * @property user - User-provided instructions or context
 */
export interface TranslationPrompt {
  system: string
  user: string
}

/**
 * Configuration for different content type prompts
 * @property general - Prompt configuration for general content
 * @property dialogue - Prompt configuration for dialogue content
 * @property menu - Prompt configuration for menu items
 * @property items - Prompt configuration for game items
 * @property skills - Prompt configuration for character skills
 * @property name - Prompt configuration for character/location names
 * @property adult - Prompt configuration for adult content
 */
export interface PromptConfig {
  general: TranslationPrompt
  dialogue: TranslationPrompt
  menu: TranslationPrompt
  items: TranslationPrompt
  skills: TranslationPrompt
  name: TranslationPrompt
  adult: TranslationPrompt
}

/**
 * Request for AI translation
 * @property text - Text to be translated
 * @property sourceLanguage - Source language code
 * @property targetLanguage - Target language code
 * @property context - Optional context to improve translation accuracy
 * @property contentType - Optional type of content being translated
 */
export interface TranslationRequest {
  text: string
  sourceLanguage: string
  targetLanguage: string
  context?: string
  contentType?: ContentType
}

/**
 * Response from AI translation
 * @property translatedText - The translated text
 * @property confidence - Optional confidence score of the translation
 * @property tokens - Optional token usage information
 * @property cost - Optional cost of the translation
 * @property meta - Optional metadata about the translation process
 */
export interface TranslationResponse {
  translatedText: string
  confidence?: number
  tokens?: {
    prompt: number
    completion: number
    total: number
  }
  cost?: number
  meta?: TranslationMeta
}

/**
 * Result of a batch translation operation
 * @property translations - Array of completed text pair translations
 * @property stats - Statistics about the batch operation
 * @property errors - Optional array of errors encountered during translation
 */
export interface BatchTranslationResult {
  translations: TextPair[]
  stats: TranslationStats
  errors?: Array<{
    text: string
    error: string
    retryCount?: number
  }>
}