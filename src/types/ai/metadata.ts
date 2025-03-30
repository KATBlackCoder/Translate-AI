/**
 * AI Provider Metadata Types
 * 
 * This file contains types and interfaces for describing AI provider capabilities,
 * model presets, and other metadata. These types are used for UI display,
 * provider selection, and default configuration values.
 */

import type { ContentRating, PromptType } from '@/types/shared/translation'
import type { AIProviderType } from '@/types/ai/base'

// ============================================================
// MODEL METADATA
// ============================================================

/**
 * AI model preset metadata
 * 
 * Contains information about an AI model used for UI display
 * and setting appropriate defaults for the model.
 */
export interface AIModelPreset {
  /** Human-readable display name of the model */
  name: string
  
  /** Detailed description of the model's capabilities */
  description: string
  
  /** Recommended default temperature parameter for best results */
  defaultTemperature: number
  
  /** Recommended default token limit for outputs */
  defaultMaxTokens: number
  
  /** Languages this model can effectively handle (if limited) */
  supportedLanguages?: string[]
}

/**
 * Collection of AI model presets organized by provider and model ID
 * 
 * Used for populating UI dropdowns and retrieving appropriate
 * default settings for each model.
 */
export type AIModelPresets = Record<AIProviderType, Record<string, AIModelPreset>>

// ============================================================
// PROVIDER METADATA
// ============================================================

/**
 * Standard provider metadata
 * 
 * Contains basic information about an AI provider's capabilities
 * and limitations. Used for provider selection and UI display.
 */
export interface ProviderMetadata {
  /** Human-readable provider display name */
  name: string
  
  /** Provider implementation version */
  version: string
  
  /** Cost per token in USD (0 for free providers) */
  costPerToken: number
  
  /** Maximum number of translations to process in parallel */
  maxBatchSize: number
  
  /** Quality score for this provider (0-1) */
  qualityScore: number
  
  /** Whether this provider allows adult content */
  supportsAdultContent: boolean
  
  /** Content types supported by this provider */
  supportedPromptTypes: PromptType[]
  
  /** Languages supported by this provider */
  supportedLanguages: string[]
}

/**
 * Provider configuration template
 * 
 * Extended metadata that includes default configuration values
 * for a provider. Used for initializing new provider instances.
 */
export interface ProviderTemplate extends ProviderMetadata {
  /** Default model identifier for this provider */
  defaultModel: string
  
  /** Default temperature setting for this provider */
  defaultTemperature: number
  
  /** Default max tokens setting for this provider */
  defaultMaxTokens: number
  
  /** Default content rating this provider can handle */
  contentRating: ContentRating
  
  /** List of model IDs supported by this provider */
  supportedModels: string[]
  
  /** Default base URL for this provider's API */
  defaultBaseUrl: string
} 