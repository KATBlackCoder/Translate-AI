/**
 * AI Types Index
 * 
 * This file serves as the main entry point for all AI-related types.
 * It re-exports types from @shared and @ai to provide a single import point.
 */

// Re-export shared types
export type { 
  PromptType,
  TranslationMeta,
  TokenUsage,
  Translatable,
  BatchOptions,
  TranslationStats
} from '@/types/shared/core'

export type {
  ResourceTranslation,
  ResourceTranslationResult
} from '@/types/shared/resources'

export type { 
  TranslationRequest,
  TranslationPrompt
} from '@/types/shared/ai'

export type { 
  TranslationError,
  AITranslationError
} from '@/types/shared/errors'

// Re-export language types
export type {
  LanguageCode,
  LanguageInfo,
  LanguagePair,
  LanguageSupport
} from '@/types/shared/languages'

// Re-export AI-specific types
export type {
  AIProvider,
  AIProviderType,
  AIBaseConfig,
  AIErrorMessages,
  AIModelErrorMessages,
  ProviderErrorMessages,
  ProviderMetadata,
  TranslationResponse,
  TranslationProvider,
  ConfigValidator,
  CostEstimator,
  PromptManager
} from '@/types/ai/provider'

export type {
  AIStore
} from '@/types/ai/store'

export type {
  CustomPrompt
} from '@/types/ai/prompt'

export type {
  AIProviderConfig,
  TranslationQualitySettings
} from '@/types/ai/config' 