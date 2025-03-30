import type { ContentRating, PromptType } from '@/types/shared/translation'
import type { AIErrorMessages, AIProviderType } from '@/types/ai/base'
import type { AIModelPreset, ProviderMetadata } from '@/types/ai/metadata'
import { AI_SUPPORTED_LANGUAGES } from '@/config/provider/languages'
import { SUPPORTED_PROMPT_TYPES } from '@/config/provider/prompts'

// GPT model language support
const GPT35_LANGUAGES = AI_SUPPORTED_LANGUAGES.filter(lang => 
  ['en', 'fr', 'de', 'es', 'it', 'ja', 'ko', 'zh', 'ru', 'ar', 'pt'].includes(lang)
)

const GPT4_LANGUAGES = AI_SUPPORTED_LANGUAGES.filter(lang => 
  ['en', 'fr', 'de', 'es', 'it', 'ja', 'ko', 'zh', 'ru', 'ar', 'pt', 'nl'].includes(lang)
)

/**
 * ChatGPT provider configuration
 */
export const CHATGPT_CONFIG: ProviderMetadata = {
  name: 'ChatGPT',
  version: '1.0.0',
  costPerToken: 0.000002, // $0.002 per 1000 tokens
  maxBatchSize: 10,
  qualityScore: 0.95,
  supportsAdultContent: true,
  supportedPromptTypes: SUPPORTED_PROMPT_TYPES as PromptType[],
  supportedLanguages: GPT4_LANGUAGES
}

/**
 * ChatGPT provider default settings
 */
export const CHATGPT_DEFAULTS = {
  providerType: 'chatgpt' as AIProviderType,
  baseUrl: 'https://api.openai.com/v1',
  defaultModel: 'gpt-3.5-turbo',
  defaultTemperature: 0.3,
  defaultMaxTokens: 1000,
  retryCount: 3,
  batchSize: 5,
  timeout: 30000,
  contentRating: 'nsfw' as ContentRating,
  supportedModels: [
    'gpt-3.5-turbo',
    'gpt-3.5-turbo-16k',
    'gpt-4',
    'gpt-4-turbo',
    'gpt-4-32k'
  ]
}

/**
 * Model-specific costs per token
 */
export const CHATGPT_MODEL_COSTS: Record<string, number> = {
  'gpt-3.5-turbo': 0.000002, // $0.002 per 1000 tokens
  'gpt-3.5-turbo-16k': 0.000004, // $0.004 per 1000 tokens
  'gpt-4': 0.00003, // $0.03 per 1000 tokens
  'gpt-4-turbo': 0.00001, // $0.01 per 1000 tokens
  'gpt-4-32k': 0.00006 // $0.06 per 1000 tokens
}

/**
 * Model presets with UI metadata and defaults
 */
export const CHATGPT_MODEL_PRESETS: Record<string, AIModelPreset> = {
  'gpt-3.5-turbo': {
    name: 'GPT-3.5 Turbo',
    description: 'Fast and economical option for most translation tasks',
    defaultTemperature: 0.3,
    defaultMaxTokens: 800,
    supportedLanguages: GPT35_LANGUAGES
  },
  'gpt-4': {
    name: 'GPT-4',
    description: 'Best quality translations with improved context understanding',
    defaultTemperature: 0.2,
    defaultMaxTokens: 1000,
    supportedLanguages: GPT4_LANGUAGES
  },
  'gpt-4-turbo': {
    name: 'GPT-4 Turbo',
    description: 'Latest GPT-4 model with improved performance and lower cost',
    defaultTemperature: 0.2,
    defaultMaxTokens: 1000,
    supportedLanguages: GPT4_LANGUAGES
  }
}

/**
 * ChatGPT error messages
 */
export const CHATGPT_ERROR_MESSAGES: AIErrorMessages = {
  connectionFailed: 'Cannot connect to OpenAI API. Check your internet connection.',
  apiNotFound: 'OpenAI API endpoint not found. The API may have changed or be temporarily unavailable.',
  authFailed: 'Invalid ChatGPT API key. Please check your credentials in settings.',
  rateLimit: 'You have exceeded your OpenAI API quota or rate limit. Check your usage or upgrade your plan.',
  default: 'An error occurred connecting to OpenAI API.'
}

/**
 * Model-specific error messages
 */
export const CHATGPT_MODEL_ERROR_MESSAGES: Record<string, string> = {
  'gpt-3.5-turbo': 'Error accessing GPT-3.5 Turbo. This model may be temporarily unavailable.',
  'gpt-3.5-turbo-16k': 'Error accessing GPT-3.5 Turbo 16K. This model may be temporarily unavailable or your account may not have access.',
  'gpt-4': 'Error accessing GPT-4. Your account may not have access to this model or it may be temporarily unavailable.',
  'gpt-4-turbo': 'Error accessing GPT-4 Turbo. This model may require a paid subscription or it may be temporarily unavailable.',
  'gpt-4-32k': 'Error accessing GPT-4 32K. This model requires special account access and may not be available to all users.',
  'default': 'The requested model is unavailable. Please try another model or check your OpenAI account access.'
}

/**
 * Creates a default provider configuration for ChatGPT
 */
export function createChatGPTProviderConfig(model?: string, apiKey?: string, options?: Record<string, unknown>) {
  return {
    providerType: CHATGPT_DEFAULTS.providerType,
    model: model || CHATGPT_DEFAULTS.defaultModel,
    baseUrl: CHATGPT_DEFAULTS.baseUrl,
    apiKey,
    temperature: CHATGPT_DEFAULTS.defaultTemperature,
    maxTokens: CHATGPT_DEFAULTS.defaultMaxTokens,
    contentRating: CHATGPT_DEFAULTS.contentRating,
    options
  };
}

/**
 * Check if a model is supported by ChatGPT
 */
export function isChatGPTModelSupported(model: string): boolean {
  return CHATGPT_DEFAULTS.supportedModels.includes(model)
}

/**
 * Get cost per token for a specific ChatGPT model
 */
export function getChatGPTModelCost(model: string): number {
  return CHATGPT_MODEL_COSTS[model] || CHATGPT_CONFIG.costPerToken
}

/**
 * Get error message for a specific ChatGPT model
 */
export function getChatGPTModelError(model: string): string {
  return CHATGPT_MODEL_ERROR_MESSAGES[model] || CHATGPT_MODEL_ERROR_MESSAGES.default
}

/**
 * Get preset for a specific ChatGPT model
 */
export function getChatGPTModelPreset(model: string): AIModelPreset | undefined {
  return CHATGPT_MODEL_PRESETS[model]
} 