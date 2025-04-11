import { BaseCostEstimator } from '@/core/ai/base/base-cost';
import type { LanguagePair } from '@/types/ai';

/**
 * Cost estimator implementation for Ollama provider
 * Extends BaseCostEstimator with Ollama-specific cost calculations
 */
export class OllamaCostEstimator extends BaseCostEstimator {
  /**
   * Get the cost per token for a specific model and language pair
   * @param model The model identifier
   * @param languagePair The source and target languages (optional)
   * @returns Cost per token in USD
   */
  protected getCostPerToken(model: string, languagePair?: LanguagePair): number {
    // Ollama is free to use, so cost is 0
    return 0;
  }

  /**
   * Estimate the number of tokens in a text
   * @param text The text to analyze
   * @param languagePair The source and target languages (optional)
   * @returns Estimated token count
   */
  protected estimateTokenCount(text: string, languagePair?: LanguagePair): number {
    // Simple estimation: 1 token ≈ 4 characters
    // This is a rough estimate and may need adjustment based on actual tokenization
    return Math.ceil(text.length / 4);
  }
} 