import type { AIProvider, AIConfig, TranslationRequest, TranslationResponse, BatchTranslationResult } from '@/types/ai/base'
import type { TranslationTarget } from '@/types/engines/base'
import OpenAI from 'openai'

export class ChatGPTProvider implements AIProvider {
  readonly name = 'ChatGPT'
  readonly version = '1.0.0'
  readonly supportedLanguages = ['en', 'ja', 'zh', 'ko', 'fr', 'de', 'es', 'it', 'pt', 'ru']
  readonly maxBatchSize = 10
  readonly costPerToken = 0.00002 // $0.02 per 1K tokens for GPT-4

  private client: OpenAI
  private config: AIConfig

  constructor(config: AIConfig) {
    this.config = config
    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseUrl
    })
  }

  async translate(request: TranslationRequest): Promise<TranslationResponse> {
    const prompt = this.buildPrompt(request)
    
    const completion = await this.client.chat.completions.create({
      model: this.config.model || 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a professional translator. Translate the given text accurately while preserving the original meaning and context. Respond only with the translation, no explanations.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: this.config.temperature || 0.3,
      max_tokens: this.config.maxTokens || 1000
    })

    const response = completion.choices[0]?.message?.content || ''
    
    return {
      translatedText: response.trim(),
      tokens: {
        prompt: completion.usage?.prompt_tokens || 0,
        completion: completion.usage?.completion_tokens || 0,
        total: completion.usage?.total_tokens || 0
      },
      cost: (completion.usage?.total_tokens || 0) * this.costPerToken
    }
  }

  async translateBatch(
    targets: TranslationTarget[], 
    sourceLanguage: string, 
    targetLanguage: string
  ): Promise<BatchTranslationResult> {
    const results: TranslationTarget[] = []
    let totalTokens = 0
    let totalCost = 0
    
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
        totalCost += response.cost || 0
        
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
        totalCost,
        averageConfidence: 0.95 // OpenAI doesn't provide confidence scores
      }
    }
  }

  validateConfig(config: AIConfig): boolean {
    if (!config.apiKey) return false
    if (config.model && !config.model.startsWith('gpt-')) return false
    if (config.temperature && (config.temperature < 0 || config.temperature > 2)) return false
    return true
  }

  estimateCost(text: string): { tokens: number; cost: number } {
    // Rough estimation: 1 token ≈ 4 characters for English, may vary for other languages
    const estimatedTokens = Math.ceil(text.length / 4)
    return {
      tokens: estimatedTokens,
      cost: estimatedTokens * this.costPerToken
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