import { OpenAIBaseProvider } from '@/core/ai/openai-base-provider'
import type { AIProviderConfig } from '@/types/ai/config'
import { 
  AI_MODEL_PRESETS, 
  getDefaultModelForProvider,
  isModelSupported as isModelSupportedByProvider,
  OLLAMA_CONFIG,
  OLLAMA_DEFAULTS
} from '@/config/provider/ai'

/**
 * Ollama AI provider implementation for translation services.
 * Uses local Ollama models for free, offline translations.
 */
export class OllamaProvider extends OpenAIBaseProvider {
  readonly name: string = OLLAMA_CONFIG.name
  readonly version: string = OLLAMA_CONFIG.version
  readonly maxBatchSize: number = OLLAMA_CONFIG.maxBatchSize
  /** Cost per token in USD (free, runs locally) */
  readonly costPerToken: number = OLLAMA_CONFIG.costPerToken
  readonly supportsAdultContent: boolean = OLLAMA_CONFIG.supportsAdultContent
  readonly qualityScore: number = OLLAMA_CONFIG.qualityScore

  protected getBaseUrl(baseUrl?: string): string {
    // Add /v1 to the base URL for OpenAI compatibility
    return `${baseUrl || OLLAMA_DEFAULTS.baseUrl}`
  }

  protected getDefaultModel(): string {
    return getDefaultModelForProvider('ollama')
  }

  protected getDefaultTemperature(): number {
    const defaultModel = this.getDefaultModel()
    const preset = AI_MODEL_PRESETS.ollama[defaultModel]
    return preset?.defaultTemperature || OLLAMA_DEFAULTS.defaultTemperature
  }

  protected isModelSupported(model: string): boolean {
    return isModelSupportedByProvider('ollama', model)
  }

  /**
   * Estimates the cost of translation based on text length.
   * Since Ollama runs locally, cost is always 0.
   * @param text - The text to estimate cost for
   * @returns Object containing estimated tokens and cost (always 0)
   */
  estimateCost(text: string): { tokens: number; cost: number } {
    // Rough estimation: 1 token ≈ 4 characters for English
    const estimatedTokens = Math.ceil(text.length / 4)
    return {
      tokens: estimatedTokens,
      cost: 0 // Ollama is free, runs locally
    }
  }

  /**
   * Validates the Ollama provider configuration.
   * @param config - The configuration to validate
   * @returns Promise resolving to true if config is valid
   */
  async validateConfig(config: AIProviderConfig): Promise<boolean> {
    if (!config.baseUrl) return false
    if (config.model && !this.isModelSupported(config.model)) return false
    if (config.temperature && (config.temperature < 0 || config.temperature > 2)) {
      return false
    }
    
    // Check for correct provider type to prevent misconfiguration
    if (config.providerType !== 'ollama') {
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
} 