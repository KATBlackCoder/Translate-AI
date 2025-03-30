// Export all provider configurations
export * from '@/config/provider/ai/chatgpt'
export * from '@/config/provider/ai/ollama'
export * from '@/config/provider/ai/deepseek'

import type { AIProviderType, AIErrorMessages } from '@/types/ai/base'
import type { AIModelPreset, AIModelPresets } from '@/types/ai/metadata'

// Import all provider configurations
import { 
  CHATGPT_CONFIG, 
  CHATGPT_DEFAULTS,
  CHATGPT_MODEL_PRESETS,
  CHATGPT_ERROR_MESSAGES,
  CHATGPT_MODEL_ERROR_MESSAGES,
  CHATGPT_MODEL_COSTS,
  createChatGPTProviderConfig,
  getChatGPTModelCost,
  getChatGPTModelError,
  getChatGPTModelPreset,
  isChatGPTModelSupported
} from '@/config/provider/ai/chatgpt'

import { 
  OLLAMA_CONFIG, 
  OLLAMA_DEFAULTS,
  OLLAMA_MODEL_PRESETS,
  OLLAMA_ERROR_MESSAGES,
  OLLAMA_MODEL_ERROR_MESSAGES,
  createOllamaProviderConfig,
  getOllamaModelError,
  getOllamaModelPreset,
  isOllamaModelSupported
} from '@/config/provider/ai/ollama'

import { 
  DEEPSEEK_CONFIG, 
  DEEPSEEK_DEFAULTS,
  DEEPSEEK_MODEL_PRESETS,
  DEEPSEEK_ERROR_MESSAGES,
  DEEPSEEK_MODEL_ERROR_MESSAGES,
  createDeepSeekProviderConfig,
  getDeepSeekModelError,
  getDeepSeekModelPreset,
  isDeepSeekModelSupported
} from '@/config/provider/ai/deepseek'

// Consolidated model presets for all providers
export const AI_MODEL_PRESETS: AIModelPresets = {
  'chatgpt': CHATGPT_MODEL_PRESETS,
  'ollama': OLLAMA_MODEL_PRESETS,
  'deepseek': DEEPSEEK_MODEL_PRESETS
}

// Default error messages for when provider is unknown
export const DEFAULT_ERROR_MESSAGES: AIErrorMessages = {
  connectionFailed: 'Cannot connect to API. Check your internet connection.',
  apiNotFound: 'API endpoint not found. The API may have changed or be temporarily unavailable.',
  authFailed: 'Authentication failed. Please check your credentials.',
  rateLimit: 'Rate limit exceeded. Please try again later.',
  default: 'An error occurred connecting to the API.'
}

// Individual provider exports
export {
  // ChatGPT
  CHATGPT_CONFIG,
  CHATGPT_DEFAULTS,
  CHATGPT_MODEL_PRESETS,
  CHATGPT_ERROR_MESSAGES,
  CHATGPT_MODEL_ERROR_MESSAGES,
  CHATGPT_MODEL_COSTS,
  createChatGPTProviderConfig,
  getChatGPTModelCost,
  getChatGPTModelError,
  getChatGPTModelPreset,
  isChatGPTModelSupported,
  
  // Ollama
  OLLAMA_CONFIG,
  OLLAMA_DEFAULTS,
  OLLAMA_MODEL_PRESETS,
  OLLAMA_ERROR_MESSAGES,
  OLLAMA_MODEL_ERROR_MESSAGES,
  createOllamaProviderConfig,
  getOllamaModelError,
  getOllamaModelPreset,
  isOllamaModelSupported,
  
  // DeepSeek
  DEEPSEEK_CONFIG,
  DEEPSEEK_DEFAULTS,
  DEEPSEEK_MODEL_PRESETS,
  DEEPSEEK_ERROR_MESSAGES,
  DEEPSEEK_MODEL_ERROR_MESSAGES,
  createDeepSeekProviderConfig,
  getDeepSeekModelError,
  getDeepSeekModelPreset,
  isDeepSeekModelSupported
}

/**
 * Get the default model for a specific provider
 */
export function getDefaultModelForProvider(provider: AIProviderType): string {
  switch (provider) {
    case 'chatgpt':
      return CHATGPT_DEFAULTS.defaultModel
    case 'ollama':
      return OLLAMA_DEFAULTS.defaultModel
    case 'deepseek':
      return DEEPSEEK_DEFAULTS.defaultModel
    default:
      return 'gpt-3.5-turbo'
  }
}

/**
 * Get model preset by provider and model ID
 */
export function getModelPreset(
  provider: AIProviderType,
  model: string
): AIModelPreset | undefined {
  switch (provider) {
    case 'chatgpt':
      return getChatGPTModelPreset(model)
    case 'ollama':
      return getOllamaModelPreset(model)
    case 'deepseek':
      return getDeepSeekModelPreset(model)
    default:
      return undefined
  }
}

/**
 * Get error messages for a specific provider
 */
export function getErrorMessages(provider: AIProviderType): AIErrorMessages {
  switch (provider) {
    case 'chatgpt':
      return CHATGPT_ERROR_MESSAGES
    case 'ollama':
      return OLLAMA_ERROR_MESSAGES
    case 'deepseek':
      return DEEPSEEK_ERROR_MESSAGES
    default:
      return DEFAULT_ERROR_MESSAGES
  }
}

/**
 * Check if a model is supported by a given provider
 */
export function isModelSupported(
  provider: AIProviderType,
  model: string
): boolean {
  switch (provider) {
    case 'chatgpt':
      return isChatGPTModelSupported(model)
    case 'ollama':
      return isOllamaModelSupported(model)
    case 'deepseek':
      return isDeepSeekModelSupported(model)
    default:
      return false
  }
}

/**
 * Get an error message for a specific model
 */
export function getModelError(
  provider: AIProviderType,
  model: string
): string {
  switch (provider) {
    case 'chatgpt':
      return getChatGPTModelError(model)
    case 'ollama':
      return getOllamaModelError(model)
    case 'deepseek':
      return getDeepSeekModelError(model)
    default:
      return 'Unknown provider or model'
  }
} 