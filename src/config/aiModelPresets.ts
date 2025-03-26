import type { AIModelPresets, AIErrorMessages } from '@/types/ai/base'

/**
 * Default error messages for each AI provider
 */
export const providerErrorMessages: Record<string, AIErrorMessages> = {
  ollama: {
    connectionFailed: 'Cannot connect to Ollama. Make sure Ollama is running locally.',
    apiNotFound: 'Ollama API endpoint not found. Check if Ollama is installed correctly.',
    authFailed: 'Authentication error. This is unusual for Ollama which doesn\'t require auth.',
    rateLimit: 'Ollama is processing too many requests. Please wait a moment and try again.',
    default: 'An error occurred connecting to Ollama.'
  },
  chatgpt: {
    connectionFailed: 'Cannot connect to OpenAI API. Check your internet connection.',
    apiNotFound: 'OpenAI API endpoint not found. The API may have changed or be temporarily unavailable.',
    authFailed: 'Invalid ChatGPT API key. Please check your credentials in settings.',
    rateLimit: 'You have exceeded your OpenAI API quota or rate limit. Check your usage or upgrade your plan.',
    default: 'An error occurred connecting to OpenAI API.'
  },
  deepseek: {
    connectionFailed: 'Cannot connect to DeepSeek API. Check your internet connection.',
    apiNotFound: 'DeepSeek API endpoint not found. The API may have changed or be temporarily unavailable.',
    authFailed: 'Invalid DeepSeek API key. Please check your credentials in settings.',
    rateLimit: 'You have exceeded your DeepSeek API quota or rate limit.',
    default: 'An error occurred connecting to DeepSeek API.'
  }
}

/**
 * AI Model presets - contains metadata about available models
 * This data is separated from the settings store for better maintainability
 */
export const aiModelPresets: AIModelPresets = {
  ollama: {
    'mistral': {
      name: 'Mistral',
      description: 'Efficient open source 7B parameter model with good multilingual support',
      defaultTemperature: 0.3,
      defaultMaxTokens: 1000,
      supportedLanguages: ['en', 'fr', 'de', 'es', 'it', 'ja', 'ko', 'zh']
    },
    'llama2': {
      name: 'Llama 2',
      description: 'Meta\'s open source LLM, good for general translation tasks',
      defaultTemperature: 0.4,
      defaultMaxTokens: 1000,
      supportedLanguages: ['en', 'fr', 'de', 'es', 'it', 'ja', 'zh']
    },
    'codellama': {
      name: 'Code Llama',
      description: 'Specialized for code generation, good for translating technical content',
      defaultTemperature: 0.2,
      defaultMaxTokens: 1200,
      supportedLanguages: ['en', 'fr', 'de', 'es', 'ja', 'zh']
    }
  },
  chatgpt: {
    'gpt-3.5-turbo': {
      name: 'GPT-3.5 Turbo',
      description: 'Fast and economical option for most translation tasks',
      defaultTemperature: 0.3,
      defaultMaxTokens: 800,
      supportedLanguages: ['en', 'fr', 'de', 'es', 'it', 'ja', 'ko', 'zh', 'ru', 'ar', 'pt']
    },
    'gpt-4': {
      name: 'GPT-4',
      description: 'Best quality translations with improved context understanding',
      defaultTemperature: 0.2,
      defaultMaxTokens: 1000,
      supportedLanguages: ['en', 'fr', 'de', 'es', 'it', 'ja', 'ko', 'zh', 'ru', 'ar', 'pt', 'nl']
    }
  },
  deepseek: {
    'deepseek-chat': {
      name: 'DeepSeek Chat',
      description: 'General purpose model with good multilingual capabilities',
      defaultTemperature: 0.3,
      defaultMaxTokens: 1000,
      supportedLanguages: ['en', 'zh', 'ja']
    },
    'deepseek-coder': {
      name: 'DeepSeek Coder',
      description: 'Specialized for technical content and programming',
      defaultTemperature: 0.2,
      defaultMaxTokens: 1200,
      supportedLanguages: ['en', 'zh', 'ja']
    }
  }
}

/**
 * Get default model for a provider
 * @param provider The AI provider
 * @returns The default model ID for that provider
 */
export function getDefaultModelForProvider(provider: keyof typeof aiModelPresets): string {
  switch (provider) {
    case 'ollama':
      return 'mistral'
    case 'chatgpt':
      return 'gpt-3.5-turbo'
    case 'deepseek':
      return 'deepseek-chat'
    default:
      return Object.keys(aiModelPresets[provider])[0] || ''
  }
}

/**
 * Get default base URL for a provider
 * @param provider The AI provider
 * @returns The default base URL for that provider
 */
export function getDefaultBaseUrlForProvider(provider: keyof typeof aiModelPresets): string {
  const defaultBaseUrls: Record<keyof typeof aiModelPresets, string> = {
    ollama: 'http://localhost:11434',
    chatgpt: 'https://api.openai.com/v1',
    deepseek: 'https://api.deepseek.com/v1'
  }
  
  return defaultBaseUrls[provider] || ''
}

/**
 * Get error messages for a provider
 * @param provider The AI provider
 * @returns Error message templates for that provider
 */
export function getErrorMessagesForProvider(provider: keyof typeof aiModelPresets): AIErrorMessages {
  return providerErrorMessages[provider as string] || providerErrorMessages.chatgpt
} 

