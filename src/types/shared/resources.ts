/**
 * Game Resource Translation Type Definitions
 * 
 * @module types/shared/resources
 * @description Types for handling game resource translations.
 * This module defines interfaces and types for translating game-specific resources
 * such as dialogue, items, skills, and other in-game content.
 */

import type { 
  Translatable,
  TokenUsage,
  TranslationResult,
  TranslationService
} from '@/types/shared/core'

// ============================================================
// GAME RESOURCE TYPES
// ============================================================

/**
 * A game resource translation target
 * 
 * @interface ResourceTranslation
 * @description Represents a specific piece of game content that needs translation.
 * Includes file and resource metadata for content management.
 * 
 * @extends {Translatable}
 * @property {string} resourceId - Identifier for the specific resource
 * @property {string} field - The specific field within the resource being translated
 * @property {string} file - Path to the file containing the resource
 * @property {string} [section] - Section within the file (e.g., dialogue, menu)
 */
export interface ResourceTranslation extends Translatable {
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
 * @interface TranslatedResource
 * @description Extends ResourceTranslation with token usage data for cost tracking.
 * Used to monitor and optimize AI translation costs.
 * 
 * @extends {ResourceTranslation}
 * @property {TokenUsage} [tokens] - Token usage information from the translation
 */
export interface TranslatedResource extends ResourceTranslation {
  /** Token usage information from the translation */
  tokens?: TokenUsage
}

/**
 * Resource-specific translation result
 * 
 * @typedef {TranslationResult<ResourceTranslation>} ResourceTranslationResult
 * @description Type alias for translation results specific to game resources.
 * Contains the translated resources, statistics, and any errors encountered.
 */
export type ResourceTranslationResult = TranslationResult<ResourceTranslation>

/**
 * Resource-specific translation service
 * 
 * @typedef {TranslationService<ResourceTranslation>} ResourceTranslationService
 * @description Type alias for translation services that handle game resources.
 * Defines the contract for services that can translate game-specific content.
 */
export type ResourceTranslationService = TranslationService<ResourceTranslation>

// ============================================================
// BATCH OPERATION TYPES
// ============================================================

/**
 * Batch translation operation progress
 * 
 * @interface BatchProgress
 * @description Provides tracking information for ongoing batch operations.
 * Used to monitor progress, estimate completion time, and handle failures
 * during large-scale translation operations.
 * 
 * @property {number} total - Total number of resources to process
 * @property {number} completed - Number of resources processed so far
 * @property {number} failed - Number of resources that failed
 * @property {number} progressPercent - Estimated completion percentage (0-100)
 * @property {number} [estimatedTimeRemaining] - Estimated time remaining in milliseconds
 * @property {ResourceTranslation} [currentResource] - Currently processing resource
 */
export interface BatchProgress {
  /** Total number of resources to process */
  total: number
  
  /** Number of resources processed so far */
  completed: number
  
  /** Number of resources that failed */
  failed: number
  
  /** Estimated completion percentage (0-100) */
  progressPercent: number
  
  /** Estimated time remaining in milliseconds */
  estimatedTimeRemaining?: number
  
  /** Currently processing resource */
  currentResource?: ResourceTranslation
} 