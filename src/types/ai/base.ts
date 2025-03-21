import type { TranslationTarget } from '../engines/base'

export type PromptType = 'general' | 'dialogue' | 'menu' | 'items' | 'skills' | 'name'

export interface AIConfig {
  apiKey?: string
  model: string
  temperature?: number
  maxTokens?: number
  baseUrl?: string
  promptType?: PromptType
}

export interface TranslationPrompt {
  system: string
  user: string
}

export interface TranslationRequest {
  text: string
  context?: string
  sourceLanguage: string
  targetLanguage: string
  promptType?: PromptType
  instructions?: string
  systemPrompt?: string
  userPrompt?: string
}

export interface TranslationResponse {
  translatedText: string
  confidence?: number
  tokens?: {
    prompt: number
    completion: number
    total: number
  }
  cost?: number
  metadata?: {
    promptType?: PromptType
    modelUsed?: string
    processingTime?: number
    qualityScore?: number
  }
}

export interface BatchTranslationResult {
  translations: TranslationTarget[]
  stats: {
    totalTokens: number
    totalCost: number
    averageConfidence: number
    failedTranslations?: number
    successfulTranslations?: number
    totalProcessingTime?: number
  }
  errors?: Array<{
    text: string
    error: string
    retryCount?: number
  }>
}

export interface AIProvider {
  readonly name: string
  readonly version: string
  readonly supportedLanguages: string[]
  readonly maxBatchSize: number
  readonly costPerToken: number
  readonly supportedPromptTypes: PromptType[]

  translate(request: TranslationRequest): Promise<TranslationResponse>
  translateBatch(
    targets: TranslationTarget[], 
    sourceLanguage: string, 
    targetLanguage: string, 
    options?: {
      promptType?: PromptType
      batchSize?: number
      retryCount?: number
      timeout?: number
    }
  ): Promise<BatchTranslationResult>
  
  validateConfig(config: AIConfig): boolean
  estimateCost(text: string): { tokens: number; cost: number }
  
  // New methods for prompt handling
  getDefaultPrompt(type: PromptType): TranslationPrompt
  validatePrompt(prompt: TranslationPrompt): boolean
} 