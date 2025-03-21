import type { AIProvider, AIConfig, TranslationRequest, TranslationResponse, BatchTranslationResult } from '@/types/ai/base'
import type { TranslationTarget } from '@/types/engines/base'
import axios from 'axios'

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
    const prompt = this.buildPrompt(request)
    
    try {
      const { data } = await this.axiosInstance.post<OllamaResponse>('/api/generate', {
        model: this.config.model || 'mistral',
        prompt: prompt,
        stream: false
      })
      return {
        translatedText: data.response.trim(),
        tokens: {
          prompt: data.prompt_eval_count,
          completion: data.eval_count,
          total: data.prompt_eval_count + data.eval_count
        },
        cost: 0 // Free
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
    targetLanguage: string
  ): Promise<BatchTranslationResult> {
    const results: TranslationTarget[] = []
    let totalTokens = 0
    
    // Process in chunks of maxBatchSize
    for (let i = 0; i < targets.length; i += this.maxBatchSize) {
      const batch = targets.slice(i, i + this.maxBatchSize)
      const batchPromises = batch.map(async target => {
        const response = await this.translate({
          text: target.source,
          context: target.context,
          sourceLanguage,
          targetLanguage
        })
        
        totalTokens += response.tokens?.total || 0
        
        return {
          ...target,
          target: response.translatedText
        }
      })
      
      const batchResults = await Promise.all(batchPromises)
      results.push(...batchResults)
    }
    
    return {
      translations: results,
      stats: {
        totalTokens,
        totalCost: 0, // Free
        averageConfidence: 0.85 // Local models might be less accurate
      }
    }
  }

  validateConfig(config: AIConfig): boolean {
    if (config.model && !['mistral', 'llama2', 'codellama', 'neural-chat'].includes(config.model)) {
      return false
    }
    if (config.temperature && (config.temperature < 0 || config.temperature > 2)) {
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

  private buildPrompt(request: TranslationRequest): string {
    let prompt = `Translate the following text from ${request.sourceLanguage} to ${request.targetLanguage}.\n\n`
    
    if (request.context) {
      prompt += `Context: ${request.context}\n`
    }
    
    if (request.instructions) {
      prompt += `Special instructions: ${request.instructions}\n`
    }
    
    prompt += `\nText to translate:\n${request.text}`
    
    return prompt
  }
} 