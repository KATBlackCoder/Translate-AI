import type { AIProvider, AIProviderConfig, AIBaseConfig } from '@/types/ai/base'
import type { 
  ResourceTranslation,
  TranslationRequest, 
  TranslationResponse, 
  BatchTranslationResult, 
  TranslationPrompt,
  PromptType,
  TextPair
} from '@/types/shared/translation'
import { RetryManager } from '@/utils/ai/retry'
import { RateLimiter } from '@/utils/ai/rate-limiter'
import { CacheManager } from '@/utils/ai/cache'
import { 
  getPrompt,
  SUPPORTED_PROMPT_TYPES,
  AI_SUPPORTED_LANGUAGES
} from '@/config'

/**
 * Abstract base class for AI provider implementations
 * Handles common functionality like caching, rate limiting, and retry logic
 */
export abstract class BaseProvider implements AIProvider {
  // Default values from the configuration
  readonly supportedLanguages: string[] = AI_SUPPORTED_LANGUAGES
  readonly supportedPromptTypes: PromptType[] = SUPPORTED_PROMPT_TYPES

  // Required properties that must be implemented by subclasses
  abstract readonly name: string
  abstract readonly version: string
  abstract readonly maxBatchSize: number
  abstract readonly costPerToken: number
  abstract readonly supportsAdultContent: boolean
  // New required property from AIProvider interface
  abstract readonly qualityScore: number

  // Configuration for the provider
  readonly config: AIBaseConfig

  // Utility managers
  protected readonly retryManager: typeof RetryManager
  protected readonly rateLimiter: RateLimiter
  protected readonly cache: CacheManager

  /**
   * Create a new BaseProvider instance
   * @param config Provider configuration
   */
  constructor(config: AIProviderConfig) {
    this.config = config
    this.retryManager = RetryManager
    this.rateLimiter = new RateLimiter()
    this.cache = new CacheManager()
  }

  /**
   * Build a prompt string for the provider
   * @param request Translation request
   */
  protected abstract buildPrompt(request: TranslationRequest): string

  /**
   * Translate a single text using this provider
   * Implements caching and rate limiting
   * @param request Translation request details
   * @returns Promise with translation response
   */
  async translate(request: TranslationRequest): Promise<TranslationResponse> {
    const cacheKey = this.getCacheKey(request)
    const cached = await this.cache.get<TranslationResponse>(cacheKey)
    if (cached) return cached

    await this.rateLimiter.acquire()
    
    return this.retryManager.withRetry(async () => {
      const response = await this.performTranslation(request)
      this.cache.set(cacheKey, response)
      return response
    })
  }

  /**
   * Implemented by subclasses to perform the actual translation
   * @param request Translation request details
   */
  protected abstract performTranslation(request: TranslationRequest): Promise<TranslationResponse>

  /**
   * Batch translate multiple texts
   * Handles error collection, parallelization, and statistics
   * @param targets Resource translations to process
   * @param sourceLanguage Source language code
   * @param targetLanguage Target language code
   * @param options Additional options for batch processing
   */
  async translateBatch(
    targets: ResourceTranslation[], 
    sourceLanguage: string, 
    targetLanguage: string,
    options?: AIBaseConfig & {
      batchSize?: number
      retryCount?: number
      timeout?: number
    }
  ): Promise<BatchTranslationResult> {
    // Check content suitability
    if (options?.isAdult && !this.supportsAdultContent) {
      throw new Error('This provider does not support adult content')
    }

    if (options?.contentRating === 'nsfw' && !this.supportsAdultContent) {
      throw new Error(`This provider does not support NSFW content`)
    }

    const results: ResourceTranslation[] = []
    const errors: Array<{ text: string; error: string; retryCount?: number }> = []
    let totalTokens = 0
    let successfulTranslations = 0
    let failedTranslations = 0
    const startTime = Date.now()
    
    const batchSize = options?.batchSize || this.maxBatchSize
    const maxRetries = options?.retryCount || 3
    
    // Process in batches to avoid overwhelming the provider
    for (let i = 0; i < targets.length; i += batchSize) {
      const batch = targets.slice(i, i + batchSize)
      const batchResults = await Promise.allSettled(
        batch.map(target => 
          this.retryManager.withRetry(
            async () => {
              // Determine content type based on options and provider capabilities
              let contentType: PromptType = 'general'
              if (options?.promptType && this.supportedPromptTypes.includes(options.promptType)) {
                contentType = options.promptType
              } else if (options?.isAdult && this.supportsAdultContent) {
                contentType = 'nsfw'
              }

              const response = await this.translate({
                text: target.source,
                context: target.context,
                sourceLanguage,
                targetLanguage,
                contentType
              })
              
              totalTokens += response.tokens?.total || 0
              successfulTranslations++
              
              return {
                ...target,
                target: response.translatedText
              }
            },
            { maxAttempts: maxRetries }
          )
        )
      )

      // Collect results and errors
      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results.push(result.value)
        } else {
          failedTranslations++
          errors.push({
            text: batch[index].source,
            error: result.reason instanceof Error ? result.reason.message : 'Unknown error',
            retryCount: maxRetries
          })
        }
      })
    }
    
    // Return combined results with statistics
    return {
      translations: results as unknown as TextPair[],
      stats: {
        totalTokens,
        totalCost: totalTokens * this.costPerToken,
        averageConfidence: 0.85,
        failedCount: failedTranslations,
        successCount: successfulTranslations,
        totalProcessingTime: Date.now() - startTime
      },
      errors: errors.length > 0 ? errors : undefined
    }
  }

  /**
   * Validate provider configuration
   * Implemented by subclasses for provider-specific validation
   * @param config Configuration to validate
   */
  abstract validateConfig(config: AIProviderConfig): Promise<boolean>

  /**
   * Estimate cost for translating text
   * @param text Text to estimate
   * @returns Object with token count and cost
   */
  estimateCost(text: string): { tokens: number; cost: number } {
    const estimatedTokens = Math.ceil(text.length / 4)
    return {
      tokens: estimatedTokens,
      cost: estimatedTokens * this.costPerToken
    }
  }

  /**
   * Get the default prompt for a content type
   * @param type The prompt type to get
   * @returns The default translation prompt
   */
  getDefaultPrompt(type: PromptType): TranslationPrompt {
    return getPrompt(type)
  }

  /**
   * Validate if a prompt is properly formed
   * @param prompt The prompt to validate
   * @returns True if the prompt is valid
   */
  validatePrompt(prompt: TranslationPrompt): boolean {
    return (
      typeof prompt.system === 'string' &&
      typeof prompt.user === 'string' &&
      prompt.system.length > 0 &&
      prompt.user.length > 0
    )
  }

  /**
   * Generate a cache key for translation requests
   * @param request Translation request
   * @returns Cache key string
   */
  private getCacheKey(request: TranslationRequest): string {
    return `${request.sourceLanguage}-${request.targetLanguage}-${request.text}`
  }
} 