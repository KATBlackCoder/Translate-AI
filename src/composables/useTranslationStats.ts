import { ref } from 'vue'
import type { TranslationStats } from '@/types/store/stores'
import { createInitialStats } from '@/types/store/stores'

/**
 * Composable for managing translation statistics
 * @returns {Object} Translation stats state and methods
 * @returns {Ref<TranslationStats>} stats - Current translation statistics
 * @returns {(duration: number, tokens: number, success: boolean, batchSize?: number) => void} updateStats - Function to update stats
 * @returns {() => void} reset - Function to reset stats to initial values
 */
export function useTranslationStats() {
  const stats = ref<TranslationStats>(createInitialStats())

  /**
   * Updates translation statistics with new data
   * @param {number} duration - Duration of the translation in milliseconds
   * @param {number} tokens - Number of tokens used
   * @param {boolean} success - Whether the translation was successful
   * @param {number} [batchSize=1] - Number of items in the batch
   */
  function updateStats(duration: number, tokens: number, success: boolean, batchSize = 1) {
    if (duration < 0 || tokens < 0 || batchSize < 1) {
      throw new Error('Invalid parameters: duration, tokens, and batchSize must be non-negative')
    }

    const costPerToken = 0.0001
    stats.value.totalTokens += tokens
    stats.value.totalCost += Number((tokens * costPerToken).toFixed(6))

    if (success) {
      stats.value.successCount += batchSize
      stats.value.averageTime = 
        (stats.value.averageTime * (stats.value.successCount - batchSize) + duration) / stats.value.successCount
    } else {
      stats.value.failureCount += batchSize
    }
  }

  /**
   * Resets statistics to initial values
   */
  function reset() {
    stats.value = createInitialStats()
  }

  return {
    stats,
    updateStats,
    reset
  }
} 