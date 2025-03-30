import type { ContentRating, PromptType } from '@/types/shared/translation'
import type { AIErrorMessages, AIProviderType } from '@/types/ai/base'
import type { AIModelPreset, ProviderMetadata } from '@/types/ai/metadata'
import { AI_SUPPORTED_LANGUAGES } from '@/config/provider/languages'
import { SUPPORTED_PROMPT_TYPES } from '@/config/provider/prompts'

// Ollama language support - varies by model
const OLLAMA_BASIC_LANGUAGES = AI_SUPPORTED_LANGUAGES.filter(lang => 
  ['en', 'es', 'fr', 'de', 'it'].includes(lang)
)

const OLLAMA_EXTENDED_LANGUAGES = AI_SUPPORTED_LANGUAGES.filter(lang => 
  ['en', 'es', 'fr', 'de', 'it', 'pt', 'nl', 'ru', 'zh', 'ja'].includes(lang)
)

/**
 * Ollama provider configuration
 */
export const OLLAMA_CONFIG: ProviderMetadata = {
  name: 'Ollama',
  version: '1.0.0',
  costPerToken: 0, // Free, local inference
  maxBatchSize: 5,
  qualityScore: 0.85,
  supportsAdultContent: true,
  supportedPromptTypes: SUPPORTED_PROMPT_TYPES as PromptType[],
  supportedLanguages: OLLAMA_EXTENDED_LANGUAGES
}

/**
 * Ollama provider default settings
 */
export const OLLAMA_DEFAULTS = {
  providerType: 'ollama' as AIProviderType,
  baseUrl: 'http://localhost:11434/v1',
  defaultModel: 'mistral',
  defaultTemperature: 0.7,
  defaultMaxTokens: 2000,
  retryCount: 3,
  batchSize: 5,
  timeout: 30000,
  contentRating: 'nsfw' as ContentRating,
  supportedModels: [
    'llama2',
    'llama2:13b',
    'llama2-uncensored',
    'mistral',
    'mixtral',
    'phi',
    'dolphin-phi',
    'neural-chat',
    'starling-lm'
  ]
}

/**
 * Model presets with UI metadata and defaults
 */
export const OLLAMA_MODEL_PRESETS: Record<string, AIModelPreset> = {
  'llama2': {
    name: 'Llama 2 (7B)',
    description: 'Meta\'s Llama 2 model, good general performance with language constraints',
    defaultTemperature: 0.7,
    defaultMaxTokens: 2000,
    supportedLanguages: OLLAMA_BASIC_LANGUAGES
  },
  'llama2:13b': {
    name: 'Llama 2 (13B)',
    description: 'Larger version of Llama 2 with better comprehension and accuracy',
    defaultTemperature: 0.7,
    defaultMaxTokens: 2000,
    supportedLanguages: OLLAMA_BASIC_LANGUAGES
  },
  'mistral': {
    name: 'Mistral (7B)',
    description: 'High-quality open model with strong multilingual capabilities',
    defaultTemperature: 0.7,
    defaultMaxTokens: 2000,
    supportedLanguages: OLLAMA_EXTENDED_LANGUAGES
  },
  'mixtral': {
    name: 'Mixtral (8x7B)',
    description: 'Powerful mixture of experts model with excellent translation quality',
    defaultTemperature: 0.7,
    defaultMaxTokens: 2000,
    supportedLanguages: OLLAMA_EXTENDED_LANGUAGES
  }
}

/**
 * Ollama error messages
 */
export const OLLAMA_ERROR_MESSAGES: AIErrorMessages = {
  connectionFailed: 'Cannot connect to local Ollama server. Make sure Ollama is running on your system.',
  apiNotFound: 'Ollama API endpoint not found. Check your Ollama installation.',
  default: 'An error occurred connecting to Ollama.'
}

/**
 * Model-specific error messages
 */
export const OLLAMA_MODEL_ERROR_MESSAGES: Record<string, string> = {
  'llama2': 'Error accessing Llama 2 model. Make sure you\'ve pulled this model with "ollama pull llama2".',
  'llama2:13b': 'Error accessing Llama 2 (13B) model. This larger model requires more RAM and may need to be pulled first.',
  'mistral': 'Error accessing Mistral model. Make sure you\'ve pulled this model with "ollama pull mistral".',
  'mixtral': 'Error accessing Mixtral model. This is a large model requiring significant RAM (16GB+).',
  'default': 'The requested Ollama model is unavailable. Make sure you\'ve pulled the model or check Ollama logs.'
}

/**
 * Creates a default provider configuration for Ollama
 */
export function createOllamaProviderConfig(model?: string, options?: Record<string, unknown>) {
  return {
    providerType: OLLAMA_DEFAULTS.providerType,
    model: model || OLLAMA_DEFAULTS.defaultModel,
    baseUrl: OLLAMA_DEFAULTS.baseUrl,
    temperature: OLLAMA_DEFAULTS.defaultTemperature,
    maxTokens: OLLAMA_DEFAULTS.defaultMaxTokens,
    contentRating: OLLAMA_DEFAULTS.contentRating,
    options
  };
}

/**
 * Check if a model is supported by Ollama
 */
export function isOllamaModelSupported(model: string): boolean {
  return OLLAMA_DEFAULTS.supportedModels.includes(model)
}

/**
 * Get error message for a specific Ollama model
 */
export function getOllamaModelError(model: string): string {
  return OLLAMA_MODEL_ERROR_MESSAGES[model] || OLLAMA_MODEL_ERROR_MESSAGES.default
}

/**
 * Get preset for a specific Ollama model
 */
export function getOllamaModelPreset(model: string): AIModelPreset | undefined {
  return OLLAMA_MODEL_PRESETS[model]
} 