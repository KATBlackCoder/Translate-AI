import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { EngineFile, EngineValidation, TranslationTarget } from '@/types/engines/base'
import { useEngineStore } from './engine'

export const useProjectStore = defineStore('project', () => {
  const engineStore = useEngineStore()

  const projectPath = ref('')
  const projectFiles = ref<EngineFile[]>([])
  const validationStatus = ref<EngineValidation>()
  const extractedTexts = ref<TranslationTarget[]>([])
  const errors = ref<string[]>([])

  async function validateProject(path: string) {
    try {
      errors.value = []
      projectPath.value = path
      
      engineStore.initializeEngine()
      const validation = await engineStore.validateProject(path)
      
      if (!validation) {
        errors.value = ['Failed to validate project']
        return false
      }

      validationStatus.value = validation
      
      if (!validation.isValid) {
        errors.value = validation.errors
        return false
      }
      
      projectFiles.value = await engineStore.readProject(path)
      extractedTexts.value = engineStore.extractTranslations(projectFiles.value)
      return true
    } catch (error) {
      errors.value = [error instanceof Error ? error.message : 'Unknown error']
      return false
    }
  }

  function resetProject() {
    projectPath.value = ''
    projectFiles.value = []
    validationStatus.value = undefined
    errors.value = []
    extractedTexts.value = []
    engineStore.reset()
  }

  return {
    projectPath,
    projectFiles,
    validationStatus,
    extractedTexts,
    errors,
    validateProject,
    resetProject
  }
}) 