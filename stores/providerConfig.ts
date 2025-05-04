import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { load } from '@tauri-apps/plugin-store'
import type { Store } from '@tauri-apps/plugin-store'
import { invoke } from '@tauri-apps/api/core'

// Type definitions that match the backend types
export type OllamaProviderConfig = {
  endpoint_url: string
  model_name: string
}

// This type represents the backend enum format
export type BackendProviderConfig = {
  Ollama: OllamaProviderConfig
}

// Frontend representation
export type ProviderConfig = {
  type: 'ollama'
  config: OllamaProviderConfig
}

// Config store filename
const STORE_FILENAME = 'provider-config.json'

export const useProviderConfigStore = defineStore('providerConfig', () => {
  // State
  const isLoading = ref(false)
  const hasError = ref(false)
  const errorMessage = ref('')
  const store = ref<Store | null>(null)
  const config = ref<ProviderConfig | null>(null)
  const isInitialized = ref(false)

  // Getters
  const isConfigured = computed(() => !!config.value)
  
  // Convert backend enum to frontend type
  const convertFromBackendFormat = (backendConfig: BackendProviderConfig | null): ProviderConfig | null => {
    if (!backendConfig) return null
    
    if ('Ollama' in backendConfig) {
      return {
        type: 'ollama',
        config: backendConfig.Ollama
      }
    }
    
    return null
  }
  
  // Convert frontend type to backend enum
  const convertToBackendFormat = (config: ProviderConfig): BackendProviderConfig => {
    if (config.type === 'ollama') {
      return { Ollama: config.config }
    }
    return { Ollama: { endpoint_url: '', model_name: '' } } // fallback, shouldn't happen
  }

  // Initialize the store
  const init = async () => {
    if (isInitialized.value) return
    
    isLoading.value = true
    hasError.value = false
    errorMessage.value = ''
    
    try {
      // Load or create the store
      store.value = await load(STORE_FILENAME, { autoSave: true })
      if (!store.value) throw new Error('Store could not be loaded')
      
      // Try to get existing config
      const savedConfig = await store.value.get<ProviderConfig>('config') 
      
      if (savedConfig) {
        config.value = savedConfig
      } else {
        // Get default config from backend
        const defaultConfig = await invoke<BackendProviderConfig>('get_default_provider_config')
        config.value = convertFromBackendFormat(defaultConfig)
        
        // Save the default config
        if (config.value) {
          if (!store.value) throw new Error('Store not available for saving default config')
          await store.value.set('config', config.value)
        }
      }
      
      isInitialized.value = true
    } catch (error) {
      hasError.value = true
      const err = error as Error
      errorMessage.value = err.message || 'Failed to initialize provider config'
      console.error('Provider config initialization error:', err)
    } finally {
      isLoading.value = false
    }
  }

  // Validate configuration with backend
  const validateConfig = async (configToValidate: ProviderConfig): Promise<boolean> => {
    isLoading.value = true
    hasError.value = false
    errorMessage.value = ''
    try {
      const backendFormat = convertToBackendFormat(configToValidate)
      await invoke('validate_provider_config', { config: backendFormat })
      return true
    } catch (error) {
      hasError.value = true
      const err = error as Error
      errorMessage.value = typeof error === 'string' ? error : (err.message || 'Invalid configuration') 
      console.error('Config validation error:', error)
      return false
    } finally {
        isLoading.value = false
    }
  }

  // Save configuration
  const saveConfig = async (newConfig: ProviderConfig): Promise<boolean> => {
    if (!store.value) {
        errorMessage.value = 'Store not initialized. Cannot save config.';
        hasError.value = true;
        return false;
    }

    isLoading.value = true
    hasError.value = false
    errorMessage.value = ''
    
    try {
      // Validate before saving
      const isValid = await validateConfig(newConfig)
      if (!isValid) return false
      
      // Update local state
      config.value = newConfig
      
      // Save to store
        await store.value.set('config', newConfig)
      await store.value.save()
      
      return true
    } catch (error) {
      hasError.value = true
      const err = error as Error
      errorMessage.value = err.message || 'Failed to save configuration'
      console.error('Save config error:', err)
      return false
    } finally {
      isLoading.value = false
    }
  }

  // Reset configuration to defaults
  const resetToDefaults = async (): Promise<boolean> => {
    if (!store.value) {
        errorMessage.value = 'Store not initialized. Cannot reset config.';
        hasError.value = true;
        return false;
    }

    isLoading.value = true
    hasError.value = false
    errorMessage.value = ''
    
    try {
      // Get default config from backend
      const defaultConfig = await invoke<BackendProviderConfig>('get_default_provider_config')
      const converted = convertFromBackendFormat(defaultConfig)
      
      if (converted) {
        config.value = converted
        await store.value.set('config', converted)
        await store.value.save()
        return true
      }
      return false
    } catch (error) {
      hasError.value = true
      const err = error as Error
      errorMessage.value = err.message || 'Failed to reset configuration'
      console.error('Reset config error:', err)
      return false
    } finally {
      isLoading.value = false
    }
  }

  // Clear error state
  const clearError = () => {
    hasError.value = false
    errorMessage.value = ''
  }

  return {
    // State
    isLoading,
    hasError,
    errorMessage,
    config,
    isInitialized,
    
    // Getters
    isConfigured,
    
    // Actions
    init,
    saveConfig,
    validateConfig,
    resetToDefaults,
    clearError
  }
})
