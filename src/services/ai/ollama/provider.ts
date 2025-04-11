import { OpenAIBaseProvider } from '@/core/ai/base/openai-base-provider';
import type { AIBaseConfig, ProviderMetadata, TranslationRequest, TranslationResponse } from '@/types/ai';
import { AIErrorFactory } from '@/core/ai/base/base-error';
import { OllamaPromptManager } from './prompt';
import { OllamaCostEstimator } from './cost';

/**
 * Provider implementation for Ollama
 * Extends OpenAIBaseProvider to use OpenAI-compatible API
 */
export class OllamaProvider extends OpenAIBaseProvider {
  protected promptManager: OllamaPromptManager;
  protected costEstimator: OllamaCostEstimator;

  constructor() {
    super();
    this.promptManager = new OllamaPromptManager();
    this.costEstimator = new OllamaCostEstimator();
  }

  /**
   * Provider metadata
   */
  protected readonly metadata: ProviderMetadata = {
    name: 'ollama',
    version: '1.0.0',
    costPerToken: 0,
    maxBatchSize: 10,
    qualityScore: 0.9,
    supportedPromptTypes: ['dialogue', 'menu', 'items', 'skills', 'name'],
    supportedLanguages: ['en', 'ja', 'zh', 'ko', 'es', 'fr', 'de', 'it', 'ru']
  };

  /**
   * Get the configuration for this provider
   * @returns The current configuration
   */
  public get config(): AIBaseConfig {
    return {
      model: 'mistral',
      temperature: 0.7,
      maxTokens: 2000,
      baseUrl: 'http://localhost:11434/v1' // Ollama OpenAI-compatible API endpoint
    };
  }

  /**
   * Translate text using Ollama
   * @param request The translation request
   * @returns Promise resolving to the translation response
   */
  public async translate(request: TranslationRequest): Promise<TranslationResponse> {
    try {
      const client = await this.getClient();
      if (!client) {
        throw AIErrorFactory.api('Failed to initialize client', this.name);
      }

      const prompt = this.promptManager.createPrompt(
        request.text,
        {
          source: request.sourceLanguage,
          target: request.targetLanguage
        },
        request.contentType
      );

      if (!prompt.system || !prompt.user) {
        throw AIErrorFactory.api('Failed to generate prompt', this.name);
      }

      const response = await client.chat.completions.create({
        model: this.config.model,
        messages: [
          { role: 'system', content: prompt.system },
          { role: 'user', content: prompt.user }
        ],
        temperature: this.config.temperature,
        max_tokens: this.config.maxTokens
      });

      const choices = response.choices as Array<{ message: { content: string } }>;
      if (!choices || !choices[0] || !choices[0].message || !choices[0].message.content) {
        throw AIErrorFactory.api('No translation response received', this.name);
      }

      const translatedText = choices[0].message.content;
      const usage = response.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };

      return {
        translatedText,
        confidence: 0.9,
        tokens: {
          prompt: usage.prompt_tokens,
          completion: usage.completion_tokens,
          total: usage.total_tokens
        },
        cost: 0
      };
    } catch (error) {
      if (error instanceof Error) {
        throw AIErrorFactory.api(`Translation error: ${error.message}`, this.name);
      } else {
        throw AIErrorFactory.unknown(`Unknown translation error: ${String(error)}`, this.name);
      }
    }
  }
} 