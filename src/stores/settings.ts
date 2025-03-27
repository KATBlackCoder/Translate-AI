import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { 
  AIProviderType,
  TranslationQualitySettings
} from '@/types/ai/base'
import type { EngineType } from '@/types/engines/base'
import { usePreferredDark } from '@vueuse/core'
import { useRPGMVStore } from './engines/rpgmv'
import { AI_MODEL_PRESETS, getDefaultModelForProvider } from '@/config/provider/ai'
// TODO: Add new engine store when adding
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
  const allowNSFWContent = ref(false)

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

  // Engine Settings
  // To add a new engine:
  // 1. Add the engine type to EngineType in types/engines/base.ts
  // 2. Create new engine store in src/stores/engines/[engine].ts
  // 3. Create engine-specific handlers in src/services/engines/[engine]/
  const engineType = ref<EngineType>('rpgmv')

  // Theme
  const isDark = ref(false)
  const systemDark = usePreferredDark()

  // Validation
  const isAIConfigValid = computed(() => {
    if (aiProvider.value === 'ollama') {
      return Boolean(aiModel.value) && Boolean(baseUrl.value)
    }
    if (aiProvider.value === 'deepseek' || aiProvider.value === 'chatgpt') {
      return Boolean(apiKey.value && baseUrl.value && aiModel.value)
    }
    return Boolean(apiKey.value && aiModel.value)
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
   * Gets available AI models for the selected provider
   * @returns {Record<string, AIModelPreset>} Dictionary of available models
   */
  function getAvailableModels() {
    return AI_MODEL_PRESETS[aiProvider.value] || {}
  }

  /**
   * Gets current model preset
   * @returns {AIModelPreset | undefined} The current model preset or undefined
   */
  function getCurrentModelPreset() {
    const models = AI_MODEL_PRESETS[aiProvider.value]
    return models?.[aiModel.value]
  }

  /**
   * Updates quality settings based on the selected model
   */
  function applyModelPresetDefaults(): void {
    const preset = getCurrentModelPreset()
    if (preset) {
      qualitySettings.value.temperature = preset.defaultTemperature
      qualitySettings.value.maxTokens = preset.defaultMaxTokens
    }
  }

  /**
   * Checks if the current language pair is supported by the selected model
   * @returns {boolean} True if the language pair is supported
   */
  function isLanguagePairSupported(): boolean {
    const preset = getCurrentModelPreset()
    if (!preset || !preset.supportedLanguages) return true // Assume supported if not specified
    
    return preset.supportedLanguages.includes(sourceLanguage.value) && 
           preset.supportedLanguages.includes(targetLanguage.value)
  }

  /**
   * Resets all settings to default values
   */
  function reset() {
    sourceLanguage.value = 'ja'
    targetLanguage.value = 'en'
    allowNSFWContent.value = false
    aiProvider.value = 'ollama'
    aiModel.value = getDefaultModelForProvider('ollama')
    apiKey.value = ''
    baseUrl.value = ''
    
    // Use default values from the mistral preset
    const defaultPreset = AI_MODEL_PRESETS.ollama.mistral
    qualitySettings.value = {
      temperature: defaultPreset.defaultTemperature,
      maxTokens: defaultPreset.defaultMaxTokens,
      retryCount: 3,
      batchSize: 10,
      timeout: 30000
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
    allowNSFWContent,
    
    // AI Settings
    aiProvider,
    aiModel,
    apiKey,
    baseUrl,
    
    // AI Model Presets
    modelPresets: AI_MODEL_PRESETS,
    getAvailableModels,
    getCurrentModelPreset,
    applyModelPresetDefaults,
    isLanguagePairSupported,
    
    // Quality Settings
    qualitySettings,
    
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