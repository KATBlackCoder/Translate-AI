import { type Ref } from 'vue'
import type { AIProvider } from '@/types/ai/base'
import type { ResourceTranslation, TranslatedResource } from '@/types/shared/translation'
import { createStoreError } from '@/types/store/stores'
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
 * @param {Ref<AIProvider | null>} provider - AI provider reference
 * @param {Object} settings - Settings store with error handling and translation config
 * @returns {Object} Translation service methods
 * @returns {(text: ResourceTranslation) => Promise<TranslatedResource | null>} translate - Single text translation
 * @returns {(texts: ResourceTranslation[]) => Promise<{translations: TranslatedResource[], stats: any}>} translateBatch - Batch translation
 */
export function useTranslationService(
  provider: Ref<AIProvider | null>,
  settings: {
    addError: (error: any) => void,
    setLoading: (loading: boolean) => void,
    updateLastModified: () => void,
    sourceLanguage: string,
    targetLanguage: string,
    isTranslationConfigValid: boolean
  }
) {
  const { rateLimit, canMakeRequest } = useRateLimit()
  const { updateStats } = useTranslationStats()

  /**
   * Translates a single text using the AI provider
   * @param {ResourceTranslation} text - Text to translate
   * @returns {Promise<TranslatedResource | null>} Translated text or null if failed
   */
  async function translate(text: ResourceTranslation): Promise<TranslatedResource | null> {
    if (!text.source?.trim()) {
      settings.addError(createStoreError(
        ERROR_CODES.TRANSLATION_FAILED,
        'Source text cannot be empty'
      ))
      return null
    }

    if (!canMakeRequest.value) {
      settings.addError(createStoreError(
        ERROR_CODES.RATE_LIMIT,
        'Rate limit exceeded. Please wait before making more requests.'
      ))
      return null
    }

    if (!provider.value) {
      settings.addError(createStoreError(
        ERROR_CODES.NO_PROVIDER,
        'AI provider not initialized'
      ))
      return null
    }

    if (!settings.isTranslationConfigValid) {
      settings.addError(createStoreError(
        ERROR_CODES.INVALID_CONFIG,
        'Source and target languages must be set'
      ))
      return null
    }

    try {
      settings.setLoading(true)
      const startTime = Date.now()
      
      const response = await provider.value.translate({
        text: text.source,
        context: text.context,
        sourceLanguage: settings.sourceLanguage,
        targetLanguage: settings.targetLanguage
      })

      const translatedText: TranslatedResource = {
        ...text,
        target: response.translatedText,
        tokens: response.tokens
      }

      // Update stats
      const duration = Date.now() - startTime
      updateStats(duration, response.tokens?.total || 0, true)

      // Update rate limit
      rateLimit.value.requests++
      settings.updateLastModified()
      return translatedText

    } catch (error) {
      updateStats(0, 0, false)
      settings.addError(createStoreError(
        ERROR_CODES.TRANSLATION_FAILED,
        error instanceof Error ? error.message : 'Translation failed',
        { textLength: text.source.length }
      ))
      return null
    } finally {
      settings.setLoading(false)
    }
  }

  /**
   * Translates multiple texts in a batch
   * @param {ResourceTranslation[]} texts - Array of texts to translate
   * @returns {Promise<{translations: TranslatedResource[], stats: any}>} Translation results and stats
   */
  async function translateBatch(texts: ResourceTranslation[]) {
    if (!texts.length) {
      settings.addError(createStoreError(
        ERROR_CODES.BATCH_FAILED,
        'Batch cannot be empty'
      ))
      return { translations: [], stats: null }
    }

    if (!canMakeRequest.value) {
      settings.addError(createStoreError(
        ERROR_CODES.RATE_LIMIT,
        'Rate limit exceeded. Please wait before making more requests.'
      ))
      return { translations: [], stats: null }
    }

    if (!provider.value) {
      settings.addError(createStoreError(
        ERROR_CODES.NO_PROVIDER,
        'AI provider not initialized'
      ))
      return { translations: [], stats: null }
    }

    if (!settings.isTranslationConfigValid) {
      settings.addError(createStoreError(
        ERROR_CODES.INVALID_CONFIG,
        'Source and target languages must be set'
      ))
      return { translations: [], stats: null }
    }

    try {
      settings.setLoading(true)
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
      settings.updateLastModified()
      return result

    } catch (error) {
      updateStats(0, 0, false, texts.length)
      settings.addError(createStoreError(
        ERROR_CODES.BATCH_FAILED,
        error instanceof Error ? error.message : 'Batch translation failed',
        { batchSize: texts.length }
      ))
      return { translations: [], stats: null }
    } finally {
      settings.setLoading(false)
    }
  }

  return {
    translate,
    translateBatch
  }
} 