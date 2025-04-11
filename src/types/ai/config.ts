/**
 * AI Configuration System
 * 
 * This file defines the configuration types for the AI translation system.
 * It provides a comprehensive, type-safe way to configure AI providers and
 * translation services with proper validation support.
 * 
 * @module types/ai/config
 */

import type { 
  AIBaseConfig, 
  AIProviderType, 
  AIErrorMessages,
  LanguagePair
} from '@/types/ai'

// ============================================================
// PROVIDER CONFIGURATION
// ============================================================

/**
 * Provider-specific configuration
 * 
 * Extends the base configuration with provider-specific details.
 * Includes explicit provider type to eliminate detection logic.
 * 
 * @example
 * ```typescript
 * const ollamaConfig: AIProviderConfig = {
 *   providerType: 'ollama',
 *   model: 'mistral',
 *   baseUrl: 'http://localhost:11434/api',
 *   temperature: 0.7,
 *   maxTokens: 2000
 * };
 * ```
 */
export interface AIProviderConfig extends AIBaseConfig {
  /** 
   * The provider type identifier
   * Explicitly storing the provider type simplifies provider handling
   * 
   * @example 'chatgpt' | 'ollama' | 'deepseek'
   */
  providerType: AIProviderType
  
  /**
   * Provider-specific options
   * Additional configuration options specific to each provider
   * that don't fit into the standard configuration model
   * 
   * @example { context_window: 4096 } for Ollama models with custom context settings
   * @example { streaming: true } for enabling streaming in certain providers
   */
  options?: Record<string, unknown>
}

// ============================================================
// QUALITY SETTINGS
// ============================================================

/**
 * Configuration for translation quality and performance
 * 
 * Controls the balance between translation quality, speed, and reliability.
 * These settings affect how translations are processed and retried.
 * 
 * @example
 * ```typescript
 * // High quality, slower processing
 * const highQualitySettings: TranslationQualitySettings = {
 *   temperature: 0.3,
 *   maxTokens: 2000,
 *   retryCount: 3,
 *   batchSize: 5,
 *   timeout: 60000
 * };
 * 
 * // Balanced settings
 * const balancedSettings: TranslationQualitySettings = {
 *   temperature: 0.7,
 *   maxTokens: 1000,
 *   retryCount: 2,
 *   batchSize: 10,
 *   timeout: 30000
 * };
 * ```
 */
export interface TranslationQualitySettings {
  /**
   * Model temperature setting (0.0 - 2.0)
   * 
   * Controls randomness in output:
   * - Lower (0.0-0.3): More deterministic, consistent outputs
   * - Medium (0.4-0.7): Balanced creativity and consistency
   * - Higher (0.8-2.0): More creative, varied outputs
   * 
   * For translations, lower temperatures (0.1-0.4) generally produce
   * more accurate and consistent results.
   * 
   * @minimum 0
   * @maximum 2
   * @default 0.3 for translation tasks
   */
  temperature: number
  
  /**
   * Maximum tokens to generate per translation
   * 
   * Limits the length of generated text:
   * - Lower values reduce costs and prevent overgeneration
   * - Higher values allow for longer translations
   * 
   * Should be set based on expected translation length and model capabilities.
   * For most translations, 500-1500 tokens is sufficient.
   * 
   * @minimum 1
   * @recommended 1000
   */
  maxTokens: number
  
  /**
   * Number of retry attempts for failed translations
   * 
   * How many times to retry a failed translation before giving up:
   * - Minimum: 0 (no retries)
   * - Recommended: 2-3 for balanced reliability
   * - Higher values improve success rate but increase processing time
   * 
   * Each retry may use adjusted parameters to improve success chances.
   * 
   * @minimum 0
   * @recommended 2
   */
  retryCount: number
  
  /**
   * Number of translations to process in parallel
   * 
   * Controls throughput and server load:
   * - Lower values (1-5): Less resource usage, slower processing
   * - Medium values (6-15): Balanced approach
   * - Higher values (16+): Faster processing but higher resource usage
   * 
   * Should be adjusted based on provider rate limits and performance.
   * Note that some providers (like Ollama) work best with smaller batch sizes,
   * while others (like ChatGPT) can handle larger batches efficiently.
   * 
   * @minimum 1
   * @recommended 10
   */
  batchSize: number
  
  /**
   * Request timeout in milliseconds
   * 
   * Maximum time to wait for each translation request:
   * - Minimum: 5000 (5 seconds)
   * - Recommended: 30000 (30 seconds)
   * - Higher values reduce timeout errors but may delay processing
   * 
   * Longer timeouts are better for complex or lengthy translations,
   * but can delay error reporting for failed requests.
   * 
   * @minimum 5000
   * @recommended 30000
   */
  timeout: number
}

// ============================================================
// SERVICE CONFIGURATION
// ============================================================

/**
 * Complete AI service configuration
 * 
 * Comprehensive configuration combining all aspects of the AI translation
 * service, including language settings, provider configuration, and
 * quality control parameters.
 * 
 * @example
 * ```typescript
 * const serviceConfig: AIServiceConfig = {
 *   languagePair: { source: 'ja', target: 'en' },
 *   provider: {
 *     providerType: 'ollama',
 *     model: 'mistral',
 *     baseUrl: 'http://localhost:11434/api',
 *     temperature: 0.7,
 *     maxTokens: 2000
 *   },
 *   quality: {
 *     temperature: 0.3,
 *     maxTokens: 1000,
 *     retryCount: 2,
 *     batchSize: 10,
 *     timeout: 30000
 *   }
 * };
 * ```
 */
export interface AIServiceConfig {
  /**
   * Language pair for translation
   * 
   * Specifies the source and target languages for translation
   * using the LanguagePair type that encapsulates both languages
   * 
   * @example { source: 'ja', target: 'en' }
   */
  languagePair: LanguagePair
  
  /**
   * Provider-specific configuration
   * Settings for the specific AI provider being used
   * 
   * @see AIProviderConfig
   */
  provider: AIProviderConfig
  
  /**
   * Quality and performance settings
   * Controls the translation process behavior
   * 
   * @see TranslationQualitySettings
   */
  quality: TranslationQualitySettings
}

// ============================================================
// CONNECTION TESTING
// ============================================================

/**
 * Configuration for testing provider connections
 * 
 * Used specifically for validating connectivity to AI providers
 * before attempting to perform translations.
 * 
 * @example
 * ```typescript
 * const connectionConfig: AIConnectionConfig = {
 *   model: 'gpt-3.5-turbo',
 *   baseUrl: 'https://api.openai.com/v1',
 *   apiKey: 'sk-...',
 *   temperature: 0.7,
 *   maxTokens: 100,
 *   errorMessages: {
 *     connectionFailed: 'Unable to connect to OpenAI API',
 *     apiNotFound: 'OpenAI API endpoint not found',
 *     authFailed: 'Authentication failed. Check your API key',
 *     default: 'Unknown error connecting to OpenAI'
 *   }
 * };
 * ```
 */
export interface AIConnectionConfig extends AIBaseConfig {
  /**
   * Error messages for different failure scenarios
   * If not provided, default messages will be used
   * 
   * Custom error messages can provide more specific guidance
   * to users about what went wrong and how to fix it.
   * 
   * @see AIErrorMessages
   */
  errorMessages?: AIErrorMessages
} 