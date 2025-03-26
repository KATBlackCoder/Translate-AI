import { useAIConnection } from './useAIConnection'
import { getDefaultModelForProvider, getErrorMessagesForProvider } from '@/config/aiModelPresets'
import type { AIConnectionConfig } from '@/types/ai/base'

/**
 * Composable for managing Ollama API connection
 * @returns Ollama connection state and methods
 */
export function useOllamaConnection() {
  const { isConnected, errors, checkConnection, reset } = useAIConnection()

  async function checkOllamaConnection(baseUrl?: string) {
    const config: AIConnectionConfig = {
      model: getDefaultModelForProvider('ollama'),
      baseUrl,
      apiKey: 'ollama', // Required by OpenAI client but not used by Ollama
      errorMessages: getErrorMessagesForProvider('ollama')
    }
    return checkConnection(config)
  }

  return {
    isConnected,
    errors,
    checkConnection: checkOllamaConnection,
    reset
  }
} 