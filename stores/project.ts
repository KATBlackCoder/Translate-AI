import { defineStore } from 'pinia'
import { ref } from 'vue'
import { invoke } from '@tauri-apps/api/core'
import { useToast } from '#imports'

// Define the enum/type for the detection result on the frontend
// Matches the RpgMakerDetectionResult enum in Rust
export type RpgMakerDetectionResultType = 
  | 'DetectedByProjectFile' 
  | 'DetectedByWwwData' 
  | 'NotDetected'

// Interface for the structure returned by extract_project_strings_command
export interface TranslatableStringEntry {
  object_id: number; // u32 in Rust maps to number in TS
  text: string;
  source_file: string;
  json_path: string;
}

export const useProjectStore = defineStore('project', () => {
  // --- State ---
  const selectedProjectFolderPath = ref<string | null>(null)
  const projectDetectionResult = ref<RpgMakerDetectionResultType | null>(null)
  const isLoadingProjectFolder = ref<boolean>(false)

  // New state for string extraction test
  const isExtractingStrings = ref(false)
  const extractionResult = ref<TranslatableStringEntry[] | string | null>(null) // Typed array or error string

  // --- Toast (initialized once) ---
  const toast = useToast()

  // --- Actions ---
  async function selectProjectFolder() {
    isLoadingProjectFolder.value = true
    projectDetectionResult.value = null // Reset detection result
    extractionResult.value = null // Reset extraction result too
    try {
      const result = await invoke<
        [string, RpgMakerDetectionResultType] | null
      >('select_project_folder_command')

      if (result && result[0]) {
        selectedProjectFolderPath.value = result[0]
        projectDetectionResult.value = result[1]
        toast.add({ 
          title: 'Project Folder Selected', 
          description: `${result[0]} - Detection: ${result[1]}`,
          color: 'success' 
        })
      } else {
        selectedProjectFolderPath.value = null
        projectDetectionResult.value = null
        // No toast needed if user cancelled, or handled by backend if it was an unexpected null.
      }
    } catch (err) {
      selectedProjectFolderPath.value = null
      projectDetectionResult.value = null
      const errorMessage = typeof err === 'string' ? err : (err instanceof Error ? err.message : 'Unknown error')
      toast.add({ 
        title: 'Error Selecting Folder',
        description: errorMessage,
        color: 'error',
      })
    } finally {
      isLoadingProjectFolder.value = false
    }
  }

  // New action to test string extraction
  async function performExtractionTest() {
    if (!selectedProjectFolderPath.value) {
      toast.add({ title: 'Error', description: 'No project folder selected.', color: 'error' })
      return
    }

    isExtractingStrings.value = true
    extractionResult.value = null
    console.log(`Attempting to extract strings from: ${selectedProjectFolderPath.value}`)

    try {
      // Use the new interface for the expected result type
      const result: TranslatableStringEntry[] = await invoke('extract_project_strings_command', {
        projectPath: selectedProjectFolderPath.value,
      })
      extractionResult.value = result
      console.log('Extraction Result:', result)
      toast.add({ 
        title: 'Extraction Test Complete',
        description: `Successfully extracted ${result.length} string(s). Check console for details.`,
        color: 'success',
      })
    } catch (err) {
      const errorMessage = typeof err === 'string' ? err : (err instanceof Error ? err.message : 'Unknown error during extraction')
      extractionResult.value = errorMessage
      console.error('Extraction Error:', err)
      toast.add({ 
        title: 'Extraction Test Failed',
        description: errorMessage,
        color: 'error',
      })
    } finally {
      isExtractingStrings.value = false
    }
  }

  // --- Return state and actions ---
  return {
    selectedProjectFolderPath,
    projectDetectionResult,
    isLoadingProjectFolder,
    isExtractingStrings,
    extractionResult,
    selectProjectFolder,
    performExtractionTest,
  }
})
