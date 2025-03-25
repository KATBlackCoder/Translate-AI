import type { PromptType } from '@/types/ai/base'

export interface TranslationTarget {
  id: string
  field: string
  source: string
  target: string
  context?: string
  file: string
}

export interface TranslationMetadata {
  promptType: PromptType
  modelUsed: string
  processingTime: number
  qualityScore: number
  contentRating?: 'general' | 'teen' | 'mature' | 'adult'
}

export interface TranslationStats {
  totalTokens: number
  totalCost: number
  averageConfidence: number
  failedTranslations: number
  successfulTranslations: number
  totalProcessingTime: number
}

export interface TranslatedText extends TranslationTarget {
  tokens?: {
    total: number
    prompt: number
    completion: number
  }
  metadata?: TranslationMetadata
}

export interface TranslationPrompt {
  system: string
  user: string
}

export interface TranslationRequest {
  text: string
  sourceLanguage: string
  targetLanguage: string
  context?: string
  promptType?: PromptType
  contentRating?: 'general' | 'teen' | 'mature' | 'adult'
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
  metadata?: TranslationMetadata
}

export interface BatchTranslationResult {
  translations: TranslationTarget[]
  stats: TranslationStats
  errors?: Array<{
    text: string
    error: string
    retryCount?: number
  }>
}
