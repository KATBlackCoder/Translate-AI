import type { ContentRating } from '@/types/shared/translation'

/**
 * Base provider configuration
 */
export const BASE_PROVIDER_CONFIG = {
  maxBatchSize: 10,
  defaultTimeout: 30000,
  defaultRetryCount: 3,
  cacheDuration: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
}

/**
 * OpenAI provider configuration
 */
export const OPENAI_PROVIDER_CONFIG = {
  name: 'ChatGPT',
  version: '1.0.0',
  costPerToken: 0.000002, // $0.002 per 1000 tokens
  maxBatchSize: 10,
  defaultModel: 'gpt-3.5-turbo',
  defaultTemperature: 0.3,
  defaultMaxTokens: 1000,
  qualityScore: 0.95,
  supportsAdultContent: true,
  contentRating: 'adult' as ContentRating,
  supportedModels: [
    'gpt-3.5-turbo',
    'gpt-3.5-turbo-16k',
    'gpt-4',
    'gpt-4-turbo',
    'gpt-4-32k'
  ],
  modelCosts: {
    'gpt-3.5-turbo': 0.000002, // $0.002 per 1000 tokens
    'gpt-3.5-turbo-16k': 0.000004, // $0.004 per 1000 tokens
    'gpt-4': 0.00003, // $0.03 per 1000 tokens
    'gpt-4-turbo': 0.00001, // $0.01 per 1000 tokens
    'gpt-4-32k': 0.00006 // $0.06 per 1000 tokens
  }
}

/**
 * Ollama provider configuration
 */
export const OLLAMA_PROVIDER_CONFIG = {
  name: 'Ollama',
  version: '1.0.0',
  costPerToken: 0, // Free for local models
  maxBatchSize: 5,
  defaultModel: 'llama3',
  defaultTemperature: 0.3,
  defaultMaxTokens: 1000,
  qualityScore: 0.85,
  supportsAdultContent: true,
  contentRating: 'adult' as ContentRating,
  supportedModels: [
    'llama3',
    'llama2',
    'mistral',
    'mixtral',
    'phi',
    'qwen'
  ]
}

/**
 * DeepSeek provider configuration
 */
export const DEEPSEEK_PROVIDER_CONFIG = {
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
  ]
}

/**
 * Check if a model is supported by a specific provider
 */
export function isModelSupported(provider: string, model: string): boolean {
  switch (provider.toLowerCase()) {
    case 'chatgpt':
      return OPENAI_PROVIDER_CONFIG.supportedModels.includes(model)
    case 'ollama':
      return OLLAMA_PROVIDER_CONFIG.supportedModels.includes(model)
    case 'deepseek':
      return DEEPSEEK_PROVIDER_CONFIG.supportedModels.includes(model)
    default:
      return false
  }
}

/**
 * Get provider configuration by name
 */
export function getProviderConfigByName(name: string) {
  switch (name.toLowerCase()) {
    case 'chatgpt':
      return OPENAI_PROVIDER_CONFIG
    case 'ollama':
      return OLLAMA_PROVIDER_CONFIG
    case 'deepseek':
      return DEEPSEEK_PROVIDER_CONFIG
    default:
      throw new Error(`Unknown provider: ${name}`)
  }
} 