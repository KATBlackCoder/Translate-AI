// src/services/translation.ts
import { AIProviderFactory } from '@/services/providers/factory'
import type { AIServiceConfig } from '@/types/ai/config'
import type { 
  TranslationRequest, 
  TranslationResponse,
  ResourceTranslation,
  BatchTranslationResult,
  TranslationStats,
  PromptType
} from '@/types/shared/translation'

/**
 * Core translation service that manages AI provider interactions
 * and provides translation capabilities to the application.
 * Follows the singleton pattern for consistent state management.
 */
export class TranslationService {
  private static instance: TranslationService | null = null
  private config: AIServiceConfig | null = null
  private stats: TranslationStats = this.getInitialStats()
  private lastError: Error | null = null
  private initialized = false
  
  /**
   * Private constructor to enforce singleton pattern
   */
  private constructor() {}
  
  /**
   * Get the singleton instance of the translation service
   */
  static getInstance(): TranslationService {
    if (!this.instance) {
      this.instance = new TranslationService()
    }
    return this.instance
  }
  
  /**
   * Initialize the translation service with a configuration
   * @param config - The AI service configuration
   * @throws Error if configuration is invalid
   */
  async initialize(config: AIServiceConfig): Promise<void> {
    try {
      this.config = config
      // Validate configuration by attempting to create provider
      await AIProviderFactory.createProvider(
        config.provider.providerType,
        config.provider
      )
      
      this.initialized = true
      this.lastError = null
    } catch (error) {
      this.lastError = error instanceof Error 
        ? error 
        : new Error(String(error))
      this.initialized = false
      throw this.lastError
    }
  }
  
  /**
   * Check if the service has been properly initialized
   */
  isInitialized(): boolean {
    return this.initialized && !!this.config
  }
  
  /**
   * Get the last error that occurred during service operation
   */
  getLastError(): Error | null {
    return this.lastError
  }
  
  /**
   * Clear error state and reset statistics
   */
  reset(): void {
    this.lastError = null
    this.stats = this.getInitialStats()
  }
  
  /**
   * Translate a single text string
   * @param request - The translation request
   * @returns Translation response with results and metadata
   * @throws Error if service is not initialized or translation fails
   */
  async translate(request: TranslationRequest): Promise<TranslationResponse> {
    this.validateServiceState()
    
    try {
      const provider = await this.getActiveProvider()
      
      const response = await provider.translate({
        ...request,
        sourceLanguage: request.sourceLanguage || this.config!.sourceLanguage,
        targetLanguage: request.targetLanguage || this.config!.targetLanguage
      })
      
      // Update stats
      this.updateStatsFromResponse(response)
      this.lastError = null
      
      return response
    } catch (error) {
      this.handleError('Translation failed', error)
      throw this.lastError
    }
  }
  
  /**
   * Translate a batch of texts
   * @param targets - The resource translations to process 
   * @param options - Optional settings for the batch operation
   * @returns Batch translation result with translations and statistics
   * @throws Error if service is not initialized or batch translation fails
   */
  async translateBatch(
    targets: ResourceTranslation[],
    options?: {
      promptType?: PromptType
      batchSize?: number
      retryCount?: number
      timeout?: number
    }
  ): Promise<BatchTranslationResult> {
    this.validateServiceState()
    
    try {
      const provider = await this.getActiveProvider()
      
      const result = await provider.translateBatch(
        targets,
        this.config!.sourceLanguage,
        this.config!.targetLanguage,
        {
          ...this.config!.provider,
          ...options
        }
      )
      
      // Update global stats from batch result
      this.updateStatsFromBatch(result)
      this.lastError = null
      
      return result
    } catch (error) {
      this.handleError('Batch translation failed', error)
      throw this.lastError
    }
  }
  
