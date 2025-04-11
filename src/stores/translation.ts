// src/stores/translation.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useTranslationQueue } from '@/composables/useTranslationQueue'
import type { ResourceTranslation, PromptType } from '@/types/ai'
import type { AIServiceConfig } from '@/types/ai/config'

/**
 * Translation Store
 * 
 * Responsible for:
 * - Managing the translation UI state
 * - Tracking translation progress
 * - Storing and organizing translation results
 * - Providing high-level translation operations
 */
export const useTranslationStore = defineStore('translation', () => {
  // Core dependencies
  const queue = useTranslationQueue()
  
  // State
  const isTranslating = ref(false)
  const error = ref<string | null>(null)
  const results = ref<ResourceTranslation[]>([])
  const currentBatch = ref<ResourceTranslation[]>([])
  const totalItemsCount = ref(0)
  
  // Computed
  const progress = computed(() => {
    if (totalItemsCount.value === 0) return 0
    return Math.round((results.value.length / totalItemsCount.value) * 100)
  })
  
  const completedItems = computed(() => results.value.length)
  const remainingItems = computed(() => totalItemsCount.value - completedItems.value)
  
  /**
   * Translate a batch of texts
   * Delegates to the translation queue for actual processing
   */
  async function translateBatch(
    texts: ResourceTranslation[], 
    config: AIServiceConfig,
    options?: {
      promptType?: PromptType
      batchSize?: number
    }
  ): Promise<ResourceTranslation[]> {
    if (texts.length === 0) return []
    
    const allResults: ResourceTranslation[] = []
    
    // Create batches
    const batchSize = options?.batchSize || config.quality.batchSize
    const batches: ResourceTranslation[][] = []
    for (let i = 0; i < texts.length; i += batchSize) {
      batches.push(texts.slice(i, i + batchSize))
    }
    
    for (const batch of batches) {
      currentBatch.value = batch
      
      try {
        // Use the queue to process this batch
        queue.clearQueue()
        queue.addToQueue(batch)
        
        const result = await queue.processQueue(config, {
          promptType: options?.promptType,
          batchSize
        })
        
        if (result?.translations) {
          // Add to our cumulative results
          const batchResults = ensureResourceTranslations(result.translations)
          results.value = [...results.value, ...batchResults]
          allResults.push(...batchResults)
        }
      } catch (e) {
        handleError('Batch translation error', e)
      }
    }
    
    currentBatch.value = []
    return allResults
  }
  
  /**
   * Translate all texts and optionally apply the translations
   */
  async function translateAll(
    texts: ResourceTranslation[],
    config: AIServiceConfig,
    options?: {
      applyTranslationsFn?: (translations: ResourceTranslation[]) => Promise<void>
      promptType?: PromptType
      batchSize?: number
    }
  ): Promise<ResourceTranslation[]> {
    if (isTranslating.value) return []
    
    try {
      // Start translation process
      isTranslating.value = true
      error.value = null
      results.value = []
      
      if (texts.length === 0) {
        console.warn('No texts to translate')
        return []
      }
      
      // Set total for progress tracking
      totalItemsCount.value = texts.length
      
      // Translate all texts in batches
      const translatedTexts = await translateBatch(texts, config, {
        promptType: options?.promptType,
        batchSize: options?.batchSize
      })
      
      // Apply translations if a function was provided
      if (translatedTexts.length > 0 && options?.applyTranslationsFn) {
        await options.applyTranslationsFn(translatedTexts)
      }
      
      return translatedTexts
    } catch (e) {
      handleError('Translation process error', e)
      return []
    } finally {
      isTranslating.value = false
    }
  }
  
  /**
   * Reset the translation state
   */
  function resetTranslation() {
    isTranslating.value = false
    error.value = null
    results.value = []
    currentBatch.value = []
    totalItemsCount.value = 0
    queue.clearQueue()
  }
  
  /**
   * Handle errors consistently
   */
  function handleError(context: string, err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    error.value = `${context}: ${message}`
    console.error(error.value)
  }
  
  /**
   * Ensure all items are valid ResourceTranslations
   */
  function ensureResourceTranslations(items: any[]): ResourceTranslation[] {
    return items.map(item => {
      if ('resourceId' in item && 'field' in item && 'file' in item) {
        return item as ResourceTranslation
      }
      
      // Convert to ResourceTranslation
      return {
        resourceId: item.id || '',
        field: 'text',
        file: 'unknown',
        source: item.source || '',
        target: item.target || '',
        context: item.context || ''
      } as ResourceTranslation
    })
  }
  
  return {
    // State
    progress,
    isTranslating,
    error,
    results,
    currentBatch,
    
    // Computed
    completedItems,
    remainingItems,
    
    // Methods
    translateAll,
    translateBatch,
    resetTranslation
  }
})