import { readTextFile, exists } from '@tauri-apps/plugin-fs'
import { ref } from 'vue'

/**
 * Represents a file system operation error
 * @interface FileSystemError
 * @property {string} code - Error code for identifying the type of error
 * @property {string} message - Detailed error message
 */
export interface FileSystemError {
  code: string
  message: string
}

/**
 * Generic result type for file operations
 * @interface FileOperationResult
 * @template T - Type of the operation's data
 * @property {T} [data] - Operation result data if successful
 * @property {FileSystemError} [error] - Error information if operation failed
 * @property {boolean} success - Whether the operation was successful
 */
export interface FileOperationResult<T> {
  data?: T
  error?: FileSystemError
  success: boolean
}

/**
 * Composable for validating and reading game data files
 * Provides functionality to check file existence, read JSON files,
 * and validate required game files
 */
export function useValidateFile() {
  const isProcessing = ref(false)
  const lastError = ref<FileSystemError | null>(null)

  /**
   * Reads and parses a JSON file
   * @param {string} path - Path to the JSON file
   * @returns {Promise<FileOperationResult<any>>} Parsed JSON data or error
   * @example
   * const result = await readJsonFile('data/System.json')
   * if (result.success) {
   *   console.log(result.data)
   * }
   */
  async function readJsonFile(path: string): Promise<FileOperationResult<any>> {
    isProcessing.value = true
    try {
      const content = await readTextFile(path)
      return {
        data: JSON.parse(content),
        success: true
      }
    } catch (e) {
      const error = {
        code: 'READ_ERROR',
        message: `Error reading file ${path}: ${e}`
      }
      lastError.value = error
      return {
        error,
        success: false
      }
    } finally {
      isProcessing.value = false
    }
  }

  /**
   * Checks if a file or directory exists at the given path
   * @param {string} path - Path to check
   * @returns {Promise<FileOperationResult<boolean>>} Whether the path exists
   * @example
   * const result = await checkPathExists('data/Items.json')
   * if (result.success && result.data) {
   *   console.log('File exists')
   * }
   */
  async function checkPathExists(path: string): Promise<FileOperationResult<boolean>> {
    isProcessing.value = true
    try {
      const pathExists = await exists(path)
      return {
        data: pathExists,
        success: true
      }
    } catch (e) {
      const error = {
        code: 'CHECK_ERROR',
        message: `Error checking path ${path}: ${e}`
      }
      lastError.value = error
      return {
        error,
        success: false
      }
    } finally {
      isProcessing.value = false
    }
  }

  /**
   * Validates that all required files exist in the given directory
   * @param {string} basePath - Base directory path
   * @param {string[]} requiredFiles - Array of required file names
   * @returns {Promise<FileOperationResult<string[]>>} Array of missing files or error
   * @example
   * const result = await validateRequiredFiles('data', ['System.json', 'Items.json'])
   * if (result.success && result.data.length === 0) {
   *   console.log('All files present')
   * }
   */
  async function validateRequiredFiles(
    basePath: string,
    requiredFiles: string[]
  ): Promise<FileOperationResult<string[]>> {
    isProcessing.value = true
    const missingFiles: string[] = []

    try {
      for (const file of requiredFiles) {
        const filePath = `${basePath}/${file}`
        const result = await checkPathExists(filePath)
        if (!result.success) {
          throw new Error(`Failed to check path: ${result.error?.message}`)
        }
        if (!result.data) {
          missingFiles.push(file)
        }
      }

      return {
        data: missingFiles,
        success: true
      }
    } catch (e) {
      const error = {
        code: 'VALIDATION_ERROR',
        message: `Error validating files in ${basePath}: ${e}`
      }
      lastError.value = error
      return {
        error,
        success: false
      }
    } finally {
      isProcessing.value = false
    }
  }

  /**
   * Reads multiple JSON files from a directory
   * @param {string} basePath - Base directory path
   * @param {string[]} files - Array of file names to read
   * @returns {Promise<FileOperationResult<Array<{path: string, content: any}>>>} Array of file contents or error
   * @example
   * const result = await readJsonFiles('data', ['System.json', 'Items.json'])
   * if (result.success) {
   *   result.data.forEach(file => console.log(file.path, file.content))
   * }
   */
  async function readJsonFiles(
    basePath: string,
    files: string[]
  ): Promise<FileOperationResult<{ path: string; content: any }[]>> {
    isProcessing.value = true
    const results: { path: string; content: any }[] = []
    const errors: string[] = []

    try {
      for (const file of files) {
        const filePath = `${basePath}/${file}`
        const result = await readJsonFile(filePath)
        
        if (result.success && result.data) {
          results.push({
            path: file,
            content: result.data
          })
        } else {
          errors.push(`Failed to read ${file}: ${result.error?.message}`)
        }
      }

      if (errors.length > 0) {
        throw new Error(errors.join('\n'))
      }

      return {
        data: results,
        success: true
      }
    } catch (e) {
      const error = {
        code: 'BATCH_READ_ERROR',
        message: `Error reading files in ${basePath}: ${e}`
      }
      lastError.value = error
      return {
        error,
        success: false
      }
    } finally {
      isProcessing.value = false
    }
  }

  return {
    // State
    isProcessing,
    lastError,

    // Methods
    readJsonFile,
    checkPathExists,
    validateRequiredFiles,
    readJsonFiles
  }
}
