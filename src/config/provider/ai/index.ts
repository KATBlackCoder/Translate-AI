// Export all provider configurations
export * from './chatgpt'
export * from './ollama'
export * from './deepseek'

import { 
  CHATGPT_CONFIG, 
  CHATGPT_ERROR_MESSAGES, 
  CHATGPT_MODEL_ERROR_MESSAGES, 
  CHATGPT_MODEL_PRESETS,
  getChatGPTModelError,
  getChatGPTModelPreset
} from './chatgpt'

import { 
  OLLAMA_CONFIG, 
  OLLAMA_ERROR_MESSAGES, 
  OLLAMA_MODEL_ERROR_MESSAGES, 
  OLLAMA_MODEL_PRESETS,
  getOllamaModelError,
  getOllamaModelPreset
} from './ollama'

import { 
  DEEPSEEK_CONFIG, 
  DEEPSEEK_ERROR_MESSAGES, 
  DEEPSEEK_MODEL_ERROR_MESSAGES, 
  DEEPSEEK_MODEL_PRESETS,
  getDeepSeekModelError,
  getDeepSeekModelPreset
} from './deepseek'

import type { AIErrorMessages, AIModelPreset, AIProviderType } from '@/types/ai/base'

/**
 * Map of provider names to their configurations
 */
export const PROVIDER_CONFIGS = {
  chatgpt: CHATGPT_CONFIG,
  ollama: OLLAMA_CONFIG,
  deepseek: DEEPSEEK_CONFIG
}

/**
 * Map of provider names to their error messages
 */
export const PROVIDER_ERROR_MESSAGES = {
  chatgpt: CHATGPT_ERROR_MESSAGES,
  ollama: OLLAMA_ERROR_MESSAGES,
  deepseek: DEEPSEEK_ERROR_MESSAGES
}

/**
 * Map of provider names to their model-specific error messages
 */
export const PROVIDER_MODEL_ERROR_MESSAGES = {
  chatgpt: CHATGPT_MODEL_ERROR_MESSAGES,
  ollama: OLLAMA_MODEL_ERROR_MESSAGES,
  deepseek: DEEPSEEK_MODEL_ERROR_MESSAGES
}

/**
 * Map of provider names to their model presets
 */
export const PROVIDER_MODEL_PRESETS = {
  chatgpt: CHATGPT_MODEL_PRESETS,
  ollama: OLLAMA_MODEL_PRESETS,
  deepseek: DEEPSEEK_MODEL_PRESETS
}

/**
 * Get provider configuration by name
 */
export function getProviderConfigByName(name: AIProviderType) {
  return PROVIDER_CONFIGS[name]
}

/**
 * Get error messages for a provider
 */
export function getErrorMessagesForProvider(name: AIProviderType): AIErrorMessages {
  return PROVIDER_ERROR_MESSAGES[name] || CHATGPT_ERROR_MESSAGES
}

/**
 * Get model-specific error message
 */
export function getModelErrorMessage(provider: AIProviderType, model: string): string {
  switch (provider) {
    case 'chatgpt':
      return getChatGPTModelError(model)
    case 'ollama':
      return getOllamaModelError(model)
    case 'deepseek':
      return getDeepSeekModelError(model)
    default:
      return 'Unknown model error'
  }
}

/**
 * Get model preset for a specific provider and model
 */
export function getModelPreset(provider: AIProviderType, model: string): AIModelPreset | undefined {
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
 * Get default model for a provider
 */
export function getDefaultModelForProvider(provider: AIProviderType): string {
  const config = PROVIDER_CONFIGS[provider]
  return config?.defaultModel || Object.keys(PROVIDER_MODEL_PRESETS[provider])[0] || ''
}

/**
 * Check if a model is supported by a specific provider
 */
export function isModelSupported(provider: AIProviderType, model: string): boolean {
  return PROVIDER_CONFIGS[provider]?.supportedModels.includes(model) || false
} 