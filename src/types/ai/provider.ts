/**
 * AI Provider Interfaces
 * 
 * This file defines the core interfaces that AI providers must implement.
 * It establishes the contract between the application and AI services,
 * ensuring that all providers expose a consistent API.
 */

import type { 
  PromptType,
  TranslationMeta,
  TokenUsage,
  BatchOptions,
  ResourceTranslation,
  ResourceTranslationResult,
  TranslationRequest,
  LanguageCode,
  LanguagePair
} from '@/types/ai'

import type { AIProviderConfig } from '@/types/ai/config'
import type { CustomPrompt } from '@/types/ai/prompt'

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

  /** Specific content type for translation */
  promptType?: PromptType
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
  
  /** Content types supported by this provider */
  supportedPromptTypes: PromptType[]
  
  /** Languages supported by this provider */
  supportedLanguages: LanguageCode[]
}

// ============================================================
// PROVIDER INTERFACES
// ============================================================

/**
 * Translation response from AI providers
 * 
 * @description Output data from a translation operation.
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
 * Basic translation capabilities
 */
export interface TranslationProvider {
  /**
   * Translate a single text using this provider
   * 
   * @param request - The translation request containing text and context
   * @returns Promise resolving to the translation response with metadata
   */
  translate(request: TranslationRequest): Promise<TranslationResponse>
  
  /**
   * Translate multiple texts in batch
   * 
   * Efficiently processes multiple translations in a single operation.
   * May implement parallelization, rate limiting, and retries internally.
   * 
   * @param targets - Resource translations to process
   * @param languagePair - Source and target language pair
   * @param options - Additional options for the batch processing
   * @returns Promise resolving to the resource translation result
   */
  translateBatch(
    targets: ResourceTranslation[], 
    languagePair: LanguagePair, 
    options?: AIBaseConfig & BatchOptions
  ): Promise<ResourceTranslationResult>
}

/**
 * Configuration validation capabilities
 */
export interface ConfigValidator {
  /**
   * Validate provider configuration
   * 
   * Checks if the provided configuration is valid for this provider.
   * Should validate model support, API credentials, and other settings.
   * 
   * @param config - Configuration to validate
   * @returns Promise resolving to true if valid
   */
  validateConfig(config: AIProviderConfig): Promise<boolean>
}
  
/**
 * Cost estimation capabilities
 */
export interface CostEstimator {
  /**
   * Estimate cost for translating text
   * 
   * Calculates the approximate cost and token count for translating
   * the given text. Used for budgeting and progress indicators.
   * 
   * @param text - Text to estimate
   * @returns Object with token count and estimated cost in USD
   */
  estimateCost(text: string): { tokens: number; cost: number }
}
  
/**
 * Prompt management capabilities
 */
export interface PromptManager {
  /**
   * Get the default prompt for a content type
   * 
   * Retrieves the provider's default prompt template for a given
   * content type. Used when custom prompts aren't specified.
   * 
   * @param type - The prompt type to get
   * @returns The default translation prompt with system and user components
   */
  getDefaultPrompt(type: PromptType): CustomPrompt
  
  /**
   * Validate if a prompt is properly formed
   * 
   * Checks if a prompt meets the provider's requirements.
   * Used to validate custom prompts before use.
   * 
   * @param prompt - The prompt to validate
   * @returns True if the prompt is valid for this provider
   */
  validatePrompt(prompt: CustomPrompt): boolean
}

/**
 * Core interface that all AI providers must implement
 * 
 * This interface defines the contract that every AI provider
 * implementation must fulfill to be usable within the application.
 * It extends ProviderMetadata to include implementation details
 * along with descriptive information.
 */
export interface AIProvider extends 
  ProviderMetadata, 
  TranslationProvider, 
  ConfigValidator, 
  CostEstimator, 
  PromptManager {
  /** Current configuration for this provider */
  readonly config: AIBaseConfig
} 