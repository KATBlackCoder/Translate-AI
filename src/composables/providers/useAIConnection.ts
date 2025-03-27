import { ref } from 'vue'
import OpenAI from 'openai'
import type { AIConnectionConfig, AIProviderType, AIErrorMessages } from '@/types/ai/base'
import { getDefaultModelForProvider, getModelError, getErrorMessages } from '@/config/provider/ai'

/**
 * Base composable for managing AI API connections
 * @returns Connection state and methods
 */
export function useAIConnection() {
  const isConnected = ref(false)
  const isChecking = ref(false)
  const errors = ref<Array<{ code: string; message: string }>>([])

  /**
   * Check connection to the AI provider
   * @param config - The connection configuration
   * @param providerType - The type of AI provider
   * @returns True if connection is successful
   */
  async function checkConnection(config: AIConnectionConfig, providerType?: AIProviderType) {
    if (isChecking.value) return false;
    
    // Get error messages from config - needed in both try and catch blocks
    const errorMessages: AIErrorMessages = config.errorMessages || 
      (providerType ? getErrorMessages(providerType) : getErrorMessages('chatgpt'));
    
    try {
      isChecking.value = true;
      errors.value = [];
      
      // Use default model if not specified
      const model = config.model || (providerType ? getDefaultModelForProvider(providerType) : 'gpt-3.5-turbo');
      
      const client = new OpenAI({
        apiKey: config.apiKey || 'sk-test',
        baseURL: config.baseUrl
      })

      // Try a simple API call to verify connection
      await client.chat.completions.create({
        model: model,
        messages: [{ role: 'user', content: 'test' }],
        max_tokens: 1
      })

      isConnected.value = true;
      return true;
    } catch (error) {
      isConnected.value = false;
      
      const errorObj = error as Error;
      const errorMessage = errorObj?.message || errorMessages.default;
      
      // Extract OpenAI error code if available
      const openAIError = error as any;
      const errorCode = openAIError?.error?.code || '';
      
      if (errorMessage.includes('connect') || errorMessage.includes('ECONNREFUSED')) {
        errors.value.push({ 
          code: 'CONNECTION_FAILED', 
          message: errorMessages.connectionFailed 
        });
      } else if (errorMessage.includes('404') || errorCode === 'not_found') {
        errors.value.push({ 
          code: 'API_NOT_FOUND', 
          message: errorMessages.apiNotFound 
        });
      } else if (errorMessage.includes('401') || errorMessage.includes('403') || 
                errorCode === 'invalid_api_key' || errorCode === 'invalid_request_error') {
        errors.value.push({ 
          code: 'AUTH_FAILED', 
          message: errorMessages.authFailed || errorMessages.default 
        });
      } else if (errorMessage.includes('429') || errorCode === 'rate_limit_exceeded') {
        errors.value.push({ 
          code: 'RATE_LIMIT', 
          message: errorMessages.rateLimit || errorMessages.default 
        });
      } else if (errorMessage.includes('model')) {
        errors.value.push({ 
          code: 'MODEL_ERROR', 
          message: providerType && config.model ? 
            getModelError(providerType, config.model) : 
            errorMessages.default 
        });
      } else {
        errors.value.push({ 
          code: 'CONNECTION_ERROR', 
          message: errorMessages.default 
        });
      }
      
      return false;
    } finally {
      isChecking.value = false;
    }
  }

  /**
   * Reset connection state
   */
  function reset() {
    isConnected.value = false;
    isChecking.value = false;
    errors.value = [];
  }

  return {
    isConnected,
    isChecking,
    errors,
    checkConnection,
    reset
  }
} 