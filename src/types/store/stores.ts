/**
 * Base state interface for all stores
 */
/*export interface StoreState {
  isLoading: boolean
  errors: StoreError[]
  lastUpdated: number
}
*/
/**
 * Error tracking interface
 */
export interface StoreError {
  code: string
  message: string
  timestamp: number
  metadata?: Record<string, unknown>
}

/**
 * Translation statistics interface
 */
export interface TranslationStats {
  totalTokens: number
  totalCost: number
  successCount: number
  failureCount: number
  averageTime: number
}

/**
 * Type guard for StoreError
 */
export function isStoreError(error: unknown): error is StoreError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error &&
    'timestamp' in error
  )
}

/**
 * Type guard for TranslationStats
 */
export function isValidStats(stats: unknown): stats is TranslationStats {
  return (
    typeof stats === 'object' &&
    stats !== null &&
    'totalTokens' in stats &&
    'totalCost' in stats &&
    'successCount' in stats &&
    'failureCount' in stats &&
    'averageTime' in stats
  )
}

/**
 * Helper to create a new StoreError
 */
export function createStoreError(
  code: string,
  message: string,
  metadata?: Record<string, unknown>
): StoreError {
  return {
    code,
    message,
    timestamp: Date.now(),
    metadata
  }
}

/**
 * Helper to create initial TranslationStats
 */
export function createInitialStats(): TranslationStats {
  return {
    totalTokens: 0,
    totalCost: 0,
    successCount: 0,
    failureCount: 0,
    averageTime: 0
  }
} 