  /**
   * Estimate the cost of translating a text
   * @param text - The text to estimate
   * @returns Token and cost estimation
   * @throws Error if service is not initialized
   */
  estimateCost(text: string): { tokens: number; cost: number } {
    this.validateServiceState()
    
    try {
      const provider = AIProviderFactory.getProvider(
        this.config!.provider.providerType,
        this.config!.provider
      )
      
      return provider.estimateCost(text)
    } catch (error) {
      this.handleError('Cost estimation failed', error)
      return { tokens: 0, cost: 0 }
    }
  }
  
  /**
   * Get the current service configuration
   */
  getCurrentConfig(): AIServiceConfig | null {
    return this.config
  }
  
  /**
   * Get current translation statistics
   */
  getStats(): TranslationStats {
    return { ...this.stats }
  }
  
  /**
   * Validate if a configuration is valid
   * @param config - The configuration to validate
   * @returns True if the configuration is valid
   */
  async validateConfig(config: AIServiceConfig): Promise<boolean> {
    try {
      const provider = await AIProviderFactory.createProvider(
        config.provider.providerType,
        config.provider
      )
      return await provider.validateConfig(config.provider)
    } catch (error) {
      return false
    }
  }
  
  /**
   * Check if the service is in a healthy state
   * @returns True if service is initialized and has no errors
   */
  isHealthy(): boolean {
    return this.initialized && !this.lastError
  }
  
  /**
   * Get an active provider instance based on current config
   * @returns An AIProvider instance
   * @private
   */
  private async getActiveProvider() {
    if (!this.config) {
      throw new Error('Translation service not initialized')
    }
    
    return await AIProviderFactory.createProvider(
      this.config.provider.providerType,
      this.config.provider
    )
  }
  
  /**
   * Validate that the service is in a valid state for operations
   * @throws Error if service is not properly initialized
   * @private
   */
  private validateServiceState() {
    if (!this.isInitialized()) {
      throw new Error('Translation service not initialized')
    }
  }
  
  /**
   * Handle an error that occurred during service operation
   * @param context - Description of the operation that failed
   * @param error - The error that occurred
   * @private
   */
  private handleError(context: string, error: unknown) {
    this.lastError = error instanceof Error 
      ? new Error(`${context}: ${error.message}`)
      : new Error(`${context}: ${String(error)}`)
    
    // Increment error count in stats
    this.stats.failedCount++
    
    console.error(this.lastError)
  }
  
  /**
   * Update global stats from a single translation response
   * @param response - The translation response
   * @private
   */
  private updateStatsFromResponse(response: TranslationResponse) {
    if (response.tokens) {
      this.stats.totalTokens += response.tokens.total || 0
    }
    
    if (response.cost) {
      this.stats.totalCost += response.cost
    }
    
    if (response.confidence) {
      // Update running average of confidence
      const prevTotal = this.stats.averageConfidence || 0 * this.stats.successCount
      this.stats.averageConfidence = (prevTotal + response.confidence) / (this.stats.successCount + 1)
    }
    
    this.stats.successCount++
    this.stats.lastTranslationTime = Date.now()
  }
  
  /**
   * Update global stats from a batch translation result
   * @param result - The batch translation result
   * @private
   */
  private updateStatsFromBatch(result: BatchTranslationResult) {
    this.stats.totalTokens += result.stats.totalTokens || 0
    this.stats.totalCost += result.stats.totalCost || 0
    this.stats.successCount += result.stats.successCount || 0
    this.stats.failedCount += result.stats.failedCount || 0
    this.stats.lastTranslationTime = Date.now()
    
    // If batch includes processing time, update it
    if (result.stats.totalProcessingTime) {
      this.stats.totalProcessingTime = (this.stats.totalProcessingTime || 0) + 
        result.stats.totalProcessingTime
    }
  }
  
  /**
   * Get initial stats object with zeroed values
   * @private
   */
  private getInitialStats(): TranslationStats {
    return {
      totalTokens: 0,
      totalCost: 0,
      averageConfidence: 0,
      failedCount: 0,
      successCount: 0,
      totalProcessingTime: 0,
      lastTranslationTime: 0
    }
  }
}