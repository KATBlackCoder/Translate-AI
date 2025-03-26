import { ref } from 'vue'
import type { AIProvider, AIProviderConfig, AIProviderType } from '@/types/ai/base'
import { AIProviderFactory } from '@/services/providers/factory'
import { useOllamaConnection } from './providers/useOllamaConnection'
import { useChatGPTConnection } from './providers/useChatGPTConnection'
import { useDeepSeekConnection } from './providers/useDeepSeekConnection'

/**
 * Composable for managing AI provider initialization and state
 */
export function useAIProvider() {
  /** Current AI provider instance */
  const provider = ref<AIProvider | null>(null)
  /** Whether provider is being initialized */
  const isVerifying = ref(false)
  /** Last error message if any */
  const error = ref<string | null>(null)

  const { checkConnection: checkOllamaConnection } = useOllamaConnection()
  const { checkConnection: checkChatGPTConnection } = useChatGPTConnection()
  const { checkConnection: checkDeepSeekConnection } = useDeepSeekConnection()

  /**
   * Initializes the AI provider
   * @param providerType The AI provider type
   * @param config The provider configuration
   */
  async function initialize(providerType: AIProviderType, config: AIProviderConfig) {
    try {
      error.value = null
      isVerifying.value = true
      
      // Check provider-specific connection
      let isConnected = true
      switch (providerType) {
        case 'ollama':
          isConnected = await checkOllamaConnection(config.baseUrl)
          break
        case 'chatgpt':
          isConnected = await checkChatGPTConnection(config.apiKey)
          break
        case 'deepseek':
          isConnected = await checkDeepSeekConnection(config.baseUrl)
          break
      }
      
      if (!isConnected) {
        error.value = `Failed to connect to ${providerType} service`
        return false
      }

      const newProvider = await AIProviderFactory.createProvider(providerType, config)
      if (!newProvider) {
        error.value = `Failed to create ${providerType} provider`
        return false
      }

      const isValid = await newProvider.validateConfig(config)
      if (!isValid) {
        error.value = `Invalid configuration for ${providerType}`
        return false
      }

      provider.value = newProvider
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error occurred'
      return false
    } finally {
      isVerifying.value = false
    }
  }

  /**
   * Resets the AI provider state
   */
  function reset() {
    provider.value = null
    error.value = null
  }

  return {
    provider,
    isVerifying,
    error,
    initialize,
    reset
  }
} 