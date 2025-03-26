import type { ContentRating } from '@/types/shared/translation'
import type { AIErrorMessages, AIModelPreset } from '@/types/ai/base'
import { AI_SUPPORTED_LANGUAGES } from '../languages'

// Language support varies by model
const MISTRAL_LANGUAGES = AI_SUPPORTED_LANGUAGES.filter(lang => 
  ['en', 'fr', 'de', 'es', 'it', 'ja', 'ko', 'zh'].includes(lang)
)

const LLAMA2_LANGUAGES = AI_SUPPORTED_LANGUAGES.filter(lang => 
  ['en', 'fr', 'de', 'es', 'it', 'ja', 'zh'].includes(lang)
)

const LLAMA3_LANGUAGES = AI_SUPPORTED_LANGUAGES.filter(lang => 
  ['en', 'fr', 'de', 'es', 'it', 'ja', 'ko', 'zh', 'ru'].includes(lang)
)

const CODELLAMA_LANGUAGES = AI_SUPPORTED_LANGUAGES.filter(lang => 
  ['en', 'fr', 'de', 'es', 'ja', 'zh'].includes(lang)
)

/**
 * Ollama provider configuration
 */
export const OLLAMA_CONFIG = {
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
  ],
  baseUrl: 'http://localhost:11434'
}

/**
 * Model presets with UI metadata and defaults
 */
export const OLLAMA_MODEL_PRESETS: Record<string, AIModelPreset> = {
  'mistral': {
    name: 'Mistral',
    description: 'Efficient open source 7B parameter model with good multilingual support',
    defaultTemperature: 0.3,
    defaultMaxTokens: 1000,
    supportedLanguages: MISTRAL_LANGUAGES
  },
  'llama2': {
    name: 'Llama 2',
    description: 'Meta\'s open source LLM, good for general translation tasks',
    defaultTemperature: 0.4,
    defaultMaxTokens: 1000,
    supportedLanguages: LLAMA2_LANGUAGES
  },
  'llama3': {
    name: 'Llama 3',
    description: 'Latest Meta LLM with improved multilingual capabilities',
    defaultTemperature: 0.3,
    defaultMaxTokens: 1000,
    supportedLanguages: LLAMA3_LANGUAGES
  },
  'codellama': {
    name: 'Code Llama',
    description: 'Specialized for code generation, good for translating technical content',
    defaultTemperature: 0.2,
    defaultMaxTokens: 1200,
    supportedLanguages: CODELLAMA_LANGUAGES
  }
}

/**
 * Ollama error messages
 */
export const OLLAMA_ERROR_MESSAGES: AIErrorMessages = {
  connectionFailed: 'Cannot connect to Ollama. Make sure Ollama is running locally.',
  apiNotFound: 'Ollama API endpoint not found. Check if Ollama is installed correctly.',
  authFailed: 'Authentication error. This is unusual for Ollama which doesn\'t require auth.',
  rateLimit: 'Ollama is processing too many requests. Please wait a moment and try again.',
  default: 'An error occurred connecting to Ollama.'
}

/**
 * Model-specific error messages
 */
export const OLLAMA_MODEL_ERROR_MESSAGES: Record<string, string> = {
  'llama3': 'Error loading Llama 3 model. Check if you have pulled this model with "ollama pull llama3".',
  'llama2': 'Error loading Llama 2 model. Check if you have pulled this model with "ollama pull llama2".',
  'mistral': 'Error loading Mistral model. Check if you have pulled this model with "ollama pull mistral".',
  'mixtral': 'Error loading Mixtral model. Check if you have pulled this model and have sufficient RAM (requires >16GB).',
  'phi': 'Error loading Phi model. Check if you have pulled this model with "ollama pull phi".',
  'qwen': 'Error loading Qwen model. Check if you have pulled this model with "ollama pull qwen".',
  'default': 'The requested model is unavailable. Run "ollama list" to see available models or pull this model first.'
}

/**
 * Check if a model is supported by Ollama
 */
export function isOllamaModelSupported(model: string): boolean {
  return OLLAMA_CONFIG.supportedModels.includes(model)
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