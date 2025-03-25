import type { StoreState } from '@/types/store/stores'
import { useAIConnection } from './useAIConnection'

/**
 * Composable for managing ChatGPT API connection
 * @param state - Store state for error handling and loading state
 * @returns ChatGPT connection state and methods
 */
export function useChatGPTConnection(state: StoreState) {
  const { isConnected, checkConnection, reset } = useAIConnection(state)

  /**
   * Check connection to ChatGPT API
   * @param apiKey - OpenAI API key
   * @param baseUrl - Optional custom OpenAI API endpoint (e.g. Azure OpenAI)
   */
  async function checkChatGPTConnection(apiKey?: string, baseUrl?: string) {
    return checkConnection({
      provider: 'chatgpt',
      apiKey,
      baseUrl,
      errorMessages: {
        connectionFailed: 'Cannot connect to ChatGPT API.',
        apiNotFound: 'ChatGPT API endpoint not found.',
        authFailed: 'Invalid API key. Please check your OpenAI API key.',
        rateLimit: 'Rate limit exceeded. Please try again later.',
        default: 'ChatGPT connection error'
      }
    })
  }

  return {
    isConnected,
    checkConnection: checkChatGPTConnection,
    reset
  }
} 