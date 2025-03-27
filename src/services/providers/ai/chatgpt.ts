import { OpenAIBaseProvider } from '@/core/ai/openai-base-provider'
import type { AIProviderConfig } from '@/types/ai/base'
import type { TranslationRequest, ContentRating, PromptType } from '@/types/shared/translation'
import { 
  AI_MODEL_PRESETS, 
  getDefaultModelForProvider,
  isModelSupported as isModelSupportedByProvider,
  CHATGPT_CONFIG
} from '@/config/provider/ai'

/**
 * ChatGPT AI provider implementation for translation services.
 * Uses OpenAI's GPT models for high-quality translations.
 */
export class ChatGPTProvider extends OpenAIBaseProvider {
  readonly name: string = 'ChatGPT'
  readonly version: string = '1.0.0'
  readonly maxBatchSize: number = 10
  /** Cost per token in USD ($0.0001 per token) */
  readonly costPerToken: number = 0.0001
  readonly supportsAdultContent: boolean = false
  readonly qualityScore: number = 0.9

  protected getBaseUrl(baseUrl?: string): string {
    return baseUrl || CHATGPT_CONFIG.baseUrl
  }

  protected getDefaultModel(): string {
    return getDefaultModelForProvider('chatgpt')
  }

  protected getDefaultTemperature(): number {
    const defaultModel = this.getDefaultModel()
    const preset = AI_MODEL_PRESETS.chatgpt[defaultModel]
    return preset?.defaultTemperature || 0.7
  }

  protected isModelSupported(model: string): boolean {
    return isModelSupportedByProvider('chatgpt', model)
  }

  /**
   * Validates the ChatGPT provider configuration.
   * @param config - The configuration to validate
   * @returns Promise resolving to true if config is valid
   */
  async validateConfig(config: AIProviderConfig): Promise<boolean> {
    if (!config.apiKey) return false
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

  /**
   * Estimates the cost of translation based on text length.
   * @param text - The text to estimate cost for
   * @returns Object containing estimated tokens and cost
   */
  estimateCost(text: string): { tokens: number; cost: number } {
    // Rough estimation: 1 token ≈ 4 characters for English, may vary for other languages
    const estimatedTokens = Math.ceil(text.length / 4)
    return {
      tokens: estimatedTokens,
      cost: estimatedTokens * this.costPerToken
    }
  }
} 