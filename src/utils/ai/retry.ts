/**
 * Executes an operation with retry logic using exponential backoff
 * @param operation The async operation to execute
 * @param options Retry configuration options
 * @returns Promise with the operation result
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  options?: {
    maxAttempts?: number
    initialDelay?: number
    maxDelay?: number
    backoffFactor?: number
    retryableErrors?: (error: Error) => boolean
  }
): Promise<T> {
  const config = {
    maxAttempts: options?.maxAttempts || 3,
    initialDelay: options?.initialDelay || 1000,
    maxDelay: options?.maxDelay || 10000,
    backoffFactor: options?.backoffFactor || 2,
    retryableErrors: options?.retryableErrors || (() => true)
  }
  
  let lastError: Error | null = null
  
  for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
    try {
      const result = await operation()
      return result
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      
      if (attempt === config.maxAttempts || !config.retryableErrors(lastError)) {
        throw lastError
      }
      
      const delay = Math.min(
        config.initialDelay * Math.pow(config.backoffFactor, attempt - 1),
        config.maxDelay
      )
      
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  throw lastError
} 