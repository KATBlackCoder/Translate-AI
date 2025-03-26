import { useAIConnection } from './useAIConnection'
import { getDefaultModelForProvider, getErrorMessagesForProvider } from '@/config/aiModelPresets'
import type { AIConnectionConfig } from '@/types/ai/base'

/**
 * Composable for managing ChatGPT API connection
 * @returns ChatGPT connection state and methods
 */
export function useChatGPTConnection() {
  const { isConnected, errors, checkConnection, reset } = useAIConnection()

  /**
   * Check connection to ChatGPT API
   * @param apiKey - OpenAI API key
   * @param baseUrl - Optional custom OpenAI API endpoint (e.g. Azure OpenAI)
   */
  async function checkChatGPTConnection(apiKey?: string, baseUrl?: string) {
    const config: AIConnectionConfig = {
      model: getDefaultModelForProvider('chatgpt'),
      apiKey,
      baseUrl,
      errorMessages: getErrorMessagesForProvider('chatgpt')
    }
    return checkConnection(config)
  }

  return {
    isConnected,
    errors,
    checkConnection: checkChatGPTConnection,
    reset
  }
} 