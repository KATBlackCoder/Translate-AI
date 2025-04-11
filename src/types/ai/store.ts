import type { Ref } from 'vue'
import type { 
  AIProvider, 
  TranslationResponse, 
  AIProviderType, 
  ProviderMetadata,
  PromptType,
  ResourceTranslation, 
  ResourceTranslationResult,
  LanguagePair
} from '@/types/ai'
import type { AIServiceConfig } from '@/types/ai/config'

// ============================================================
// MODEL METADATA
// ============================================================

/**
 * AI model preset metadata
 * 
 * Contains information about an AI model used for UI display
 * and setting appropriate defaults for the model.
 */
export interface AIModelPreset {
  /** Human-readable display name of the model */
  name: string
  
  /** Detailed description of the model's capabilities */
  description: string
  
  /** Recommended default temperature parameter for best results */
  defaultTemperature: number
  
  /** Recommended default token limit for outputs */
  defaultMaxTokens: number
  
  /** Languages this model can effectively handle (if limited) */
  supportedLanguages?: string[]
}

/**
 * Collection of AI model presets organized by provider and model ID
 * 
 * Used for populating UI dropdowns and retrieving appropriate
 * default settings for each model.
 */
export type AIModelPresets = Record<AIProviderType, Record<string, AIModelPreset>>

// ============================================================
// PROVIDER METADATA
// ============================================================

/**
 * Provider configuration template
 * 
 * Extended metadata that includes default configuration values
 * for a provider. Used for initializing new provider instances.
 */
export interface ProviderTemplate extends ProviderMetadata {
  /** Default model identifier for this provider */
  defaultModel: string
  
  /** Default temperature setting for this provider */
  defaultTemperature: number
  
  /** Default max tokens setting for this provider */
  defaultMaxTokens: number
  
  /** List of model IDs supported by this provider */
  supportedModels: string[]
  
  /** Default base URL for this provider's API */
  defaultBaseUrl: string
}

// ============================================================
// STORE TYPES
// ============================================================

/**
 * AI Store State Interface
 * 
 * Defines the reactive state managed by the AI store
 */
export interface AIStoreState {
  provider: Ref<AIProvider | null>;
  config: Ref<AIServiceConfig | null>;
  isConnected: Ref<boolean>;
  isInitializing: Ref<boolean>;
  error: Ref<Error | null>;
  lastTranslation: Ref<TranslationResponse | null>;
  translationQueue: Ref<ResourceTranslation[]>;
  translationInProgress: Ref<boolean>;
  estimatedTokensUsed: Ref<number>;
  estimatedCost: Ref<number>;
  totalTranslationsCompleted: Ref<number>;
}

/**
 * AI Store Getters Interface
 * 
 * Defines computed properties derived from state
 */
export interface AIStoreGetters {
  isReady: Ref<boolean>;
  canTranslate: Ref<boolean>;
  currentProvider: Ref<string>;
  supportedPromptTypes: Ref<PromptType[]>;
  averageCostPerWord: Ref<number>;
}

/**
 * AI Store Actions Interface
 * 
 * Defines methods that can modify state
 */
export interface AIStoreActions {
  initialize(serviceConfig: AIServiceConfig): Promise<void>;
  resetValues(): void;
  disconnect(): Promise<void>;
  translate(
    text: string,
    languagePair?: LanguagePair,
    contentType?: PromptType
  ): Promise<TranslationResponse>;
  translateBatch(
    texts: ResourceTranslation[],
    contentType?: PromptType
  ): Promise<ResourceTranslationResult>;
  estimateCost(text: string): { tokens: number; cost: number };
  supportsPromptType(promptType: PromptType): boolean;
}

/**
 * Complete AI Store Interface
 * 
 * Combines state, getters, and actions
 */
export interface AIStore extends AIStoreState, AIStoreGetters, AIStoreActions {} 