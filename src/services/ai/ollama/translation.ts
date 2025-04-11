import { OllamaProvider } from './provider';
import { OllamaPromptManager } from './prompt';
import type { 
  TranslationRequest, 
  TranslationResponse,
  LanguagePair,
  ResourceTranslation,
  ResourceTranslationResult,
  BatchOptions
} from '@/types/ai';
import { AIErrorFactory } from '@/core/ai/base/base-error';

/**
 * Translation service implementation for Ollama
 * Uses OllamaProvider for API calls and OllamaPromptManager for prompts
 */
export class OllamaTranslationService {
  private provider: OllamaProvider;
  private promptManager: OllamaPromptManager;

  constructor() {
    this.provider = new OllamaProvider();
    this.promptManager = new OllamaPromptManager();
  }

  /**
   * Translate a single text using Ollama
   * @param request The translation request containing text and context
   * @returns Promise resolving to the translation response with metadata
   */
  public async translate(request: TranslationRequest): Promise<TranslationResponse> {
    // Validate request
    if (!request.text) {
      throw AIErrorFactory.validation('Empty translation text', this.provider.name);
    }
    
    if (!request.sourceLanguage || !request.targetLanguage) {
      throw AIErrorFactory.validation('Missing language information', this.provider.name);
    }

    try {
      const startTime = Date.now();

      // Get prompts from prompt manager
      const prompt = this.promptManager.createPrompt(
        request.text,
        {
          source: request.sourceLanguage,
          target: request.targetLanguage
        },
        request.contentType
      );

      // Make API call using provider's translate method
      const response = await this.provider.translate({
        text: request.text,
        sourceLanguage: request.sourceLanguage,
        targetLanguage: request.targetLanguage,
        context: request.context,
        contentType: request.contentType
      });

      const processingTime = Date.now() - startTime;

      return {
        ...response,
        meta: {
          processingTime,
          qualityScore: 0.9
        }
      };
    } catch (error) {
      if (error instanceof Error) {
        throw AIErrorFactory.api(`Translation error: ${error.message}`, this.provider.name);
      } else {
        throw AIErrorFactory.unknown(`Unknown translation error: ${String(error)}`, this.provider.name);
      }
    }
  }

  /**
   * Translate multiple texts in batch
   * @param targets Resource translations to process
   * @param languagePair Source and target language pair
   * @param options Additional options for the batch processing
   * @returns Promise resolving to the resource translation result
   */
  public async translateBatch(
    targets: ResourceTranslation[],
    languagePair: LanguagePair,
    options?: BatchOptions
  ): Promise<ResourceTranslationResult> {
    if (!targets || targets.length === 0) {
      throw AIErrorFactory.validation('No translation targets provided', this.provider.name);
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
            throw AIErrorFactory.validation('Empty source text in translation target', this.provider.name);
          }
          
          // Create a translation request
          const request: TranslationRequest = {
            text: target.source,
            sourceLanguage: languagePair.source,
            targetLanguage: languagePair.target,
            context: target.context,
            contentType: target.promptType
          };
          
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
            if (error instanceof Error) {
              throw AIErrorFactory.api(`Translation error: ${error.message}`, this.provider.name);
            } else {
              throw AIErrorFactory.unknown(`Unknown translation error: ${String(error)}`, this.provider.name);
            }
          }
        }
      }
    }
    
    return result;
  }
} 