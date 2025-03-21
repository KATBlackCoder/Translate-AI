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
import OpenAI from 'openai'
import { prompts } from '@/services/prompts'

export class ChatGPTProvider implements AIProvider {
  readonly name = 'ChatGPT'
  readonly version = '1.0.0'
  readonly supportedLanguages = ['en', 'ja', 'zh', 'ko', 'fr', 'de', 'es', 'it', 'pt', 'ru']
  readonly maxBatchSize = 10
  readonly costPerToken = 0.00002 // $0.02 per 1K tokens for GPT-4
  readonly supportedPromptTypes: PromptType[] = ['general', 'dialogue', 'menu', 'items', 'skills']

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
    const startTime = Date.now()
    const { systemPrompt, userPrompt } = this.buildPrompt(request)
    
    const completion = await this.client.chat.completions.create({
      model: this.config.model || 'gpt-4',
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: userPrompt
        }
      ],
      temperature: this.config.temperature || 0.3,
      max_tokens: this.config.maxTokens || 1000
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
      metadata: {
        promptType: request.promptType || 'general',
        modelUsed: this.config.model || 'gpt-4',
        processingTime,
        qualityScore: 0.95 // GPT models typically have high accuracy
      }
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
    let totalCost = 0
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
            totalCost += response.cost || 0
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
            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, 1000 * retryCount))
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
        totalCost,
        averageConfidence: 0.95,
        failedTranslations,
        successfulTranslations,
        totalProcessingTime: Date.now() - startTime
      },
      errors: errors.length > 0 ? errors : undefined
    }
  }

  validateConfig(config: AIConfig): boolean {
    if (!config.apiKey) return false
    if (config.model && !config.model.startsWith('gpt-')) return false
    if (config.temperature && (config.temperature < 0 || config.temperature > 2)) return false
    if (config.promptType && !this.supportedPromptTypes.includes(config.promptType)) return false
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

  private buildPrompt(request: TranslationRequest): { systemPrompt: string; userPrompt: string } {
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
    
    return { systemPrompt, userPrompt }
  }
} 