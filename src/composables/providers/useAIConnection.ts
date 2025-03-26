import { ref } from 'vue'
import OpenAI from 'openai'
import type { AIConnectionConfig } from '@/types/ai/base'

/**
 * Base composable for managing AI API connections
 * @returns Connection state and methods
 */
export function useAIConnection() {
  const isConnected = ref(false)
  const errors = ref<Array<{ code: string; message: string }>>([])

  async function checkConnection(config: AIConnectionConfig) {
    try {
      const client = new OpenAI({
        apiKey: config.apiKey,
        baseURL: config.baseUrl
      })

      // Try a simple API call to verify connection
      await client.chat.completions.create({
        model: config.model || 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'test' }],
        max_tokens: 1
      })

      isConnected.value = true
      errors.value = []
      return true
    } catch (error) {
      isConnected.value = false
      const errorMessage = error instanceof Error ? error.message : config.errorMessages.default
      
      if (errorMessage.includes('connect')) {
        errors.value.push({ code: 'CONNECTION_FAILED', message: config.errorMessages.connectionFailed })
      } else if (errorMessage.includes('404')) {
        errors.value.push({ code: 'API_NOT_FOUND', message: config.errorMessages.apiNotFound })
      } else if (errorMessage.includes('401') || errorMessage.includes('403')) {
        errors.value.push({ code: 'AUTH_FAILED', message: config.errorMessages.authFailed || config.errorMessages.default })
      } else if (errorMessage.includes('429')) {
        errors.value.push({ code: 'RATE_LIMIT', message: config.errorMessages.rateLimit || config.errorMessages.default })
      } else {
        errors.value.push({ code: 'CONNECTION_ERROR', message: config.errorMessages.default })
      }
      
      return false
    }
  }

  function reset() {
    isConnected.value = false
    errors.value = []
  }

  return {
    isConnected,
    errors,
    checkConnection,
    reset
  }
} 