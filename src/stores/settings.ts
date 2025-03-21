import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { AIProviderType } from '@/services/ai/factory'
import type { GameEngineType } from './engine'
import type { PromptType } from '@/types/ai/base'
import { usePreferredDark } from '@vueuse/core'

export interface TranslationQualitySettings {
  temperature: number
  maxTokens: number
  retryCount: number
  batchSize: number
  timeout: number
}

export interface PromptSettings {
  customPrompts: Record<PromptType, {
    system?: string
    user?: string
  }>
}

export const useSettingsStore = defineStore('settings', () => {
  // Translation Settings
  const sourceLanguage = ref('')
  const targetLanguage = ref('')

  // AI Provider Settings
  const aiProvider = ref<AIProviderType>('ollama')
  const aiModel = ref('')
  const apiKey = ref('')
  const baseUrl = ref('')

  // Quality Settings
  const qualitySettings = ref<TranslationQualitySettings>({
    temperature: 0.3,
    maxTokens: 1000,
    retryCount: 3,
    batchSize: 10,
    timeout: 30000
  })

  // Prompt Settings
  const promptSettings = ref<PromptSettings>({
    customPrompts: {
      general: {},
      dialogue: {},
      menu: {},
      items: {},
      skills: {},
      name: {}
    }
  })

  // Engine Settings
  const engineType = ref<GameEngineType>('rpgmv')
  const engineSettings = ref<Record<string, any>>({
    rpgmv: {
      dataDir: 'www/data',
      encoding: 'utf8',
      skipEmptyLines: true,
      preserveFormatting: true
    }
  })

  // Theme
  const isDark = ref(false)
  const systemDark = usePreferredDark()

  // Validation
  const isAIConfigValid = computed(() => {
    if (aiProvider.value === 'ollama') {
      return Boolean(aiModel.value)
    }
    if (aiProvider.value === 'deepseek' || aiProvider.value === 'chatgpt') {
      return Boolean(apiKey.value && baseUrl.value)
    }
    return Boolean(apiKey.value)
  })

  const isTranslationConfigValid = computed(() => {
    return Boolean(sourceLanguage.value && targetLanguage.value)
  })

  const isQualityConfigValid = computed(() => {
    const q = qualitySettings.value
    return (
      q.temperature >= 0 && 
      q.temperature <= 2 &&
      q.maxTokens > 0 &&
      q.retryCount > 0 &&
      q.batchSize > 0 &&
      q.timeout >= 1000
    )
  })

  function getEngineConfig<T>(key: string): T | undefined {
    return engineSettings.value[engineType.value]?.[key]
  }

  function setEngineConfig(key: string, value: any) {
    if (!engineSettings.value[engineType.value]) {
      engineSettings.value[engineType.value] = {}
    }
    engineSettings.value[engineType.value][key] = value
  }

  function getCustomPrompt(type: PromptType) {
    return promptSettings.value.customPrompts[type]
  }

  function setCustomPrompt(type: PromptType, system?: string, user?: string) {
    promptSettings.value.customPrompts[type] = { system, user }
  }

  function reset() {
    sourceLanguage.value = ''
    targetLanguage.value = ''
    aiProvider.value = 'ollama'
    aiModel.value = ''
    apiKey.value = ''
    baseUrl.value = ''
    
    qualitySettings.value = {
      temperature: 0.3,
      maxTokens: 1000,
      retryCount: 3,
      batchSize: 10,
      timeout: 30000
    }

    promptSettings.value = {
      customPrompts: {
        general: {},
        dialogue: {},
        menu: {},
        items: {},
        skills: {},
        name: {}
      }
    }

    engineType.value = 'rpgmv'
    engineSettings.value = {
      rpgmv: {
        dataDir: 'www/data',
        encoding: 'utf8',
        skipEmptyLines: true,
        preserveFormatting: true
      }
    }
  }

  // Initialize theme from localStorage or system preference
  const initializeTheme = () => {
    const stored = localStorage.getItem('darkMode')
    isDark.value = stored ? JSON.parse(stored) : systemDark.value
    updateTheme()
  }

  // Update theme
  const updateTheme = () => {
    document.documentElement.classList.toggle('dark', isDark.value)
    localStorage.setItem('darkMode', JSON.stringify(isDark.value))
  }

  // Toggle theme
  const toggleDarkMode = () => {
    isDark.value = !isDark.value
    updateTheme()
  }

  return {
    // Translation Settings
    sourceLanguage,
    targetLanguage,
    
    // AI Settings
    aiProvider,
    aiModel,
    apiKey,
    baseUrl,
    
    // Quality Settings
    qualitySettings,
    
    // Prompt Settings
    promptSettings,
    getCustomPrompt,
    setCustomPrompt,
    
    // Engine Settings
    engineType,
    engineSettings,
    getEngineConfig,
    setEngineConfig,

    // Validation
    isAIConfigValid,
    isTranslationConfigValid,
    isQualityConfigValid,
    
    // Actions
    reset,

    // Theme
    isDark,
    initializeTheme,
    toggleDarkMode,
  }
}) 