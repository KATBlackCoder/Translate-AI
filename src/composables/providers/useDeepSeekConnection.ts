import { useAIConnection } from './useAIConnection'
import { getDefaultModelForProvider, getErrorMessagesForProvider } from '@/config/aiModelPresets'
import type { AIConnectionConfig } from '@/types/ai/base'

/**
 * Composable for managing DeepSeek API connection
 * @returns DeepSeek connection state and methods
 */
export function useDeepSeekConnection() {
  const { isConnected, errors, checkConnection, reset } = useAIConnection()

  /**
   * Check connection to DeepSeek API
   * @param baseUrl - Optional base URL for DeepSeek API
   * @param apiKey - DeepSeek API key
   */
  async function checkDeepSeekConnection(baseUrl?: string, apiKey?: string) {
    const config: AIConnectionConfig = {
      model: getDefaultModelForProvider('deepseek'),
      baseUrl,
      apiKey,
      errorMessages: getErrorMessagesForProvider('deepseek')
    }
    return checkConnection(config)
  }

  return {
    isConnected,
    errors,
    checkConnection: checkDeepSeekConnection,
    reset
  }
} 