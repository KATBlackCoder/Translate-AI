/**
 * Shared Translation Type Definitions
 * 
 * This file contains the core types and interfaces used throughout the translation system.
 * These types define the translation domain model and are used across various application
 * components including both AI and non-AI translation features.
 */

// ============================================================
// CORE ENUMS AND CONSTANTS
// ============================================================

/**
 * Content rating classification for translated content
 * 
 * Used to filter and tag content based on its appropriateness.
 * Affects prompt selection and content handling.
 */
export type ContentRating = 'sfw' | 'nsfw'

/**
 * Types of content requiring specialized translation approaches
 * 
 * Each type may use different prompts and translation strategies.
 * This helps optimize translations for specific content domains.
 */
export type PromptType = 'general' | 'dialogue' | 'menu' | 'items' | 'skills' | 'name' | 'nsfw'

// ============================================================
// TOKEN AND STATISTICS TYPES
// ============================================================

/**
 * Token usage statistics for billing and monitoring
 * 
 * Tracks token consumption for cost calculation and optimization.
 */
export interface TokenUsage {
  /** Tokens used in the prompt (input) */
  prompt: number
  
  /** Tokens generated in the completion (output) */
  completion: number
  
  /** Total tokens used (prompt + completion) */
  total: number
}

/**
 * Statistics for translation operations
 * 
 * Comprehensive metrics for tracking translation performance and costs.
 */
export interface TranslationStats {
  /** Total number of tokens processed */
  totalTokens: number;
  
  /** Total cost of the translation operation in USD */
  totalCost: number;
  
  /** Average confidence score across all translations (0-1) */
  averageConfidence?: number;
  
  /** Number of failed translation attempts */
  failedCount: number;
  
  /** Number of successful translations */
  successCount: number;
  
  /** Total time taken for the entire operation in milliseconds */
  totalProcessingTime?: number;
  
  /** Timestamp of the last translation operation */
  lastTranslationTime?: number;
}

/**
 * Metadata about the translation process
 * 
 * Additional information about how a translation was performed.
 */
export interface TranslationMeta {
  /** Time taken to process the translation in milliseconds */
  processingTime: number
  
  /** Quality assessment score (0-1) */
  qualityScore?: number
  
  /** Content rating classification */
  contentRating?: ContentRating
}

// ============================================================
// TEXT PAIR TYPES
// ============================================================

/**
 * Base interface for a translatable text pair
 * 
 * The fundamental unit of translation in the system.
 */
export interface BaseTextPair {
  /** Original text in source language */
  source: string
  
  /** Translated text in target language */
  target: string
  
  /** Optional context information to aid translation */
  context?: string
}

/**
 * A text pair with an identifier
 * 
 * Extends the base text pair with a unique identifier.
 */
export interface TextPair extends BaseTextPair {
  /** Unique identifier for the text pair */
  id: string
}

// ============================================================
// GAME RESOURCE TYPES
// ============================================================

/**
 * A game resource translation target
 * 
 * Represents a specific piece of game content that needs translation.
 * Includes file and resource metadata for content management.
 */
export interface ResourceTranslation extends BaseTextPair {
  /** Identifier for the specific resource */
  resourceId: string
  
  /** The specific field within the resource being translated */
  field: string
  
  /** Path to the file containing the resource */
  file: string
  
  /** Section within the file (e.g., dialogue, menu) */
  section?: string
}

/**
 * A translated game resource with token information
 * 
 * Extends ResourceTranslation with token usage data for cost tracking.
 */
export interface TranslatedResource extends ResourceTranslation {
  /** Token usage information from the translation */
  tokens?: TokenUsage
}

/**
 * Result of a game translation operation
 * 
 * Complete output from a game resource translation process.
 */
export interface ResourceTranslationResult {
  /** Array of completed resource translations */
  translations: ResourceTranslation[]
  
  /** Optional statistics about the translation operation */
  stats?: TranslationStats
  
  /** Optional array of error messages */
  errors?: string[]
}

// ============================================================
// AI TRANSLATION TYPES
// ============================================================

/**
 * Prompt for AI translation with system and user instructions
 * 
 * The template used to instruct the AI on how to perform a translation.
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
 * Maps content types to their corresponding prompts.
 */
export type PromptConfig = {
  /** Prompt configuration for each content type */
  [key in PromptType]: TranslationPrompt
}

/**
 * Request for AI translation
 * 
 * Input parameters for a translation operation.
 */
export interface TranslationRequest {
  /** Text to be translated */
  text: string
  
  /** Source language code (ISO) */
  sourceLanguage: string
  
  /** Target language code (ISO) */
  targetLanguage: string
  
  /** Optional context to improve translation accuracy */
  context?: string
  
  /** Optional type of content being translated */
  contentType?: PromptType
}

/**
 * Response from AI translation
 * 
 * Output data from a translation operation.
 */
export interface TranslationResponse {
  /** The translated text */
  translatedText: string
  
  /** Confidence score of the translation (0-1) */
  confidence?: number
  
  /** Token usage information */
  tokens?: TokenUsage
  
  /** Cost of the translation in USD */
  cost?: number
  
  /** Metadata about the translation process */
  meta?: TranslationMeta
}

/**
 * Result of a batch translation operation
 * 
 * Complete output from a batch translation process.
 */
export interface BatchTranslationResult {
  /** Array of completed text pair translations */
  translations: TextPair[]
  
  /** Statistics about the batch operation */
  stats: TranslationStats
  
  /** Optional array of errors encountered during translation */
  errors?: Array<{
    /** The text that failed to translate */
    text: string
    
    /** The error message */
    error: string
    
    /** Number of retry attempts made */
    retryCount?: number
  }>
}

// ============================================================
// BATCH TRANSLATION SERVICE TYPES
// ============================================================

/**
 * Translation service interface for batch operations
 * 
 * Defines the minimal contract for services that can perform batch translations.
 * Used for dependency injection in components and composables.
 */
export interface BatchTranslationService {
  /** Method to translate a batch of texts */
  translateBatch: (
    texts: ResourceTranslation[],
    contentType: PromptType
  ) => Promise<BatchTranslationResult>;
  
  /** Indicates if the service is ready to perform translations */
  isReady: boolean;
}

/**
 * Configuration options for batch translation operations
 * 
 * Used to configure batch translation services and composables.
 */
export interface BatchTranslationOptions {
  /** The translation service to use, can be a direct reference or a factory function */
  translationService: BatchTranslationService | (() => BatchTranslationService);
  
  /** Optional number of texts to process in a single batch */
  batchSize?: number;
  
  /** Optional number of retry attempts for failed translations */
  retryCount?: number;
  
  /** Optional timeout in milliseconds for each batch */
  timeout?: number;
}
