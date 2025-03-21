import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { AIProvider } from '@/types/ai/base'
import { AIProviderFactory } from '@/services/ai/factory'
import type { TranslationTarget, TranslatedText } from '@/types/engines/base'
import { useSettingsStore } from './settings'

export const useAIStore = defineStore('ai', () => {
  const settings = useSettingsStore()
  
  // State
  const provider = ref<AIProvider | null>(null)
  const totalTokens = ref(0)
  const errors = ref<string[]>([])

  // Computed
  const estimatedCost = computed(() => {
    // Rough estimate: $0.0001 per token
    return totalTokens.value * 0.0001
  })

  // Actions
  function initializeProvider() {
    if (!settings.isAIConfigValid) {
      errors.value.push('Invalid AI configuration')
      return
    }

    provider.value = AIProviderFactory.createProvider(settings.aiProvider, {
      apiKey: settings.apiKey,
      model: settings.aiModel
    })
  }

  async function translate(text: TranslationTarget): Promise<TranslatedText | null> {
    if (!provider.value) {
      initializeProvider()
      if (!provider.value) return null
    }

    if (!settings.isTranslationConfigValid) {
      errors.value.push('Source and target languages must be set')
      return null
    }

    try {
      const response = await provider.value.translate({
        text: text.source,
        context: text.context,
        sourceLanguage: settings.sourceLanguage,
        targetLanguage: settings.targetLanguage
      })

      const translatedText: TranslatedText = {
        ...text,
        target: response.translatedText,
        tokens: response.tokens
      }

      totalTokens.value += response.tokens?.total || 0
      return translatedText

    } catch (error) {
      errors.value.push(error instanceof Error ? error.message : 'Translation failed')
      return null
    }
  }

  async function translateBatch(texts: TranslationTarget[]) {
    if (!provider.value) {
      initializeProvider()
      if (!provider.value) return { translations: [], stats: null }
    }

    if (!settings.isTranslationConfigValid) {
      errors.value.push('Source and target languages must be set')
      return { translations: [], stats: null }
    }

    try {
      const result = await provider.value.translateBatch(
        texts,
        settings.sourceLanguage,
        settings.targetLanguage
      )

      totalTokens.value += result.stats?.totalTokens || 0
      return result

    } catch (error) {
      errors.value.push(error instanceof Error ? error.message : 'Batch translation failed')
      return { translations: [], stats: null }
    }
  }

  function reset() {
    provider.value = null
    totalTokens.value = 0
    errors.value = []
  }

  return {
    provider,
    totalTokens,
    errors,
    estimatedCost,
    initializeProvider,
    translate,
    translateBatch,
    reset
  }
}) 