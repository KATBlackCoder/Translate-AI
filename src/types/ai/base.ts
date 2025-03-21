import type { TranslationTarget } from '../engines/base'

export interface AIConfig {
  apiKey?: string
  model: string
  temperature?: number
  maxTokens?: number
  baseUrl?: string
}

export interface TranslationRequest {
  text: string
  context?: string
  sourceLanguage: string
  targetLanguage: string
  instructions?: string
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
}

export interface BatchTranslationResult {
  translations: TranslationTarget[]
  stats: {
    totalTokens: number
    totalCost: number
    averageConfidence: number
  }
}

export interface AIProvider {
  readonly name: string
  readonly version: string
  readonly supportedLanguages: string[]
  readonly maxBatchSize: number
  readonly costPerToken: number

  translate(request: TranslationRequest): Promise<TranslationResponse>
  translateBatch(targets: TranslationTarget[], sourceLanguage: string, targetLanguage: string): Promise<BatchTranslationResult>
  validateConfig(config: AIConfig): boolean
  estimateCost(text: string): { tokens: number; cost: number }
} 