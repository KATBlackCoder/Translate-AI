import { ref, computed } from 'vue'
import type { RPGMVActor } from '@/types/engines/rpgmv'
import type { EngineSettings } from '@/types/engines/base'
import { RPGMakerMVEngine } from '@/services/engines/rpgmv/rpgmv'

/**
 * Settings for the RPG Maker MV engine
 * Imported from the RPGMakerMVEngine which is the single source of truth
 */
export const settings: EngineSettings = new RPGMakerMVEngine().settings;

/**
 * State and computed properties for RPGMV store
 */
export function useRPGMVState() {
  // State
  const actors = ref<RPGMVActor[]>([])
  // TODO: Add new state for items and maps
  /**
   * Array of RPGMV items loaded from the project
   * @example
   * ```typescript
   * const items = ref<RPGMVItem[]>([])
   * ```
   */
  // const items = ref<RPGMVItem[]>([])
  
  /**
   * Array of RPGMV maps loaded from the project
   * @example
   * ```typescript
   * const maps = ref<RPGMVMap[]>([])
   * ```
   */
  // const maps = ref<RPGMVMap[]>([])
  
  const isLoading = ref(false)
  const errors = ref<string[]>([])

  // Computed
  const pathConfig = computed(() => settings.pathConfig)
  const encoding = computed(() => settings.encoding)
  const hasActors = computed(() => actors.value.length > 0)
  
  // TODO: Add new computed properties for items and maps
  /**
   * Checks if there are any items loaded
   * @example
   * ```typescript
   * const hasItems = computed(() => items.value.length > 0)
   * ```
   */
  // const hasItems = computed(() => items.value.length > 0)
  
  /**
   * Checks if there are any maps loaded
   * @example
   * ```typescript
   * const hasMaps = computed(() => maps.value.length > 0)
   * ```
   */
  // const hasMaps = computed(() => maps.value.length > 0)

  const translatableActors = computed(() => actors.value.filter(actor => 
    actor.name || actor.profile || actor.nickname || actor.note
  ))
  
  // TODO: Add new computed properties for translatable items and maps
  /**
   * Filters items to only those with translatable content
   * @example
   * ```typescript
   * const translatableItems = computed(() => items.value.filter(item => 
   *   item.name || item.description || item.note
   * ))
   * ```
   */
  // const translatableItems = computed(() => items.value.filter(item => 
  //   item.name || item.description || item.note
  // ))

  return {
    // State
    settings,
    actors,
    // items,
    // maps,
    isLoading,
    errors,

    // Computed
    pathConfig,
    encoding,
    hasActors,
    // hasItems,
    // hasMaps,
    translatableActors,
    // translatableItems
  }
} 