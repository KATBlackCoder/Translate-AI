import type { BaseGameEngine, EngineType } from '@/core/engines/engine-base'
import { RPGMakerMVEngine } from './rpgmv/rpgmv'

/**
 * Factory class for creating and managing game engines
 */
export class GameEngineFactory {
  private static engines: Map<EngineType, BaseGameEngine> = new Map()

  /**
   * Gets or creates an engine instance
   */
  static getEngine(type: EngineType): BaseGameEngine {
    if (this.engines.has(type)) {
      return this.engines.get(type)!
    }

    const engine = this.createEngine(type)
    this.engines.set(type, engine)
    return engine
  }

  /**
   * Creates a new engine instance
   */
  private static createEngine(type: EngineType): BaseGameEngine {
    switch (type) {
      case 'rpgmv':
        return new RPGMakerMVEngine()
      case 'rpgmz':
        throw new Error('RPG Maker MZ support coming soon')
      case 'renpy':
        throw new Error('Ren\'Py support coming soon')
      case 'unity':
        throw new Error('Unity support coming soon')
      default:
        throw new Error(`Unknown engine type: ${type}`)
    }
  }

  /**
   * Checks if an engine type is supported
   */
  static isEngineSupported(type: string): type is EngineType {
    return ['rpgmv', 'rpgmz', 'renpy', 'unity'].includes(type)
  }
} 