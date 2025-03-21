import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { EngineFile, EngineValidation, TranslationTarget, TranslatedText } from '@/types/engines/base'
import type { AIProvider } from '@/types/ai/base'
import { AIProviderFactory, type AIProviderType } from '@/services/ai/factory'
import { RPGMakerMVEngine } from '@/engines/rpgmv'
import { writeTextFile, writeFile } from '@tauri-apps/plugin-fs'
import { join } from '@tauri-apps/api/path'
import { open, save } from '@tauri-apps/plugin-dialog'
import { zip } from 'fflate'

// Define supported game engines
export type GameEngineType = 'rpgmv' // Add more engines here later

export const useTranslationStore = defineStore('translation', () => {

  // Project State
  const projectPath = ref('')
  const engineType = ref<GameEngineType>('rpgmv') // Default to RPGMV
  const projectFiles = ref<EngineFile[]>([])
  const validationStatus = ref<EngineValidation>()

  // Translation Settings
  const sourceLanguage = ref('')
  const targetLanguage = ref('')
  const aiProvider = ref<AIProviderType>('ollama')
  const aiModel = ref('')
  const apiKey = ref('')

  // Translation State
  const extractedTexts = ref<TranslationTarget[]>([])
  const translatedTexts = ref<TranslatedText[]>([])
  const currentFile = ref('')
  const progress = ref(0)
  const errors = ref<string[]>([])

  // AI Provider State
  let provider: AIProvider | null = null

  // Project Actions
  async function validateProject(path: string) {
    try {
      errors.value = []
      projectPath.value = path
      
      // Get appropriate engine based on type
      const engine = new RPGMakerMVEngine()
      
      // Validate project
      validationStatus.value = await engine.validateProject(path)
      
      if (!validationStatus.value.isValid) {
        errors.value = validationStatus.value.errors
        return false
      }
      
      // Read project files if valid
      projectFiles.value = await engine.readProject(path)

      // Extract translations
      extractedTexts.value = engine.extractTranslations(projectFiles.value)
      console.log(extractedTexts.value)
      return true
    } catch (error) {
      errors.value = [error instanceof Error ? error.message : 'Unknown error']
      return false
    }
  }

  function resetProject() {
    projectPath.value = ''
    projectFiles.value = []
    validationStatus.value = undefined
    errors.value = []
    extractedTexts.value = []
    translatedTexts.value = []
    currentFile.value = ''
    progress.value = 0
  }

  // Translation Actions
  async function translateSingle(text: TranslationTarget) {
    if (!provider) {
      provider = AIProviderFactory.createProvider(aiProvider.value, {
        apiKey: apiKey.value,
        model: aiModel.value
      })
    }

    try {
      const response = await provider.translate({
        text: text.source,
        context: text.context,
        sourceLanguage: sourceLanguage.value,
        targetLanguage: targetLanguage.value
      })

      translatedTexts.value.push({
        ...text,
        target: response.translatedText,
        tokens: response.tokens
      })

    } catch (error) {
      errors.value.push(error instanceof Error ? error.message : 'Translation failed')
    }
  }

  async function translateBatch(texts: TranslationTarget[]) {
    if (!provider) {
      provider = AIProviderFactory.createProvider(aiProvider.value, {
        apiKey: apiKey.value,
        model: aiModel.value
      })
    }

    try {
      const result = await provider.translateBatch(
        texts,
        sourceLanguage.value,
        targetLanguage.value
      )

      translatedTexts.value.push(...result.translations)
      return result.stats

    } catch (error) {
      errors.value.push(error instanceof Error ? error.message : 'Batch translation failed')
      return null
    }
  }

  async function translateAll() {
    const untranslated = extractedTexts.value.filter(text => 
      !translatedTexts.value.some(t => 
        t.id === text.id && 
        t.field === text.field && 
        t.file === text.file
      )
    )

    if (untranslated.length === 0) return

    progress.value = 0
    const batchSize = 10 // Adjust based on provider's maxBatchSize
    const batches = Math.ceil(untranslated.length / batchSize)

    for (let i = 0; i < batches; i++) {
      const batch = untranslated.slice(i * batchSize, (i + 1) * batchSize)
      await translateBatch(batch)
      progress.value = Math.round(((i + 1) / batches) * 100)
    }
  }

  // Save Actions
  async function saveTranslations() {
    try {
      if (!projectPath.value || !projectFiles.value.length) {
        throw new Error('No project files loaded')
      }

      if (!translatedTexts.value.length) {
        throw new Error('No translations to export')
      }

      // Ask user where to save
      const selectedDir = await open({
        directory: true,
        multiple: false,
        title: 'Select where to save translated files'
      })

      if (!selectedDir) {
        throw new Error('No directory selected')
      }

      const engine = new RPGMakerMVEngine()
      
      // Apply translations to files
      const updatedFiles = engine.applyTranslations(projectFiles.value, translatedTexts.value)
      
      // Save each file
      const savedFiles: string[] = []
      const failedFiles: string[] = []

      for (const file of updatedFiles) {
        try {
          // Create the same folder structure in selected directory
          const relativePath = file.path.replace('www/data/', '')
          const fullPath = await join(selectedDir as string, relativePath)
          await writeTextFile(fullPath, JSON.stringify(file.content, null, 2))
          savedFiles.push(relativePath)
          console.log(`Saved translations to: ${fullPath}`)
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

  // Export Actions
  async function exportTranslations() {
    try {
      if (!translatedTexts.value.length) {
        throw new Error('No translations to export')
      }

      const engine = new RPGMakerMVEngine()
      const updatedFiles = engine.applyTranslations(projectFiles.value, translatedTexts.value)
      
      // Prepare files for ZIP
      const files: Record<string, Uint8Array> = {}

      // Add metadata and translations JSON
      const exportData = {
        metadata: {
          timestamp: new Date().toISOString(),
          sourceLanguage: sourceLanguage.value,
          targetLanguage: targetLanguage.value,
          provider: aiProvider.value,
          stats: {
            total: translatedTexts.value.length,
            totalTokens: translatedTexts.value.reduce((sum, t) => sum + (t.tokens?.total || 0), 0)
          }
        },
        translations: translatedTexts.value
      }
      
      files['translations.json'] = new TextEncoder().encode(JSON.stringify(exportData, null, 2))

      // Add translated game files
      for (const file of updatedFiles) {
        files[file.path] = new TextEncoder().encode(JSON.stringify(file.content, null, 2))
      }

      // Create ZIP file
      return new Promise<boolean>((resolve, reject) => {
        zip(files, { level: 6 }, async (err: Error | null, data: Uint8Array) => {
          if (err) {
            reject(err)
            return
          }

          try {
            // Ask user where to save ZIP
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

  return {
    // Project
    projectPath,
    engineType,
    projectFiles,
    validationStatus,
    
    // Settings
    sourceLanguage,
    targetLanguage,
    aiProvider,
    aiModel,
    apiKey,
    
    // Translation State
    extractedTexts,
    translatedTexts,
    currentFile,
    progress,
    errors,

    // Actions
    validateProject,
    resetProject,
    translateSingle,
    translateBatch,
    translateAll,
    saveTranslations,
    exportTranslations
  }
}) 