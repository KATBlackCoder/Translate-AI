// src/composables/useFileExport.ts
import { ref } from 'vue'
import { open, save } from '@tauri-apps/plugin-dialog'
import { writeFile } from '@tauri-apps/plugin-fs'
import { zip, Zippable } from 'fflate'
import { useEngine } from './useEngine'
import { useTranslationStore } from '@/stores/translation'
import { useToast } from 'primevue/usetoast'

export function useFileExport() {
  const isExporting = ref(false)
  const engine = useEngine()
  const translationStore = useTranslationStore()
  const toast = useToast()

  /**
   * Opens a folder selection dialog
   */
  async function selectFolder(title = 'Select Folder'): Promise<string | null> {
    try {
      const selected = await open({
        directory: true,
        multiple: false,
        title
      })
      return selected as string || null
    } catch (error) {
      console.error('Error selecting folder:', error)
      return null
    }
  }

  /**
   * Creates a zip file from the given files
   */
  async function createZip(files: Record<string, string>): Promise<Uint8Array> {
    return new Promise((resolve, reject) => {
      const zipData: Zippable = {}
      
      for (const [filename, content] of Object.entries(files)) {
        const encoder = new TextEncoder()
        zipData[filename] = encoder.encode(content)
      }
      
      zip(zipData, (err, data) => {
        if (err) reject(err)
        else resolve(data)
      })
    })
  }

  /**
   * Saves a Uint8Array to a file
   */
  async function saveBinaryFile(data: Uint8Array, defaultFilename: string): Promise<string | null> {
    try {
      const filePath = await save({
        filters: [{ name: 'ZIP Archive', extensions: ['zip'] }],
        defaultPath: defaultFilename
      })
      
      if (!filePath) return null
      
      await writeFile(filePath, data)
      return filePath
    } catch (error) {
      console.error('Error saving binary file:', error)
      throw error
    }
  }

  /**
   * Exports translations as a zip file with preserved directory structure
   */
  async function exportTranslations(): Promise<string | null> {
    try {
      isExporting.value = true
      
      if (translationStore.results.length === 0) {
        toast.add({
          severity: 'warn',
          summary: 'No Translations',
          detail: 'There are no translations to export',
          life: 3000
        })
        return null
      }

      // Get the translated files from the engine
      const translatedFiles = await engine.applyTranslations(translationStore.results)

      // Create files for ZIP
      const zipFiles: Record<string, string> = {}
      for (const file of translatedFiles) {
        zipFiles[file.path] = JSON.stringify(file.content, null, 2)
      }
      
      const fileName = `translations_${engine.engineName.value}_${new Date().toISOString().slice(0, 10)}.zip`
      const zipData = await createZip(zipFiles)
      const savedPath = await saveBinaryFile(zipData, fileName)
      
      if (savedPath) {
        toast.add({
          severity: 'success',
          summary: 'Export Complete',
          detail: `Translations exported to: ${savedPath}`,
          life: 3000
        })
      }
      
      return savedPath
    } catch (error) {
      console.error('Error exporting translations as ZIP:', error)
      toast.add({
        severity: 'error',
        summary: 'Export Error',
        detail: error instanceof Error ? error.message : 'Failed to export translations',
        life: 8000
      })
      return null
    } finally {
      isExporting.value = false
    }
  }

  return {
    isExporting,
    selectFolder,
    exportTranslations
  }
}