import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useValidateFile } from '../../../src/composables/useValidateFile'
import { readTextFile, exists } from '@tauri-apps/plugin-fs'

vi.mock('@tauri-apps/plugin-fs', () => ({
  readTextFile: vi.fn(),
  exists: vi.fn()
}))

describe('useValidateFile', () => {
  const { isProcessing, lastError, readJsonFile, checkPathExists, validateRequiredFiles, readJsonFiles } = useValidateFile()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('readJsonFile', () => {
    it('should read and parse JSON file successfully', async () => {
      const mockData = { name: 'Test' }
      vi.mocked(readTextFile).mockResolvedValue(JSON.stringify(mockData))

      const result = await readJsonFile('test.json')
      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockData)
      expect(isProcessing.value).toBe(false)
    })

    it('should handle read errors', async () => {
      vi.mocked(readTextFile).mockRejectedValue(new Error('Read failed'))

      const result = await readJsonFile('test.json')
      expect(result.success).toBe(false)
      expect(result.error?.code).toBe('READ_ERROR')
      expect(lastError.value?.code).toBe('READ_ERROR')
      expect(isProcessing.value).toBe(false)
    })
  })

  describe('checkPathExists', () => {
    it('should check if path exists successfully', async () => {
      vi.mocked(exists).mockResolvedValue(true)

      const result = await checkPathExists('test.json')
      expect(result.success).toBe(true)
      expect(result.data).toBe(true)
      expect(isProcessing.value).toBe(false)
    })

    it('should handle check errors', async () => {
      vi.mocked(exists).mockRejectedValue(new Error('Check failed'))

      const result = await checkPathExists('test.json')
      expect(result.success).toBe(false)
      expect(result.error?.code).toBe('CHECK_ERROR')
      expect(lastError.value?.code).toBe('CHECK_ERROR')
      expect(isProcessing.value).toBe(false)
    })
  })

  describe('validateRequiredFiles', () => {
    it('should validate required files successfully', async () => {
      vi.mocked(exists).mockResolvedValue(true)

      const result = await validateRequiredFiles('/game', ['System.json', 'Items.json'])
      expect(result.success).toBe(true)
      expect(result.data).toEqual([])
      expect(isProcessing.value).toBe(false)
    })

    it('should return missing files', async () => {
      vi.mocked(exists)
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false)

      const result = await validateRequiredFiles('/game', ['System.json', 'Items.json'])
      expect(result.success).toBe(true)
      expect(result.data).toEqual(['Items.json'])
      expect(isProcessing.value).toBe(false)
    })

    it('should handle validation errors', async () => {
      vi.mocked(exists).mockRejectedValue(new Error('Validation failed'))

      const result = await validateRequiredFiles('/game', ['System.json'])
      expect(result.success).toBe(false)
      expect(result.error?.code).toBe('VALIDATION_ERROR')
      expect(result.error?.message).toContain('Validation failed')
      expect(lastError.value?.code).toBe('VALIDATION_ERROR')
      expect(isProcessing.value).toBe(false)
    })
  })

  describe('readJsonFiles', () => {
    it('should read multiple JSON files successfully', async () => {
      const mockData1 = { name: 'System' }
      const mockData2 = { name: 'Items' }
      vi.mocked(readTextFile)
        .mockResolvedValueOnce(JSON.stringify(mockData1))
        .mockResolvedValueOnce(JSON.stringify(mockData2))

      const result = await readJsonFiles('/game', ['System.json', 'Items.json'])
      expect(result.success).toBe(true)
      expect(result.data).toHaveLength(2)
      expect(result.data?.[0].content).toEqual(mockData1)
      expect(result.data?.[1].content).toEqual(mockData2)
      expect(isProcessing.value).toBe(false)
    })

    it('should handle read errors for multiple files', async () => {
      vi.mocked(readTextFile).mockRejectedValue(new Error('Read failed'))

      const result = await readJsonFiles('/game', ['System.json'])
      expect(result.success).toBe(false)
      expect(result.error?.code).toBe('BATCH_READ_ERROR')
      expect(lastError.value?.code).toBe('BATCH_READ_ERROR')
      expect(isProcessing.value).toBe(false)
    })
  })
})
