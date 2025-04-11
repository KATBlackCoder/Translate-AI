// src/utils/fileUtils.ts
import { open, save } from '@tauri-apps/plugin-dialog'
import { writeTextFile, exists, create } from '@tauri-apps/plugin-fs'
import { dirname } from '@tauri-apps/api/path'
import { zip, Zippable } from 'fflate'

/**
 * Opens a folder selection dialog
 */
export async function selectFolder(
  title = 'Select Folder'
): Promise<string | null> {
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
    
    // Convert string content to Uint8Array
    for (const [filename, content] of Object.entries(files)) {
      const encoder = new TextEncoder()
      // Preserve the full path structure in the ZIP
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
    
    // Ensure directory exists
    const dir = await dirname(filePath)
    if (!(await exists(dir))) {
      await create(dir)
    }
    
    // Convert to binary string and save
    const binaryString = String.fromCharCode.apply(null, Array.from(data))
    await writeTextFile(filePath, binaryString)
    
    return filePath
  } catch (error) {
    console.error('Error saving binary file:', error)
    throw error
  }
}

/**
 * Exports data as a zip file with preserved directory structure
 */
export async function exportAsZip(
  files: Record<string, string>,
  defaultFilename = 'export.zip'
): Promise<string | null> {
  try {
    const zipData = await createZip(files)
    return await saveBinaryFile(zipData, defaultFilename)
  } catch (error) {
    console.error('Error exporting as zip:', error)
    throw error
  }
}