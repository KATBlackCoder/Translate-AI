// src/composables/useTranslationQueue.ts
import { ref, computed } from 'vue'
import { TranslationService } from '@/services/translation'
import type { 
  ResourceTranslation,
  BatchTranslationResult,
  PromptType,
  TranslationStats
} from '@/types/shared/translation'

export function useTranslationQueue() {
  // Get the singleton instance
  const service = TranslationService.getInstance()
  
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
  ): ResourceTranslation {
    return {
      resourceId,
      field,
      source,
      target: "",
      context,
      file,
      section
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
    options?: {
      promptType?: PromptType
      batchSize?: number
    }
  ): Promise<BatchTranslationResult | null> {
    // Don't process if queue is empty or already processing
    if (queue.value.length === 0 || isProcessing.value) {
      return null
    }
    
    // Set processing state
    isProcessing.value = true
    resetStats()
    
    try {
      // Use the translation service directly
      const result = await service.translateBatch(
        queue.value, 
        {
          promptType: options?.promptType || 'general',
          batchSize: options?.batchSize || 10
        }
      )
      
      // Update processing stats
      processingStats.value.completed = result.stats.successCount || 0
      processingStats.value.failed = result.stats.failedCount || 0
      processingStats.value.lastProcessedTime = Date.now()
      
      // Clear queue after successful processing
      queue.value = []
      
      return result
    } catch (error) {
      console.error('Error processing translation queue:', error)
      processingStats.value.failed = queue.value.length
      return null
    } finally {
      isProcessing.value = false
    }
  }
  
  /**
   * Get translation service status
   */
  function getServiceStatus() {
    return {
      isInitialized: service.isInitialized(),
      isHealthy: service.isHealthy(),
      lastError: service.getLastError()
    }
  }
  
  /**
   * Get translation statistics from the service
   */
  function getServiceStats(): TranslationStats {
    return service.getStats()
  }
  
  return {
    // State
    queue: computed(() => queue.value),
    isProcessing: computed(() => isProcessing.value),
    stats: computed(() => processingStats.value),
    
    // Service information
    serviceStatus: computed(() => getServiceStatus()),
    serviceStats: computed(() => getServiceStats()),
    
    // Methods
    createResource,
    addToQueue,
    clearQueue,
    resetStats,
    processQueue
  }
}