import { OpenAIBaseProvider } from '@/core/ai/openai-base-provider'
import type { AIProviderConfig } from '@/types/ai/base'
import type { TranslationRequest } from '@/types/shared/translation'
import { aiModelPresets, getDefaultModelForProvider, getDefaultBaseUrlForProvider } from '@/config/aiModelPresets'

/**
 * Ollama AI provider implementation for translation services.
 * Uses local Ollama models for free, offline translations.
 */
export class OllamaProvider extends OpenAIBaseProvider {
  readonly name: string = 'Ollama'
  readonly version: string = '1.0.0'
  readonly maxBatchSize: number = 5
  /** Cost per token in USD (free, runs locally) */
  readonly costPerToken: number = 0
  readonly supportsAdultContent: boolean = true
  readonly contentRating: 'general' | 'teen' | 'mature' | 'adult' = 'adult'

  protected getBaseUrl(baseUrl?: string): string {
    return `${baseUrl || getDefaultBaseUrlForProvider('ollama')}/v1`
  }

  protected getDefaultModel(): string {
    return getDefaultModelForProvider('ollama')
  }

  protected getDefaultTemperature(): number {
    const defaultModel = this.getDefaultModel()
    const preset = aiModelPresets.ollama[defaultModel]
    return preset?.defaultTemperature || 0.3
  }

  protected getQualityScore(): number {
    return 0.85
  }

  protected isModelSupported(model: string): boolean {
    return Object.keys(aiModelPresets.ollama).includes(model)
  }

  protected buildPrompt(request: TranslationRequest): string {
    const formattedPrompt = this.getFormattedPrompt(request)
    return `${formattedPrompt.system}\n\n${formattedPrompt.user}`
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
    if (config.model && !this.isModelSupported(config.model)) return false
    if (config.temperature && (config.temperature < 0 || config.temperature > 2)) {
      return false
    }
    if (config.promptType && !this.supportedPromptTypes.includes(config.promptType)) {
      return false
    }
    if (config.promptType === 'adult' && !this.supportsAdultContent) {
      return false
    }
    return true
  }
} 