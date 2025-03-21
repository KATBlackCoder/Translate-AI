import { describe, it, expect } from 'vitest'
import type { TranslationTarget, EngineFile, EngineValidation, GameEngine } from '../../../../src/types/engines/base'

describe('Base Engine Types', () => {
  describe('TranslationTarget', () => {
    it('should validate translation target structure', () => {
      const target: TranslationTarget = {
        key: 'actor.name',
        source: '源氏',
        target: 'Genji',
        context: 'Character name',
        file: 'data/Actors.json'
      }

      expect(target.key).toBeTypeOf('string')
      expect(target.source).toBeTypeOf('string')
      expect(target.target).toBeTypeOf('string')
      expect(target.file).toBeTypeOf('string')
      expect(target.context).toBeTypeOf('string')
    })

    it('should allow optional context', () => {
      const target: TranslationTarget = {
        key: 'item.description',
        source: '回復薬',
        target: 'Healing Potion',
        file: 'data/Items.json'
      }

      expect(target.context).toBeUndefined()
    })
  })

  describe('EngineFile', () => {
    it('should validate engine file structure', () => {
      const file: EngineFile = {
        path: 'data/Actors.json',
        type: 'json',
        content: { id: 1, name: 'Actor' }
      }

      expect(file.path).toBeTypeOf('string')
      expect(file.type).toBeTypeOf('string')
      expect(file.content).toBeDefined()
    })

    it('should allow any content type', () => {
      const jsonFile: EngineFile = {
        path: 'data/Actors.json',
        type: 'json',
        content: { data: [] }
      }

      const textFile: EngineFile = {
        path: 'Map001.txt',
        type: 'text',
        content: 'Some text content'
      }

      const binaryFile: EngineFile = {
        path: 'audio.ogg',
        type: 'binary',
        content: new Uint8Array()
      }

      expect(jsonFile.content).toBeTypeOf('object')
      expect(textFile.content).toBeTypeOf('string')
      expect(binaryFile.content).toBeInstanceOf(Uint8Array)
    })
  })

  describe('EngineValidation', () => {
    it('should validate successful validation result', () => {
      const validation: EngineValidation = {
        isValid: true,
        requiredFiles: ['package.json', 'data/Actors.json'],
        errors: []
      }

      expect(validation.isValid).toBe(true)
      expect(validation.requiredFiles).toBeInstanceOf(Array)
      expect(validation.errors).toHaveLength(0)
    })

    it('should validate failed validation result', () => {
      const validation: EngineValidation = {
        isValid: false,
        requiredFiles: ['package.json', 'data/Actors.json'],
        errors: ['Missing required file: data/Actors.json']
      }

      expect(validation.isValid).toBe(false)
      expect(validation.requiredFiles).toBeInstanceOf(Array)
      expect(validation.errors).toHaveLength(1)
      expect(validation.errors[0]).toBeTypeOf('string')
    })
  })

  describe('GameEngine', () => {
    it('should validate game engine interface', () => {
      const mockEngine: GameEngine = {
        name: 'RPG Maker MV',
        version: '1.0.0',
        async validateProject(path: string) {
          return {
            isValid: true,
            requiredFiles: [],
            errors: []
          }
        },
        async readProject(path: string) {
          return []
        },
        extractTranslations(files: EngineFile[]) {
          return []
        },
        applyTranslations(files: EngineFile[], translations: TranslationTarget[]) {
          return files
        }
      }

      expect(mockEngine.name).toBeTypeOf('string')
      expect(mockEngine.version).toBeTypeOf('string')
      expect(mockEngine.validateProject).toBeTypeOf('function')
      expect(mockEngine.readProject).toBeTypeOf('function')
      expect(mockEngine.extractTranslations).toBeTypeOf('function')
      expect(mockEngine.applyTranslations).toBeTypeOf('function')
    })

    it('should validate game engine method signatures', async () => {
      const mockEngine: GameEngine = {
        name: 'Test Engine',
        version: '1.0.0',
        async validateProject(path: string) {
          return {
            isValid: true,
            requiredFiles: ['test.json'],
            errors: []
          }
        },
        async readProject(path: string) {
          return [{
            path: 'test.json',
            type: 'json',
            content: {}
          }]
        },
        extractTranslations(files: EngineFile[]) {
          return [{
            key: 'test',
            source: 'Source',
            target: 'Target',
            file: 'test.json'
          }]
        },
        applyTranslations(files: EngineFile[], translations: TranslationTarget[]) {
          return files
        }
      }

      const validation = await mockEngine.validateProject('test/path')
      expect(validation).toEqual({
        isValid: true,
        requiredFiles: ['test.json'],
        errors: []
      })

      const files = await mockEngine.readProject('test/path')
      expect(files).toBeInstanceOf(Array)
      expect(files[0]).toHaveProperty('path')
      expect(files[0]).toHaveProperty('type')
      expect(files[0]).toHaveProperty('content')

      const translations = mockEngine.extractTranslations(files)
      expect(translations).toBeInstanceOf(Array)
      expect(translations[0]).toHaveProperty('key')
      expect(translations[0]).toHaveProperty('source')
      expect(translations[0]).toHaveProperty('target')
      expect(translations[0]).toHaveProperty('file')

      const updatedFiles = mockEngine.applyTranslations(files, translations)
      expect(updatedFiles).toBeInstanceOf(Array)
      expect(updatedFiles).toEqual(files)
    })
  })
})
