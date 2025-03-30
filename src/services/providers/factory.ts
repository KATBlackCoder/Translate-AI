// src/services/providers/factory.ts
import type { AIProviderType } from '@/types/ai/base'
import type { AIProviderConfig } from '@/types/ai/config'
import type { AIProvider } from '@/types/ai/provider'
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
 * Implements singleton pattern for provider instances with
 * dynamic provider registration capability.
 */
export class AIProviderFactory {
  /** Cache of provider instances by key */
  private static providers: Map<string, AIProvider> = new Map()
  
  /** Time-to-live for cached providers in milliseconds */
  private static readonly CACHE_TTL = 1000 * 60 * 60 // 1 hour
  
  /** Map of last access times for cache expiration */
  private static readonly lastAccess: Map<string, number> = new Map()
  
  /** Registry of provider classes for extensibility */
  private static providerClasses: Record<AIProviderType, new (config: AIProviderConfig) => AIProvider> = {
    'chatgpt': ChatGPTProvider,
    'ollama': OllamaProvider,
    'deepseek': DeepSeekProvider
  }

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
    // Verify provider type matches configuration
    if (config.providerType && config.providerType !== type) {
      throw new Error(`Provider type mismatch: config specifies ${config.providerType} but requested ${type}`)
    }
    
    // Ensure providerType is set in config
    const updatedConfig = { ...config, providerType: type }
    
    // Validate model before creating provider
    const model = updatedConfig.model || getDefaultModelForProvider(type)
    if (!isModelSupported(type, model)) {
      throw new Error(getModelError(type, model))
    }
    
    const key = this.getProviderKey(type, updatedConfig)
    
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
      provider = this.instantiateProvider(type, updatedConfig)
      
      // Validate provider configuration
      await provider.validateConfig(updatedConfig)
      
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
   * Instantiates a provider of the specified type with the given configuration
   * @param type - The type of provider to instantiate
   * @param config - The provider configuration
   * @returns A new provider instance
   * @throws {Error} If the provider type is not supported
   * @private
   */
  private static instantiateProvider(type: AIProviderType, config: AIProviderConfig): AIProvider {
    const ProviderClass = this.providerClasses[type]
    
    if (!ProviderClass) {
      throw new Error(`Unknown AI provider type: ${type}`)
    }
    
    return new ProviderClass(config)
  }

  /**
   * Retrieves an existing provider instance
   * @param type - The type of provider
   * @param config - The provider configuration
   * @returns An AI provider instance
   * @throws {Error} If provider is not found
   */
  static getProvider(type: AIProviderType, config: AIProviderConfig): AIProvider {
    // Ensure providerType is set for key generation
    const updatedConfig = { ...config, providerType: type }
    const key = this.getProviderKey(type, updatedConfig)
    const provider = this.providers.get(key)
    
    if (!provider) {
      throw new Error(`Provider not found for type: ${type}`)
    }
    
    // Update last access time
    this.lastAccess.set(key, Date.now())
    return provider
  }

  /**
   * Registers a new provider type with the factory.
   * This allows extending supported providers without modifying the factory code.
   * 
   * @param type - The type identifier for the provider
   * @param providerClass - The provider class constructor
   */
  static registerProvider(type: string, providerClass: new (config: AIProviderConfig) => AIProvider): void {
    this.providerClasses[type as AIProviderType] = providerClass
    
    // Clear any cached instances for this provider type
    this.cleanup();
  }

  /**
   * Type guard to check if a string is a supported provider type.
   * 
   * @param type - The string to check
   * @returns True if the string is a supported provider type
   */
  static isProviderSupported(type: string): type is AIProviderType {
    return type in this.providerClasses
  }

  /**
   * Get a list of all supported provider types
   * 
   * @returns Array of supported provider types
   */
  static getSupportedProviders(): AIProviderType[] {
    return Object.keys(this.providerClasses) as AIProviderType[]
  }

  /**
   * Removes a provider instance from the cache
   * @param type - The type of provider
   * @param config - The provider configuration
   */
  static removeProvider(type: AIProviderType, config: AIProviderConfig): void {
    // Ensure providerType is set for key generation
    const updatedConfig = { ...config, providerType: type }
    const key = this.getProviderKey(type, updatedConfig)
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
  
  /**
   * Detects the appropriate provider type based on configuration.
   * Useful for auto-selecting provider when user doesn't specify one.
   * 
   * @param config - Partial configuration to analyze
   * @returns The best matching provider type, or null if none found
   */
  static detectProviderType(config: Partial<AIProviderConfig>): AIProviderType | null {
    // If provider type is explicitly specified, use it
    if (config.providerType && this.isProviderSupported(config.providerType)) {
      return config.providerType;
    }
    
    // If API key is provided, likely OpenAI/ChatGPT
    if (config.apiKey) {
      // Check if URL matches DeepSeek
      if (config.baseUrl?.includes('deepseek')) {
        return 'deepseek';
      }
      // Default to ChatGPT for API keys
      return 'chatgpt';
    }
    
    // If localhost or local URL, likely Ollama
    if (config.baseUrl?.includes('localhost') || 
        config.baseUrl?.includes('127.0.0.1') ||
        config.baseUrl?.includes('local')) {
      return 'ollama';
    }
    
    // No clear indicators
    return null;
  }
}