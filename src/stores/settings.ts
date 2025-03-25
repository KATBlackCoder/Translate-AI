import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { AIProviderType } from '@/services/providers/factory'
import type { GameEngineType } from './engines/engine'
import type { PromptType, PromptSettings, TranslationQualitySettings } from '@/types/ai/base'
import { usePreferredDark } from '@vueuse/core'
import { useRPGMVStore } from './engines/rpgmv'
// TODO: Import new engine store when adding
// import { useNewEngineStore } from './engines/newengine'

/**
 * Store for managing application settings
 * @returns {Object} Settings state and methods
 */
export const useSettingsStore = defineStore('settings', () => {
  const rpgmvStore = useRPGMVStore()
  // TODO: Add new engine store when adding
  // const newEngineStore = useNewEngineStore()

  // Translation Settings
  const sourceLanguage = ref('ja')
  const targetLanguage = ref('en')

  // AI Provider Settings
  const aiProvider = ref<AIProviderType>('ollama')
  const aiModel = ref('mistral')
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
      name: {},
      adult: {}
    }
  })

  // Engine Settings
  // To add a new engine:
  // 1. Add the engine type to GameEngineType in ./engine.ts
  // 2. Create new engine store in src/stores/engines/[engine].ts
  // 3. Create engine-specific handlers in src/services/engines/[engine]/
  const engineType = ref<GameEngineType>('rpgmv')

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

  /**
   * Gets engine-specific configuration
   * @param {string} key - Configuration key
   * @returns {T | undefined} Configuration value
   */
  function getEngineConfig<T>(key: keyof typeof rpgmvStore.settings): T | undefined {
    switch (engineType.value) {
      case 'rpgmv':
        return rpgmvStore.getConfig(key)
      // TODO: Add new engine when adding
      // case 'newengine':
      //   return newEngineStore.getConfig(key)
      default:
        return undefined
    }
  }

  /**
   * Sets engine-specific configuration
   * @param {keyof typeof rpgmvStore.settings} key - Configuration key
   * @param {typeof rpgmvStore.settings[keyof typeof rpgmvStore.settings]} value - Configuration value
   */
  function setEngineConfig<K extends keyof typeof rpgmvStore.settings>(
    key: K, 
    value: typeof rpgmvStore.settings[K]
  ) {
    switch (engineType.value) {
      case 'rpgmv':
        rpgmvStore.setConfig(key, value)
        break
      // TODO: Add new engine when adding
      // case 'newengine':
      //   newEngineStore.setConfig(key, value)
      //   break
    }
  }

  /**
   * Gets custom prompt for a specific type
   * @param {PromptType} type - Prompt type
   * @returns {Object} Custom prompt settings
   */
  function getCustomPrompt(type: PromptType) {
    return promptSettings.value.customPrompts[type]
  }

  /**
   * Sets custom prompt for a specific type
   * @param {PromptType} type - Prompt type
   * @param {string} [system] - System prompt
   * @param {string} [user] - User prompt
   */
  function setCustomPrompt(type: PromptType, system?: string, user?: string) {
    if (!type || !(type in promptSettings.value.customPrompts)) {
      throw new Error(`Invalid prompt type: ${type}`)
    }
    promptSettings.value.customPrompts[type] = { system, user }
  }

  /**
   * Resets all settings to default values
   */
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
        name: {},
        adult: {}
      }
    }

    engineType.value = 'rpgmv'
    rpgmvStore.reset()
    // TODO: Add new engine when adding
    // newEngineStore.reset()
  }

  /**
   * Initializes theme from localStorage or system preference
   */
  const initializeTheme = () => {
    const stored = localStorage.getItem('darkMode')
    isDark.value = stored ? JSON.parse(stored) : systemDark.value
    updateTheme()
  }

  /**
   * Updates theme in DOM and localStorage
   */
  const updateTheme = () => {
    document.documentElement.classList.toggle('dark', isDark.value)
    localStorage.setItem('darkMode', JSON.stringify(isDark.value))
  }

  /**
   * Toggles dark mode
   */
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