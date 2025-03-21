import type { AIProvider, AIConfig } from '@/types/ai/base'
import { ChatGPTProvider } from './chatgpt'
import { OllamaProvider } from './ollama'
import { DeepSeekProvider } from './deepseek'

export type AIProviderType = 'chatgpt' | 'ollama' | 'deepseek'

export class AIProviderFactory {
  private static providers: Map<string, AIProvider> = new Map()

  private static getProviderKey(type: AIProviderType, config: AIConfig): string {
    return `${type}-${config.model}-${config.apiKey || 'local'}`
  }

  static createProvider(type: AIProviderType, config: AIConfig): AIProvider {
    const key = this.getProviderKey(type, config)
    
    if (this.providers.has(key)) {
      return this.providers.get(key)!
    }
    
    let provider: AIProvider
    
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
    
    if (!provider.validateConfig(config)) {
      throw new Error(`Invalid configuration for provider ${type}`)
    }
    
    this.providers.set(key, provider)
    return provider
  }

  static getProvider(type: AIProviderType, config: AIConfig): AIProvider {
    const key = this.getProviderKey(type, config)
    const provider = this.providers.get(key)
    if (!provider) {
      throw new Error('Provider not found')
    }
    return provider
  }
} 