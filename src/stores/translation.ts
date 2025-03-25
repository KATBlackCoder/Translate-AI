import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { TranslationTarget, TranslatedText } from '@/core/shared/translation'
import { writeTextFile, writeFile } from '@tauri-apps/plugin-fs'
import { join } from '@tauri-apps/api/path'
import { open, save } from '@tauri-apps/plugin-dialog'
import { zip } from 'fflate'
import { useProjectStore } from './project'
import { useSettingsStore } from './settings'
import { useAIStore } from './ai'
import { useEngineStore } from './engines/engine'

export const useTranslationStore = defineStore('translation', () => {
  const projectStore = useProjectStore()
  const settingsStore = useSettingsStore()
  const aiStore = useAIStore()
  const engineStore = useEngineStore()

  // Translation State
  const translatedTexts = ref<TranslatedText[]>([])
  const currentFile = ref('')
  const progress = ref(0)
  const errors = ref<string[]>([])
  const shouldCancel = ref(false)

  // Computed
  const isTranslating = computed(() => progress.value > 0 && progress.value < 100)
  const canTranslate = computed(() => 
    projectStore.extractedTexts.length > 0 && 
    settingsStore.isTranslationConfigValid && 
    settingsStore.isAIConfigValid
  )

  // Translation Actions
  async function translateAll() {
    if (!canTranslate.value) {
      errors.value.push('Cannot start translation: invalid configuration')
      return false
    }

    const untranslated = projectStore.extractedTexts.filter((text: TranslationTarget) => 
      !translatedTexts.value.some((t: TranslatedText) => 
        t.id === text.id && 
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
      aiStore.initializeProvider()
      
      progress.value = 0
      const batchSize = 10
      const batches = Math.ceil(untranslated.length / batchSize)

      for (let i = 0; i < batches && !shouldCancel.value; i++) {
        currentFile.value = untranslated[i * batchSize]?.file || ''
        const batch = untranslated.slice(i * batchSize, (i + 1) * batchSize)
        const result = await aiStore.translateBatch(batch)
        
        if (result.translations.length > 0) {
          translatedTexts.value.push(...result.translations)
        }

        // Add any AI errors to translation errors
        if ('errors' in result && result.errors?.length) {
          errors.value.push(...result.errors.map(e => e.error))
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

  function cancelTranslation() {
    if (isTranslating.value) {
      shouldCancel.value = true
    }
  }

  // File Operations
  async function saveTranslations() {
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

      const updatedFiles = await engineStore.applyTranslations(projectStore.projectFiles, translatedTexts.value)
      
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

  async function exportTranslations() {
    try {
      if (!translatedTexts.value.length) {
        throw new Error('No translations to export')
      }

      const updatedFiles = await engineStore.applyTranslations(projectStore.projectFiles, translatedTexts.value)
      
      const files: Record<string, Uint8Array> = {}

      const exportData = {
        metadata: {
          timestamp: new Date().toISOString(),
          sourceLanguage: settingsStore.sourceLanguage,
          targetLanguage: settingsStore.targetLanguage,
          provider: settingsStore.aiProvider,
          stats: {
            total: translatedTexts.value.length,
            totalTokens: aiStore.stats.totalTokens
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

  function reset() {
    translatedTexts.value = []
    currentFile.value = ''
    progress.value = 0
    errors.value = []
    aiStore.reset()
  }

  return {
    // State
    translatedTexts,
    currentFile,
    progress,
    errors,

    // Computed
    isTranslating,
    canTranslate,

    // Actions
    translateAll,
    cancelTranslation,
    saveTranslations,
    exportTranslations,
    reset
  }
}) 