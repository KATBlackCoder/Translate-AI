import { defineStore } from 'pinia'
import { ref } from 'vue'
import { invoke } from '@tauri-apps/api/core'
import { useToast, navigateTo } from '#imports'
import type { SourceStringData, WorkingTranslation } from '~/types/translation'
import { useTranslationStore } from './translation'
import type { RpgMakerDetectionResultType } from '~/types/project'

// Define the enum/type for the detection result on the frontend
// Matches the RpgMakerDetectionResult enum in Rust

// TranslatableStringEntry and TranslatedStringEntry are now in translation.ts
// Consider moving to a shared types/ file in the future.

export const useProjectStore = defineStore('project', () => {
  // --- State ---
  const selectedProjectFolderPath = ref<string | null>(null)
  const projectDetectionResult = ref<RpgMakerDetectionResultType | null>(null)
  const isLoadingProjectFolder = ref<boolean>(false)

  const isLoadingExtractedStrings = ref(false)
  const extractedStrings = ref<SourceStringData[]>([])
  const extractionError = ref<string | null>(null)

  const isLoadingReconstruction = ref(false)
  const reconstructionError = ref<string | null>(null)

  // State for ZIP file paths (moved from translation.ts)
  const tempZipPath = ref<string | null>(null)
  const finalZipSavedPath = ref<string | null>(null)
  const saveZipError = ref<string | null>(null)
  const openFolderError = ref<string | null>(null)
  const isLoadingSaveZip = ref(false)

  // --- Toast (initialized once) ---
  const toast = useToast()
  const translationStore = useTranslationStore() // Keep for $resetBatchState and translatedEntries

  // --- Helper for error messages ---
  const getErrorMessage = (err: unknown, context: string): string => {
    if (typeof err === 'string') return err;
    if (err instanceof Error) return err.message;
    return `Unknown error during ${context}`;
  };

  // --- Actions ---
  async function selectProjectFolder() {
    $reset();
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
      extractionError.value = getErrorMessage(err, 'folder selection');
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
      const result: SourceStringData[] = await invoke('extract_project_strings_command', {
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
      extractionError.value = getErrorMessage(err, 'extraction');
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

  async function reconstructAndPackageFiles(translatedEntries: WorkingTranslation[]) {
    if (!selectedProjectFolderPath.value) {
      toast.add({ title: 'Error', description: 'Project path is missing.', color: 'error' });
      return;
    }
    if (!translatedEntries || translatedEntries.length === 0) {
      toast.add({ title: 'Info', description: 'No translated entries to reconstruct.', color: 'info' });
      // Still allow packaging if there are no translated entries, might result in an empty or original zip
    }

    isLoadingReconstruction.value = true;
    reconstructionError.value = null;
    tempZipPath.value = null; // Reset temp path before new operation
    finalZipSavedPath.value = null; // Reset final saved path too

    try {
      const tempZipFilePath: string = await invoke('reconstruct_translated_project_files', {
        projectPath: selectedProjectFolderPath.value,
        translatedEntries: translatedEntries, 
      });

      if (tempZipFilePath) {
        tempZipPath.value = tempZipFilePath; // Set the new temp path here
        toast.add({ 
          title: 'Reconstruction Successful', 
          description: `Project files reconstructed and packaged into a temporary ZIP.`,
          color: 'success'
        });
      } else {
        reconstructionError.value = "Reconstruction command returned an empty path without error.";
        toast.add({ title: 'Reconstruction Warning', description: reconstructionError.value, color: 'warning' });
      }
    } catch (err) {
      reconstructionError.value = getErrorMessage(err, 'reconstruction and packaging');
      toast.add({ title: 'Reconstruction Failed', description: reconstructionError.value, color: 'error' });
    } finally {
      isLoadingReconstruction.value = false;
    }
  }

  async function saveProjectZip() {
    if (!tempZipPath.value) {
      toast.add({ title: 'Error', description: 'No temporary ZIP path available to save.', color: 'error' });
      return;
    }
    isLoadingSaveZip.value = true;
    saveZipError.value = null;
    finalZipSavedPath.value = null; // Clear previous final path

    try {
      const result: string | null = await invoke('save_zip_archive_command', {
        tempZipPath: tempZipPath.value,
      });

      if (result) {
        finalZipSavedPath.value = result;
        toast.add({ title: 'Success', description: `Project ZIP saved to: ${result}`, color: 'success' });
      } else {
        // User cancelled save dialog - not an error, but clear final path
        finalZipSavedPath.value = null;
        toast.add({ title: 'Save Cancelled', description: 'Save operation was cancelled by the user.', color: 'info' });
      }
    } catch (err) {
      saveZipError.value = getErrorMessage(err, 'saving ZIP file');
      toast.add({ title: 'Save ZIP Error', description: saveZipError.value, color: 'error' });
      finalZipSavedPath.value = null;
    } finally {
      isLoadingSaveZip.value = false;
    }
  }

  async function showProjectZipInFolder() {
    if (!finalZipSavedPath.value) {
      toast.add({ title: 'Error', description: 'No final ZIP path available to show.', color: 'error' });
      return;
    }
    openFolderError.value = null;

    try {
      const lastSlash = finalZipSavedPath.value.lastIndexOf('/');
      const lastBackslash = finalZipSavedPath.value.lastIndexOf('\\');
      const index = Math.max(lastSlash, lastBackslash);
      let directoryPath = "."; 
      if (index > -1) {
        directoryPath = finalZipSavedPath.value.substring(0, index);
      }
      
      await invoke('open_folder_command', {
        folderPath: directoryPath,
      });
      toast.add({ title: 'Action Sent', description: `Attempting to open folder: ${directoryPath}`, color: 'info' });
    } catch (err) {
      openFolderError.value = getErrorMessage(err, 'opening folder');
      toast.add({ title: 'Open Folder Error', description: openFolderError.value, color: 'error' });
    }
  }

  // --- Reset Action ---
  function $reset() {
    selectedProjectFolderPath.value = null;
    projectDetectionResult.value = null;
    isLoadingProjectFolder.value = false;

    isLoadingExtractedStrings.value = false;
    extractedStrings.value = [];
    extractionError.value = null;
    isLoadingReconstruction.value = false;
    reconstructionError.value = null;

    // Reset new ZIP related state
    tempZipPath.value = null;
    finalZipSavedPath.value = null;
    saveZipError.value = null;
    openFolderError.value = null;
    isLoadingSaveZip.value = false;

    translationStore.$resetBatchState();
  }

  return {
    selectedProjectFolderPath,
    projectDetectionResult,
    isLoadingProjectFolder,
    isLoadingExtractedStrings,
    extractedStrings,
    extractionError,
    isLoadingReconstruction,
    reconstructionError,
    // Expose new state and actions
    tempZipPath,
    finalZipSavedPath,
    saveZipError,
    openFolderError,
    isLoadingSaveZip,
    selectProjectFolder,
    extractProjectStrings,
    reconstructAndPackageFiles,
    saveProjectZip,
    showProjectZipInFolder,
    $reset,
  }
})
