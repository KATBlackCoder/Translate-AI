import type { CostEstimator, LanguagePair } from '@/types/ai';

/**
 * Base class for cost estimation in AI providers
 * Implements common functionality for estimating translation costs
 */
export abstract class BaseCostEstimator implements CostEstimator {
  /**
   * Get the cost per token for a specific model and language pair
   * @param model The model identifier
   * @param languagePair The source and target languages (optional)
   * @returns Cost per token in USD
   */
  protected abstract getCostPerToken(model: string, languagePair?: LanguagePair): number;

  /**
   * Estimate the number of tokens in a text
   * @param text The text to analyze
   * @param languagePair The source and target languages (optional)
   * @returns Estimated token count
   */
  protected abstract estimateTokenCount(text: string, languagePair?: LanguagePair): number;

  /**
   * Creates a standardized cost estimate object
   * @param tokens Number of tokens
   * @param costPerToken Cost per token
   * @returns Standardized cost estimate object
   */
  protected createCostEstimate(tokens: number, costPerToken: number): { tokens: number; cost: number } {
    return { 
      tokens, 
      cost: tokens * costPerToken 
    };
  }

  /**
   * Estimate the cost for translating a text
   * @param text The text to translate
   * @param languagePair The source and target languages
   * @param model The model to use for translation
   * @returns Cost estimate with token count and total cost
   */
  public estimateTranslationCost(
    text: string,
    languagePair: LanguagePair,
    model: string
  ): { tokens: number; cost: number } {
    const tokenCount = this.estimateTokenCount(text, languagePair);
    const costPerToken = this.getCostPerToken(model, languagePair);
    return this.createCostEstimate(tokenCount, costPerToken);
  }

  /**
   * Estimate the cost for a batch of translations
   * @param texts Array of texts to translate
   * @param languagePair The source and target languages
   * @param model The model to use for translation
   * @returns Total cost estimate with token count
   */
  public estimateBatchCost(
    texts: string[],
    languagePair: LanguagePair,
    model: string
  ): { tokens: number; cost: number } {
    const totalTokens = texts.reduce(
      (sum, text) => sum + this.estimateTokenCount(text, languagePair),
      0
    );
    const costPerToken = this.getCostPerToken(model, languagePair);
    return this.createCostEstimate(totalTokens, costPerToken);
  }

  /**
   * Implementation of the CostEstimator interface
   * @param text The text to estimate cost for
   * @param model The model to use (optional, defaults to 'default')
   * @param languagePair The source and target languages (optional)
   * @returns Object with token count and estimated cost in USD
   */
  public estimateCost(
    text: string,
    model: string = 'default',
    languagePair?: LanguagePair
  ): { tokens: number; cost: number } {
    const tokenCount = this.estimateTokenCount(text, languagePair);
    const costPerToken = this.getCostPerToken(model, languagePair);
    return this.createCostEstimate(tokenCount, costPerToken);
  }
} 