// src/stores/engines/engine.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ResourceTranslation, GameResourceFile, EngineType } from '@/types/engines'
import { GameEngineFactory } from '@/services/engines/factory'

/**
 * Store for managing game engine operations and state.
 * Delegates core functionality to engine services while managing UI state.
 */
export const useEngineStore = defineStore('engine', () => {
  // State
  const currentEngineType = ref<EngineType | null>(null)
  const isLoading = ref(false)
  const errors = ref<string[]>([])
  const projectFiles = ref<GameResourceFile[]>([])
  
  // Computed
  const engineName = computed(() => {
    if (!currentEngineType.value) return 'Unknown Engine'
    return GameEngineFactory.getEngineService(currentEngineType.value).getEngineName()
  })
  
  const hasEngine = computed(() => currentEngineType.value !== null)
  
  const hasProjectFiles = computed(() => projectFiles.value.length > 0)
  
  /**
   * Sets the current engine type
   */
  function setEngineType(type: EngineType) {
    currentEngineType.value = type
  }
  
  /**
   * Gets the current engine service
   */
  function getCurrentEngineService() {
    if (!currentEngineType.value) return null
    return GameEngineFactory.getEngineService(currentEngineType.value)
  }
  
  /**
   * Add an error message
   */
  function addError(error: string | Error) {
    const message = error instanceof Error ? error.message : error
    errors.value.push(message)
  }
  
  /**
   * Detect engine type from project path
   */
  async function detectEngineType(projectPath: string): Promise<EngineType | null> {
    isLoading.value = true
    errors.value = []
    
    try {
      const result = await GameEngineFactory.detectEngineType(projectPath)
      
      if (result) {
        setEngineType(result.type)
        return result.type
      } else {
        addError('Could not detect a supported game engine in this folder')
        return null
      }
    } catch (error) {
      addError(`Engine detection error: ${error instanceof Error ? error.message : String(error)}`)
      return null
    } finally {
      isLoading.value = false
    }
  }
  
  /**
   * Initialize a project with the detected engine
   */
  async function initializeProject(path: string, engineType: EngineType): Promise<boolean> {
    isLoading.value = true
    errors.value = []
    
    try {
      // Set the engine type
      setEngineType(engineType)
      
      // Get the engine service
      const engineService = getCurrentEngineService()
      if (!engineService) {
        addError('Engine service not available')
        return false
      }
      
      // Validate the project
      const validation = await engineService.validateProject(path)
      if (!validation.isValid) {
        validation.errors.forEach(addError)
        return false
      }
      
      // Read project files
      projectFiles.value = await engineService.readProject(path)
      return true
    } catch (error) {
      addError(error instanceof Error ? error.message : String(error))
      return false
    } finally {
      isLoading.value = false
    }
  }
  
  /**
   * Extract translatable content from project files
   */
  async function extractTranslatableContent(): Promise<ResourceTranslation[]> {
    if (!currentEngineType.value || projectFiles.value.length === 0) {
      addError('No project initialized')
      return []
    }
    
    isLoading.value = true
    
    try {
      // Get the engine service
      const engineService = getCurrentEngineService()
      if (!engineService) {
        addError('Engine service not available')
        return []
      }
      
      // Extract translations
      return await engineService.extractTranslations(projectFiles.value)
    } catch (error) {
      addError(error instanceof Error ? error.message : String(error))
      return []
    } finally {
      isLoading.value = false
    }
  }
  
  /**
   * Apply translations to project files
   */
  async function applyTranslations(
    translations: ResourceTranslation[]
  ): Promise<GameResourceFile[]> {
    if (!currentEngineType.value || projectFiles.value.length === 0) {
      addError('No project initialized')
      return []
    }
    
    isLoading.value = true
    
    try {
      // Get the engine service
      const engineService = getCurrentEngineService()
      if (!engineService) {
        addError('Engine service not available')
        return []
      }
      
      // Apply translations
      const updatedFiles = await engineService.applyTranslations(
        projectFiles.value,
        translations
      )
      
      // Update project files
      projectFiles.value = updatedFiles
      
      return updatedFiles
    } catch (error) {
      addError(error instanceof Error ? error.message : String(error))
      return projectFiles.value
    } finally {
      isLoading.value = false
    }
  }
  
  /**
   * Reset the engine state
   */
  function $resetEngine() {
    currentEngineType.value = null
    errors.value = []
    projectFiles.value = []
  }
  
  return {
    // State
    currentEngineType,
    isLoading,
    errors,
    projectFiles,
    
    // Computed
    engineName,
    hasEngine,
    hasProjectFiles,
    
    // Methods
    setEngineType,
    getCurrentEngineService,
    detectEngineType,
    initializeProject,
    extractTranslatableContent,
    applyTranslations,
    $resetEngine
  }
})