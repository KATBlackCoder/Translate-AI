import type { ContentRating } from '@/types/shared/translation'
import type { AIErrorMessages, AIModelPreset } from '@/types/ai/base'
import { AI_SUPPORTED_LANGUAGES } from '../languages'

// DeepSeek only supports a subset of languages
const DEEPSEEK_SUPPORTED_LANGUAGES = AI_SUPPORTED_LANGUAGES.filter(lang => 
  ['en', 'zh', 'ja'].includes(lang)
)

/**
 * DeepSeek provider configuration
 */
export const DEEPSEEK_CONFIG = {
  name: 'DeepSeek',
  version: '1.0.0',
  costPerToken: 0.000001, // $0.001 per 1000 tokens
  maxBatchSize: 8,
  defaultModel: 'deepseek-chat',
  defaultTemperature: 0.3,
  defaultMaxTokens: 1000,
  qualityScore: 0.90,
  supportsAdultContent: false,
  contentRating: 'general' as ContentRating,
  supportedModels: [
    'deepseek-chat',
    'deepseek-coder'
  ],
  baseUrl: 'https://api.deepseek.com/v1'
}

/**
 * Model presets with UI metadata and defaults
 */
export const DEEPSEEK_MODEL_PRESETS: Record<string, AIModelPreset> = {
  'deepseek-chat': {
    name: 'DeepSeek Chat',
    description: 'General purpose model with good multilingual capabilities',
    defaultTemperature: 0.3,
    defaultMaxTokens: 1000,
    supportedLanguages: DEEPSEEK_SUPPORTED_LANGUAGES
  },
  'deepseek-coder': {
    name: 'DeepSeek Coder',
    description: 'Specialized for technical content and programming',
    defaultTemperature: 0.2,
    defaultMaxTokens: 1200,
    supportedLanguages: DEEPSEEK_SUPPORTED_LANGUAGES
  }
}

/**
 * DeepSeek error messages
 */
export const DEEPSEEK_ERROR_MESSAGES: AIErrorMessages = {
  connectionFailed: 'Cannot connect to DeepSeek API. Check your internet connection.',
  apiNotFound: 'DeepSeek API endpoint not found. The API may have changed or be temporarily unavailable.',
  authFailed: 'Invalid DeepSeek API key. Please check your credentials in settings.',
  rateLimit: 'You have exceeded your DeepSeek API quota or rate limit.',
  default: 'An error occurred connecting to DeepSeek API.'
}

/**
 * Model-specific error messages
 */
export const DEEPSEEK_MODEL_ERROR_MESSAGES: Record<string, string> = {
  'deepseek-chat': 'Error accessing DeepSeek Chat model. Check your API access or account subscription.',
  'deepseek-coder': 'Error accessing DeepSeek Coder model. This specialized model may require additional permissions.',
  'default': 'The requested DeepSeek model is unavailable. Please check your API access or try another model.'
}

/**
 * Check if a model is supported by DeepSeek
 */
export function isDeepSeekModelSupported(model: string): boolean {
  return DEEPSEEK_CONFIG.supportedModels.includes(model)
}

/**
 * Get error message for a specific DeepSeek model
 */
export function getDeepSeekModelError(model: string): string {
  return DEEPSEEK_MODEL_ERROR_MESSAGES[model] || DEEPSEEK_MODEL_ERROR_MESSAGES.default
}

/**
 * Get preset for a specific DeepSeek model
 */
export function getDeepSeekModelPreset(model: string): AIModelPreset | undefined {
  return DEEPSEEK_MODEL_PRESETS[model]
} 