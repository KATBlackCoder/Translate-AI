import type { GameResourceFile, EngineValidation, EngineSettings } from '@/types/engines/base'
import type { ResourceTranslation } from '@/types/shared/translation'
import type { RPGMVActor } from '@/types/engines/rpgmv'
import { RPGMakerMVEngine } from '@/services/engines/rpgmv/rpgmv'
import { settings } from '@/composables/engines/rpgmv/state'
/**
 * Actions and methods for RPGMV store
 */
export function useRPGMVActions(
  state: ReturnType<typeof import('@/composables/engines/rpgmv/state').useRPGMVState>
) {
  const engine = new RPGMakerMVEngine()

  // Actions
  function getConfig<T>(key: keyof EngineSettings): T | undefined {
    return state.settings[key] as T | undefined
  }

  function setConfig<K extends keyof EngineSettings>(key: K, value: EngineSettings[K]) {
    state.settings[key] = value
  }

  async function validateProject(path: string): Promise<EngineValidation> {
    try {
      state.isLoading.value = true
      state.errors.value = []
      return await engine.validateProject(path)
    } catch (error) {
      state.errors.value.push(error instanceof Error ? error.message : 'Failed to validate project')
      const validation = await engine.validateProject(path)
      return {
        isValid: false,
        missingFiles: validation.missingFiles,
        errors: state.errors.value
      }
    } finally {
      state.isLoading.value = false
    }
  }

  async function loadActors(path: string) {
    try {
      state.isLoading.value = true
      state.errors.value = []
      const files = await engine.readProject(path)
      const actorFile = files.find(f => f.fileType === 'Actors')
      if (actorFile) {
        state.actors.value = actorFile.content as RPGMVActor[]
      }
    } catch (error) {
      state.errors.value.push(error instanceof Error ? error.message : 'Failed to load actors')
    } finally {
      state.isLoading.value = false
    }
  }

  // TODO: Add new load functions for items and maps
  /**
   * Loads item data into the store
   * @example
   * ```typescript
   * async function loadItems(path: string) {
   *   try {
   *     state.isLoading.value = true
   *     state.errors.value = []
   *     const files = await engine.readProject(path)
   *     const itemFile = files.find(f => f.fileType === 'Items')
   *     if (itemFile) {
   *       state.items.value = itemFile.content as RPGMVItem[]
   *     }
   *   } catch (error) {
   *     state.errors.value.push(error instanceof Error ? error.message : 'Failed to load items')
   *   } finally {
   *     state.isLoading.value = false
   *   }
   * }
   * ```
   */
  // async function loadItems(path: string) { ... }

  async function extractTranslations(files: GameResourceFile[]): Promise<ResourceTranslation[]> {
    try {
      return await engine.extractTranslations(files)
    } catch (error) {
      state.errors.value.push(error instanceof Error ? error.message : 'Failed to extract translations')
      return []
    }
  }

  async function applyTranslations(files: GameResourceFile[], translations: ResourceTranslation[]): Promise<GameResourceFile[]> {
    try {
      return await engine.applyTranslations(files, translations)
    } catch (error) {
      state.errors.value.push(error instanceof Error ? error.message : 'Failed to apply translations')
      return files
    }
  }

  function reset() {
    state.actors.value = []
    // state.items.value = []
    // state.maps.value = []
    state.errors.value = []
    state.settings = { ...settings }
  }

  return {
    getConfig,
    setConfig,
    validateProject,
    loadActors,
    // loadItems,
    extractTranslations,
    applyTranslations,
    reset
  }
} 