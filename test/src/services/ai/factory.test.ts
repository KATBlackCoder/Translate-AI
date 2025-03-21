import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AIProviderFactory } from '../../../../src/services/ai/factory'
import { OllamaProvider } from '../../../../src/services/ai/ollama'
import type { AIConfig } from '../../../../src/types/ai/base'

vi.mock('../../../../src/services/ai/ollama', () => {
  return {
    OllamaProvider: vi.fn().mockImplementation((config: AIConfig) => ({
      name: 'Ollama',
      version: '1.0.0',
      supportedLanguages: ['en', 'ja'],
      maxBatchSize: 5,
      costPerToken: 0,
      translate: vi.fn(),
      translateBatch: vi.fn(),
      validateConfig: (cfg: AIConfig) => {
        if (cfg.model && !['mistral', 'llama2', 'codellama', 'neural-chat'].includes(cfg.model)) {
          return false
        }
        if (cfg.temperature && (cfg.temperature < 0 || cfg.temperature > 2)) {
          return false
        }
        return true
      },
      estimateCost: vi.fn()
    }))
  }
})

describe('AIProviderFactory for Ollama', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Clear the providers map before each test
    // @ts-ignore - accessing private static field for testing
    AIProviderFactory.providers = new Map()
  })

  describe('createProvider', () => {
    it('should create Ollama provider with minimal config', () => {
      const config: AIConfig = { model: 'mistral' }
      const provider = AIProviderFactory.createProvider('ollama', config)
      expect(provider).toBeDefined()
      expect(OllamaProvider).toHaveBeenCalledWith(config)
    })

    it('should create Ollama provider with full config', () => {
      const config: AIConfig = {
        model: 'mistral',
        temperature: 0.7,
        maxTokens: 1000,
        baseUrl: 'http://localhost:11434'
      }
      const provider = AIProviderFactory.createProvider('ollama', config)
      expect(provider).toBeDefined()
      expect(OllamaProvider).toHaveBeenCalledWith(config)
    })

    it('should throw error for invalid config', () => {
      const config: AIConfig = { model: 'invalid-model' }
      expect(() => AIProviderFactory.createProvider('ollama', config)).toThrow('Invalid configuration')
    })

    it('should reuse existing Ollama provider instance', () => {
      const config: AIConfig = { model: 'mistral' }
      const provider1 = AIProviderFactory.createProvider('ollama', config)
      const provider2 = AIProviderFactory.createProvider('ollama', config)
      expect(provider1).toBe(provider2)
      expect(OllamaProvider).toHaveBeenCalledTimes(1)
    })

    it('should create new instance for different config', () => {
      const config1: AIConfig = { model: 'mistral' }
      const config2: AIConfig = { model: 'llama2' }
      const provider1 = AIProviderFactory.createProvider('ollama', config1)
      const provider2 = AIProviderFactory.createProvider('ollama', config2)
      expect(provider1).not.toBe(provider2)
      expect(OllamaProvider).toHaveBeenCalledTimes(2)
    })
  })

  describe('getProvider', () => {
    it('should return existing provider', () => {
      const config: AIConfig = { model: 'mistral' }
      const created = AIProviderFactory.createProvider('ollama', config)
      const retrieved = AIProviderFactory.getProvider('ollama', config)
      expect(retrieved).toBe(created)
    })

    it('should throw error if provider not created', () => {
      const config: AIConfig = { model: 'mistral' }
      expect(() => AIProviderFactory.getProvider('ollama', config)).toThrow('Provider not found')
    })
  })
})
