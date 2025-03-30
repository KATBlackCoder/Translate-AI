/**
 * AI Provider Interfaces
 * 
 * This file defines the core interfaces that AI providers must implement.
 * It establishes the contract between the application and AI services,
 * ensuring that all providers expose a consistent API.
 */

import type { 
  ResourceTranslation,
  TranslationPrompt,
  TranslationRequest,
  TranslationResponse,
  BatchTranslationResult,
  PromptType
} from '@/types/shared/translation'
import type { AIBaseConfig } from '@/types/ai/base'
import type { AIProviderConfig } from '@/types/ai/config'
import type { ProviderMetadata } from '@/types/ai/metadata'

// ============================================================
// PROVIDER INTERFACES
// ============================================================

/**
 * Core interface that all AI providers must implement
 * 
 * This interface defines the contract that every AI provider
 * implementation must fulfill to be usable within the application.
 * It extends ProviderMetadata to include implementation details
 * along with descriptive information.
 */
export interface AIProvider extends ProviderMetadata {
  /** Current configuration for this provider */
  readonly config: AIBaseConfig

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
   * @param sourceLanguage - Source language code
   * @param targetLanguage - Target language code
   * @param options - Additional options for the batch processing
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
   * 
   * Checks if the provided configuration is valid for this provider.
   * Should validate model support, API credentials, and other settings.
   * 
   * @param config - Configuration to validate
   * @returns Promise resolving to true if valid
   */
  validateConfig(config: AIProviderConfig): Promise<boolean>
  
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
  
  /**
   * Get the default prompt for a content type
   * 
   * Retrieves the provider's default prompt template for a given
   * content type. Used when custom prompts aren't specified.
   * 
   * @param type - The prompt type to get
   * @returns The default translation prompt with system and user components
   */
  getDefaultPrompt(type: PromptType): TranslationPrompt
  
  /**
   * Validate if a prompt is properly formed
   * 
   * Checks if a prompt meets the provider's requirements.
   * Used to validate custom prompts before use.
   * 
   * @param prompt - The prompt to validate
   * @returns True if the prompt is valid for this provider
   */
  validatePrompt(prompt: TranslationPrompt): boolean
} 