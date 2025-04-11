import type { 
  TranslationProvider, 
  TranslationResponse, 
  LanguagePair,
  AIBaseConfig,
  BatchOptions,
  TranslationRequest,
  ResourceTranslation,
  ResourceTranslationResult
} from '@/types/ai';

import { AIErrorFactory } from './base-error';

/**
 * Base class for translation functionality in AI providers
 * Implements common functionality for translating text and resources
 */
export abstract class BaseTranslationProvider implements TranslationProvider {
  /**
   * Get the configuration for this provider
   * @returns The current configuration
   */
  public abstract get config(): AIBaseConfig;

  /**
   * Get the provider name
   * @returns The provider name
   */
  public abstract get name(): string;

  /**
   * Translate a single text using this provider
   * @param request The translation request containing text and context
   * @returns Promise resolving to the translation response with metadata
   */
  public abstract translate(request: TranslationRequest): Promise<TranslationResponse>;

  /**
   * Translate multiple texts in batch
   * @param targets Resource translations to process
   * @param languagePair Source and target language pair
   * @param options Additional options for the batch processing
   * @returns Promise resolving to the resource translation result
   */
  public abstract translateBatch(
    targets: ResourceTranslation[], 
    languagePair: LanguagePair, 
    options?: AIBaseConfig & BatchOptions
  ): Promise<ResourceTranslationResult>;

  /**
   * Creates a standardized translation response object
   * @param translatedText The translated text
   * @param confidence Optional confidence score
   * @param tokens Optional token usage information
   * @param cost Optional cost of the translation
   * @param meta Optional metadata about the translation
   * @returns Standardized translation response object
   */
  protected createTranslationResponse(
    translatedText: string,
    confidence?: number,
    tokens?: { prompt: number; completion: number; total: number },
    cost?: number,
    meta?: { processingTime: number; qualityScore?: number }
  ): TranslationResponse {
    return {
      translatedText,
      ...(confidence !== undefined && { confidence }),
      ...(tokens && { tokens }),
      ...(cost !== undefined && { cost }),
      ...(meta && { meta })
    };
  }

  /**
   * Creates a standardized resource translation result
   * @param translations Array of translated resources
   * @param stats Translation statistics
   * @param errors Optional array of errors encountered
   * @returns Standardized resource translation result
   */
  protected createResourceTranslationResult(
    translations: ResourceTranslation[],
    stats: {
      totalTokens: number;
      totalCost: number;
      failedCount: number;
      successCount: number;
    },
    errors?: Array<{ error: string }>
  ): ResourceTranslationResult {
    return {
      translations,
      stats,
      ...(errors && errors.length > 0 && { errors })
    };
  }

  /**
   * Process a batch of translations
   * @param targets Resource translations to process
   * @param languagePair Source and target language pair
   * @param options Additional options for the batch processing
   * @returns Promise resolving to the resource translation result
   */
  protected async processBatch(
    targets: ResourceTranslation[],
    languagePair: LanguagePair,
    options?: AIBaseConfig & BatchOptions
  ): Promise<ResourceTranslationResult> {
    if (!targets || targets.length === 0) {
      throw AIErrorFactory.validation('No translation targets provided', this.name);
    }

    const batchSize = options?.batchSize || 10;
    const continueOnError = options?.continueOnError ?? true;
    
    const result: ResourceTranslationResult = {
      translations: [],
      stats: {
        totalTokens: 0,
        totalCost: 0,
        failedCount: 0,
        successCount: 0
      }
    };
    
    // Process in batches
    for (let i = 0; i < targets.length; i += batchSize) {
      const batch = targets.slice(i, i + batchSize);
      
      // Process each item in the batch
      for (const target of batch) {
        try {
          // Validate target
          if (!target.source) {
            throw AIErrorFactory.validation('Empty source text in translation target', this.name);
          }
          
          // Create a translation request
          const request: TranslationRequest = {
            text: target.source,
            sourceLanguage: languagePair.source,
            targetLanguage: languagePair.target,
            context: target.context,
            contentType: target.promptType
          };
          
          // Validate the request
          this.validateTranslationRequest(request);
          
          // Translate the text
          const response = await this.translate(request);
          
          // Update the target with the translation
          target.target = response.translatedText;
          
          // Update statistics
          result.stats.totalTokens += response.tokens?.total || 0;
          result.stats.totalCost += response.cost || 0;
          result.stats.successCount++;
          
          // Add to results
          result.translations.push(target);
        } catch (error) {
          result.stats.failedCount++;
          
          // Add error to results if needed
          if (result.errors) {
            result.errors.push({
              error: error instanceof Error ? error.message : String(error)
            });
          }
          
          // If not continuing on error, throw
          if (!continueOnError) {
            this.handleTranslationError(error);
          }
        }
      }
    }
    
    return result;
  }

  /**
   * Handle translation errors
   * @param error The error to handle
   * @throws An AIProviderError
   */
  protected handleTranslationError(error: unknown): never {
    if (error instanceof Error) {
      throw AIErrorFactory.api(`Translation error: ${error.message}`, this.name);
    } else {
      throw AIErrorFactory.unknown(`Unknown translation error: ${String(error)}`, this.name);
    }
  }

  /**
   * Validate a translation request
   * @param request The request to validate
   * @throws An AIProviderError if the request is invalid
   */
  protected validateTranslationRequest(request: TranslationRequest): void {
    if (!request.text) {
      throw AIErrorFactory.validation('Empty translation text', this.name);
    }
    
    if (!request.sourceLanguage || !request.targetLanguage) {
      throw AIErrorFactory.validation('Missing language information', this.name);
    }
  }
} 