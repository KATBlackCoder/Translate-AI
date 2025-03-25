import { type Ref } from 'vue'
import type { AIProvider } from '@/types/ai/base'
import type { TranslationTarget, TranslatedText } from '@/core/shared/translation'
import type { StoreState } from '@/types/store/stores'
import { createStoreError } from '@/types/store/stores'
import { useSettingsStore } from '@/stores/settings'
import { useRateLimit } from './useRateLimit'
import { useTranslationStats } from './useTranslationStats'

const ERROR_CODES = {
  RATE_LIMIT: 'RATE_LIMIT_EXCEEDED',
  NO_PROVIDER: 'NO_PROVIDER',
  INVALID_CONFIG: 'INVALID_TRANSLATION_CONFIG',
  TRANSLATION_FAILED: 'TRANSLATION_FAILED',
  BATCH_FAILED: 'BATCH_TRANSLATION_FAILED'
} as const

/**
 * Composable for managing translation services
 * @param {StoreState} state - Application state
 * @param {Ref<AIProvider | null>} provider - AI provider reference
 * @returns {Object} Translation service methods
 * @returns {(text: TranslationTarget) => Promise<TranslatedText | null>} translate - Single text translation
 * @returns {(texts: TranslationTarget[]) => Promise<{translations: TranslatedText[], stats: any}>} translateBatch - Batch translation
 */
export function useTranslationService(state: StoreState, provider: Ref<AIProvider | null>) {
  const settings = useSettingsStore()
  const { rateLimit, canMakeRequest } = useRateLimit()
  const { updateStats } = useTranslationStats()

  /**
   * Translates a single text using the AI provider
   * @param {TranslationTarget} text - Text to translate
   * @returns {Promise<TranslatedText | null>} Translated text or null if failed
   */
  async function translate(text: TranslationTarget): Promise<TranslatedText | null> {
    if (!text.source?.trim()) {
      state.errors.push(createStoreError(
        ERROR_CODES.TRANSLATION_FAILED,
        'Source text cannot be empty'
      ))
      return null
    }

    if (!canMakeRequest.value) {
      state.errors.push(createStoreError(
        ERROR_CODES.RATE_LIMIT,
        'Rate limit exceeded. Please wait before making more requests.'
      ))
      return null
    }

    if (!provider.value) {
      state.errors.push(createStoreError(
        ERROR_CODES.NO_PROVIDER,
        'AI provider not initialized'
      ))
      return null
    }

    if (!settings.isTranslationConfigValid) {
      state.errors.push(createStoreError(
        ERROR_CODES.INVALID_CONFIG,
        'Source and target languages must be set'
      ))
      return null
    }

    try {
      state.isLoading = true
      const startTime = Date.now()
      
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

      // Update stats
      const duration = Date.now() - startTime
      updateStats(duration, response.tokens?.total || 0, true)

      // Update rate limit
      rateLimit.value.requests++
      state.lastUpdated = Date.now()
      return translatedText

    } catch (error) {
      updateStats(0, 0, false)
      state.errors.push(createStoreError(
        ERROR_CODES.TRANSLATION_FAILED,
        error instanceof Error ? error.message : 'Translation failed',
        { textLength: text.source.length }
      ))
      return null
    } finally {
      state.isLoading = false
    }
  }

  /**
   * Translates multiple texts in a batch
   * @param {TranslationTarget[]} texts - Array of texts to translate
   * @returns {Promise<{translations: TranslatedText[], stats: any}>} Translation results and stats
   */
  async function translateBatch(texts: TranslationTarget[]) {
    if (!texts.length) {
      state.errors.push(createStoreError(
        ERROR_CODES.BATCH_FAILED,
        'Batch cannot be empty'
      ))
      return { translations: [], stats: null }
    }

    if (!canMakeRequest.value) {
      state.errors.push(createStoreError(
        ERROR_CODES.RATE_LIMIT,
        'Rate limit exceeded. Please wait before making more requests.'
      ))
      return { translations: [], stats: null }
    }

    if (!provider.value) {
      state.errors.push(createStoreError(
        ERROR_CODES.NO_PROVIDER,
        'AI provider not initialized'
      ))
      return { translations: [], stats: null }
    }

    if (!settings.isTranslationConfigValid) {
      state.errors.push(createStoreError(
        ERROR_CODES.INVALID_CONFIG,
        'Source and target languages must be set'
      ))
      return { translations: [], stats: null }
    }

    try {
      state.isLoading = true
      const startTime = Date.now()
      
      const result = await provider.value.translateBatch(
        texts,
        settings.sourceLanguage,
        settings.targetLanguage
      )

      // Update stats
      const duration = Date.now() - startTime
      updateStats(duration, result.stats?.totalTokens || 0, true, texts.length)

      // Update rate limit
      rateLimit.value.requests++
      state.lastUpdated = Date.now()
      return result

    } catch (error) {
      updateStats(0, 0, false, texts.length)
      state.errors.push(createStoreError(
        ERROR_CODES.BATCH_FAILED,
        error instanceof Error ? error.message : 'Batch translation failed',
        { batchSize: texts.length }
      ))
      return { translations: [], stats: null }
    } finally {
      state.isLoading = false
    }
  }

  return {
    translate,
    translateBatch
  }
} 