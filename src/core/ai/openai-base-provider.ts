import type { AIProviderConfig } from '@/types/ai/base'
import type { 
  TranslationRequest, 
  TranslationResponse, 
  TranslationPrompt,
  ContentRating,
  PromptType
} from '@/types/shared/translation'
import OpenAI from 'openai'
import { BaseProvider } from './base-provider'

/**
 * Base class for OpenAI-compatible AI providers.
 * Handles common OpenAI client functionality and configuration.
 */
export abstract class OpenAIBaseProvider extends BaseProvider {
  protected readonly client: OpenAI
  abstract readonly supportsAdultContent: boolean
  abstract readonly qualityScore: number

  constructor(config: AIProviderConfig) {
    super(config)
    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: this.getBaseUrl(config.baseUrl)
    })
  }

  /**
   * Gets the base URL for the provider.
   * @param baseUrl - Optional custom base URL
   * @returns The base URL for the provider
   */
  protected abstract getBaseUrl(baseUrl?: string): string

  /**
   * Gets the default model name for the provider.
   * @returns The default model name
   */
  protected abstract getDefaultModel(): string

  /**
   * Gets the default temperature for the provider.
   * @returns The default temperature value
   */
  protected abstract getDefaultTemperature(): number

  /**
   * Validates if a model is supported by the provider.
   * @param model - The model name to validate
   * @returns True if the model is supported
   */
  protected abstract isModelSupported(model: string): boolean

  /**
   * Performs translation using OpenAI's chat completion API.
   * @param request - The translation request containing text and context
   * @returns Promise resolving to the translation response with metadata
   */
  protected async performTranslation(request: TranslationRequest): Promise<TranslationResponse> {
    const startTime = Date.now()
    const formattedPrompt = this.getFormattedPrompt(request)
    const openaiConfig = this.config as AIProviderConfig
    const model = openaiConfig.model || this.getDefaultModel()
    
    if (!this.isModelSupported(model)) {
      throw new Error(`Model ${model} is not supported by ${this.name}`)
    }

    if (request.contentType === 'nsfw' && !this.supportsAdultContent) {
      throw new Error('This provider does not support NSFW content')
    }

    const completion = await this.client.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content: formattedPrompt.system
        },
        {
          role: 'user',
          content: formattedPrompt.user
        }
      ],
      temperature: openaiConfig.temperature || this.getDefaultTemperature(),
      max_tokens: openaiConfig.maxTokens || 1000
    })

    const response = completion.choices[0]?.message?.content || ''
    const processingTime = Date.now() - startTime
    
    return {
      translatedText: response.trim(),
      tokens: {
        prompt: completion.usage?.prompt_tokens || 0,
        completion: completion.usage?.completion_tokens || 0,
        total: completion.usage?.total_tokens || 0
      },
      cost: (completion.usage?.total_tokens || 0) * this.costPerToken,
      meta: {
        processingTime,
        qualityScore: this.qualityScore,
        contentRating: request.contentType === 'nsfw' ? 'nsfw' as ContentRating : 'sfw' as ContentRating
      }
    }
  }

  /**
   * Builds the prompt for the OpenAI provider.
   * @param request - The translation request
   * @returns Formatted prompt string
   */
  protected buildPrompt(request: TranslationRequest): string {
    const formattedPrompt = this.getFormattedPrompt(request)
    return `${formattedPrompt.system}\n\n${formattedPrompt.user}`
  }

  /**
   * Formats the translation prompt with the given request parameters.
   * @param request - The translation request
   * @returns Formatted prompt with system and user messages
   */
  protected getFormattedPrompt(request: TranslationRequest): TranslationPrompt {
    const contentType = (request.contentType || 'general') as PromptType
    const defaultPrompt = this.getDefaultPrompt(contentType)
    const userPrompt = defaultPrompt.user
      .replace('{source}', request.sourceLanguage)
      .replace('{target}', request.targetLanguage)
      .replace('{text}', request.text)
      .replace('{context}', request.context || '')
    
    return {
      system: defaultPrompt.system,
      user: userPrompt
    }
  }

  /**
   * Validate the configuration for OpenAI providers
   * @param config - The configuration to validate
   */
  async validateConfig(config: AIProviderConfig): Promise<boolean> {
    if (!config.apiKey) {
      throw new Error('API key is required')
    }
    
    if (config.model && !this.isModelSupported(config.model)) {
      throw new Error(`Model ${config.model} is not supported`)
    }
    
    return true
  }
} 