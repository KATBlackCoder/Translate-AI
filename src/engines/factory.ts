import type { GameEngine } from '@/types/engines/base'
import { RPGMakerMVEngine } from './rpgmv'

export type GameEngineType = 'rpgmv'

export class GameEngineFactory {
  private static engines: Map<string, GameEngine> = new Map()

  static getEngine(type: GameEngineType): GameEngine {
    if (this.engines.has(type)) {
      return this.engines.get(type)!
    }

    let engine: GameEngine
    switch (type) {
      case 'rpgmv':
        engine = new RPGMakerMVEngine()
        break
      // Add more engines here
      default:
        throw new Error(`Unsupported engine type: ${type}`)
    }

    this.engines.set(type, engine)
    return engine
  }

  static isEngineSupported(type: string): type is GameEngineType {
    return ['rpgmv'].includes(type)
  }
} 