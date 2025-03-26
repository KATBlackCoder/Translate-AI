import type { BaseGameEngine } from '@/core/engines/engine-base'
import type { EngineType } from '@/types/engines/base'
import { RPGMakerMVEngine } from './rpgmv/rpgmv'

/**
 * Factory class for creating and managing game engines.
 * Implements the singleton pattern to ensure only one instance of each engine type exists.
 * 
 * @class GameEngineFactory
 * @example
 * ```ts
 * const engine = GameEngineFactory.getEngine('rpgmv')
 * ```
 */
export class GameEngineFactory {
  /** Cache of engine instances by type */
  private static engines: Map<EngineType, BaseGameEngine> = new Map()

  /**
   * Gets or creates an engine instance of the specified type.
   * If an instance already exists, it will be returned from the cache.
   * 
   * @param type - The type of engine to get or create
   * @returns An instance of the requested engine type
   * @throws {Error} If the engine type is not supported
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
   * Creates a new engine instance of the specified type.
   * 
   * @param type - The type of engine to create
   * @returns A new instance of the requested engine type
   * @throws {Error} If the engine type is not supported
   * @private
   */
  private static createEngine(type: EngineType): BaseGameEngine {
    switch (type) {
      case 'rpgmv':
        return new RPGMakerMVEngine()
      default:
        throw new Error(`Unknown engine type: ${type}`)
    }
  }

  /**
   * Type guard to check if a string is a supported engine type.
   * 
   * @param type - The string to check
   * @returns True if the string is a supported engine type
   */
  static isEngineSupported(type: string): type is EngineType {
    return ['rpgmv'].includes(type)
  }
} 