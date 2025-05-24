import { defineStore } from 'pinia';
import { ref } from 'vue';

// Define a simple type for language options for clarity
export interface LanguageOption {
  id: string;
  label: string;
}

// Define a type for engine options
export interface EngineOption {
  id: string;
  label: string;
}

export const useSettingsStore = defineStore('settings', () => {
  // --- State ---
  const languageOptions = ref<LanguageOption[]>([
    { id: 'en', label: 'English' },
    { id: 'ja', label: 'Japanese' },
    { id: 'es', label: 'Spanish' },
    { id: 'fr', label: 'French' },
    { id: 'de', label: 'German' },
    { id: 'zh', label: 'Chinese (Simplified)' },
    { id: 'ko', label: 'Korean' },
    // Add more languages as needed
  ]);

  const engineOptions = ref<EngineOption[]>([
    { id: 'ollama', label: 'Ollama (Local)' },
    // { id: 'deepl', label: 'DeepL (Online)' }, // Future option
  ]);

  // --- Getters (if any needed later, e.g., to find a language by id) ---

  // --- Actions (if any needed later, e.g., to load settings from persistent storage) ---

  return {
    languageOptions,
    engineOptions,
  };
}); 