import type { AIProviderType } from '@/types/ai/base'
import type { PromptType, ContentRating } from '@/types/shared/translation'
import type { AIProvider } from '@/types/ai/provider'
import { isContentRatingSupportedByProvider } from '@/config/provider/prompts'

/**
 * Check if a provider supports a specific prompt type
 * 
 * @param provider The AI provider instance
 * @param promptType The prompt type to check
 * @returns True if the provider supports the prompt type
 */
export function supportsPromptType(
  provider: AIProvider | null, 
  promptType: PromptType
): boolean {
  if (!provider) return false
  return provider.supportedPromptTypes.includes(promptType)
}

/**
 * Check if a provider supports a specific content rating
 * 
 * @param provider The AI provider instance
 * @param providerType The provider type
 * @param model The model identifier
 * @param rating The content rating to check
 * @returns True if the content rating is supported
 */
export function supportsContentRating(
  providerType: AIProviderType,
  model: string,
  rating: ContentRating
): boolean {
  return isContentRatingSupportedByProvider(providerType, model, rating)
}

/**
 * Check if a provider requires an API key
 * 
 * @param providerType The provider type to check
 * @returns True if the provider requires an API key
 */
export function requiresApiKey(providerType: AIProviderType): boolean {
  // Currently only ChatGPT and DeepSeek require API keys
  return providerType === 'chatgpt' || providerType === 'deepseek'
}

/**
 * Get the default base URL for a provider
 * 
 * @param providerType The provider type
 * @returns The default base URL for the provider
 */
export function getDefaultBaseUrl(providerType: AIProviderType): string {
  switch (providerType) {
    case 'chatgpt':
      return 'https://api.openai.com/v1'
    case 'deepseek':
      return 'https://api.deepseek.com/v1'
    case 'ollama':
      return 'http://localhost:11434'
    default:
      return ''
  }
}

/**
 * Check if a provider is local (runs on the user's device)
 * 
 * @param providerType The provider type to check
 * @returns True if the provider is local
 */
export function isLocalProvider(providerType: AIProviderType): boolean {
  // Currently only Ollama is a local provider
  return providerType === 'ollama'
}

/**
 * Get the maximum number of tokens supported by a provider and model
 * 
 * @param providerType The provider type
 * @param model The model identifier
 * @returns The maximum context length in tokens
 */
export function getMaxTokens(providerType: AIProviderType, model: string): number {
  if (providerType === 'chatgpt') {
    if (model === 'gpt-4' || model === 'gpt-4-turbo') {
      return 8000
    }
    return 4000 // gpt-3.5-turbo and others
  }
  
  if (providerType === 'ollama') {
    // These are approximations and may vary by model
    if (model === 'llama2' || model === 'mistral') {
      return 4000
    }
    return 2000 // Default for other models
  }
  
  if (providerType === 'deepseek') {
    // DeepSeek models have varying context lengths
    return 4000 // Default value
  }
  
  return 2000 // Default fallback value
} 