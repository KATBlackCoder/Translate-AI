// src/stores/ai/ai.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { AIProviderFactory } from '@/services/ai/factory'
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
  const factory = AIProviderFactory.getInstance()
  
  // Computed
  const isReady = computed(() => config.value !== null && !isInitializing.value)
  const currentProvider = computed(() => config.value?.provider.providerType || 'None')
  const providerMetadata = computed(() => {
    if (!config.value) return null
    
    return {
      model: config.value.provider.model,
      sourceLanguage: config.value.languagePair.source,
      targetLanguage: config.value.languagePair.target,
      quality: config.value.quality
    }
  })
  
  /**
   * Initialize the AI provider with the specified configuration
   */
  async function initializeProvider(serviceConfig: AIServiceConfig): Promise<void> {
    isInitializing.value = true
    error.value = null
    
    try {
      const provider = factory.createProvider(serviceConfig.provider.providerType, serviceConfig.provider)
      await provider.validateConfig(serviceConfig.provider)
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
    factory.clearProviders()
    config.value = null
    error.value = null
  }
  
  /**
   * Check if the AI provider configuration is valid
   */
  async function validateProviderConfig(serviceConfig: AIServiceConfig): Promise<boolean> {
    try {
      const provider = factory.createProvider(serviceConfig.provider.providerType, serviceConfig.provider)
      return await provider.validateConfig(serviceConfig.provider)
    } catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err))
      return false
    }
  }
  
  /**
   * Get current provider health status
   */
  function getProviderHealth(): { isHealthy: boolean; lastError: Error | null } {
    if (!config.value) {
      return { isHealthy: false, lastError: null }
    }
    
    const provider = factory.getProvider(config.value.provider.providerType)
    if (!provider) {
      return { isHealthy: false, lastError: new Error('Provider not found') }
    }
    
    return {
      isHealthy: true, // Provider exists and is initialized
      lastError: error.value
    }
  }
  
  /**
   * Get current service configuration
   */
  function getCurrentConfig(): AIServiceConfig | null {
    return config.value
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