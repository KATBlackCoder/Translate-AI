interface CacheEntry<T> {
  value: T
  timestamp: number
}

export class CacheManager {
  private cache: Map<string, CacheEntry<unknown>>
  private readonly ttl: number
  private readonly maxSize: number

  constructor(ttl: number = 5 * 60 * 1000, maxSize: number = 1000) { // 5 minutes default, 1000 entries max
    if (ttl <= 0) throw new Error('TTL must be positive')
    if (maxSize <= 0) throw new Error('Max size must be positive')
    
    this.cache = new Map()
    this.ttl = ttl
    this.maxSize = maxSize
  }

  get<T>(key: string): T | null {
    if (!key) throw new Error('Key cannot be empty')
    
    const entry = this.cache.get(key) as CacheEntry<T> | undefined

    if (!entry) {
      return null
    }

    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key)
      return null
    }

    return entry.value
  }

  set<T>(key: string, value: T): void {
    if (!key) throw new Error('Key cannot be empty')
    if (value === undefined) throw new Error('Value cannot be undefined')

    // If cache is full, remove oldest entry
    if (this.cache.size >= this.maxSize) {
      const entries = Array.from(this.cache.entries())
      if (entries.length > 0) {
        const oldestKey = entries
          .sort(([, a], [, b]) => a.timestamp - b.timestamp)[0][0]
        this.cache.delete(oldestKey)
      }
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now()
    })
  }

  clear(): void {
    this.cache.clear()
  }

  delete(key: string): void {
    if (!key) throw new Error('Key cannot be empty')
    this.cache.delete(key)
  }

  has(key: string): boolean {
    if (!key) throw new Error('Key cannot be empty')
    
    const entry = this.cache.get(key)
    if (!entry) return false
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key)
      return false
    }
    return true
  }

  size(): number {
    return this.cache.size
  }

  isEmpty(): boolean {
    return this.cache.size === 0
  }

  keys(): string[] {
    return Array.from(this.cache.keys())
  }

  entries<T>(): Array<[string, T]> {
    return Array.from(this.cache.entries())
      .filter(([, entry]) => Date.now() - entry.timestamp <= this.ttl)
      .map(([key, entry]) => [key, entry.value as T])
  }

  getTTL(key: string): number | null {
    if (!key) throw new Error('Key cannot be empty')
    
    const entry = this.cache.get(key)
    if (!entry) return null
    
    const remaining = this.ttl - (Date.now() - entry.timestamp)
    return remaining > 0 ? remaining : null
  }
} 