import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { StoreState } from '@/types/store/stores'
import { useAIProvider } from '@/composables/useAIProvider'
import { useTranslationService } from '@/composables/useTranslationService'
import { useTranslationStats } from '@/composables/useTranslationStats'
import { useRateLimit } from '@/composables/useRateLimit'
import { useOllamaConnection } from '@/composables/providers/useOllamaConnection'
import { useChatGPTConnection } from '@/composables/providers/useChatGPTConnection'
import { useDeepSeekConnection } from '@/composables/providers/useDeepSeekConnection'

export const useAIStore = defineStore('ai', () => {
  // State
  const state = ref<StoreState>({
    isLoading: false,
    errors: [],
    lastUpdated: Date.now()
  })

  // Composables
  const { stats, reset: resetStats } = useTranslationStats()
  const { reset: resetRateLimit } = useRateLimit()
  const { isConnected: isOllamaConnected } = useOllamaConnection(state.value)
  const { isConnected: isChatGPTConnected } = useChatGPTConnection(state.value)
  const { isConnected: isDeepSeekConnected } = useDeepSeekConnection(state.value)
  const { provider, isVerifying, initializeProvider, reset: resetProvider } = useAIProvider(state.value)
  const { translate, translateBatch } = useTranslationService(state.value, provider)

  // Computed
  const estimatedCost = computed(() => stats.value.totalCost)

  function reset() {
    state.value = {
      isLoading: false,
      errors: [],
      lastUpdated: Date.now()
    }
    resetStats()
    resetRateLimit()
    resetProvider()
  }

  return {
    // State
    provider,
    state,
    stats,
    isVerifying,
    isOllamaConnected,
    isChatGPTConnected,
    isDeepSeekConnected,
    estimatedCost,

    // Actions
    initializeProvider,
    translate,
    translateBatch,
    reset
  }
}) 