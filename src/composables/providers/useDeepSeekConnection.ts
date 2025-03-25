import type { StoreState } from '@/types/store/stores'
import { useAIConnection } from './useAIConnection'

/**
 * Composable for managing DeepSeek API connection
 * @param state - Store state for error handling and loading state
 * @returns DeepSeek connection state and methods
 */
export function useDeepSeekConnection(state: StoreState) {
  const { isConnected, checkConnection, reset } = useAIConnection(state)

  /**
   * Check connection to DeepSeek API
   * @param baseUrl - Optional base URL for DeepSeek API
   * @param apiKey - DeepSeek API key
   */
  async function checkDeepSeekConnection(baseUrl?: string, apiKey?: string) {
    return checkConnection({
      provider: 'deepseek',
      baseUrl,
      apiKey,
      errorMessages: {
        connectionFailed: 'Cannot connect to DeepSeek. Make sure DeepSeek is running.',
        apiNotFound: 'DeepSeek API endpoint not found. Check if DeepSeek is installed correctly.',
        authFailed: 'Invalid DeepSeek API key. Please check your credentials.',
        default: 'DeepSeek connection error'
      }
    })
  }

  return {
    isConnected,
    checkConnection: checkDeepSeekConnection,
    reset
  }
} 