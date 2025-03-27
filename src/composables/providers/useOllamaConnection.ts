import { useAIConnection } from './useAIConnection'
import {
  OLLAMA_CONFIG
} from '@/config/provider/ai'
import type { AIConnectionConfig } from '@/types/ai/base'

/**
 * Composable for managing Ollama API connection
 * @returns Ollama connection state and methods
 */
export function useOllamaConnection() {
  const { isConnected, isChecking, errors, checkConnection, reset } = useAIConnection()

  /**
   * Check connection to Ollama API
   * @param baseUrl - URL of the Ollama server
   * @param model - Optional model to test connection with
   */
  async function checkOllamaConnection(baseUrl?: string, model?: string) {
    const config: AIConnectionConfig = {
      model: model || OLLAMA_CONFIG.defaultModel,
      baseUrl: baseUrl || OLLAMA_CONFIG.baseUrl,
      apiKey: 'ollama' // Required by OpenAI client but not used by Ollama
    }
    return checkConnection(config, 'ollama')
  }

  return {
    isConnected,
    isChecking,
    errors,
    checkConnection: checkOllamaConnection,
    reset
  }
} 