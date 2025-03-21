import { describe, it, expect, beforeEach } from 'vitest'
import { GameEngineFactory } from '../../../src/engines/factory'
import { RPGMakerMVEngine } from '../../../src/engines/rpgmv'

describe('GameEngineFactory', () => {
  beforeEach(() => {
    // Clear the engines map before each test
    // @ts-ignore - accessing private static field for testing
    GameEngineFactory.engines = new Map()
  })

  describe('getEngine', () => {
    it('should create RPG Maker MV engine', () => {
      const engine = GameEngineFactory.getEngine('rpgmv')
      expect(engine).toBeInstanceOf(RPGMakerMVEngine)
      expect(engine.name).toBe('RPG Maker MV')
      expect(engine.version).toBe('1.0.0')
    })

    it('should reuse existing engine instance', () => {
      const engine1 = GameEngineFactory.getEngine('rpgmv')
      const engine2 = GameEngineFactory.getEngine('rpgmv')
      expect(engine1).toBe(engine2)
    })

    it('should throw error for unsupported engine type', () => {
      // @ts-expect-error - testing invalid type
      expect(() => GameEngineFactory.getEngine('invalid')).toThrow('Unsupported engine type')
    })
  })

  describe('isEngineSupported', () => {
    it('should return true for supported engines', () => {
      expect(GameEngineFactory.isEngineSupported('rpgmv')).toBe(true)
    })

    it('should return false for unsupported engines', () => {
      expect(GameEngineFactory.isEngineSupported('invalid')).toBe(false)
    })
  })
})
