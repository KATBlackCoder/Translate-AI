import type { Ref } from 'vue'
import type { AIProvider } from '@/types/ai/provider'
import type { AIServiceConfig } from '@/types/ai/config'
import type { 
  TranslationResponse, 
  ResourceTranslation,
  BatchTranslationResult,
  PromptType,
  ContentRating
} from '@/types/shared/translation'

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
  supportsAdultContent: Ref<boolean>;
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
    sourceLanguage?: string,
    targetLanguage?: string,
    contentType?: PromptType
  ): Promise<TranslationResponse>;
  translateBatch(
    texts: ResourceTranslation[],
    contentType?: PromptType
  ): Promise<BatchTranslationResult>;
  estimateCost(text: string): { tokens: number; cost: number };
  supportsPromptType(promptType: PromptType): boolean;
  supportsContentRating(rating: ContentRating): boolean;
}

/**
 * Complete AI Store Interface
 * 
 * Combines state, getters, and actions
 */
export interface AIStore extends AIStoreState, AIStoreGetters, AIStoreActions {} 