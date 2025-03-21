import { describe, it, expect, vi, beforeEach } from 'vitest'
import { OllamaProvider } from '../../../../src/services/ai/ollama'
import type { AIConfig, TranslationRequest } from '../../../../src/types/ai/base'
import axios from 'axios'

vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      post: vi.fn()
    })),
    isAxiosError: vi.fn().mockReturnValue(true)
  }
}))

describe('OllamaProvider', () => {
  let provider: OllamaProvider
  let config: AIConfig
  let mockAxiosPost: ReturnType<typeof vi.fn>

  beforeEach(() => {
    config = {
      model: 'mistral',
      baseUrl: 'http://localhost:11434'
    }
    mockAxiosPost = vi.fn()
    vi.mocked(axios.create).mockReturnValue({ post: mockAxiosPost } as any)
    provider = new OllamaProvider(config)
    vi.clearAllMocks()
  })

  describe('constructor', () => {
    it('should initialize with default values', () => {
      expect(provider.name).toBe('Ollama')
      expect(provider.version).toBe('1.0.0')
      expect(provider.supportedLanguages).toContain('en')
      expect(provider.supportedLanguages).toContain('ja')
      expect(provider.maxBatchSize).toBe(5)
      expect(provider.costPerToken).toBe(0)
    })

    it('should use default baseUrl if not provided', () => {
      const providerWithoutUrl = new OllamaProvider({ model: 'mistral' })
      expect(providerWithoutUrl).toBeDefined()
    })
  })

  describe('translate', () => {
    const mockRequest: TranslationRequest = {
      text: '回復薬',
      sourceLanguage: 'ja',
      targetLanguage: 'en',
      context: 'Item name in a game'
    }

    const mockResponse = {
      response: 'Healing Potion',
      total_duration: 1000,
      load_duration: 100,
      prompt_eval_count: 10,
      eval_count: 5,
      eval_duration: 900
    }

    beforeEach(() => {
      mockAxiosPost.mockResolvedValue({ data: mockResponse })
    })

    it('should translate text successfully', async () => {
      const result = await provider.translate(mockRequest)
      
      expect(result.translatedText).toBe('Healing Potion')
      expect(result.tokens).toBeDefined()
      expect(result.tokens?.prompt).toBe(10)
      expect(result.tokens?.completion).toBe(5)
      expect(result.tokens?.total).toBe(15)
    })

    it('should handle translation errors', async () => {
      mockAxiosPost.mockRejectedValue(new Error('Translation failed'))
      await expect(provider.translate(mockRequest)).rejects.toThrow('Translation failed')
    })
  })

  describe('translateBatch', () => {
    const mockTargets = [
      {
        key: 'item1',
        source: '回復薬',
        target: '',
        file: 'Items.json'
      },
      {
        key: 'item2',
        source: '毒消し',
        target: '',
        file: 'Items.json'
      }
    ]

    const mockResponse = {
      response: 'Healing Potion',
      total_duration: 1000,
      load_duration: 100,
      prompt_eval_count: 10,
      eval_count: 5,
      eval_duration: 900
    }

    beforeEach(() => {
      mockAxiosPost.mockResolvedValue({ data: mockResponse })
    })

    it('should translate batch successfully', async () => {
      const result = await provider.translateBatch(mockTargets, 'ja', 'en')
      
      expect(result.translations).toHaveLength(2)
      expect(result.stats.totalTokens).toBeGreaterThan(0)
      expect(result.stats.totalCost).toBe(0)
      expect(result.stats.averageConfidence).toBeGreaterThan(0)
    })

    it('should respect maxBatchSize', async () => {
      const largeTargets = Array(10).fill(mockTargets[0])
      const result = await provider.translateBatch(largeTargets, 'ja', 'en')
      
      expect(result.translations).toHaveLength(10)
    })
  })

  describe('validateConfig', () => {
    it('should validate correct config', () => {
      expect(provider.validateConfig(config)).toBe(true)
    })

    it('should validate config without baseUrl', () => {
      expect(provider.validateConfig({ model: 'mistral' })).toBe(true)
    })

    it('should reject invalid model', () => {
      expect(provider.validateConfig({ model: 'invalid-model' })).toBe(false)
    })

    it('should reject invalid temperature', () => {
      expect(provider.validateConfig({ model: 'mistral', temperature: 3 })).toBe(false)
    })
  })

  describe('estimateCost', () => {
    it('should estimate tokens correctly', () => {
      const result = provider.estimateCost('This is a test')
      expect(result.tokens).toBeGreaterThan(0)
      expect(result.cost).toBe(0)
    })

    it('should handle empty text', () => {
      const result = provider.estimateCost('')
      expect(result.tokens).toBe(0)
      expect(result.cost).toBe(0)
    })
  })
})
