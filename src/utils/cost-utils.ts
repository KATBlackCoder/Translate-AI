import type { AIProviderType } from '@/types/ai/base'
import type { TokenUsage } from '@/types/shared/translation'

// Cost per 1000 tokens for various models (approximate USD prices)
const COST_PER_1K_TOKENS = {
  // OpenAI models
  'gpt-3.5-turbo': {
    prompt: 0.0015,
    completion: 0.002
  },
  'gpt-4': {
    prompt: 0.03,
    completion: 0.06
  },
  'gpt-4-turbo': {
    prompt: 0.01,
    completion: 0.03
  },
  // DeepSeek models (placeholder values, adjust as needed)
  'deepseek-chat': {
    prompt: 0.002,
    completion: 0.004
  },
  'deepseek-coder': {
    prompt: 0.002,
    completion: 0.004
  },
  // Ollama models (free/local, but we can estimate compute cost if needed)
  'default': {
    prompt: 0,
    completion: 0
  }
}

/**
 * Estimate the number of tokens in a text
 * 
 * This is a basic estimation based on word count. For more accurate results,
 * you should use a dedicated tokenizer for the specific model.
 * 
 * @param text The text to estimate tokens for
 * @returns Estimated token count
 */
export function estimateTokenCount(text: string): number {
  if (!text) return 0
  
  // Simple estimation: ~4 characters per token on average for English
  // For languages with different character sets (CJK, etc.), this ratio changes
  const characters = text.length
  return Math.ceil(characters / 4)
}

/**
 * Estimate the cost for a given text and model
 * 
 * @param text The text to estimate cost for
 * @param model The model identifier
 * @param providerType The AI provider type
 * @returns The estimated tokens and cost
 */
export function estimateCost(
  text: string, 
  model: string, 
  providerType: AIProviderType
): { tokens: number; cost: number } {
  // For local providers like Ollama, cost is zero
  if (providerType === 'ollama') {
    const tokens = estimateTokenCount(text)
    return { tokens, cost: 0 }
  }
  
  // Estimate tokens
  const promptTokens = estimateTokenCount(text)
  // Assume completion is roughly the same size as the prompt for translation tasks
  const completionTokens = promptTokens
  const totalTokens = promptTokens + completionTokens
  
  // Get cost rates
  const costRates = COST_PER_1K_TOKENS[model as keyof typeof COST_PER_1K_TOKENS] || 
                    COST_PER_1K_TOKENS.default
  
  // Calculate cost
  const promptCost = (promptTokens / 1000) * costRates.prompt
  const completionCost = (completionTokens / 1000) * costRates.completion
  const totalCost = promptCost + completionCost
  
  return {
    tokens: totalTokens,
    cost: totalCost
  }
}

/**
 * Calculate the cost from token usage
 * 
 * @param tokens The token usage data
 * @param model The model identifier
 * @param providerType The AI provider type
 * @returns The calculated cost
 */
export function calculateCostFromTokens(
  tokens: TokenUsage,
  model: string,
  providerType: AIProviderType
): number {
  // For local providers like Ollama, cost is zero
  if (providerType === 'ollama') {
    return 0
  }
  
  // Get cost rates
  const costRates = COST_PER_1K_TOKENS[model as keyof typeof COST_PER_1K_TOKENS] || 
                    COST_PER_1K_TOKENS.default
  
  // Calculate cost
  const promptCost = (tokens.prompt / 1000) * costRates.prompt
  const completionCost = (tokens.completion / 1000) * costRates.completion
  
  return promptCost + completionCost
}

/**
 * Format a cost as a string with currency symbol
 * 
 * @param cost The cost value
 * @param currencySymbol The currency symbol to use
 * @returns Formatted cost string
 */
export function formatCost(cost: number, currencySymbol = '$'): string {
  if (cost === 0) return 'Free'
  
  // Format with appropriate precision based on value
  if (cost < 0.01) {
    return `<${currencySymbol}0.01`
  }
  
  return `${currencySymbol}${cost.toFixed(4)}`
}

/**
 * Format a token count for display
 * 
 * @param tokens The token count
 * @returns Formatted token count string
 */
export function formatTokenCount(tokens: number): string {
  if (tokens < 1000) {
    return `${tokens}`
  }
  
  return `${(tokens / 1000).toFixed(1)}k`
} 