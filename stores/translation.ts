import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { invoke } from '@tauri-apps/api/core' // Import invoke
// useToast will be auto-imported by Nuxt 3

// Define a simple type for language options for clarity
interface LanguageOption {
  id: string
  label: string
}

export const useTranslationStore = defineStore('translation', () => {
  const toast = useToast() // Initialize useToast

  // --- State ---
  const sourceLanguage = ref<string>('en') // Default: English
  const targetLanguage = ref<string>('ja') // Default: Japanese
  const sourceText = ref<string>('')
  const targetText = ref<string>('')
  const isLoading = ref<boolean>(false)

  const languageOptions = ref<LanguageOption[]>([
    { id: 'en', label: 'English' },
    { id: 'ja', label: 'Japanese' },
    { id: 'es', label: 'Spanish' },
    { id: 'fr', label: 'French' },
    { id: 'de', label: 'German' },
    { id: 'zh', label: 'Chinese (Simplified)' },
    { id: 'ko', label: 'Korean' },
    // Add more languages as needed
  ])

  // --- Getters (Computed Properties) ---
  const canTranslate = computed(() => sourceText.value.trim() !== '' && !isLoading.value)

  // --- Actions (Functions) ---
  function setSourceLanguage(langId: string) {
    sourceLanguage.value = langId
  }

  function setTargetLanguage(langId: string) {
    targetLanguage.value = langId
  }

  function setSourceText(text: string) {
    sourceText.value = text
    if (!text) {
      targetText.value = '' // Clear target if source is emptied
    }
  }

  function setTargetText(text: string) { // Usually set by the translation result
    targetText.value = text
  }

  function swapLanguages() {
    const tempLang = sourceLanguage.value
    sourceLanguage.value = targetLanguage.value
    targetLanguage.value = tempLang

    // Optionally, swap text as well if it makes sense for the UX
    // const tempText = sourceText.value
    // sourceText.value = targetText.value
    // targetText.value = tempText
  }

  function clearTexts() {
    sourceText.value = ''
    targetText.value = ''
  }

  async function handleTranslate() {
    if (!canTranslate.value) return

    isLoading.value = true
    targetText.value = '' // Clear previous or show loading indicator in UI

    try {
      // Invoke the actual translation Rust command
      const result: string = await invoke('translate_text_command', {
        text: sourceText.value,
        sourceLang: sourceLanguage.value, // Ensure key names match Rust command args
        targetLang: targetLanguage.value  // Ensure key names match Rust command args
      })
      setTargetText(result)

    } catch (error) {
      console.error("IPC call to translate_text_command failed:", error)
      // Display error using toast
      toast.add({ 
        title: 'Translation Error', 
        description: String(error), // Backend error string is already quite descriptive 
        color: 'error',
        icon: 'i-heroicons-x-circle-solid' // Using a solid icon
      })
      setTargetText('') // Clear the target text area on error
    } finally {
      isLoading.value = false
    }
  }

  // --- Return state and actions ---
  return {
    sourceLanguage,
    targetLanguage,
    sourceText,
    targetText,
    isLoading,
    languageOptions,
    canTranslate,
    setSourceLanguage,
    setTargetLanguage,
    setSourceText,
    setTargetText, // Exposing this though it's mainly internal for translateText
    swapLanguages,
    clearTexts,
    handleTranslate,
  }
})