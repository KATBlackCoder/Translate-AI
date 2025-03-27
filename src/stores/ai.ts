import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAIProvider } from '@/composables/useAIProvider'
import { useTranslationService } from '@/composables/useTranslationService'
import { useTranslationStats } from '@/composables/useTranslationStats'
import { useRateLimit } from '@/composables/useRateLimit'
import { useOllamaConnection } from '@/composables/providers/useOllamaConnection'
import { useChatGPTConnection } from '@/composables/providers/useChatGPTConnection'
import { useDeepSeekConnection } from '@/composables/providers/useDeepSeekConnection'
import { useSettingsStore } from '@/stores/settings'
import type { ContentRating } from '@/types/shared/translation'

export const useAIStore = defineStore('ai', () => {
  // State
  const isLoading = ref(false)
  const errors = ref<Array<{
    code: string
    message: string
    timestamp: number
    metadata?: Record<string, unknown>
  }>>([])
  const lastUpdated = ref(Date.now())

  // Composables
  const settings = useSettingsStore()
  const { stats, reset: resetStats } = useTranslationStats()
  const { reset: resetRateLimit } = useRateLimit()
  const { isConnected: isOllamaConnected } = useOllamaConnection()
  const { isConnected: isChatGPTConnected } = useChatGPTConnection()
  const { isConnected: isDeepSeekConnected } = useDeepSeekConnection()
  const { 
    provider, 
    providerType, 
    isVerifying, 
    initialize, 
    reset: resetProvider 
  } = useAIProvider()
  
  // Create reactive settings configuration with computed properties
  const translationSettings = {
    addError: (error: any) => errors.value.push(error),
    setLoading: (loading: boolean) => isLoading.value = loading,
    updateLastModified: () => lastUpdated.value = Date.now(),
    get sourceLanguage() { return settings.sourceLanguage },
    get targetLanguage() { return settings.targetLanguage },
    get contentRating(): ContentRating { 
      return settings.allowNSFWContent ? 'nsfw' : 'sfw' 
    },
    get isTranslationConfigValid() { return settings.isTranslationConfigValid }
  }
  
  const { translate, translateBatch } = useTranslationService(
    provider, 
    providerType,
    translationSettings
  )

  // Computed
  const estimatedCost = computed(() => stats.value.totalCost)

  function reset() {
    isLoading.value = false
    errors.value = []
    lastUpdated.value = Date.now()
    resetStats()
    resetRateLimit()
    resetProvider()
  }

  return {
    // State
    provider,
    providerType,
    isLoading,
    errors,
    lastUpdated,
    stats,
    isVerifying,
    isOllamaConnected,
    isChatGPTConnected,
    isDeepSeekConnected,
    estimatedCost,

    // Actions
    initializeProvider: initialize,
    translate,
    translateBatch,
    reset
  }
}) 