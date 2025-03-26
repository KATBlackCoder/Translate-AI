import { defineStore } from 'pinia'
import { useRPGMVState } from '@/composables/engines/rpgmv/state'
import { useRPGMVActions } from '@/composables/engines/rpgmv/actions'

/**
 * Store for managing RPG Maker MV specific data and operations.
 * Handles actor data, translations, and file operations specific to RPGMV.
 */
export const useRPGMVStore = defineStore('rpgmv', () => {
  const state = useRPGMVState()
  const actions = useRPGMVActions(state)

  return {
    // State
    ...state,

    // Actions
    ...actions
  }
}) 