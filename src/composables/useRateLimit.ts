import { ref, computed } from 'vue'

/**
 * Configuration interface for rate limiting
 * @interface RateLimitConfig
 * @property {number} maxRequests - Maximum number of requests allowed within the reset interval
 * @property {number} resetInterval - Time in milliseconds before the rate limit resets
 */
export interface RateLimitConfig {
  maxRequests: number
  resetInterval: number
}

/**
 * Composable for managing API rate limiting
 * @param {RateLimitConfig} config - Rate limit configuration
 * @param {number} [config.maxRequests=100] - Maximum number of requests allowed
 * @param {number} [config.resetInterval=60000] - Reset interval in milliseconds (default: 1 minute)
 * @returns {Object} Rate limit state and methods
 * @returns {Ref<{requests: number, lastReset: number, maxRequests: number, resetInterval: number}>} rateLimit - Current rate limit state
 * @returns {ComputedRef<boolean>} canMakeRequest - Whether a new request is allowed
 * @returns {() => void} incrementRequests - Function to increment the request counter
 * @returns {() => void} reset - Function to reset the rate limit state
 * @example
 * ```ts
 * const { rateLimit, canMakeRequest, incrementRequests } = useRateLimit({
 *   maxRequests: 50,
 *   resetInterval: 30000 // 30 seconds
 * })
 * ```
 */
export function useRateLimit(config: RateLimitConfig = { maxRequests: 100, resetInterval: 60000 }) {
  const rateLimit = ref({
    requests: 0,
    lastReset: Date.now(),
    maxRequests: config.maxRequests,
    resetInterval: config.resetInterval
  })

  /**
   * Computed property that checks if a new request is allowed
   * Automatically resets the counter if the reset interval has passed
   */
  const canMakeRequest = computed(() => {
    const now = Date.now()
    if (now - rateLimit.value.lastReset > rateLimit.value.resetInterval) {
      rateLimit.value.requests = 0
      rateLimit.value.lastReset = now
      return true
    }
    return rateLimit.value.requests < rateLimit.value.maxRequests
  })

  /**
   * Increments the request counter
   */
  function incrementRequests() {
    rateLimit.value.requests++
  }

  /**
   * Resets the rate limit state to initial values
   */
  function reset() {
    rateLimit.value = {
      requests: 0,
      lastReset: Date.now(),
      maxRequests: config.maxRequests,
      resetInterval: config.resetInterval
    }
  }

  return {
    rateLimit,
    canMakeRequest,
    incrementRequests,
    reset
  }
} 