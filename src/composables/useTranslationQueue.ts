// src/composables/useTranslationQueue.ts
import { ref, computed } from 'vue'
import { AIProviderFactory } from '@/services/ai/factory'
import type { 
  ResourceTranslation,
  ResourceTranslationResult,
  PromptType
} from '@/types/ai'
import type { AIServiceConfig } from '@/types/ai/config'

export function useTranslationQueue() {
  // Get the factory instance
  const factory = AIProviderFactory.getInstance()
  
  // Queue state
  const queue = ref<ResourceTranslation[]>([])
  const isProcessing = ref(false)
  const processingStats = ref<{
    total: number;
    completed: number;
    failed: number;
    lastProcessedTime?: number;
  }>({
    total: 0,
    completed: 0,
    failed: 0
  })
  
  /**
   * Create a resource translation object
   */
  function createResource(
    resourceId: string,
    field: string,
    source: string,
    context: string = '',
    file: string = '',
    section: string = '',
    promptType: PromptType = 'dialogue'
  ): ResourceTranslation {
    return {
      resourceId,
      field,
      source,
      target: "",
      context,
      file,
      section,
      promptType
    }
  }
  
  /**
   * Add items to the translation queue
   */
  function addToQueue(items: ResourceTranslation | ResourceTranslation[] | string) {
    if (typeof items === 'string') {
      // If a string is provided, create a simple resource
      queue.value.push(createResource('text', 'content', items))
    } else {
      // Add array of items or single item
      const itemsToAdd = Array.isArray(items) ? items : [items]
      queue.value.push(...itemsToAdd)
    }
    
    // Update stats
    processingStats.value.total = queue.value.length
  }
  
  /**
   * Clear the queue and reset stats
   */
  function clearQueue() {
    queue.value = []
    resetStats()
  }
  
  /**
   * Reset processing statistics
   */
  function resetStats() {
    processingStats.value = {
      total: queue.value.length,
      completed: 0,
      failed: 0
    }
  }
  
  /**
   * Process the translation queue
   */
  async function processQueue(
    config: AIServiceConfig,
    options?: {
      promptType?: PromptType
      batchSize?: number
    }
  ): Promise<ResourceTranslationResult | null> {
    // Don't process if queue is empty or already processing
    if (queue.value.length === 0 || isProcessing.value) {
      return null
    }
    
    // Set processing state
    isProcessing.value = true
    resetStats()
    
    try {
      // Get provider from factory
      const provider = factory.createProvider(config.provider.providerType, config.provider)
      
      // Process translations in batches
      const batchSize = options?.batchSize || config.quality.batchSize
      const batches: ResourceTranslation[][] = []
      
      // Create batches
      for (let i = 0; i < queue.value.length; i += batchSize) {
        batches.push(queue.value.slice(i, i + batchSize))
      }
      
      const results: ResourceTranslation[] = []
      let successCount = 0
      let failedCount = 0
      let totalTokens = 0
      let totalCost = 0
      
      // Process each batch
      for (const batch of batches) {
        try {
          const batchResult = await provider.translateBatch(
            batch,
            config.languagePair,
            {
              ...config.provider,
              promptType: options?.promptType || 'dialogue',
              batchSize
            }
          )
          
          results.push(...batchResult.translations)
          successCount += batchResult.stats.successCount
          failedCount += batchResult.stats.failedCount
          totalTokens += batchResult.stats.totalTokens
          totalCost += batchResult.stats.totalCost
        } catch (error) {
          console.error('Error processing batch:', error)
          failedCount += batch.length
        }
      }
      
      // Update processing stats
      processingStats.value.completed = successCount
      processingStats.value.failed = failedCount
      processingStats.value.lastProcessedTime = Date.now()
      
      // Clear queue after successful processing
      queue.value = []
      
      return {
        translations: results,
        stats: {
          totalTokens,
          totalCost,
          failedCount,
          successCount,
          totalProcessingTime: Date.now() - (processingStats.value.lastProcessedTime || 0),
          lastTranslationTime: Date.now()
        }
      }
    } catch (error) {
      console.error('Error processing translation queue:', error)
      processingStats.value.failed = queue.value.length
      return null
    } finally {
      isProcessing.value = false
    }
  }
  
  /**
   * Get provider health status
   */
  function getProviderHealth(config: AIServiceConfig) {
    const provider = factory.getProvider(config.provider.providerType)
    if (!provider) {
      return {
        isHealthy: false,
        lastError: new Error('Provider not found')
      }
    }
    
    return {
      isHealthy: true,
      lastError: null
    }
  }
  
  return {
    // State
    queue: computed(() => queue.value),
    isProcessing: computed(() => isProcessing.value),
    stats: computed(() => processingStats.value),
    
    // Methods
    createResource,
    addToQueue,
    clearQueue,
    resetStats,
    processQueue,
    getProviderHealth
  }
}