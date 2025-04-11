/**
 * Engine Types Index
 * 
 * This file serves as the main entry point for all engine-related types.
 * It re-exports types from @shared and @engines to provide a single import point.
 */

// Re-export shared types
export type { 
  ResourceTranslation,
  ResourceTranslationResult
} from '@/types/shared/resources'

export type { 
  BatchOptions
} from '@/types/shared/core'

export type { 
  TranslationError
} from '@/types/shared/errors'

export type {
  LanguageCode,
  LanguagePair,
  LanguageSupport
} from '@/types/shared/languages'

// Re-export engine-specific types
export type {
  EngineType,
  PathConfiguration,
  EngineSettings,
  GameResourceFile,
  EngineValidation,
  ResourceTranslator,
  GameEngine
} from '@/types/engines/base'

export type {
  EngineResourceTranslator
} from '@/types/engines/translator'

// Re-export RPGMV specific types
export * from '@/types/engines/rpgmv' 