import type { 
  AIProvider, 
  AIProviderType, 
  AIBaseConfig, 
  AIProviderConfig,
  ProviderMetadata,
  LanguagePair,
  PromptType,
  CustomPrompt,
  LanguageCode,
  TranslationRequest,
  TranslationResponse,
  ResourceTranslation,
  ResourceTranslationResult,
  BatchOptions
} from '@/types/ai';

import { BaseCostEstimator } from './base-cost';
import { BasePromptManager } from './base-prompt';
import { BaseTranslationProvider } from './base-translation';
import { AIErrorFactory } from './base-error';

/**
 * Base class for AI providers
 * Implements common functionality for AI providers by combining
 * cost estimation, prompt management, and translation capabilities
 */
export abstract class BaseAIProvider implements AIProvider {
  /**
   * Provider metadata
   */
  protected abstract readonly metadata: ProviderMetadata;
  
  /**
   * Provider type
   */
  protected abstract readonly type: AIProviderType;
  
  /**
   * Cost estimator for this provider (optional)
   */
  protected costEstimator?: BaseCostEstimator;
  
  /**
   * Prompt manager for this provider (optional)
   */
  protected promptManager?: BasePromptManager;
  
  /**
   * Translation provider (optional)
   */
  protected translationProvider?: BaseTranslationProvider;
  
  /**
   * Get the configuration for this provider
   * @returns The current configuration
   */
  public abstract get config(): AIBaseConfig;
  
  /**
   * Check if a capability is supported
   * @param capability The capability to check
   * @returns True if the capability is supported
   */
  protected isCapabilitySupported<T>(capability: T | undefined): capability is T {
    return capability !== undefined;
  }
  
  /**
   * Check if translation is supported
   * @returns True if translation is supported
   */
  public isTranslationSupported(): boolean {
    return this.isCapabilitySupported(this.translationProvider);
  }
  
  /**
   * Check if cost estimation is supported
   * @returns True if cost estimation is supported
   */
  public isCostEstimationSupported(): boolean {
    return this.isCapabilitySupported(this.costEstimator);
  }
  
  /**
   * Check if prompt management is supported
   * @returns True if prompt management is supported
   */
  public isPromptManagementSupported(): boolean {
    return this.isCapabilitySupported(this.promptManager);
  }
  
  /**
   * Check if a language is supported by this provider
   * @param language The language to check
   * @returns True if the language is supported
   */
  protected isLanguageSupported(language: LanguageCode): boolean {
    return this.supportedLanguages.includes(language);
  }
  
  /**
   * Check if a prompt type is supported by this provider
   * @param type The prompt type to check
   * @returns True if the prompt type is supported
   */
  protected isPromptTypeSupported(type: PromptType): boolean {
    return this.supportedPromptTypes.includes(type);
  }
  
  /**
   * Validate a language pair
   * @param languagePair The language pair to validate
   * @throws Error if either language is not supported
   */
  protected validateLanguagePair(languagePair: LanguagePair): void {
    if (!this.isLanguageSupported(languagePair.source)) {
      throw AIErrorFactory.language(languagePair.source, this.name);
    }
    
    if (!this.isLanguageSupported(languagePair.target)) {
      throw AIErrorFactory.language(languagePair.target, this.name);
    }
  }
  
  /**
   * Validate a prompt type
   * @param type The prompt type to validate
   * @throws Error if the prompt type is not supported
   */
  protected validatePromptType(type: PromptType): void {
    if (!this.isPromptTypeSupported(type)) {
      throw AIErrorFactory.prompt(`Prompt type ${type}`, this.name);
    }
  }
  
  /**
   * Creates a standardized provider metadata object
   * @param metadata Partial metadata to use as base
   * @returns Complete provider metadata object
   */
  protected createProviderMetadata(metadata: Partial<ProviderMetadata>): ProviderMetadata {
    return {
      name: metadata.name || 'Unknown Provider',
      version: metadata.version || '1.0.0',
      costPerToken: metadata.costPerToken || 0,
      maxBatchSize: metadata.maxBatchSize || 10,
      qualityScore: metadata.qualityScore || 0.5,
      supportedPromptTypes: metadata.supportedPromptTypes || [],
      supportedLanguages: metadata.supportedLanguages || [],
      ...metadata
    };
  }
  
  // ProviderMetadata implementation
  public get name(): string {
    return this.metadata.name;
  }
  
  public get version(): string {
    return this.metadata.version;
  }
  
  public get costPerToken(): number {
    return this.metadata.costPerToken;
  }
  
  public get maxBatchSize(): number {
    return this.metadata.maxBatchSize;
  }
  
  public get qualityScore(): number {
    return this.metadata.qualityScore;
  }
  
  public get supportedPromptTypes(): PromptType[] {
    return this.metadata.supportedPromptTypes;
  }
  
  public get supportedLanguages(): LanguageCode[] {
    return this.metadata.supportedLanguages;
  }
  
  // TranslationProvider implementation
  public translate(request: TranslationRequest): Promise<TranslationResponse> {
    if (!this.isTranslationSupported()) {
      throw AIErrorFactory.capability('Translation', this.name);
    }
    return this.translationProvider!.translate(request);
  }
  
  public translateBatch(
    targets: ResourceTranslation[], 
    languagePair: LanguagePair, 
    options?: AIBaseConfig & BatchOptions
  ): Promise<ResourceTranslationResult> {
    if (!this.isTranslationSupported()) {
      throw AIErrorFactory.capability('Translation', this.name);
    }
    return this.translationProvider!.translateBatch(targets, languagePair, options);
  }
  
  // CostEstimator implementation
  public estimateCost(text: string): { tokens: number; cost: number } {
    if (!this.isCostEstimationSupported()) {
      throw AIErrorFactory.capability('Cost estimation', this.name);
    }
    return this.costEstimator!.estimateCost(text);
  }
  
  // PromptManager implementation
  public getDefaultPrompt(type: PromptType): CustomPrompt {
    if (!this.isPromptManagementSupported()) {
      throw AIErrorFactory.capability('Prompt management', this.name);
    }
    return this.promptManager!.getDefaultPrompt(type);
  }
  
  public validatePrompt(prompt: CustomPrompt): boolean {
    if (!this.isPromptManagementSupported()) {
      throw AIErrorFactory.capability('Prompt management', this.name);
    }
    return this.promptManager!.validatePrompt(prompt);
  }
  
  // ConfigValidator implementation
  public abstract validateConfig(config: AIProviderConfig): Promise<boolean>;
} 