import type { 
  AIProvider, 
  AIConfig, 
  TranslationRequest, 
  TranslationResponse, 
  BatchTranslationResult,
  PromptType,
  TranslationPrompt
} from '@/types/ai/base'
import type { TranslationTarget } from '@/types/engines/base'
import axios from 'axios'
import { prompts } from '@/services/prompts'

interface OllamaResponse {
  response: string
  total_duration: number
  load_duration: number
  prompt_eval_count: number
  eval_count: number
  eval_duration: number
}

export class OllamaProvider implements AIProvider {
  readonly name = 'Ollama'
  readonly version = '1.0.0'
  readonly supportedLanguages = ['en', 'ja', 'zh', 'ko', 'fr', 'de', 'es', 'it', 'pt', 'ru']
  readonly maxBatchSize = 5 // Lower batch size for local processing
  readonly costPerToken = 0 // Free, runs locally
  readonly supportedPromptTypes: PromptType[] = ['general', 'dialogue', 'menu', 'items', 'skills']

  private config: AIConfig
  private baseUrl: string
  private axiosInstance

  constructor(config: AIConfig) {
    this.config = config
    this.baseUrl = config.baseUrl || 'http://localhost:11434'
    this.axiosInstance = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30 second timeout
    })
  }

  async translate(request: TranslationRequest): Promise<TranslationResponse> {
    const startTime = Date.now()
    const prompt = this.buildPrompt(request)
    
    try {
      const { data } = await this.axiosInstance.post<OllamaResponse>('/api/generate', {
        model: this.config.model || 'mistral',
        prompt: prompt,
        stream: false
      })

      const processingTime = Date.now() - startTime
      
      return {
        translatedText: data.response.trim(),
        tokens: {
          prompt: data.prompt_eval_count,
          completion: data.eval_count,
          total: data.prompt_eval_count + data.eval_count
        },
        cost: 0, // Free
        metadata: {
          promptType: request.promptType || 'general',
          modelUsed: this.config.model || 'mistral',
          processingTime,
          qualityScore: 0.85 // Default quality score for local models
        }
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Ollama API error: ${error.response?.data?.message || error.message}`)
      }
      throw error
    }
  }

  async translateBatch(
    targets: TranslationTarget[], 
    sourceLanguage: string, 
    targetLanguage: string,
    options?: {
      promptType?: PromptType
      batchSize?: number
      retryCount?: number
      timeout?: number
    }
  ): Promise<BatchTranslationResult> {
    const results: TranslationTarget[] = []
    const errors: Array<{ text: string; error: string; retryCount?: number }> = []
    let totalTokens = 0
    let successfulTranslations = 0
    let failedTranslations = 0
    const startTime = Date.now()
    
    const batchSize = options?.batchSize || this.maxBatchSize
    const maxRetries = options?.retryCount || 3
    
    // Process in chunks
    for (let i = 0; i < targets.length; i += batchSize) {
      const batch = targets.slice(i, i + batchSize)
      const batchPromises = batch.map(async target => {
        let retryCount = 0
        while (retryCount < maxRetries) {
          try {
            const response = await this.translate({
              text: target.source,
              context: target.context,
              sourceLanguage,
              targetLanguage,
              promptType: options?.promptType
            })
            
            totalTokens += response.tokens?.total || 0
            successfulTranslations++
            
            return {
              ...target,
              target: response.translatedText
            }
          } catch (error) {
            retryCount++
            if (retryCount === maxRetries) {
              failedTranslations++
              errors.push({
                text: target.source,
                error: error instanceof Error ? error.message : 'Unknown error',
                retryCount
              })
              return target // Return original target without translation
            }
          }
        }
        return target
      })
      
      const batchResults = await Promise.all(batchPromises)
      results.push(...batchResults)
    }
    
    return {
      translations: results,
      stats: {
        totalTokens,
        totalCost: 0, // Free
        averageConfidence: 0.85,
        failedTranslations,
        successfulTranslations,
        totalProcessingTime: Date.now() - startTime
      },
      errors: errors.length > 0 ? errors : undefined
    }
  }

  validateConfig(config: AIConfig): boolean {
    if (config.model && !['mistral', 'llama2', 'codellama', 'neural-chat'].includes(config.model)) {
      return false
    }
    if (config.temperature && (config.temperature < 0 || config.temperature > 2)) {
      return false
    }
    if (config.promptType && !this.supportedPromptTypes.includes(config.promptType)) {
      return false
    }
    return true
  }

  estimateCost(text: string): { tokens: number; cost: number } {
    const estimatedTokens = Math.ceil(text.length / 4)
    return {
      tokens: estimatedTokens,
      cost: 0 // Free
    }
  }

  getDefaultPrompt(type: PromptType): TranslationPrompt {
    return prompts[type] || prompts.general
  }

  validatePrompt(prompt: TranslationPrompt): boolean {
    return (
      typeof prompt.system === 'string' &&
      typeof prompt.user === 'string' &&
      prompt.system.length > 0 &&
      prompt.user.length > 0
    )
  }

  private buildPrompt(request: TranslationRequest): string {
    const promptType = request.promptType || 'general'
    const defaultPrompt = this.getDefaultPrompt(promptType)
    
    const systemPrompt = request.systemPrompt || defaultPrompt.system
    let userPrompt = request.userPrompt || defaultPrompt.user
    
    // Replace placeholders in user prompt
    userPrompt = userPrompt
      .replace('{source}', request.sourceLanguage)
      .replace('{target}', request.targetLanguage)
      .replace('{text}', request.text)
      .replace('{context}', request.context || '')
    
    return `${systemPrompt}\n\n${userPrompt}`
  }
} 