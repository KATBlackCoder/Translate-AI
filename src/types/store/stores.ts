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