// Export base configurations
export * from '@/config/provider/languages'
export * from '@/config/provider/prompts'
export * from '@/config/provider/ai/index'

import { 
  AI_MODEL_PRESETS,
  getDefaultModelForProvider,
  getModelPreset,
  isModelSupported,
  getModelError
} from './ai/index'

export {
  AI_MODEL_PRESETS,
  getDefaultModelForProvider,
  getModelPreset,
  isModelSupported,
  getModelError
}

// Re-export constants for convenience at the config level
import { SUPPORTED_PROMPT_TYPES } from '@/config/provider/prompts'
import { AI_SUPPORTED_LANGUAGES } from '@/config/provider/languages'

export {
  SUPPORTED_PROMPT_TYPES,
  AI_SUPPORTED_LANGUAGES
} 