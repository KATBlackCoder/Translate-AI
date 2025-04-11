import { BaseAIProvider } from './base-provider';
import OpenAI from 'openai';
import { AIErrorFactory } from './base-error';
import type { 
  AIProviderType, 
  AIBaseConfig, 
  AIProviderConfig,
  ProviderMetadata
} from '@/types/ai';

/**
 * Base class for OpenAI-based providers
 * Extends BaseAIProvider to add OpenAI-specific functionality
 */
export abstract class OpenAIBaseProvider extends BaseAIProvider {
  protected readonly type: AIProviderType = 'chatgpt';
  protected client?: OpenAI;
  
  // These properties are required by the abstract class
  protected abstract readonly metadata: ProviderMetadata;
  public abstract get config(): AIBaseConfig;
  
  /**
   * Validates the OpenAI provider configuration
   * @param config The configuration to validate
   * @returns A promise that resolves to true if the configuration is valid
   * @throws AIProviderError if the configuration is invalid
   */
  public async validateConfig(config: AIProviderConfig): Promise<boolean> {
    // OpenAI-specific validation logic
    if (!config.apiKey) {
      throw AIErrorFactory.config('API key is required for OpenAI providers', this.name);
    }
    
    // Validate model if provided
    if (config.model && !(await this.validateModel(config.model))) {
      throw AIErrorFactory.config(`Model ${config.model} is not supported by this provider`, this.name);
    }
    
    return true;
  }
  
  /**
   * Validates if a model is supported by this provider
   * @param model The model to validate
   * @returns A promise that resolves to true if the model is supported
   */
  protected async validateModel(model: string): Promise<boolean> {
    // This should be overridden by concrete implementations
    // to provide model-specific validation
    return true;
  }
  
  /**
   * Creates an OpenAI client instance
   * @returns A promise that resolves to the OpenAI client
   * @throws AIProviderError if the client cannot be created
   */
  protected async createClient(): Promise<OpenAI> {
    if (!this.config.apiKey) {
      throw AIErrorFactory.config('API key is required to create OpenAI client', this.name);
    }
    
    this.client = new OpenAI({
      apiKey: this.config.apiKey,
      baseURL: this.config.baseUrl,
    });
    
    return this.client;
  }
  
  /**
   * Gets the OpenAI client, creating it if necessary
   * @returns A promise that resolves to the OpenAI client
   */
  protected async getClient(): Promise<OpenAI> {
    if (!this.client) {
      await this.createClient();
    }
    
    return this.client!;
  }
} 