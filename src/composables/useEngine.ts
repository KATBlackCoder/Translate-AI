// src/composables/useEngine.ts
import { storeToRefs } from 'pinia'
import { useEngineStore } from '@/stores/engine'

export function useEngine() {
  const store = useEngineStore()
  
  // Get reactive refs for state
  const { 
    currentEngineType,
    isLoading,
    errors,
    projectFiles,
    engineName,
    hasEngine,
    hasProjectFiles
  } = storeToRefs(store)
  
  return {
    // State
    currentEngineType,
    isLoading,
    errors,
    projectFiles,
    engineName,
    hasEngine,
    hasProjectFiles,
    
    // Methods
    detectEngine: store.detectEngineType,
    initializeProject: store.initializeProject,
    extractContent: store.extractTranslatableContent,
    applyTranslations: store.applyTranslations,
    reset: store.$resetEngine
  }
}