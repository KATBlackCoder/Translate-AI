import { describe, it, expect } from 'vitest'
import type { EngineFile, EngineValidation, GameEngine } from '../../../../../../src/types/engines/base'

describe('EngineFile', () => {
  it('should validate file structure', () => {
    const file: EngineFile = {
      path: 'www/data/Actors.json',
      type: 'actors',
      content: {}
    }

    expect(file.path).toBeDefined()
    expect(typeof file.path).toBe('string')
    expect(file.type).toBeDefined()
    expect(typeof file.type).toBe('string')
    expect(file.content).toBeDefined()
  })

  it('should allow any content type', () => {
    const file: EngineFile = {
      path: 'www/data/Actors.json',
      type: 'actors',
      content: null
    }
    expect(file.content).toBeNull()
  })
})

describe('EngineValidation', () => {
  it('should validate structure', () => {
    const validation: EngineValidation = {
      isValid: true,
      requiredFiles: ['Actors.json'],
      errors: []
    }

    expect(validation.isValid).toBeDefined()
    expect(typeof validation.isValid).toBe('boolean')
    expect(Array.isArray(validation.requiredFiles)).toBe(true)
    expect(Array.isArray(validation.errors)).toBe(true)
  })

  it('should handle validation errors', () => {
    const validation: EngineValidation = {
      isValid: false,
      requiredFiles: ['Actors.json'],
      errors: ['File not found']
    }

    expect(validation.isValid).toBe(false)
    expect(validation.errors).toHaveLength(1)
    expect(validation.errors[0]).toBe('File not found')
  })
})

describe('GameEngine', () => {
  it('should validate required properties', () => {
    const engine: GameEngine = {
      name: 'Test Engine',
      version: '1.0.0',
      validateProject: async () => ({ isValid: true, requiredFiles: [], errors: [] }),
      readProject: async () => [],
      extractTranslations: async () => [],
      applyTranslations: async () => []
    }

    expect(engine.name).toBeDefined()
    expect(typeof engine.name).toBe('string')
    expect(engine.version).toBeDefined()
    expect(typeof engine.version).toBe('string')
  })

  it('should validate async methods', () => {
    const engine: GameEngine = {
      name: 'Test Engine',
      version: '1.0.0',
      validateProject: async () => ({ isValid: true, requiredFiles: [], errors: [] }),
      readProject: async () => [],
      extractTranslations: async () => [],
      applyTranslations: async () => []
    }

    expect(engine.validateProject('')).toBeInstanceOf(Promise)
    expect(engine.readProject('')).toBeInstanceOf(Promise)
    expect(engine.extractTranslations([])).toBeInstanceOf(Promise)
    expect(engine.applyTranslations([], [])).toBeInstanceOf(Promise)
  })
})
