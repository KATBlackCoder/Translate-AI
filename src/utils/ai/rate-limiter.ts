export class RateLimiter {
  private tokens: number
  private lastRefill: number
  private readonly maxTokens: number
  private readonly refillRate: number
  private readonly refillInterval: number

  constructor(
    maxTokens: number = 10,
    refillRate: number = 1,
    refillInterval: number = 1000
  ) {
    if (maxTokens <= 0) throw new Error('Max tokens must be positive')
    if (refillRate <= 0) throw new Error('Refill rate must be positive')
    if (refillInterval <= 0) throw new Error('Refill interval must be positive')
    if (refillRate > maxTokens) throw new Error('Refill rate cannot be greater than max tokens')

    this.maxTokens = maxTokens
    this.tokens = maxTokens
    this.lastRefill = Date.now()
    this.refillRate = refillRate
    this.refillInterval = refillInterval
  }

  private refillTokens(): void {
    const now = Date.now()
    const timePassed = now - this.lastRefill
    const tokensToAdd = Math.floor(timePassed / this.refillInterval) * this.refillRate

    if (tokensToAdd > 0) {
      this.tokens = Math.min(this.maxTokens, this.tokens + tokensToAdd)
      this.lastRefill = now
    }
  }

  async acquire(): Promise<void> {
    this.refillTokens()

    if (this.tokens <= 0) {
      const waitTime = this.refillInterval - (Date.now() - this.lastRefill)
      await new Promise(resolve => setTimeout(resolve, waitTime))
    }

    this.tokens--
  }

  canAcquire(): boolean {
    this.refillTokens()
    return this.tokens > 0
  }

  getWaitTime(): number {
    this.refillTokens()
    if (this.tokens > 0) return 0
    return this.refillInterval - (Date.now() - this.lastRefill)
  }

  getTokens(): number {
    this.refillTokens()
    return this.tokens
  }

  reset(): void {
    this.tokens = this.maxTokens
    this.lastRefill = Date.now()
  }
} 