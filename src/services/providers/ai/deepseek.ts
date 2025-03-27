import { OpenAIBaseProvider } from '@/core/ai/openai-base-provider'
import type { AIProviderConfig } from '@/types/ai/base'
import type { TranslationRequest, ContentRating, PromptType } from '@/types/shared/translation'
import { 
  AI_MODEL_PRESETS, 
  getDefaultModelForProvider,
  isModelSupported as isModelSupportedByProvider,
  DEEPSEEK_CONFIG
} from '@/config/provider/ai'

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
  readonly qualityScore: number = 0.92

  protected getBaseUrl(baseUrl?: string): string {
    return baseUrl || DEEPSEEK_CONFIG.baseUrl
  }

  protected getDefaultModel(): string {
    return getDefaultModelForProvider('deepseek')
  }

  protected getDefaultTemperature(): number {
    const defaultModel = this.getDefaultModel()
    const preset = AI_MODEL_PRESETS.deepseek[defaultModel]
    return preset?.defaultTemperature || 0.3
  }

  protected isModelSupported(model: string): boolean {
    return isModelSupportedByProvider('deepseek', model)
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
  async validateConfig(config: AIProviderConfig): Promise<boolean> {
    if (!config.apiKey || !config.baseUrl) return false
    if (config.model && !this.isModelSupported(config.model)) return false
    if (config.temperature && (config.temperature < 0 || config.temperature > 2)) {
      return false
    }
    if (config.promptType && !this.supportedPromptTypes.includes(config.promptType)) {
      return false
    }
    if (config.promptType === 'nsfw' && !this.supportsAdultContent) {
      return false
    }
    return true
  }
} 