import { defineStore } from 'pinia'
import { ref } from 'vue'
import { invoke } from '@tauri-apps/api/core'
import { useToast, navigateTo } from '#imports' // Assuming navigateTo is auto-imported or available
import type { SourceStringData, WorkingTranslation } from '~/types/translation'; // Updated import

// LanguageOption interface removed as it's now in stores/settings.ts

export const useTranslationStore = defineStore('translation', () => {
  const toast = useToast()

  // --- State ---
  // languageOptions has been moved to stores/settings.ts

  // State for batch translation (moved from project.ts)
  const isLoadingBatchTranslation = ref(false)
  const batchTranslatedStrings = ref<WorkingTranslation[]>([]) // Updated type
  const batchTranslationError = ref<string | null>(null)

  // --- Helper for error messages ---
  const getErrorMessage = (err: unknown, context: string): string => {
    if (typeof err === 'string') return err;
    if (err instanceof Error) return err.message;
    return `Unknown error during ${context}`;
  };

  // --- Actions ---
  async function performBatchTranslation(
    entriesToTranslate: SourceStringData[], // Updated type
    sourceLanguage: string, 
    targetLanguage: string, 
    engineName: string
  ) {
    if (!entriesToTranslate || entriesToTranslate.length === 0) {
      toast.add({ title: 'Batch Translation Error', description: 'No strings provided to translate.', color: 'error' });
      return;
    }

    isLoadingBatchTranslation.value = true;
    batchTranslatedStrings.value = [];
    batchTranslationError.value = null;

    try {
      const results: WorkingTranslation[] = await invoke('batch_translate_strings_command', { // Updated type
        entries: entriesToTranslate,
        sourceLanguage,
        targetLanguage,
        engineName, 
      });
      batchTranslatedStrings.value = results;
      
      const successCount = results.filter(r => r.error === null).length;
      const failureCount = results.length - successCount;

      if (results.length === 0) {
        toast.add({ title: 'Batch Translation', description: 'No strings were processed.', color: 'info' });
      } else if (failureCount === 0) {
        toast.add({ title: 'Batch Translation Successful', description: `Successfully translated ${successCount} string(s).`, color: 'success' });
      } else if (successCount === 0) {
        toast.add({ title: 'Batch Translation Failed', description: `All ${failureCount} string(s) failed to translate. Check individual errors.`, color: 'error' });
      } else {
      toast.add({ 
          title: 'Batch Translation Partially Successful',
          description: `Translated ${successCount} string(s). ${failureCount} string(s) failed. Check results for details.`,
          color: 'warning' 
        });
      }
      // Navigate to the project (results) page after batch translation attempt
      await navigateTo('/project');

    } catch (err) {
      batchTranslationError.value = getErrorMessage(err, 'batch translation');
      toast.add({ title: 'Batch Translation Error', description: batchTranslationError.value, color: 'error' });
    } finally {
      isLoadingBatchTranslation.value = false;
    }
  }

  function $resetBatchState() {
    isLoadingBatchTranslation.value = false;
    batchTranslatedStrings.value = [];
    batchTranslationError.value = null;
  }

  // --- Return state and actions ---
  return {
    isLoadingBatchTranslation,
    batchTranslatedStrings,
    batchTranslationError,
    performBatchTranslation,
    $resetBatchState,
  }
})