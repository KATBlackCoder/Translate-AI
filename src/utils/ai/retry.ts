export interface RetryOptions {
  maxAttempts?: number
  initialDelay?: number
  maxDelay?: number
  backoffFactor?: number
  retryableErrors?: (error: Error) => boolean
  onRetry?: (attempt: number, error: Error, delay: number) => void
  onSuccess?: (attempt: number) => void
  onFailure?: (attempt: number, error: Error) => void
}

export class RetryManager {
  private static defaultOptions: RetryOptions = {
    maxAttempts: 3,
    initialDelay: 1000,
    maxDelay: 10000,
    backoffFactor: 2,
    retryableErrors: () => true
  }

  private static validateOptions(options: RetryOptions): void {
    if (options.maxAttempts !== undefined && options.maxAttempts <= 0) {
      throw new Error('maxAttempts must be positive')
    }
    if (options.initialDelay !== undefined && options.initialDelay <= 0) {
      throw new Error('initialDelay must be positive')
    }
    if (options.maxDelay !== undefined && options.maxDelay <= 0) {
      throw new Error('maxDelay must be positive')
    }
    if (options.backoffFactor !== undefined && options.backoffFactor <= 0) {
      throw new Error('backoffFactor must be positive')
    }
    if (options.maxDelay !== undefined && options.initialDelay !== undefined && options.maxDelay < options.initialDelay) {
      throw new Error('maxDelay must be greater than or equal to initialDelay')
    }
  }

  private static calculateDelay(attempt: number, config: RetryOptions): number {
    const delay = config.initialDelay! * Math.pow(config.backoffFactor!, attempt - 1)
    return Math.min(delay, config.maxDelay!)
  }

  static async withRetry<T>(
    operation: () => Promise<T>,
    options: RetryOptions = {}
  ): Promise<T> {
    this.validateOptions(options)
    const config = { ...this.defaultOptions, ...options }
    let lastError: Error | null = null

    for (let attempt = 1; attempt <= config.maxAttempts!; attempt++) {
      try {
        const result = await operation()
        config.onSuccess?.(attempt)
        return result
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))
        
        if (attempt === config.maxAttempts || !config.retryableErrors!(lastError)) {
          config.onFailure?.(attempt, lastError)
          throw lastError
        }

        const delay = this.calculateDelay(attempt, config)
        config.onRetry?.(attempt, lastError, delay)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }

    config.onFailure?.(config.maxAttempts!, lastError!)
    throw lastError
  }
} 