import { OpenAIBaseProvider } from '@/core/ai/openai-base-provider'
import { BaseProvider } from '@/core/ai/base-provider'
import type { TranslationRequest } from '@/core/shared/translation'

/**
 * DeepSeek AI provider implementation for translation services.
 * Uses DeepSeek's chat completion API for high-quality translations.
 */
export class DeepSeekProvider extends OpenAIBaseProvider {
  readonly name: string = 'DeepSeek'
  readonly version: string = '1.0.0'
  readonly maxBatchSize: number = 10
  /** Cost per token in USD (approximately $0.02 per 1K tokens) */
  readonly costPerToken: number = 0.00002
  readonly supportsAdultContent: boolean = true
  readonly contentRating: 'general' | 'teen' | 'mature' | 'adult' = 'mature'

  private readonly supportedModels = [
    'deepseek-chat',
    'deepseek-coder',
    'deepseek-math'
  ]

  protected getBaseUrl(baseUrl?: string): string {
    return baseUrl || 'https://api.deepseek.com/v1'
  }

  protected getDefaultModel(): string {
    return 'deepseek-chat'
  }

  protected getDefaultTemperature(): number {
    return 0.3
  }

  protected getQualityScore(): number {
    return 0.92
  }

  protected isModelSupported(model: string): boolean {
    return this.supportedModels.includes(model)
  }

  protected buildPrompt(request: TranslationRequest): string {
    const formattedPrompt = this.getFormattedPrompt(request)
    return `${formattedPrompt.system}\n\n${formattedPrompt.user}`
  }

  /**
   * Estimates the cost of translation based on text length.
   * @param text - The text to estimate cost for
   * @returns Object containing estimated tokens and cost
   */
  estimateCost(text: string): { tokens: number; cost: number } {
    // Rough estimation: 1 token ≈ 4 characters for English
    const estimatedTokens = Math.ceil(text.length / 4)
    return {
      tokens: estimatedTokens,
      cost: estimatedTokens * this.costPerToken
    }
  }

  /**
   * Validates the DeepSeek provider configuration.
   * @param config - The configuration to validate
   * @returns Promise resolving to true if config is valid
   */
  async validateConfig(config: BaseProvider['config']): Promise<boolean> {
    if (!config.apiKey || !config.baseUrl) return false
    if (config.model && !this.isModelSupported(config.model)) return false
    if (config.temperature && (config.temperature < 0 || config.temperature > 2)) {
      return false
    }
    if (config.promptType && !this.supportedPromptTypes.includes(config.promptType)) {
      return false
    }
    if (config.contentRating && config.contentRating !== this.contentRating) {
      return false
    }
    return true
  }
} 