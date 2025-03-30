import { OpenAIBaseProvider } from '@/core/ai/openai-base-provider'
import type { AIProviderConfig } from '@/types/ai/config'
import { 
  AI_MODEL_PRESETS, 
  getDefaultModelForProvider,
  isModelSupported as isModelSupportedByProvider,
  CHATGPT_DEFAULTS,
  CHATGPT_CONFIG
} from '@/config/provider/ai'

/**
 * ChatGPT AI provider implementation for translation services.
 * Uses OpenAI's GPT models for high-quality translations.
 */
export class ChatGPTProvider extends OpenAIBaseProvider {
  readonly name: string = CHATGPT_CONFIG.name
  readonly version: string = CHATGPT_CONFIG.version
  readonly maxBatchSize: number = CHATGPT_CONFIG.maxBatchSize
  /** Cost per token in USD ($0.0001 per token) */
  readonly costPerToken: number = CHATGPT_CONFIG.costPerToken
  readonly supportsAdultContent: boolean = CHATGPT_CONFIG.supportsAdultContent
  readonly qualityScore: number = CHATGPT_CONFIG.qualityScore

  protected getBaseUrl(baseUrl?: string): string {
    return baseUrl || CHATGPT_DEFAULTS.baseUrl
  }

  protected getDefaultModel(): string {
    return getDefaultModelForProvider('chatgpt')
  }

  protected getDefaultTemperature(): number {
    const defaultModel = this.getDefaultModel()
    const preset = AI_MODEL_PRESETS.chatgpt[defaultModel]
    return preset?.defaultTemperature || CHATGPT_DEFAULTS.defaultTemperature
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
    
    // Check for correct provider type to prevent misconfiguration
    if (config.providerType !== 'chatgpt') {
      return false
    }
    
    // Check prompt type compatibility
    if (config.promptType && !this.supportedPromptTypes.includes(config.promptType)) {
      return false
    }
    
    // Content rating check
    if (config.contentRating === 'nsfw' && !this.supportsAdultContent) {
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