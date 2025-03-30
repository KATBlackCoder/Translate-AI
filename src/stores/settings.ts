import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { OLLAMA_DEFAULTS } from '@/config/provider/ai/ollama'
/**
 * Store for managing application settings
 * Handles translation configuration, AI provider settings, and quality settings
 */
export const useSettingsStore = defineStore('settings', () => {
  // Language settings
  const sourceLanguage = ref<string>('ja')
  const targetLanguage = ref<string>('en')
  
  // AI provider settings
  const aiProvider = ref<string>(OLLAMA_DEFAULTS.providerType)
  const aiModel = ref<string>(OLLAMA_DEFAULTS.defaultModel)
  const apiKey = ref<string>('')
  const baseUrl = ref<string>(OLLAMA_DEFAULTS.baseUrl)
  
  // Content settings
  const allowNSFWContent = ref<boolean>(true)
  
  // Theme settings
  const isDark = ref(false)
  
  // Quality settings
  const qualitySettings = ref({
    temperature: OLLAMA_DEFAULTS.defaultTemperature,
    maxTokens: OLLAMA_DEFAULTS.defaultMaxTokens,
    retryCount: OLLAMA_DEFAULTS.retryCount, 
    batchSize: OLLAMA_DEFAULTS.batchSize,
    timeout: OLLAMA_DEFAULTS.timeout
  })
  
  // Computed properties
  const isAIConfigValid = computed(() => {
    const validProvider = !!aiProvider.value
    const validModel = !!aiModel.value
    
    // Different validation depending on provider
    if (aiProvider.value === 'ollama') {
      return validProvider && validModel && !!baseUrl.value
    } else if (aiProvider.value === 'chatgpt' || aiProvider.value === 'deepseek') {
      return validProvider && validModel && !!apiKey.value
    }
    
    return false
  })
  
  const isTranslationConfigValid = computed(() => {
    return !!sourceLanguage.value && 
           !!targetLanguage.value && 
           sourceLanguage.value !== targetLanguage.value
  })
  
  /**
   * Save settings to local storage
   */
  function saveSettings() {
    const settings = {
      sourceLanguage: sourceLanguage.value,
      targetLanguage: targetLanguage.value,
      aiProvider: aiProvider.value,
      aiModel: aiModel.value,
      apiKey: apiKey.value,
      baseUrl: baseUrl.value,
      allowNSFWContent: allowNSFWContent.value,
      qualitySettings: qualitySettings.value
    }
    
    localStorage.setItem('translation-ai-settings', JSON.stringify(settings))
  }
  
  /**
   * Load settings from local storage
   */
  function loadSettings() {
    const savedSettings = localStorage.getItem('translation-ai-settings')
    if (!savedSettings) return
    
    try {
      const settings = JSON.parse(savedSettings)
      
      // Update refs with saved values
      sourceLanguage.value = settings.sourceLanguage || 'ja'
      targetLanguage.value = settings.targetLanguage || 'en'
      aiProvider.value = settings.aiProvider || OLLAMA_DEFAULTS.providerType
      aiModel.value = settings.aiModel || OLLAMA_DEFAULTS.defaultModel
      apiKey.value = settings.apiKey || ''
      baseUrl.value = settings.baseUrl || OLLAMA_DEFAULTS.baseUrl
      allowNSFWContent.value = settings.allowNSFWContent || false
      
      // Merge quality settings with defaults
      qualitySettings.value = {
        ...qualitySettings.value,
        ...settings.qualitySettings
      }
    } catch (error) {
      console.error('Error loading settings:', error)
    }
  }
  
  /**
   * Reset settings to defaults
   */
  function resetSettings() {
    sourceLanguage.value = 'ja'
    targetLanguage.value = 'en'
    aiProvider.value = 'ollama'
    aiModel.value = 'mistral'
    apiKey.value = ''
    baseUrl.value = 'http://localhost:11434/api'
    allowNSFWContent.value = false
    
    qualitySettings.value = {
      temperature: 0.7,
      maxTokens: 2000,
      retryCount: 3,
      batchSize: 5,
      timeout: 30000
    }
    
    // Remove from local storage
    localStorage.removeItem('translation-ai-settings')
  }
  
  /**
   * Toggle between dark and light mode
   */
  function toggleDarkMode() {
    isDark.value = !isDark.value
    updateTheme()
  }
  
  /**
   * Initialize theme based on system preference
   */
  function initializeTheme() {
    // Use system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    isDark.value = prefersDark
    updateTheme()
  }
  
  /**
   * Update the document theme based on current isDark state
   */
  function updateTheme() {
    if (isDark.value) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }
  
  // Load settings on store creation
  loadSettings()
  
  return {
    // State
    sourceLanguage,
    targetLanguage,
    aiProvider,
    aiModel,
    apiKey,
    baseUrl,
    allowNSFWContent,
    qualitySettings,
    isDark,
    
    // Computed
    isAIConfigValid,
    isTranslationConfigValid,
    
    // Methods
    saveSettings,
    loadSettings,
    resetSettings,
    toggleDarkMode,
    initializeTheme
  }
}) 