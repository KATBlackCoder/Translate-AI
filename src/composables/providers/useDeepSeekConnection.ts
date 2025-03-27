import { useAIConnection } from './useAIConnection'
import {
  DEEPSEEK_CONFIG
} from '@/config/provider/ai'
import type { AIConnectionConfig } from '@/types/ai/base'

/**
 * Composable for managing DeepSeek API connection
 * @returns DeepSeek connection state and methods
 */
export function useDeepSeekConnection() {
  const { isConnected, isChecking, errors, checkConnection, reset } = useAIConnection()

  /**
   * Check connection to DeepSeek API
   * @param apiKey - DeepSeek API key
   * @param baseUrl - Optional base URL for DeepSeek API
   * @param model - Optional model to test connection with
   */
  async function checkDeepSeekConnection(
    apiKey: string,
    baseUrl?: string,
    model?: string
  ) {
    const config: AIConnectionConfig = {
      model: model || DEEPSEEK_CONFIG.defaultModel,
      baseUrl: baseUrl || DEEPSEEK_CONFIG.baseUrl,
      apiKey
    }
    return checkConnection(config, 'deepseek')
  }

  return {
    isConnected,
    isChecking,
    errors,
    checkConnection: checkDeepSeekConnection,
    reset
  }
} 