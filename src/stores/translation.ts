import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ResourceTranslation } from '@/types/shared/translation'
import { writeTextFile, writeFile } from '@tauri-apps/plugin-fs'
import { join } from '@tauri-apps/api/path'
import { open, save } from '@tauri-apps/plugin-dialog'
import { zip } from 'fflate'
import { useProjectStore } from './project'
import { useSettingsStore } from './settings'
import { useAIStore } from './ai'
import { useEngineStore } from './engines/engine'
import { useTranslationStats } from '@/composables/useTranslationStats'

// Define TranslationTarget and TranslatedText types based on ResourceTranslation
type TranslationTarget = ResourceTranslation;
type TranslatedText = ResourceTranslation;

/**
 * Store for managing translation operations
 * Handles translating, saving, and exporting game resources
 */
export const useTranslationStore = defineStore('translation', () => {
  const projectStore = useProjectStore()
  const settingsStore = useSettingsStore()
  const aiStore = useAIStore()
  const engineStore = useEngineStore()
  const translationStats = useTranslationStats()

  // Translation State
  const translatedTexts = ref<TranslatedText[]>([])
  const currentFile = ref('')
  const progress = ref(0)
  const errors = ref<string[]>([])
  const shouldCancel = ref(false)

  // Helper functions
  function findTranslationByResourceId(resourceId: string): TranslatedText | undefined {
    return translatedTexts.value.find(t => t.resourceId === resourceId)
  }

  function findTranslationsByResourceId(resourceId: string): TranslatedText[] {
    return translatedTexts.value.filter(t => t.resourceId === resourceId)
  }

  // Computed
  const isTranslating = computed(() => progress.value > 0 && progress.value < 100)
  const canTranslate = computed(() => 
    projectStore.extractedTexts.length > 0 && 
    settingsStore.isTranslationConfigValid && 
    settingsStore.isAIConfigValid
  )

  /**
   * Start translation of all untranslated texts
   * @returns {Promise<boolean>} True if successful, false otherwise
   */
  async function translateAll(): Promise<boolean> {
    if (!canTranslate.value) {
      errors.value.push('Cannot start translation: invalid configuration')
      return false
    }

    const untranslated = projectStore.extractedTexts.filter((text: TranslationTarget) => 
      !translatedTexts.value.some((t: TranslatedText) => 
        t.resourceId === text.resourceId && 
        t.field === text.field && 
        t.file === text.file
      )
    )

    if (untranslated.length === 0) {
      return true
    }

    try {
      errors.value = [] // Clear previous errors
      shouldCancel.value = false
      
      // Initialize AI provider with the current settings
      aiStore.initializeProvider(
        settingsStore.aiProvider,
        {
          model: settingsStore.aiModel,
          apiKey: settingsStore.apiKey,
          baseUrl: settingsStore.baseUrl,
          temperature: settingsStore.qualitySettings.temperature,
          maxTokens: settingsStore.qualitySettings.maxTokens
        }
      )
      
      progress.value = 0
      const batchSize = settingsStore.qualitySettings.batchSize || 10
      const batches = Math.ceil(untranslated.length / batchSize)

      for (let i = 0; i < batches && !shouldCancel.value; i++) {
        currentFile.value = untranslated[i * batchSize]?.file || ''
        const batch = untranslated.slice(i * batchSize, (i + 1) * batchSize)
        const result = await aiStore.translateBatch(batch)
        
        if (result.translations.length > 0) {
          const completeTranslations = result.translations.map((translation: any) => {
            const sourceText = batch.find(text => text.resourceId === translation.resourceId)
            if (!sourceText) return null
            
            return {
              ...translation,
              field: sourceText.field,
              file: sourceText.file,
              resourceId: sourceText.resourceId,
              section: sourceText.section
            } as ResourceTranslation
          }).filter(Boolean) as ResourceTranslation[]
          
          translatedTexts.value.push(...completeTranslations)
          
          // Update translation statistics
          if (result.stats) {
            translationStats.stats.value = {
              ...translationStats.stats.value,
              ...result.stats
            }
          }
        }

        // Add any AI errors to translation errors
        if ('errors' in result && result.errors?.length) {
          errors.value.push(...result.errors.map((e: { error: string }) => e.error))
        }

        progress.value = Math.round(((i + 1) / batches) * 100)
      }

      return !shouldCancel.value
    } catch (error) {
      errors.value.push(error instanceof Error ? error.message : 'Translation failed')
      return false
    } finally {
      if (shouldCancel.value) {
        errors.value.push('Translation cancelled')
      }
      currentFile.value = ''
      progress.value = 0
      shouldCancel.value = false
    }
  }

  /**
   * Cancel the current translation process
   */
  function cancelTranslation(): void {
    if (isTranslating.value) {
      shouldCancel.value = true
    }
  }

  /**
   * Save translated files to the specified directory
   * @returns {Promise<boolean>} True if successful, false otherwise
   */
  async function saveTranslations(): Promise<boolean> {
    try {
      if (!projectStore.projectPath || !projectStore.projectFiles.length) {
        throw new Error('No project files loaded')
      }

      if (!translatedTexts.value.length) {
        throw new Error('No translations to save')
      }

      const selectedDir = await open({
        directory: true,
        multiple: false,
        title: 'Select where to save translated files'
      })

      if (!selectedDir) {
        throw new Error('No directory selected')
      }

      const updatedFiles = await engineStore.applyTranslations(
        projectStore.projectFiles, 
        translatedTexts.value,
        settingsStore.engineType
      )
      
      const savedFiles: string[] = []
      const failedFiles: string[] = []

      for (const file of updatedFiles) {
        try {
          const relativePath = file.path.replace('www/data/', '')
          const fullPath = await join(selectedDir as string, relativePath)
          await writeTextFile(fullPath, JSON.stringify(file.content, null, 2))
          savedFiles.push(relativePath)
        } catch (error) {
          failedFiles.push(file.path)
          errors.value.push(`Failed to save ${file.path}: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      }

      if (failedFiles.length > 0) {
        if (savedFiles.length === 0) {
          throw new Error('Failed to save any files. Check file permissions and try again.')
        }
        throw new Error(`Partially saved. Failed files: ${failedFiles.join(', ')}`)
      }

      return true
    } catch (error) {
      errors.value.push(error instanceof Error ? error.message : 'Failed to save translations')
      return false
    }
  }

  /**
   * Export translations as a ZIP archive
   * @returns {Promise<boolean>} True if successful, false otherwise
   */
  async function exportTranslations(): Promise<boolean> {
    try {
      if (!translatedTexts.value.length) {
        throw new Error('No translations to export')
      }

      const updatedFiles = await engineStore.applyTranslations(
        projectStore.projectFiles, 
        translatedTexts.value,
        settingsStore.engineType
      )
      
      const files: Record<string, Uint8Array> = {}

      const exportData = {
        metadata: {
          timestamp: new Date().toISOString(),
          sourceLanguage: settingsStore.sourceLanguage,
          targetLanguage: settingsStore.targetLanguage,
          provider: settingsStore.aiProvider,
          model: settingsStore.aiModel,
          stats: {
            total: translatedTexts.value.length,
            ...Object.fromEntries(
              Object.entries(translationStats.stats.value)
                .filter(([key]) => key !== 'totalTokens')
            )
          }
        },
        translations: translatedTexts.value
      }
      
      files['translations.json'] = new TextEncoder().encode(JSON.stringify(exportData, null, 2))

      for (const file of updatedFiles) {
        files[file.path] = new TextEncoder().encode(JSON.stringify(file.content, null, 2))
      }

      return new Promise<boolean>((resolve, reject) => {
        zip(files, { level: 6 }, async (err: Error | null, data: Uint8Array) => {
          if (err) {
            reject(err)
            return
          }

          try {
            const savePath = await save({
              filters: [{
                name: 'ZIP Archive',
                extensions: ['zip']
              }],
              defaultPath: 'translations.zip'
            })

            if (!savePath) {
              throw new Error('No save location selected')
            }

            await writeFile(savePath, data, { append: false })
            resolve(true)
          } catch (error) {
            reject(error)
          }
        })
      })

    } catch (error) {
      errors.value.push(error instanceof Error ? error.message : 'Failed to export translations')
      return false
    }
  }

  /**
   * Reset the translation store
   */
  function reset(): void {
    translatedTexts.value = []
    currentFile.value = ''
    progress.value = 0
    errors.value = []
    aiStore.reset()
    translationStats.reset()
  }

  return {
    // State
    translatedTexts,
    currentFile,
    progress,
    errors,
    stats: translationStats.stats,

    // Computed
    isTranslating,
    canTranslate,

    // Actions
    translateAll,
    cancelTranslation,
    saveTranslations,
    exportTranslations,
    reset,
    findTranslationByResourceId,
    findTranslationsByResourceId
  }
}) 