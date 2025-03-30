// src/stores/ai/ai.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { TranslationService } from '@/services/translation'
import type { AIServiceConfig } from '@/types/ai/config'

/**
 * AI Provider Store
 * Responsible for managing the AI provider configuration and initialization.
 * Only handles provider state, not translation functionality.
 */
export const useAIStore = defineStore('ai', () => {
  // State
  const config = ref<AIServiceConfig | null>(null)
  const isInitializing = ref(false)
  const error = ref<Error | null>(null)
  
  // Service reference
  const service = TranslationService.getInstance()
  
  // Computed
  const isReady = computed(() => service.isInitialized() && !isInitializing.value)
  const currentProvider = computed(() => config.value?.provider.providerType || 'None')
  const providerMetadata = computed(() => {
    if (!config.value) return null
    
    return {
      model: config.value.provider.model,
      sourceLanguage: config.value.sourceLanguage,
      targetLanguage: config.value.targetLanguage,
      contentRating: config.value.contentRating
    }
  })
  
  /**
   * Initialize the AI provider with the specified configuration
   */
  async function initializeProvider(serviceConfig: AIServiceConfig): Promise<void> {
    isInitializing.value = true
    error.value = null
    
    try {
      await service.initialize(serviceConfig)
      config.value = serviceConfig
    } catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err))
      throw error.value
    } finally {
      isInitializing.value = false
    }
  }
  
  /**
   * Reset the provider state
   */
  function resetProvider(): void {
    service.reset()
    error.value = null
  }
  
  /**
   * Check if the AI provider configuration is valid
   */
  async function validateProviderConfig(serviceConfig: AIServiceConfig): Promise<boolean> {
    try {
      return await service.validateConfig(serviceConfig)
    } catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err))
      return false
    }
  }
  
  /**
   * Get current provider health status
   */
  function getProviderHealth(): { isHealthy: boolean; lastError: Error | null } {
    return {
      isHealthy: service.isHealthy(),
      lastError: service.getLastError()
    }
  }
  
  /**
   * Get current service configuration
   */
  function getCurrentConfig(): AIServiceConfig | null {
    return service.getCurrentConfig()
  }
  
  return {
    // State
    config,
    isInitializing,
    error,
    
    // Computed
    isReady,
    currentProvider,
    providerMetadata,
    
    // Methods
    initializeProvider,
    resetProvider,
    validateProviderConfig,
    getProviderHealth,
    getCurrentConfig
  }
})