export interface TranslationTarget {
  id: string
  field: string
  source: string
  target: string
  context?: string
  file: string
}

export interface TranslationMetadata {
  promptType: string
  modelUsed: string
  processingTime: number
  qualityScore: number
}

export interface TranslationStats {
  totalTokens: number
  totalCost: number
  averageConfidence: number
  failedTranslations: number
  successfulTranslations: number
  totalProcessingTime: number
}

export interface TranslatedText extends TranslationTarget {
  tokens?: {
    total: number
    prompt: number
    completion: number
  }
  metadata?: TranslationMetadata
}

export interface EngineFile {
  path: string
  type: string
  content: unknown
}

export interface EngineValidation {
  isValid: boolean
  requiredFiles: string[]
  errors: string[]
}

export interface GameEngine {
  /**
   * Engine name and version
   */
  readonly name: string
  readonly version: string

  /**
   * Validate if a project folder is valid for this engine
   */
  validateProject(path: string): Promise<EngineValidation>

  /**
   * Read all translatable files from the project
   */
  readProject(path: string): Promise<EngineFile[]>

  /**
   * Extract translatable content from files
   */
  extractTranslations(files: EngineFile[]): TranslationTarget[]

  /**
   * Apply translations back to files
   */
  applyTranslations(files: EngineFile[], translations: TranslationTarget[]): EngineFile[]
} 