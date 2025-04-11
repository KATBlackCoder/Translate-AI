import { OllamaProvider } from './ollama';
import type { AIProvider, AIProviderConfig } from '@/types/ai';
import { AIErrorFactory } from '@/core/ai/base/base-error';

/**
 * Factory for creating AI providers
 */
export class AIProviderFactory {
  private static instance: AIProviderFactory;
  private providers: Map<string, AIProvider>;

  private constructor() {
    this.providers = new Map();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): AIProviderFactory {
    if (!AIProviderFactory.instance) {
      AIProviderFactory.instance = new AIProviderFactory();
    }
    return AIProviderFactory.instance;
  }

  /**
   * Create a provider instance
   * @param name Provider name
   * @param config Provider configuration
   * @returns Provider instance
   */
  public createProvider(name: string, config: AIProviderConfig): AIProvider {
    // Check if provider already exists
    const existingProvider = this.providers.get(name);
    if (existingProvider) {
      return existingProvider;
    }

    // Create new provider
    let provider: AIProvider;
    switch (name.toLowerCase()) {
      case 'ollama':
        provider = new OllamaProvider();
        break;
      default:
        throw AIErrorFactory.validation(`Unsupported provider: ${name}`, 'factory');
    }

    // Store provider
    this.providers.set(name, provider);
    return provider;
  }

  /**
   * Get an existing provider instance
   * @param name Provider name
   * @returns Provider instance or undefined
   */
  public getProvider(name: string): AIProvider | undefined {
    return this.providers.get(name);
  }

  /**
   * Clear all provider instances
   */
  public clearProviders(): void {
    this.providers.clear();
  }
} 