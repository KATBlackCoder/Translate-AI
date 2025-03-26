import { ref, computed } from 'vue'
import type { TranslationStats } from '@/types/shared/translation'

/**
 * Creates initial translation statistics
 * @returns {TranslationStats} Default statistics object
 */
function createInitialStats(): TranslationStats {
  return {
    totalTokens: 0,
    totalCost: 0,
    averageConfidence: 0,
    failedCount: 0,
    successCount: 0,
    totalProcessingTime: 0
  }
}

/**
 * Composable for managing translation statistics
 * @returns {Object} Translation stats state and methods
 */
export function useTranslationStats() {
  const stats = ref<TranslationStats>(createInitialStats())

  /**
   * Updates translation statistics with new data
   * @param {number} duration - Duration of the translation in milliseconds
   * @param {number} tokens - Number of tokens used
   * @param {boolean} success - Whether the translation was successful
   * @param {number} [batchSize=1] - Number of items in the batch
   * @param {number} [confidence=0] - Confidence score of the translation (0-1)
   */
  function updateStats(
    duration: number, 
    tokens: number, 
    success: boolean, 
    batchSize = 1,
    confidence = 0
  ) {
    if (duration < 0 || tokens < 0 || batchSize < 1) {
      throw new Error('Invalid parameters: duration, tokens, and batchSize must be non-negative')
    }

    if (confidence < 0 || confidence > 1) {
      throw new Error('Confidence must be between 0 and 1')
    }

    // Update token usage and cost
    const costPerToken = getCostPerToken()
    stats.value.totalTokens += tokens
    stats.value.totalCost += Number((tokens * costPerToken).toFixed(6))
    stats.value.totalProcessingTime += duration

    // Update success/failure counts
    if (success) {
      stats.value.successCount += batchSize
      
      // Update average confidence
      if (confidence > 0) {
        const totalItems = stats.value.successCount + stats.value.failedCount
        const previousTotalConfidence = stats.value.averageConfidence * (totalItems - batchSize)
        const newTotalConfidence = previousTotalConfidence + (confidence * batchSize)
        stats.value.averageConfidence = newTotalConfidence / totalItems
      }
    } else {
      stats.value.failedCount += batchSize
    }
  }

  /**
   * Gets the cost per token based on current settings
   * @returns {number} Cost per token in USD
   */
  function getCostPerToken(): number {
    // This could be extended to use different rates based on model
    return 0.0001 // Default rate
  }

  /**
   * Resets statistics to initial values
   */
  function reset() {
    stats.value = createInitialStats()
  }

  // Computed properties
  const totalTranslations = computed(() => 
    stats.value.successCount + stats.value.failedCount
  )
  
  const successRate = computed(() => 
    totalTranslations.value > 0 
      ? (stats.value.successCount / totalTranslations.value) * 100 
      : 0
  )
  
  const averageTimePerItem = computed(() => 
    stats.value.successCount > 0 
      ? stats.value.totalProcessingTime / stats.value.successCount 
      : 0
  )
  
  const formattedStats = computed(() => ({
    totalTranslations: totalTranslations.value,
    successRate: `${successRate.value.toFixed(1)}%`,
    averageConfidence: `${(stats.value.averageConfidence * 100).toFixed(1)}%`,
    totalCost: `$${stats.value.totalCost.toFixed(4)}`,
    processingTime: formatDuration(stats.value.totalProcessingTime),
    averageTime: formatDuration(averageTimePerItem.value),
    tokensUsed: stats.value.totalTokens.toLocaleString()
  }))
  
  /**
   * Formats a duration in milliseconds to a human-readable string
   * @param {number} ms - Duration in milliseconds
   * @returns {string} Formatted duration string
   */
  function formatDuration(ms: number): string {
    if (ms < 1000) return `${ms.toFixed(0)}ms`
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
    return `${(ms / 60000).toFixed(1)}min`
  }

  return {
    stats,
    updateStats,
    reset,
    totalTranslations,
    successRate,
    averageTimePerItem,
    formattedStats
  }
} 