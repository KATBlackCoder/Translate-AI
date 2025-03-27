import type { AIProvider, AIProviderConfig, AIProviderType } from '@/types/ai/base'
import { ChatGPTProvider } from './ai/chatgpt'
import { OllamaProvider } from './ai/ollama'
import { DeepSeekProvider } from './ai/deepseek'
import { 
  isModelSupported, 
  getModelError,
  getDefaultModelForProvider
} from '@/config/provider/ai'

/**
 * Factory class for creating and managing AI providers.
 * Implements singleton pattern for provider instances.
 */
export class AIProviderFactory {
  private static providers: Map<string, AIProvider> = new Map()
  private static readonly CACHE_TTL = 1000 * 60 * 60 // 1 hour
  private static readonly lastAccess: Map<string, number> = new Map()

  /**
   * Generates a unique key for a provider instance
   * @param type - The type of provider
   * @param config - The provider configuration
   * @returns A unique key string
   */
  private static getProviderKey(type: AIProviderType, config: AIProviderConfig): string {
    const modelKey = config.model || getDefaultModelForProvider(type)
    const apiKey = config.apiKey ? config.apiKey.substring(0, 8) : 'local'
    return `${type}-${modelKey}-${apiKey}`
  }

  /**
   * Creates a new provider instance or returns an existing one
   * @param type - The type of provider to create
   * @param config - The provider configuration
   * @returns An AI provider instance
   * @throws {Error} If provider type is unknown or configuration is invalid
   */
  static async createProvider(type: AIProviderType, config: AIProviderConfig): Promise<AIProvider> {
    // Validate model before creating provider
    const model = config.model || getDefaultModelForProvider(type)
    if (!isModelSupported(type, model)) {
      throw new Error(getModelError(type, model))
    }
    
    const key = this.getProviderKey(type, config)
    
    // Check if provider exists and is not expired
    if (this.providers.has(key)) {
      const lastAccessTime = this.lastAccess.get(key) || 0
      if (Date.now() - lastAccessTime < this.CACHE_TTL) {
        this.lastAccess.set(key, Date.now())
        return this.providers.get(key)!
      }
      // Provider exists but is expired, remove it
      this.providers.delete(key)
      this.lastAccess.delete(key)
    }
    
    let provider: AIProvider
    
    try {
      switch (type) {
        case 'chatgpt':
          provider = new ChatGPTProvider(config)
          break
        case 'ollama':
          provider = new OllamaProvider(config)
          break
        case 'deepseek':
          provider = new DeepSeekProvider(config)
          break
        default:
          throw new Error(`Unknown AI provider type: ${type}`)
      }
      
      // Validate provider configuration
      await provider.validateConfig(config)
      
      // Cache the provider
      this.providers.set(key, provider)
      this.lastAccess.set(key, Date.now())
      
      return provider
    } catch (error) {
      // Clean up on error
      this.providers.delete(key)
      this.lastAccess.delete(key)
      throw error
    }
  }

  /**
   * Retrieves an existing provider instance
   * @param type - The type of provider
   * @param config - The provider configuration
   * @returns An AI provider instance
   * @throws {Error} If provider is not found
   */
  static getProvider(type: AIProviderType, config: AIProviderConfig): AIProvider {
    const key = this.getProviderKey(type, config)
    const provider = this.providers.get(key)
    
    if (!provider) {
      throw new Error(`Provider not found for type: ${type}`)
    }
    
    // Update last access time
    this.lastAccess.set(key, Date.now())
    return provider
  }

  /**
   * Removes a provider instance from the cache
   * @param type - The type of provider
   * @param config - The provider configuration
   */
  static removeProvider(type: AIProviderType, config: AIProviderConfig): void {
    const key = this.getProviderKey(type, config)
    this.providers.delete(key)
    this.lastAccess.delete(key)
  }

  /**
   * Cleans up expired providers from the cache
   */
  static cleanup(): void {
    const now = Date.now()
    for (const [key, lastAccessTime] of this.lastAccess.entries()) {
      if (now - lastAccessTime >= this.CACHE_TTL) {
        this.providers.delete(key)
        this.lastAccess.delete(key)
      }
    }
  }

  /**
   * Gets the number of active providers in the cache
   * @returns The number of active providers
   */
  static getActiveProviderCount(): number {
    return this.providers.size
  }
} 