import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { EngineValidation, GameResourceFile } from '@/types/engines/base'
import type { ResourceTranslation } from '@/types/shared/translation'
import { useEngineStore } from './engines/engine'
import { useSettingsStore } from './settings'

/**
 * Store for managing project data and operations.
 * Handles project validation, file loading, and translation extraction.
 */
export const useProjectStore = defineStore('project', () => {
  const engineStore = useEngineStore()
  const settingsStore = useSettingsStore()

  // State
  const projectPath = ref('')
  const projectFiles = ref<GameResourceFile[]>([])
  const validationStatus = ref<EngineValidation>()
  const extractedTexts = ref<ResourceTranslation[]>([])
  const errors = ref<string[]>([])

  /**
   * Validates a project folder for the current engine.
   * @param {string} path - Path to the project folder
   * @returns {Promise<EngineValidation | null>} Validation result or null on error
   */
  async function validateEngineProject(path: string): Promise<EngineValidation | null> {
    try {
      const engineType = settingsStore.engineType
      if (!engineType) {
        throw new Error('No engine type selected')
      }
      
      // Use the engine store's validation method
      const result = await engineStore.startEngineProject(path, engineType)
      
      // Handle case where result is an array of GameResourceFiles (success)
      if (Array.isArray(result) && result.length > 0 && typeof result[0] === 'object' && 'path' in result[0]) {
        return {
          isValid: true,
          missingFiles: [],
          errors: []
        }
      } 
      // Handle case where result is an array of error strings (failure)
      else if (Array.isArray(result)) {
        return {
          isValid: false,
          missingFiles: [],
          errors: result as string[]
        }
      }
      // Fallback for unexpected result format
      return {
        isValid: false,
        missingFiles: [],
        errors: ['Unknown validation error']
      }
    } catch (error) {
      errors.value.push('VALIDATION_FAILED: ' + (error instanceof Error ? error.message : 'Project validation failed'))
      console.error('Project validation failed', { path })
      return null
    }
  }
  
  /**
   * Reads all translatable files from a project.
   * @param {string} path - Path to the project folder
   * @returns {Promise<GameResourceFile[]>} Array of translatable files or empty array on error
   */
  async function readEngineProject(path: string): Promise<GameResourceFile[]> {
    try {
      const engineType = settingsStore.engineType
      if (!engineType) {
        throw new Error('No engine type selected')
      }
      
      // Use the engine store to get files
      const result = await engineStore.startEngineProject(path, engineType)
      
      // Check if result is an array of GameResourceFiles (has path property)
      if (Array.isArray(result) && result.length > 0 && typeof result[0] === 'object' && 'path' in result[0]) {
        return result as GameResourceFile[]
      }
      return []
    } catch (error) {
      errors.value.push('READ_FAILED: ' + (error instanceof Error ? error.message : 'Failed to read project files'))
      console.error('Failed to read project files', { path })
      return []
    }
  }

  /**
   * Starts a project by validating, reading files, and extracting translations.
   * @param {string} path - Path to the project folder
   * @returns {Promise<boolean>} True if project started successfully
   */
  async function startEngineProject(path: string): Promise<boolean> {
    try {
      const validation = await validateEngineProject(path)
      
      if (!validation) {
        errors.value = ['Failed to validate project']
        return false
      }

      if (!validation.isValid) {
        errors.value = validation.errors
        return false
      }

      projectFiles.value = await readEngineProject(path)
      if (projectFiles.value.length === 0) {
        errors.value = ['No translatable files found']
        return false
      }

      extractedTexts.value = await engineStore.extractTranslations(
        projectFiles.value, 
        settingsStore.engineType
      )
      projectPath.value = path
      return true
    } catch (error) {
      errors.value = [error instanceof Error ? error.message : 'Unknown error']
      return false
    }
  }

  /**
   * Resets the project store to its initial state.
   */
  function resetProject() {
    projectPath.value = ''
    projectFiles.value = []
    validationStatus.value = undefined
    errors.value = []
    extractedTexts.value = []
    engineStore.$resetEngine()
  }

  return {
    // State
    projectPath,
    projectFiles,
    validationStatus,
    extractedTexts,
    errors,

    // Actions
    startEngineProject,
    resetProject
  }
}) 