import { ref } from 'vue'
import OpenAI from 'openai'
import type { StoreState } from '@/types/store/stores'
import { createStoreError } from '@/types/store/stores'

interface AIConnectionConfig {
  provider: 'chatgpt' | 'ollama' | 'deepseek'
  baseUrl?: string
  apiKey?: string
  errorMessages: {
    connectionFailed: string
    apiNotFound: string
    authFailed?: string
    rateLimit?: string
    default: string
  }
}

/**
 * Base composable for managing AI provider connections
 * @param state - Store state for error handling and loading state
 * @returns AI connection state and methods
 */
export function useAIConnection(state: StoreState) {
  const isConnected = ref(false)

  async function checkConnection(config: AIConnectionConfig) {
    const { provider, baseUrl, apiKey, errorMessages } = config

    if (!baseUrl && !apiKey) return true

    try {
      state.isLoading = true
      const client = new OpenAI({
        ...(baseUrl && { baseURL: baseUrl }),
        ...(apiKey && { apiKey })
      })
      
      await client.models.list()
      isConnected.value = true
      state.lastUpdated = Date.now()
      return true
    } catch (error) {
      isConnected.value = false
      if (error instanceof Error) {
        if (error.message.includes('ECONNREFUSED')) {
          state.errors.push(createStoreError(
            `${provider.toUpperCase()}_CONNECTION_FAILED`,
            errorMessages.connectionFailed,
            { baseUrl }
          ))
        } else if (error.message.includes('404')) {
          state.errors.push(createStoreError(
            `${provider.toUpperCase()}_API_NOT_FOUND`,
            errorMessages.apiNotFound,
            { baseUrl }
          ))
        } else if (error.message.includes('401') && errorMessages.authFailed) {
          state.errors.push(createStoreError(
            `${provider.toUpperCase()}_AUTH_FAILED`,
            errorMessages.authFailed,
            { apiKey: apiKey?.slice(0, 4) + '...' }
          ))
        } else if (error.message.includes('429') && errorMessages.rateLimit) {
          state.errors.push(createStoreError(
            `${provider.toUpperCase()}_RATE_LIMIT`,
            errorMessages.rateLimit,
            {}
          ))
        } else {
          state.errors.push(createStoreError(
            `${provider.toUpperCase()}_ERROR`,
            errorMessages.default,
            { baseUrl }
          ))
        }
      }
      return false
    } finally {
      state.isLoading = false
    }
  }

  function reset() {
    isConnected.value = false
  }

  return {
    isConnected,
    checkConnection,
    reset
  }
} 