import type { 
  TranslationTarget,
  TranslationPrompt,
  TranslationRequest,
  TranslationResponse,
  BatchTranslationResult
} from '@/types/shared/translation'

/**
 * Types of prompts available for translation
 */
export type PromptType = 'general' | 'dialogue' | 'menu' | 'items' | 'skills' | 'name' | 'adult'

/**
 * Settings for translation quality control
 */
export interface TranslationQualitySettings {
  temperature: number
  maxTokens: number
  retryCount: number
  batchSize: number
  timeout: number
}

/**
 * Settings for custom prompts by type
 */
export interface PromptSettings {
  customPrompts: Record<PromptType, {
    system?: string
    user?: string
  }>
}

/**
 * Configuration for AI providers
 */
export interface AIConfig {
  apiKey?: string
  model: string
  temperature?: number
  maxTokens?: number
  baseUrl?: string
  promptType?: PromptType
  isAdult?: boolean
  contentRating?: 'general' | 'teen' | 'mature' | 'adult'
}

/**
 * Base interface for all AI providers
 */
export interface AIProvider {
  readonly name: string
  readonly version: string
  readonly supportedLanguages: string[]
  readonly maxBatchSize: number
  readonly costPerToken: number
  readonly supportedPromptTypes: PromptType[]
  readonly supportsAdultContent: boolean
  readonly contentRating?: 'general' | 'teen' | 'mature' | 'adult'

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
      isAdult?: boolean
      contentRating?: 'general' | 'teen' | 'mature' | 'adult'
    }
  ): Promise<BatchTranslationResult>
  
  validateConfig(config: AIConfig): Promise<boolean>
  estimateCost(text: string): { tokens: number; cost: number }
  
  getDefaultPrompt(type: PromptType): TranslationPrompt
  validatePrompt(prompt: TranslationPrompt): boolean
} 