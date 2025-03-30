/**
 * Core AI System Type Definitions
 * 
 * This file contains the fundamental types and interfaces that form the base
 * of the AI translation system. These are the essential building blocks that
 * all other AI-related types depend on.
 */

import type { ContentRating } from '@/types/shared/translation'

// ============================================================
// PROVIDER TYPES
// ============================================================

/**
 * Supported AI provider types in the application
 * 
 * Add new provider types here when implementing new integrations.
 * This is the central definition of supported providers used throughout the system.
 */
export type AIProviderType = 
  | 'chatgpt'  // OpenAI's GPT models
  | 'ollama'   // Local Ollama models
  | 'deepseek' // DeepSeek cloud models

// ============================================================
// CONFIGURATION TYPES
// ============================================================

/**
 * Essential configuration required by all AI providers
 * 
 * This represents the core settings that every AI provider implementation
 * must have to function properly. Different providers may use these settings
 * in different ways, but all providers must support these basic configurations.
 */
export interface AIBaseConfig {
  /** The specific model identifier to use (e.g., "gpt-3.5-turbo", "llama2") */
  model: string
  
  /** Base URL for the API endpoint */
  baseUrl: string
  
  /** API key for authentication (required for commercial providers like ChatGPT) */
  apiKey?: string
  
  /** 
   * Model temperature (randomness) setting 
   * Higher values (0.7-1.0) make output more random
   * Lower values (0.0-0.3) make output more deterministic
   */
  temperature: number
  
  /** Maximum tokens to generate in the response */
  maxTokens: number
  
  /** Content rating classification (sfw/nsfw) */
  contentRating: ContentRating
}

// ============================================================
// ERROR MESSAGE TYPES
// ============================================================

/**
 * Error message templates for API connections
 * 
 * Standardized error messages for different connection scenarios.
 * These are used to provide consistent error reporting across providers.
 */
export interface AIErrorMessages {
  /** Error message when connection to the provider fails */
  connectionFailed: string
  
  /** Error message when the API endpoint is not found */
  apiNotFound: string
  
  /** Error message for authentication failures */
  authFailed?: string
  
  /** Error message for rate limiting */
  rateLimit?: string
  
  /** Default/fallback error message */
  default: string
}

/**
 * Error message templates for specific models
 * 
 * Provides model-specific error messages, useful for when certain
 * models have unique requirements or limitations.
 */
export interface AIModelErrorMessages {
  /** Default error message for unknown models */
  default: string
  
  /** Error messages by model ID */
  [modelId: string]: string
}

/**
 * Combined error messages for a provider
 * 
 * Comprehensive collection of all error messages for a provider,
 * including both connection and model-specific errors.
 */
export interface ProviderErrorMessages {
  /** Connection-related error messages */
  connection: AIErrorMessages
  
  /** Model-specific error messages */
  models: AIModelErrorMessages
} 