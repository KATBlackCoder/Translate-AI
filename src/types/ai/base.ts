import type { 
  ResourceTranslation,
  TranslationPrompt,
  TranslationRequest,
  TranslationResponse,
  BatchTranslationResult,
  ContentRating,
  PromptType
} from '@/types/shared/translation'

// ============================================================
// CORE ENUMS AND SIMPLE TYPES
// ============================================================

/**
 * Supported AI provider types
 */
export type AIProviderType = 'chatgpt' | 'ollama' | 'deepseek'

// ============================================================
// PROMPT AND MESSAGE RELATED TYPES
// ============================================================

/**
 * Custom prompt configuration for a specific content type
 */
export interface CustomPrompt {
  /** System prompt that defines the context and instructions */
  system?: string
  /** User prompt template for this content type */
  user?: string
}

/**
 * Collection of custom prompts by content type
 */
export interface PromptSettings {
  /** Custom prompts organized by content type */
  customPrompts: Record<PromptType, CustomPrompt>
}

/**
 * Error message templates for API connections
 */
export interface AIErrorMessages {
  /** Error message when connection fails */
  connectionFailed: string
  /** Error message when API endpoint is not found */
  apiNotFound: string
  /** Error message for authentication failures */
  authFailed?: string
  /** Error message for rate limiting */
  rateLimit?: string
  /** Default error message */
  default: string
}

// ============================================================
// MODEL AND CONFIGURATION TYPES
// ============================================================

/**
 * AI model preset metadata for UI and defaults
 */
export interface AIModelPreset {
  /** Display name of the model */
  name: string
  /** Description of the model's capabilities */
  description: string
  /** Default temperature parameter for best results */
  defaultTemperature: number
  /** Default token limit for outputs */
  defaultMaxTokens: number
  /** Languages this model can effectively handle */
  supportedLanguages?: string[]
}

/**
 * Base configuration for translation AI operations
 */
export interface AIBaseConfig {
  /** The type of content being translated, affects prompt selection */
  promptType?: PromptType
  /** Whether the content contains adult themes */
  isAdult?: boolean
  /** Content rating classification (sfw/nsfw) */
  contentRating?: ContentRating
  /** Model temperature (randomness) setting */
  temperature?: number
  /** Maximum tokens to generate */
  maxTokens?: number
}

/**
 * Standard provider metadata
 */
export interface ProviderMetadata {
  /** Provider display name */
  name: string
  /** Provider implementation version */
  version: string
  /** Cost per token in USD */
  costPerToken: number
  /** Maximum number of translations to process in parallel */
  maxBatchSize: number
  /** Quality score for this provider (0-1) */
  qualityScore: number
  /** Whether this provider allows adult content */
  supportsAdultContent: boolean
  /** Prompt types supported by this provider */
  supportedPromptTypes: PromptType[]
  /** Languages supported by this provider */
  supportedLanguages: string[]
}

/**
 * Common provider configuration shared across all AI providers
 */
export interface CommonProviderConfig extends ProviderMetadata {
  /** Default model for this provider */
  defaultModel: string
  /** Default temperature setting */
  defaultTemperature: number
  /** Default max tokens setting */
  defaultMaxTokens: number
  /** Default content rating this provider can handle (sfw/nsfw) */
  contentRating: ContentRating
  /** List of supported model IDs */
  supportedModels: string[]
  /** Base URL for the API */
  baseUrl: string
}

/**
 * Collection of AI model presets organized by provider and model ID
 */
export type AIModelPresets = Record<AIProviderType, Record<string, AIModelPreset>>

/**
 * Runtime AI provider configuration for translation operations
 */
export interface AIProviderConfig {
  /** The specific model to use */
  model: string
  /** API key for authenticated providers */
  apiKey?: string
  /** Base URL for the API */
  baseUrl?: string
  /** The type of content being translated, affects prompt selection */
  promptType?: PromptType
  /** Whether the content contains adult themes */
  isAdult?: boolean
  /** Content rating classification (sfw/nsfw) */
  contentRating?: ContentRating
  /** Model temperature (randomness) setting */
  temperature?: number
  /** Maximum tokens to generate */
  maxTokens?: number
}

/**
 * Configuration for quality control in translation
 */
export interface TranslationQualitySettings {
  /** Model temperature (randomness) setting */
  temperature: number
  /** Maximum tokens to generate */
  maxTokens: number
  /** Number of retries on failure */
  retryCount: number
  /** Number of translations to process in parallel */
  batchSize: number
  /** Request timeout in milliseconds */
  timeout: number
}

/**
 * Connection configuration for testing AI provider connections
 */
export interface AIConnectionConfig extends Omit<AIProviderConfig, 'apiKey'> {
  /** API key for authenticated providers */
  apiKey: string
  /** Error messages for different failure scenarios - if not provided, defaults will be used */
  errorMessages?: AIErrorMessages
}

// ============================================================
// SERVICE INTERFACES
// ============================================================

/**
 * Core interface that all AI providers must implement
 */
export interface AIProvider extends ProviderMetadata {
  /** Current configuration for this provider */
  readonly config: AIBaseConfig

  /**
   * Translate a single text using this provider
   * @param request The translation request details
   * @returns Promise resolving to the translation response
   */
  translate(request: TranslationRequest): Promise<TranslationResponse>
  
  /**
   * Translate multiple texts in batch
   * @param targets Resource translations to process
   * @param sourceLanguage Source language code
   * @param targetLanguage Target language code
   * @param options Additional options for the batch processing
   * @returns Promise resolving to the batch translation result
   */
  translateBatch(
    targets: ResourceTranslation[], 
    sourceLanguage: string, 
    targetLanguage: string, 
    options?: AIBaseConfig & {
      batchSize?: number
      retryCount?: number
      timeout?: number
    }
  ): Promise<BatchTranslationResult>
  
  /**
   * Validate provider configuration
   * @param config Configuration to validate
   * @returns Promise resolving to true if valid
   */
  validateConfig(config: AIProviderConfig): Promise<boolean>
  
  /**
   * Estimate cost for translating text
   * @param text Text to estimate
   * @returns Object with token count and cost
   */
  estimateCost(text: string): { tokens: number; cost: number }
  
  /**
   * Get the default prompt for a content type
   * @param type The prompt type to get
   * @returns The default translation prompt
   */
  getDefaultPrompt(type: PromptType): TranslationPrompt
  
  /**
   * Validate if a prompt is properly formed
   * @param prompt The prompt to validate
   * @returns True if the prompt is valid
   */
  validatePrompt(prompt: TranslationPrompt): boolean
} 