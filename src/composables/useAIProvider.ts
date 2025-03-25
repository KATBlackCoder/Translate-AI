import { ref } from 'vue'
import type { AIProvider } from '@/types/ai/base'
import { AIProviderFactory } from '@/services/providers/factory'
import type { StoreState } from '@/types/store/stores'
import { createStoreError } from '@/types/store/stores'
import { useSettingsStore } from '@/stores/settings'
import { useOllamaConnection } from './providers/useOllamaConnection'
import { useChatGPTConnection } from './providers/useChatGPTConnection'
import { useDeepSeekConnection } from './providers/useDeepSeekConnection'

/**
 * Composable for managing AI provider initialization and state
 * @param state - Store state for error handling and loading state
 * @returns AI provider state and methods
 */
export function useAIProvider(state: StoreState) {
  const settings = useSettingsStore()
  /** Current AI provider instance */
  const provider = ref<AIProvider | null>(null)
  /** Whether provider is being initialized */
  const isVerifying = ref(false)

  const { checkConnection: checkOllamaConnection } = useOllamaConnection(state)
  const { checkConnection: checkChatGPTConnection } = useChatGPTConnection(state)
  const { checkConnection: checkDeepSeekConnection } = useDeepSeekConnection(state)

  /**
   * Initializes the AI provider based on current settings
   * @throws {Error} When provider creation or validation fails
   * @returns {Promise<void>}
   * 
   * @example
   * ```ts
   * const { initializeProvider } = useAIProvider(state)
   * await initializeProvider()
   * ```
   */
  async function initializeProvider() {
    if (!settings.isAIConfigValid) {
      state.errors.push(createStoreError(
        'INVALID_CONFIG',
        'Invalid AI configuration'
      ))
      return
    }

    try {
      isVerifying.value = true
      state.errors = [] // Clear previous errors

      // Check provider-specific connection
      let isConnected = true
      switch (settings.aiProvider) {
        case 'ollama':
          isConnected = await checkOllamaConnection(settings.baseUrl)
          break
        case 'chatgpt':
          isConnected = await checkChatGPTConnection(settings.apiKey)
          break
        case 'deepseek':
          isConnected = await checkDeepSeekConnection(settings.baseUrl)
          break
      }
      if (!isConnected) return

      const config = {
        apiKey: settings.apiKey,
        model: settings.aiModel,
        baseUrl: settings.baseUrl
      }

      const newProvider = await AIProviderFactory.createProvider(settings.aiProvider, config)
      if (!newProvider) {
        state.errors.push(createStoreError(
          'PROVIDER_CREATION_FAILED',
          'Failed to create AI provider',
          { provider: settings.aiProvider }
        ))
        return
      }

      const isValid = await newProvider.validateConfig(config)
      if (!isValid) {
        state.errors.push(createStoreError(
          'INVALID_PROVIDER_CONFIG',
          'Invalid AI provider configuration',
          { provider: settings.aiProvider }
        ))
        return
      }

      provider.value = newProvider
      state.lastUpdated = Date.now()
    } catch (error) {
      state.errors.push(createStoreError(
        'INIT_FAILED',
        error instanceof Error ? error.message : 'Failed to initialize AI provider',
        { provider: settings.aiProvider }
      ))
      provider.value = null
    } finally {
      isVerifying.value = false
    }
  }

  /**
   * Resets the AI provider state
   * @example
   * ```ts
   * const { reset } = useAIProvider(state)
   * reset()
   * ```
   */
  function reset() {
    provider.value = null
  }

  return {
    provider,
    isVerifying,
    initializeProvider,
    reset
  }
} 