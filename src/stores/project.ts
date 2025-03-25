import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { EngineFile, EngineValidation } from '@/types/engines/base'
import type { TranslationTarget } from '@/core/shared/translation'
import { useEngineStore } from './engines/engine'

/**
 * Store for managing project data and operations.
 * Handles project validation, file loading, and translation extraction.
 */
export const useProjectStore = defineStore('project', () => {
  const engineStore = useEngineStore()

  // State
  const projectPath = ref('')
  const projectFiles = ref<EngineFile[]>([])
  const validationStatus = ref<EngineValidation>()
  const extractedTexts = ref<TranslationTarget[]>([])
  const errors = ref<string[]>([])

    /**
   * Validates a project folder for the current engine.
   * @param {string} path - Path to the project folder
   * @returns {Promise<EngineValidation | null>} Validation result or null on error
   */
    async function validateEngineProject(path: string): Promise<EngineValidation | null> {
      return engineStore.withEngine(
        () => engineStore.validateProject(path),
        'VALIDATION_FAILED',
        'Project validation failed',
        { path }
      )
    }
  
    /**
     * Reads all translatable files from a project.
     * @param {string} path - Path to the project folder
     * @returns {Promise<EngineFile[]>} Array of translatable files or empty array on error
     */
    async function readEngineProject(path: string): Promise<EngineFile[]> {
      return engineStore.withEngine(
        () => engineStore.readProject(path),
        'READ_FAILED',
        'Failed to read project files',
        { path }
      )
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
      extractedTexts.value = await engineStore.extractTranslations(projectFiles.value)
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