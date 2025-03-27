import { useAIConnection } from './useAIConnection'
import { 
  CHATGPT_CONFIG
} from '@/config/provider/ai'
import type { AIConnectionConfig } from '@/types/ai/base'

/**
 * Composable for managing ChatGPT API connection
 * @returns ChatGPT connection state and methods
 */
export function useChatGPTConnection() {
  const { isConnected, isChecking, errors, checkConnection, reset } = useAIConnection()

  /**
   * Check connection to ChatGPT API
   * @param apiKey - OpenAI API key
   * @param baseUrl - Optional custom OpenAI API endpoint (e.g. Azure OpenAI)
   * @param model - Optional model to test connection with
   */
  async function checkChatGPTConnection(
    apiKey: string,
    baseUrl?: string,
    model?: string
  ) {
    const config: AIConnectionConfig = {
      model: model || CHATGPT_CONFIG.defaultModel,
      apiKey,
      baseUrl: baseUrl || CHATGPT_CONFIG.baseUrl
    }
    return checkConnection(config, 'chatgpt')
  }

  return {
    isConnected,
    isChecking,
    errors,
    checkConnection: checkChatGPTConnection,
    reset
  }
} 