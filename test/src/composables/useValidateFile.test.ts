import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useValidateFile } from '../../../src/composables/useValidateFile'
import { readTextFile, exists } from '@tauri-apps/plugin-fs'

// Mock the Tauri plugin-fs
vi.mock('@tauri-apps/plugin-fs', () => ({
  readTextFile: vi.fn(),
  exists: vi.fn()
}))

describe('useValidateFile', () => {
  beforeEach(() => {
    // Reset all mocks
    vi.resetAllMocks()
  })
  
  it('should read and parse a JSON file successfully', async () => {
    const mockJsonContent = '{"name": "Test", "value": 123}'
    const mockJsonObject = { name: 'Test', value: 123 }
    
    // Setup mock implementation
    vi.mocked(readTextFile).mockResolvedValue(mockJsonContent)
    
    const validator = useValidateFile()
    const result = await validator.readJsonFile('test.json')
    
    expect(readTextFile).toHaveBeenCalledWith('test.json')
    expect(result.success).toBe(true)
    expect(result.data).toEqual(mockJsonObject)
    expect(result.error).toBeUndefined()
    expect(validator.isProcessing.value).toBe(false)
  })
  
  it('should handle errors when reading JSON file', async () => {
    // Setup mock to throw error
    vi.mocked(readTextFile).mockRejectedValue(new Error('File not found'))
    
    const validator = useValidateFile()
    const result = await validator.readJsonFile('invalid.json')
    
    expect(readTextFile).toHaveBeenCalledWith('invalid.json')
    expect(result.success).toBe(false)
    expect(result.data).toBeUndefined()
    expect(result.error).toEqual({
      code: 'READ_ERROR',
      message: expect.stringContaining('File not found')
    })
    expect(validator.lastError.value).toEqual({
      code: 'READ_ERROR',
      message: expect.stringContaining('File not found')
    })
    expect(validator.isProcessing.value).toBe(false)
  })
  
  it('should handle JSON parsing errors', async () => {
    const invalidJson = '{name: "Test", value: 123' // Missing closing brace
    
    // Setup mock implementation
    vi.mocked(readTextFile).mockResolvedValue(invalidJson)
    
    const validator = useValidateFile()
    const result = await validator.readJsonFile('malformed.json')
    
    expect(readTextFile).toHaveBeenCalledWith('malformed.json')
    expect(result.success).toBe(false)
    expect(result.data).toBeUndefined()
    expect(result.error?.code).toBe('READ_ERROR')
    expect(validator.isProcessing.value).toBe(false)
  })
  
  it('should check if a path exists successfully', async () => {
    // Setup mock implementation
    vi.mocked(exists).mockResolvedValue(true)
    
    const validator = useValidateFile()
    const result = await validator.checkPathExists('exists.json')
    
    expect(exists).toHaveBeenCalledWith('exists.json')
    expect(result.success).toBe(true)
    expect(result.data).toBe(true)
    expect(result.error).toBeUndefined()
    expect(validator.isProcessing.value).toBe(false)
  })
  
  it('should handle errors when checking if path exists', async () => {
    // Setup mock to throw error
    vi.mocked(exists).mockRejectedValue(new Error('Invalid path'))
    
    const validator = useValidateFile()
    const result = await validator.checkPathExists('invalid/path')
    
    expect(exists).toHaveBeenCalledWith('invalid/path')
    expect(result.success).toBe(false)
    expect(result.data).toBeUndefined()
    expect(result.error).toEqual({
      code: 'CHECK_ERROR',
      message: expect.stringContaining('Invalid path')
    })
    expect(validator.lastError.value).toEqual({
      code: 'CHECK_ERROR',
      message: expect.stringContaining('Invalid path')
    })
    expect(validator.isProcessing.value).toBe(false)
  })
  
  it('should validate required files successfully', async () => {
    // Setup mock implementation for exists
    vi.mocked(exists)
      .mockResolvedValueOnce(true)  // First file exists
      .mockResolvedValueOnce(false) // Second file doesn't exist
      .mockResolvedValueOnce(true)  // Third file exists
    
    const validator = useValidateFile()
    const result = await validator.validateRequiredFiles('/data', [
      'file1.json',
      'file2.json',
      'file3.json'
    ])
    
    expect(exists).toHaveBeenCalledTimes(3)
    expect(exists).toHaveBeenCalledWith('/data/file1.json')
    expect(exists).toHaveBeenCalledWith('/data/file2.json')
    expect(exists).toHaveBeenCalledWith('/data/file3.json')
    
    expect(result.success).toBe(true)
    expect(result.data).toEqual(['file2.json']) // Only the second file is missing
    expect(validator.isProcessing.value).toBe(false)
  })
  
  it('should handle errors when validating required files', async () => {
    // Setup mock for the first call to succeed, second to fail
    vi.mocked(exists)
      .mockResolvedValueOnce(true)
      .mockRejectedValueOnce(new Error('Access denied'))
    
    const validator = useValidateFile()
    const result = await validator.validateRequiredFiles('/data', [
      'file1.json',
      'file2.json'
    ])
    
    expect(exists).toHaveBeenCalledTimes(2)
    expect(result.success).toBe(false)
    expect(result.data).toBeUndefined()
    expect(result.error?.code).toBe('VALIDATION_ERROR')
    expect(validator.isProcessing.value).toBe(false)
  })
  
  it('should read multiple JSON files successfully', async () => {
    const mockContents = [
      '{"id": 1, "name": "File 1"}',
      '{"id": 2, "name": "File 2"}'
    ]
    
    // Setup mock implementation
    vi.mocked(readTextFile)
      .mockResolvedValueOnce(mockContents[0])
      .mockResolvedValueOnce(mockContents[1])
    
    const validator = useValidateFile()
    const result = await validator.readJsonFiles('/data', [
      'file1.json',
      'file2.json'
    ])
    
    expect(readTextFile).toHaveBeenCalledTimes(2)
    expect(readTextFile).toHaveBeenCalledWith('/data/file1.json')
    expect(readTextFile).toHaveBeenCalledWith('/data/file2.json')
    
    expect(result.success).toBe(true)
    expect(result.data).toHaveLength(2)
    expect(result.data?.[0]).toEqual({
      path: 'file1.json',
      content: { id: 1, name: 'File 1' }
    })
    expect(result.data?.[1]).toEqual({
      path: 'file2.json',
      content: { id: 2, name: 'File 2' }
    })
    expect(validator.isProcessing.value).toBe(false)
  })
  
  it('should handle errors when reading multiple JSON files', async () => {
    // First file succeeds, second file fails
    vi.mocked(readTextFile)
      .mockResolvedValueOnce('{"id": 1, "name": "File 1"}')
      .mockRejectedValueOnce(new Error('File not found'))
    
    const validator = useValidateFile()
    const result = await validator.readJsonFiles('/data', [
      'file1.json',
      'file2.json'
    ])
    
    expect(readTextFile).toHaveBeenCalledTimes(2)
    expect(result.success).toBe(false)
    expect(result.error?.code).toBe('BATCH_READ_ERROR')
    expect(validator.isProcessing.value).toBe(false)
  })
})
