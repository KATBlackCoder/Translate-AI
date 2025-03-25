import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { GameResourceFile } from '@/types/engines/base'
import type { TranslationTarget, TranslatedText } from '@/core/shared/translation'
import { RPGMakerMVEngine } from '@/services/engines/rpgmv/rpgmv'
// TODO: Import new engine when adding
// import { NewEngine } from '@/services/engines/newengine/newengine'
import { useSettingsStore } from '../settings'
import { useRPGMVStore } from './rpgmv'
// TODO: Import new engine store when adding
// import { useNewEngineStore } from './engines/newengine'
/**
 * Supported game engine types.
 * Add new engine types here when implementing new engines.
 */
export type GameEngineType = 'rpgmv' // | 'newengine'

/**
 * Type for the engine store
 */
export type EngineStore = ReturnType<typeof useEngineStore>

/**
 * Main engine store that manages game engine operations and routing.
 * Handles engine initialization, project validation, and translation operations.
 * Delegates specific file handling to engine-specific stores.
 */
export const useEngineStore = defineStore('engine', () => {
  const settings = useSettingsStore()
  const rpgmvStore = useRPGMVStore()
  const isValidationFailed = ref()
  // TODO: Add new engine store when adding
  // const newEngineStore = useNewEngineStore()
  
  // State
  const engine = ref<RPGMakerMVEngine | null>(null)
  // TODO: Update engine type when adding
  // const engine = ref<RPGMakerMVEngine | NewEngine | null>(null)

  // Computed
  /**
   * Gets the data directory path from the current engine's settings
   */
  const dataDir = computed(() => {
    switch (settings.engineType) {
      case 'rpgmv':
        return rpgmvStore.dataDir
      // TODO: Add new engine when adding
      // case 'newengine':
      //   return newEngineStore.dataDir
      default:
        return 'www/data'
    }
  })

  /**
   * Gets the file encoding from the current engine's settings
   */
  const encoding = computed(() => {
    switch (settings.engineType) {
      case 'rpgmv':
        return rpgmvStore.encoding
      // TODO: Add new engine when adding
      // case 'newengine':
      //   return newEngineStore.encoding
      default:
        return 'utf8'
    }
  })

  /**
   * Ensures the engine is initialized before performing operations.
   * @returns {Promise<boolean>} True if engine is ready, false otherwise
   */
  async function ensureEngineInitialized(): Promise<boolean> {
    if (engine.value) return true
    return await initializeEngine()
  }

  /**
   * Initializes the game engine based on settings.
   * @param {number} [retries=3] - Number of initialization retries
   * @returns {Promise<boolean>} True if initialization successful
   */
  async function initializeEngine(retries = 3): Promise<boolean> {
    for (let i = 0; i < retries; i++) {
      try {
        const type = settings.engineType
        if (type === 'rpgmv') {
          engine.value = new RPGMakerMVEngine()
          if ('configure' in engine.value) {
            (engine.value as any).configure({
              dataDir: rpgmvStore.dataDir,
              encoding: rpgmvStore.encoding
            })
          }
        }
        // TODO: Add new engine initialization when adding
        // else if (type === 'newengine') {
        //   engine.value = new NewEngine()
        //   if ('configure' in engine.value) {
        //     (engine.value as any).configure({
        //       dataDir: newEngineStore.dataDir,
        //       encoding: newEngineStore.encoding
        //     })
        //   }
        // }
        else {
          throw new Error(`Unsupported engine type: ${type}`)
        }
        return true
      } catch (error) {
        if (i === retries - 1) throw error
        await new Promise(r => setTimeout(r, 1000 * (i + 1)))
      }
    }
    return false
  }

  /**
   * Starts a new project by validating and loading files
   * @param {string} path - Path to the project folder
   */
  async function startEngineProject(path: string) {
    if (!await ensureEngineInitialized()) {
      throw new Error('Engine not initialized')
    }

    isValidationFailed.value = (await engine.value!.validateProject(path)).isValid
    if (!isValidationFailed.value) {
      return (await engine.value!.validateProject(path)).errors
    }

    const files: GameResourceFile[] = await engine.value!.readProject(path)
    if (files.length === 0) {
      throw new Error('No translatable files found')
    }

    return files
  }

  /**
   * Extracts translations from project files.
   * Routes files to appropriate engine-specific stores based on file type.
   * @param {EngineFile[]} files - Array of files to extract translations from
   * @returns {Promise<TranslationTarget[]>} Array of translation targets or empty array on error
   */
  async function extractTranslations(files: GameResourceFile[]): Promise<TranslationTarget[]> {
    if (!await ensureEngineInitialized()) {
      throw new Error('Engine not initialized')
    }

    try {
      const translations: TranslationTarget[] = []
      for (const file of files) {
        if (file.translatableFileTypes.includes('rpgmv')) {
          const fileTranslations = await rpgmvStore.extractTranslations([file])
          translations.push(...fileTranslations)
        }
        // TODO: Add new engine when adding
        // else if (file.type.startsWith('newengine_')) {
        //   const fileTranslations = await newEngineStore.extractTranslations([file])
        //   translations.push(...fileTranslations)
        // }
      }
      return translations
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to extract translations')
    }
  }

  /**
   * Applies translations to project files.
   * Routes files to appropriate engine-specific stores based on file type.
   * @param {EngineFile[]} files - Array of files to update
   * @param {TranslatedText[]} translations - Array of translations to apply
   * @returns {Promise<EngineFile[]>} Updated files or empty array on error
   */
  async function applyTranslations(files: GameResourceFile[], translations: TranslatedText[]): Promise<GameResourceFile[]> {
    if (!await ensureEngineInitialized()) {
      throw new Error('Engine not initialized')
    }

    try {
      const updatedFiles: GameResourceFile[] = []
      for (const file of files) {
        if (file.translatableFileTypes.includes('rpgmv')) {
          const updatedFile = await rpgmvStore.applyTranslations([file], translations)
          updatedFiles.push(...updatedFile)
        }
        // TODO: Add new engine when adding
        // else if (file.type.startsWith('newengine_')) {
        //   const updatedFile = await newEngineStore.applyTranslations([file], translations)
        //   updatedFiles.push(...updatedFile)
        // }
        else {
          updatedFiles.push(file)
        }
      }
      return updatedFiles
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to apply translations')
    }
  }

  /**
   * Resets the engine store to its initial state.
   */
  function $resetEngine() {
    engine.value = null
    // Reset engine-specific stores
    rpgmvStore.reset()
    // TODO: Add new engine when adding
    // newEngineStore.reset()
  }

  return {
    // State
    engine,

    // Computed
    dataDir,
    encoding,

    // Actions
    startEngineProject,
    extractTranslations,
    applyTranslations,
    $resetEngine
  }
}) 