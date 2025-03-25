import type { AIProvider, AIConfig, PromptType } from '@/types/ai/base'
import type { TranslationTarget, TranslationRequest, TranslationResponse, BatchTranslationResult, TranslationPrompt } from '@/core/shared/translation'
import { RetryManager } from '@/utils/ai/retry'
import { RateLimiter } from '@/utils/ai/rate-limiter'
import { CacheManager } from '@/utils/ai/cache'
import { prompts } from '@/utils/ai/prompts' 

export abstract class BaseProvider implements AIProvider {
  protected static SUPPORTED_LANGUAGES: string[] = [
    'en', // English
    'ja', // Japanese
    'zh', // Chinese
    'ko', // Korean
    'fr', // French
    'de', // German
    'es', // Spanish
    'it', // Italian
    'pt', // Portuguese
    'ru'  // Russian
  ]

  protected static SUPPORTED_PROMPT_TYPES: PromptType[] = [
    'general',
    'dialogue',
    'menu',
    'items',
    'skills',
    'name',
    'adult'
  ]

  protected readonly retryManager: typeof RetryManager
  protected readonly rateLimiter: RateLimiter
  protected readonly cache: CacheManager
  protected readonly config: AIConfig

  constructor(config: AIConfig) {
    this.config = config
    this.retryManager = RetryManager
    this.rateLimiter = new RateLimiter()
    this.cache = new CacheManager()
  }

  abstract readonly name: string
  abstract readonly version: string
  readonly supportedLanguages = BaseProvider.SUPPORTED_LANGUAGES
  abstract readonly maxBatchSize: number
  abstract readonly costPerToken: number
  readonly supportedPromptTypes = BaseProvider.SUPPORTED_PROMPT_TYPES
  abstract readonly supportsAdultContent: boolean
  abstract readonly contentRating?: 'general' | 'teen' | 'mature' | 'adult'

  protected abstract buildPrompt(request: TranslationRequest): string

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

  protected abstract performTranslation(request: TranslationRequest): Promise<TranslationResponse>

  async translateBatch(
    targets: TranslationTarget[], 
    sourceLanguage: string, 
    targetLanguage: string,
    options?: {
      promptType?: PromptType
      batchSize?: number
      retryCount?: number
      timeout?: number
      isAdult?: boolean
      contentRating?: 'general' | 'teen' | 'mature' | 'adult'
    }
  ): Promise<BatchTranslationResult> {
    if (options?.isAdult && !this.supportsAdultContent) {
      throw new Error('This provider does not support adult content')
    }

    if (options?.contentRating && this.contentRating && options.contentRating !== this.contentRating) {
      throw new Error(`Content rating mismatch. Provider supports ${this.contentRating} but requested ${options.contentRating}`)
    }

    const results: TranslationTarget[] = []
    const errors: Array<{ text: string; error: string; retryCount?: number }> = []
    let totalTokens = 0
    let successfulTranslations = 0
    let failedTranslations = 0
    const startTime = Date.now()
    
    const batchSize = options?.batchSize || this.maxBatchSize
    const maxRetries = options?.retryCount || 3
    
    for (let i = 0; i < targets.length; i += batchSize) {
      const batch = targets.slice(i, i + batchSize)
      const batchResults = await Promise.allSettled(
        batch.map(target => 
          this.retryManager.withRetry(
            async () => {
              const response = await this.translate({
                text: target.source,
                context: target.context,
                sourceLanguage,
                targetLanguage,
                promptType: options?.promptType || (options?.isAdult ? 'adult' : 'general')
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
    
    return {
      translations: results,
      stats: {
        totalTokens,
        totalCost: totalTokens * this.costPerToken,
        averageConfidence: 0.85,
        failedTranslations,
        successfulTranslations,
        totalProcessingTime: Date.now() - startTime
      },
      errors: errors.length > 0 ? errors : undefined
    }
  }

  abstract validateConfig(config: AIConfig): Promise<boolean>

  estimateCost(text: string): { tokens: number; cost: number } {
    const estimatedTokens = Math.ceil(text.length / 4)
    return {
      tokens: estimatedTokens,
      cost: estimatedTokens * this.costPerToken
    }
  }

  getDefaultPrompt(type: PromptType): TranslationPrompt {
    return prompts[type as keyof typeof prompts] || prompts.general
  }

  validatePrompt(prompt: TranslationPrompt): boolean {
    return (
      typeof prompt.system === 'string' &&
      typeof prompt.user === 'string' &&
      prompt.system.length > 0 &&
      prompt.user.length > 0
    )
  }

  private getCacheKey(request: TranslationRequest): string {
    return `${request.sourceLanguage}-${request.targetLanguage}-${request.text}`
  }
} 