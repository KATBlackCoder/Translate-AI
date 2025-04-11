/**
 * Creates a rate limiter using the token bucket algorithm
 * @param maxTokens Maximum number of tokens (default: 10)
 * @param refillRate Tokens added per interval (default: 1)
 * @param refillInterval Time between refills in ms (default: 1000)
 * @returns Object with acquire method to control rate limiting
 */
export function createRateLimiter(
  maxTokens = 10,
  refillRate = 1,
  refillInterval = 1000
) {
  let tokens = maxTokens
  let lastRefill = Date.now()
  
  function refillTokens() {
    const now = Date.now()
    const timePassed = now - lastRefill
    const tokensToAdd = Math.floor(timePassed / refillInterval) * refillRate
    
    if (tokensToAdd > 0) {
      tokens = Math.min(maxTokens, tokens + tokensToAdd)
      lastRefill = now
    }
  }
  
  return {
    /**
     * Acquires a token, waiting if necessary
     * @returns Promise that resolves when a token is available
     */
    async acquire() {
      refillTokens()
      
      if (tokens <= 0) {
        const waitTime = refillInterval - (Date.now() - lastRefill)
        await new Promise(resolve => setTimeout(resolve, waitTime))
      }
      
      tokens--
    },

    canAcquire(): boolean {
      refillTokens()
      return tokens > 0
    },

    getWaitTime(): number {
      refillTokens()
      if (tokens > 0) return 0
      return refillInterval - (Date.now() - lastRefill)
    },

    getTokens(): number {
      refillTokens()
      return tokens
    },

    reset(): void {
      tokens = maxTokens
      lastRefill = Date.now()
    }
  }
} 