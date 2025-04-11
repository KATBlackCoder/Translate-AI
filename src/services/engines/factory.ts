// src/services/engines/factory.ts
import type { BaseEngineService } from '@/services/engines/base-engine-service'
import { RPGMVEngineService } from '@/services/engines/rpgmv/rpgmv-engine-service'
import type { EngineType, EngineValidation } from '@/types/engines'

/**
 * Factory class for creating and managing game engine services.
 * Implements the singleton pattern to ensure only one instance of each engine service exists.
 */
export class GameEngineFactory {
  /** Cache of engine service instances by type */
  private static services: Map<EngineType, BaseEngineService> = new Map()
  
  /** Registry of engine service classes for extensibility */
  private static serviceClasses: Record<string, new () => BaseEngineService> = {
    'rpgmv': RPGMVEngineService
  }

  /**
   * Gets or creates an engine service instance of the specified type.
   * If an instance already exists, it will be returned from the cache.
   * 
   * @param type - The type of engine to get or create
   * @returns An instance of the requested engine service
   * @throws {Error} If the engine type is not supported
   */
  static getEngineService(type: EngineType): BaseEngineService {
    if (this.services.has(type)) {
      return this.services.get(type)!
    }

    const service = this.createEngineService(type)
    this.services.set(type, service)
    console.log(`[GameEngineFactory] Creating new engine service instance: ${type}`)
    return service
  }

  /**
   * Creates a new engine service instance of the specified type.
   * 
   * @param type - The type of engine to create
   * @returns A new instance of the requested engine service
   * @throws {Error} If the engine type is not supported
   * @private
   */
  private static createEngineService(type: EngineType): BaseEngineService {
    const ServiceClass = this.serviceClasses[type]
    
    if (!ServiceClass) {
      throw new Error(`Unsupported engine type: ${type}`)
    }
    
    return new ServiceClass()
  }

  /**
   * Detects the appropriate engine type for a project folder.
   * Uses engine service signatures to identify the engine type.
   * 
   * @param projectPath - Path to the project folder
   * @returns Promise with the detected engine type and validation result, or null if no valid engine found
   */
  static async detectEngineType(
    projectPath: string
  ): Promise<{ type: EngineType; validation: EngineValidation } | null> {
    // Create an instance of each engine service to check signatures
    for (const type of Object.keys(this.serviceClasses) as EngineType[]) {
      const service = this.createEngineService(type)
      
      try {
        // Check if the project matches this engine's signature
        const matches = await service.matchesEngineSignature(projectPath)
        
        if (matches) {
          // If it matches, run full validation
          const validation = await service.validateProject(projectPath)
          return { type, validation }
        }
      } catch (error) {
        console.log(`Engine ${type} detection failed:`, error)
        // Continue to next engine type
      }
    }
    
    // No valid engine found
    return null
  }

  /**
   * Registers a new engine type with the factory.
   * This allows extending supported engines without modifying the factory code.
   * 
   * @param type - The type identifier for the engine
   * @param serviceClass - The engine service class constructor
   */
  static registerEngineService(
    type: string, 
    serviceClass: new () => BaseEngineService
  ): void {
    this.serviceClasses[type as EngineType] = serviceClass
    
    // Clear any cached instance when replacing an engine implementation
    if (this.services.has(type as EngineType)) {
      this.services.delete(type as EngineType)
    }
  }

  /**
   * Type guard to check if a string is a supported engine type.
   * 
   * @param type - The string to check
   * @returns True if the string is a supported engine type
   */
  static isEngineSupported(type: string): type is EngineType {
    return type in this.serviceClasses
  }

  /**
   * Get a list of all supported engine types
   * 
   * @returns Array of supported engine types
   */
  static getSupportedEngines(): EngineType[] {
    return Object.keys(this.serviceClasses) as EngineType[]
  }
}