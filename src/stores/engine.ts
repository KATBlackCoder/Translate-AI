import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { EngineFile, EngineValidation, TranslationTarget, TranslatedText } from '@/types/engines/base'
import { RPGMakerMVEngine } from '@/engines/rpgmv'
import { useSettingsStore } from './settings'

export type GameEngineType = 'rpgmv'

export const useEngineStore = defineStore('engine', () => {
  const settings = useSettingsStore()
  
  // State
  const engine = ref<RPGMakerMVEngine | null>(null)
  const errors = ref<string[]>([])

  // Computed
  const dataDir = computed(() => settings.getEngineConfig<string>('dataDir') || 'www/data')
  const encoding = computed(() => settings.getEngineConfig<string>('encoding') || 'utf8')

  // Actions
  function initializeEngine() {
    try {
      const type = settings.engineType
      if (type === 'rpgmv') {
        engine.value = new RPGMakerMVEngine()
        // Apply engine settings if the engine supports configuration
        if ('configure' in engine.value) {
          (engine.value as any).configure({
            dataDir: dataDir.value,
            encoding: encoding.value
          })
        }
      } else {
        throw new Error(`Unsupported engine type: ${type}`)
      }
    } catch (error) {
      errors.value.push(error instanceof Error ? error.message : 'Failed to initialize engine')
      engine.value = null
    }
  }

  async function validateProject(path: string): Promise<EngineValidation | null> {
    if (!engine.value) {
      initializeEngine()
      if (!engine.value) {
        errors.value.push('Failed to initialize engine')
        return null
      }
    }

    try {
      return await engine.value.validateProject(path)
    } catch (error) {
      errors.value.push(error instanceof Error ? error.message : 'Project validation failed')
      return null
    }
  }

  async function readProject(path: string): Promise<EngineFile[]> {
    if (!engine.value) {
      initializeEngine()
      if (!engine.value) {
        errors.value.push('Failed to initialize engine')
        return []
      }
    }

    try {
      return await engine.value.readProject(path)
    } catch (error) {
      errors.value.push(error instanceof Error ? error.message : 'Failed to read project files')
      return []
    }
  }

  function extractTranslations(files: EngineFile[]): TranslationTarget[] {
    if (!engine.value) {
      initializeEngine()
      if (!engine.value) {
        errors.value.push('Failed to initialize engine')
        return []
      }
    }

    try {
      return engine.value.extractTranslations(files)
    } catch (error) {
      errors.value.push(error instanceof Error ? error.message : 'Failed to extract translations')
      return []
    }
  }

  function applyTranslations(files: EngineFile[], translations: TranslatedText[]): EngineFile[] {
    if (!engine.value) {
      initializeEngine()
      if (!engine.value) {
        errors.value.push('Failed to initialize engine')
        return []
      }
    }

    try {
      return engine.value.applyTranslations(files, translations)
    } catch (error) {
      errors.value.push(error instanceof Error ? error.message : 'Failed to apply translations')
      return []
    }
  }

  function reset() {
    engine.value = null
    errors.value = []
  }

  return {
    // State
    engine,
    errors,

    // Computed
    dataDir,
    encoding,

    // Actions
    initializeEngine,
    validateProject,
    readProject,
    extractTranslations,
    applyTranslations,
    reset
  }
}) 