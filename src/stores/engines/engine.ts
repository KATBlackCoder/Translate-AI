import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { GameResourceFile, PathConfiguration, EngineType } from '@/types/engines/base'
import type { ResourceTranslation } from '@/types/shared/translation'
import { RPGMakerMVEngine } from '@/services/engines/rpgmv/rpgmv'
// TODO: Import new engine when adding
// import { NewEngine } from '@/services/engines/newengine/newengine'
import { useRPGMVStore } from './rpgmv'
// TODO: Import new engine store when adding
// import { useNewEngineStore } from './engines/newengine'
/**
 * Supported game engine types.
 * Add new engine types here when implementing new engines.
 */

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
    if (engine.value) {
      return engine.value.settings.pathConfig.dataDir
    }
    return 'www/data'
  })

  /**
   * Gets the file encoding from the current engine's settings
   */
  const encoding = computed(() => {
    if (engine.value) {
      return engine.value.settings.encoding
    }
    return 'utf8'
  })

  /**
   * Ensures the engine is initialized before performing operations.
   * @param {EngineType} engineType - Type of engine to initialize
   * @returns {Promise<boolean>} True if engine is ready, false otherwise
   */
  async function ensureEngineInitialized(engineType: EngineType): Promise<boolean> {
    if (engine.value) return true
    return await initializeEngine(engineType)
  }

  /**
   * Initializes the game engine based on settings.
   * @param {EngineType} engineType - Type of engine to initialize
   * @param {number} [retries=3] - Number of initialization retries
   * @returns {Promise<boolean>} True if initialization successful
   */
  async function initializeEngine(engineType: EngineType, retries = 3): Promise<boolean> {
    for (let i = 0; i < retries; i++) {
      try {
        if (engineType === 'rpgmv') {
          engine.value = new RPGMakerMVEngine()
          if ('configure' in engine.value) {
            const pathConfig = rpgmvStore.getConfig<PathConfiguration>('pathConfig')
            const encoding = rpgmvStore.getConfig<string>('encoding')
            
            if (pathConfig && encoding) {
              (engine.value as any).configure({
                pathConfig,
                encoding
              })
            }
          }
        }
        // TODO: Add new engine initialization when adding
        // else if (engineType === 'newengine') {
        //   engine.value = new NewEngine()
        //   if ('configure' in engine.value) {
        //     const pathConfig = newEngineStore.getConfig<PathConfiguration>('pathConfig')
        //     const encoding = newEngineStore.getConfig<string>('encoding')
        //     
        //     if (pathConfig && encoding) {
        //       (engine.value as any).configure({
        //         pathConfig,
        //         encoding
        //       })
        //     }
        //   }
        // }
        else {
          throw new Error(`Unsupported engine type: ${engineType}`)
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
   * @param {EngineType} engineType - Type of engine to use
   */
  async function startEngineProject(path: string, engineType: EngineType) {
    if (!await ensureEngineInitialized(engineType)) {
      throw new Error('Engine not initialized')
    }

    const validation = await engine.value!.validateProject(path)
    isValidationFailed.value = validation.isValid
    if (!isValidationFailed.value) {
      return validation.errors
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
   * @param {GameResourceFile[]} files - Array of files to extract translations from
   * @param {EngineType} engineType - Type of engine to use
   * @returns {Promise<ResourceTranslation[]>} Array of translation targets or empty array on error
   */
  async function extractTranslations(files: GameResourceFile[], engineType: EngineType): Promise<ResourceTranslation[]> {
    if (!await ensureEngineInitialized(engineType)) {
      throw new Error('Engine not initialized')
    }

    try {
      const translations: ResourceTranslation[] = []
      for (const file of files) {
        switch (file.fileType) {
          case 'Actors':
            const fileTranslations = await rpgmvStore.extractTranslations([file])
            translations.push(...fileTranslations)
            break
          // TODO: Add new engine when adding
          // case 'NewEngine_Item':
          //   const fileTranslations = await newEngineStore.extractTranslations([file])
          //   translations.push(...fileTranslations)
          //   break
        }
      }
      return translations
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to extract translations')
    }
  }

  /**
   * Applies translations to project files.
   * Routes files to appropriate engine-specific stores based on file type.
   * @param {GameResourceFile[]} files - Array of files to update
   * @param {ResourceTranslation[]} translations - Array of translations to apply
   * @param {EngineType} engineType - Type of engine to use
   * @returns {Promise<GameResourceFile[]>} Updated files or empty array on error
   */
  async function applyTranslations(files: GameResourceFile[], translations: ResourceTranslation[], engineType: EngineType): Promise<GameResourceFile[]> {
    if (!await ensureEngineInitialized(engineType)) {
      throw new Error('Engine not initialized')
    }

    try {
      const updatedFiles: GameResourceFile[] = []
      for (const file of files) {
        switch (file.fileType) {
          case 'Actors':
            const updatedFile = await rpgmvStore.applyTranslations([file], translations)
            updatedFiles.push(...updatedFile)
            break
          // TODO: Add new engine when adding
          // case 'NewEngine_Item':
          //   const updatedFile = await newEngineStore.applyTranslations([file], translations)
          //   updatedFiles.push(...updatedFile)
          //   break
          default:
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