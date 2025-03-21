import { describe, it, expect } from 'vitest'
import type { AIConfig, TranslationRequest, TranslationResponse, BatchTranslationResult, AIProvider } from '../../../../src/types/ai/base'
import type { TranslationTarget } from '../../../../src/types/engines/base'

describe('AI Base Types for Ollama', () => {
  describe('AIConfig', () => {
    it('should validate minimal Ollama config', () => {
      const config: AIConfig = {
        model: 'mistral'
      }

      expect(config.model).toBeTypeOf('string')
      expect(config.apiKey).toBeUndefined()
      expect(config.temperature).toBeUndefined()
      expect(config.maxTokens).toBeUndefined()
      expect(config.baseUrl).toBeUndefined()
    })

    it('should validate full Ollama config', () => {
      const config: AIConfig = {
        model: 'mistral',
        temperature: 0.7,
        maxTokens: 1000,
        baseUrl: 'http://localhost:11434'
      }

      expect(config.model).toBeTypeOf('string')
      expect(config.temperature).toBeGreaterThan(0)
      expect(config.temperature).toBeLessThan(1)
      expect(config.maxTokens).toBeGreaterThan(0)
      expect(config.baseUrl).toBeTypeOf('string')
    })
  })

  describe('TranslationRequest', () => {
    it('should validate Ollama translation request', () => {
      const request: TranslationRequest = {
        text: '回復薬',
        sourceLanguage: 'ja',
        targetLanguage: 'en',
        context: 'Item name in a game',
        instructions: 'Translate keeping the game context in mind'
      }

      expect(request.text).toBeTypeOf('string')
      expect(request.sourceLanguage).toBe('ja')
      expect(request.targetLanguage).toBe('en')
      expect(request.context).toBeTypeOf('string')
      expect(request.instructions).toBeTypeOf('string')
    })
  })

  describe('TranslationResponse', () => {
    it('should validate Ollama translation response', () => {
      const response: TranslationResponse = {
        translatedText: 'Healing Potion',
        tokens: {
          prompt: 10,
          completion: 5,
          total: 15
        }
      }

      expect(response.translatedText).toBeTypeOf('string')
      expect(response.tokens).toBeDefined()
      if (response.tokens) {
        expect(response.tokens.prompt).toBeGreaterThan(0)
        expect(response.tokens.completion).toBeGreaterThan(0)
        expect(response.tokens.total).toBe(response.tokens.prompt + response.tokens.completion)
      }
      // Ollama doesn't provide cost or confidence
      expect(response.cost).toBeUndefined()
      expect(response.confidence).toBeUndefined()
    })
  })

  describe('BatchTranslationResult', () => {
    it('should validate Ollama batch translation result', () => {
      const result: BatchTranslationResult = {
        translations: [
          {
            key: 'item.name',
            source: '回復薬',
            target: 'Healing Potion',
            file: 'Items.json'
          },
          {
            key: 'item.description',
            source: 'HPを回復する薬',
            target: 'A potion that restores HP',
            file: 'Items.json'
          }
        ],
        stats: {
          totalTokens: 30,
          totalCost: 0, // Ollama is free
          averageConfidence: 1 // Ollama doesn't provide confidence
        }
      }

      expect(result.translations).toHaveLength(2)
      expect(result.translations[0]).toHaveProperty('key')
      expect(result.translations[0]).toHaveProperty('source')
      expect(result.translations[0]).toHaveProperty('target')
      expect(result.translations[0]).toHaveProperty('file')
      expect(result.stats.totalTokens).toBeGreaterThan(0)
      expect(result.stats.totalCost).toBe(0)
      expect(result.stats.averageConfidence).toBe(1)
    })
  })

  describe('AIProvider Interface for Ollama', () => {
    it('should validate Ollama provider implementation', () => {
      const provider: AIProvider = {
        name: 'Ollama',
        version: '1.0.0',
        supportedLanguages: ['en', 'ja', 'zh', 'ko', 'fr', 'de', 'es', 'it', 'pt', 'ru'],
        maxBatchSize: 5,
        costPerToken: 0,
        async translate(request: TranslationRequest) {
          return {
            translatedText: 'Translated text',
            tokens: {
              prompt: 10,
              completion: 5,
              total: 15
            }
          }
        },
        async translateBatch(targets: TranslationTarget[], sourceLanguage: string, targetLanguage: string) {
          return {
            translations: targets.map(t => ({ ...t, target: 'Translated' })),
            stats: {
              totalTokens: targets.length * 15,
              totalCost: 0,
              averageConfidence: 1
            }
          }
        },
        validateConfig(config: AIConfig) {
          return !!config.model
        },
        estimateCost(text: string) {
          return {
            tokens: Math.ceil(text.length / 4),
            cost: 0
          }
        }
      }

      expect(provider.name).toBe('Ollama')
      expect(provider.version).toBe('1.0.0')
      expect(provider.supportedLanguages).toContain('ja')
      expect(provider.maxBatchSize).toBe(5)
      expect(provider.costPerToken).toBe(0)
      expect(provider.translate).toBeTypeOf('function')
      expect(provider.translateBatch).toBeTypeOf('function')
      expect(provider.validateConfig).toBeTypeOf('function')
      expect(provider.estimateCost).toBeTypeOf('function')
    })
  })
})
