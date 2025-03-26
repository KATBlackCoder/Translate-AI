// Export base configurations
export * from './languages'
export * from './prompt-types'

// Re-export provider utilities to avoid conflicts
import * as providersModule from './providers'
export {
  BASE_PROVIDER_CONFIG,
  OPENAI_PROVIDER_CONFIG,
  OLLAMA_PROVIDER_CONFIG,
  DEEPSEEK_PROVIDER_CONFIG
} from './providers'

// Export AI provider-specific configurations with their own namespace
import * as aiProviders from './ai'
export { aiProviders }

// Use the legacy provider functions unless specifically importing from AI namespace
export const isModelSupported = providersModule.isModelSupported
export const getProviderConfigByName = providersModule.getProviderConfigByName

// Re-export helper functions from AI providers
export const getModelErrorMessage = aiProviders.getModelErrorMessage
export const getModelPreset = aiProviders.getModelPreset
export const getDefaultModelForProvider = aiProviders.getDefaultModelForProvider
export const getErrorMessagesForProvider = aiProviders.getErrorMessagesForProvider 