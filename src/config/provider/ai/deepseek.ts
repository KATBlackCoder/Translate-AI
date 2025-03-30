import type { ContentRating, PromptType } from '@/types/shared/translation'
import type { AIErrorMessages, AIProviderType } from '@/types/ai/base'
import type { AIModelPreset, ProviderMetadata } from '@/types/ai/metadata'
import { AI_SUPPORTED_LANGUAGES } from '@/config/provider/languages'
import { SUPPORTED_PROMPT_TYPES } from '@/config/provider/prompts'

// DeepSeek language support - limited to English, Chinese, and Japanese
const DEEPSEEK_LANGUAGES = AI_SUPPORTED_LANGUAGES.filter(lang => 
  ['en', 'zh', 'ja'].includes(lang)
)

// DeepSeek supports a subset of prompt types (no adult content)
const DEEPSEEK_PROMPT_TYPES = SUPPORTED_PROMPT_TYPES.filter(type => 
  type !== 'nsfw'
)

/**
 * DeepSeek provider configuration
 */
export const DEEPSEEK_CONFIG: ProviderMetadata = {
  name: 'DeepSeek',
  version: '1.0.0',
  costPerToken: 0.000001, // $0.001 per 1000 tokens
  maxBatchSize: 8,
  qualityScore: 0.90,
  supportsAdultContent: false,
  supportedPromptTypes: DEEPSEEK_PROMPT_TYPES as PromptType[],
  supportedLanguages: DEEPSEEK_LANGUAGES
}

/**
 * DeepSeek provider default settings
 */
export const DEEPSEEK_DEFAULTS = {
  providerType: 'deepseek' as AIProviderType, // Explicit provider identification
  baseUrl: 'https://api.deepseek.com/v1', // API endpoint (verify against latest docs)
  defaultModel: 'deepseek-chat', // Default conversational model
  defaultTemperature: 0.3, // Balanced creativity/focus (0-1 scale)
  defaultMaxTokens: 1000, // Response length limit (adjust per use case)
  retryCount: 3, // Resilient retries for transient errors
  batchSize: 5, // API requests per batch (align with rate limits)
  timeout: 30000, // 30s timeout (balance UX and API reliability)
  contentRating: 'sfw' as ContentRating, // Safety filter default
  supportedModels: [ // Approved model variants
    'deepseek-chat', // General-purpose conversations
    'deepseek-coder' // Code-specific model
  ]
};

/**
 * Model presets with UI metadata and defaults
 */
export const DEEPSEEK_MODEL_PRESETS: Record<string, AIModelPreset> = {
  'deepseek-chat': {
    name: 'DeepSeek Chat',
    description: 'General purpose model with good multilingual capabilities',
    defaultTemperature: 0.3,
    defaultMaxTokens: 1000,
    supportedLanguages: DEEPSEEK_LANGUAGES
  },
  'deepseek-coder': {
    name: 'DeepSeek Coder',
    description: 'Specialized for technical content and programming',
    defaultTemperature: 0.2,
    defaultMaxTokens: 1200,
    supportedLanguages: DEEPSEEK_LANGUAGES
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
 * Creates a default provider configuration for DeepSeek
 */
export function createDeepSeekProviderConfig(model?: string, apiKey?: string, options?: Record<string, unknown>) {
  return {
    providerType: DEEPSEEK_DEFAULTS.providerType,
    model: model || DEEPSEEK_DEFAULTS.defaultModel,
    baseUrl: DEEPSEEK_DEFAULTS.baseUrl,
    apiKey,
    temperature: DEEPSEEK_DEFAULTS.defaultTemperature,
    maxTokens: DEEPSEEK_DEFAULTS.defaultMaxTokens,
    contentRating: DEEPSEEK_DEFAULTS.contentRating,
    options
  };
}

/**
 * Check if a model is supported by DeepSeek
 */
export function isDeepSeekModelSupported(model: string): boolean {
  return DEEPSEEK_DEFAULTS.supportedModels.includes(model)
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