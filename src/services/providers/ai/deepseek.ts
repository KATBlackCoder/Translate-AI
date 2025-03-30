import { OpenAIBaseProvider } from '@/core/ai/openai-base-provider'
import type { AIProviderConfig } from '@/types/ai/config'
import { 
  AI_MODEL_PRESETS, 
  getDefaultModelForProvider,
  isModelSupported as isModelSupportedByProvider,
  DEEPSEEK_CONFIG,
  DEEPSEEK_DEFAULTS
} from '@/config/provider/ai'

/**
 * DeepSeek AI provider implementation for translation services.
 * Uses DeepSeek's chat completion API for high-quality translations.
 */
export class DeepSeekProvider extends OpenAIBaseProvider {
  readonly name: string = DEEPSEEK_CONFIG.name
  readonly version: string = DEEPSEEK_CONFIG.version
  readonly maxBatchSize: number = DEEPSEEK_CONFIG.maxBatchSize
  /** Cost per token in USD (approximately $0.001 per 1K tokens) */
  readonly costPerToken: number = DEEPSEEK_CONFIG.costPerToken
  readonly supportsAdultContent: boolean = DEEPSEEK_CONFIG.supportsAdultContent
  readonly qualityScore: number = DEEPSEEK_CONFIG.qualityScore

  protected getBaseUrl(baseUrl?: string): string {
    return baseUrl || DEEPSEEK_DEFAULTS.baseUrl
  }

  protected getDefaultModel(): string {
    return getDefaultModelForProvider('deepseek')
  }

  protected getDefaultTemperature(): number {
    const defaultModel = this.getDefaultModel()
    const preset = AI_MODEL_PRESETS.deepseek[defaultModel]
    return preset?.defaultTemperature || DEEPSEEK_DEFAULTS.defaultTemperature
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
    
    // Check for correct provider type to prevent misconfiguration
    if (config.providerType !== 'deepseek') {
      return false
    }
    
    // Check prompt type compatibility
    if (config.promptType && !this.supportedPromptTypes.includes(config.promptType)) {
      return false
    }
    
    // DeepSeek doesn't support NSFW content
    if (config.promptType === 'nsfw' || config.contentRating === 'nsfw') {
      return false
    }
    
    return true
  }
} 