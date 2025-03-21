import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { EngineFile, EngineValidation, TranslationTarget } from '@/types/engines/base'
import type { AIProviderType } from '@/services/ai/factory'

export const useTranslationStore = defineStore('translation', () => {
  // Project State
  const projectPath = ref('')
  const engineType = ref<'rpgmv'>('rpgmv')
  const projectFiles = ref<EngineFile[]>([])
  const validationStatus = ref<EngineValidation | null>(null)

  // Translation Settings
  const sourceLanguage = ref('ja')
  const targetLanguage = ref('en')
  const aiProvider = ref<AIProviderType>('ollama')
  const aiModel = ref('mistral')
  const apiKey = ref('')

  // Translation State
  const extractedTexts = ref<TranslationTarget[]>([])
  const translatedTexts = ref<TranslationTarget[]>([])
  const currentFile = ref('')
  const progress = ref(0)
  const errors = ref<string[]>([])

  return {
    // Project
    projectPath,
    engineType,
    projectFiles,
    validationStatus,
    
    // Settings
    sourceLanguage,
    targetLanguage,
    aiProvider,
    aiModel,
    apiKey,
    
    // Translation State
    extractedTexts,
    translatedTexts,
    currentFile,
    progress,
    errors
  }
}) 