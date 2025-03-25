import type { StoreState } from '@/types/store/stores'
import { useAIConnection } from './useAIConnection'

/**
 * Composable for managing Ollama API connection
 * @param state - Store state for error handling and loading state
 * @returns Ollama connection state and methods
 */
export function useOllamaConnection(state: StoreState) {
  const { isConnected, checkConnection, reset } = useAIConnection(state)

  async function checkOllamaConnection(baseUrl?: string) {
    return checkConnection({
      provider: 'ollama',
      baseUrl,
      apiKey: 'ollama', // Required by OpenAI client but not used by Ollama
      errorMessages: {
        connectionFailed: 'Cannot connect to Ollama. Make sure Ollama is running.',
        apiNotFound: 'Ollama API endpoint not found. Check if Ollama is installed correctly.',
        default: 'Ollama connection error'
      }
    })
  }

  return {
    isConnected,
    checkConnection: checkOllamaConnection,
    reset
  }
} 