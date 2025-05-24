import { defineStore } from 'pinia'
import { ref } from 'vue'
import { invoke } from '@tauri-apps/api/core'
import { useToast, navigateTo } from '#imports'
import type { TranslatableStringEntry } from './translation'
import { useTranslationStore } from './translation'

// Define the enum/type for the detection result on the frontend
// Matches the RpgMakerDetectionResult enum in Rust
export type RpgMakerDetectionResultType = 
  | 'DetectedByProjectFile' 
  | 'DetectedByWwwData' 
  | 'NotDetected'

// TranslatableStringEntry and TranslatedStringEntry are now in translation.ts
// Consider moving to a shared types/ file in the future.

export const useProjectStore = defineStore('project', () => {
  // --- State ---
  const selectedProjectFolderPath = ref<string | null>(null)
  const projectDetectionResult = ref<RpgMakerDetectionResultType | null>(null)
  const isLoadingProjectFolder = ref<boolean>(false)

  const isLoadingExtractedStrings = ref(false)
  const extractedStrings = ref<TranslatableStringEntry[]>([])
  const extractionError = ref<string | null>(null)

  // Batch translation state and actions are moved to stores/translation.ts

  // --- Toast (initialized once) ---
  const toast = useToast()

  // --- Helper for error messages ---
  const getErrorMessage = (err: unknown, context: string): string => {
    if (typeof err === 'string') return err;
    if (err instanceof Error) return err.message;
    return `Unknown error during ${context}`;
  };

  // --- Actions ---
  async function selectProjectFolder() {
    $reset(); // This will now also call translationStore.$resetBatchState()
    isLoadingProjectFolder.value = true; 

    try {
      const result = await invoke<
        [string, RpgMakerDetectionResultType] | null
      >('select_project_folder_command');

      if (result && result[0]) {
        selectedProjectFolderPath.value = result[0];
        projectDetectionResult.value = result[1];
        
        toast.add({ 
          title: 'Project Folder Selected', 
          description: `${selectedProjectFolderPath.value} - Detection: ${projectDetectionResult.value}`,
          color: projectDetectionResult.value !== 'NotDetected' ? 'success' : 'warning' 
        });

        if (projectDetectionResult.value && projectDetectionResult.value !== 'NotDetected') {
          await extractProjectStrings(); 
        }
      } 
    } catch (err) {
      selectedProjectFolderPath.value = null;
      projectDetectionResult.value = null;
      extractionError.value = getErrorMessage(err, 'folder selection'); // Use helper
      toast.add({ 
        title: 'Error Selecting Folder',
        description: extractionError.value,
        color: 'error',
      });
    } finally {
      isLoadingProjectFolder.value = false;
    }
  }

  async function extractProjectStrings() {
    if (!selectedProjectFolderPath.value) {
      extractionError.value = 'No project folder selected. Cannot extract strings.'
      toast.add({ title: 'Error', description: extractionError.value, color: 'error' })
      return
    }
    if (projectDetectionResult.value === 'NotDetected' || projectDetectionResult.value === null) {
        extractionError.value = 'Project not detected or detection failed. Cannot extract strings.'
        toast.add({ title: 'Error', description: extractionError.value, color: 'error' })
        return
    }

    isLoadingExtractedStrings.value = true
    extractedStrings.value = [] 
    extractionError.value = null 

    try {
      const result: TranslatableStringEntry[] = await invoke('extract_project_strings_command', {
        projectPath: selectedProjectFolderPath.value,
      })
      extractedStrings.value = result
      if (result.length === 0) {
        toast.add({ 
          title: 'Extraction Complete',
          description: 'No translatable strings found in the project.',
          color: 'info',
        })
      } else {
      toast.add({ 
          title: 'Extraction Successful',
          description: `Successfully extracted ${result.length} string(s). Proceed to review & translate.`,
        color: 'success',
      })
      }
      await navigateTo('/project');
    } catch (err) {
      extractionError.value = getErrorMessage(err, 'extraction'); // Use helper
      extractedStrings.value = [] 
      toast.add({ 
        title: 'Extraction Failed',
        description: extractionError.value,
        color: 'error',
      })
    } finally {
      isLoadingExtractedStrings.value = false
    }
  }

  // performBatchTranslation action removed

  // --- Reset Action ---
  function $reset() {
    selectedProjectFolderPath.value = null;
    projectDetectionResult.value = null;
    isLoadingProjectFolder.value = false;

    isLoadingExtractedStrings.value = false;
    extractedStrings.value = [];
    extractionError.value = null;

    // Reset batch state in translationStore as well
    const translationStore = useTranslationStore();
    translationStore.$resetBatchState();
  }

  return {
    selectedProjectFolderPath,
    projectDetectionResult,
    isLoadingProjectFolder,
    isLoadingExtractedStrings,
    extractedStrings,
    extractionError,
    selectProjectFolder,
    extractProjectStrings,
    $reset,
  }
})
