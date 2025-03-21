import type { EngineFile, TranslationTarget, TranslatedText, TranslationStats } from '@/types/engines/base'

export interface FileHandler {
  type: string
  extractTranslations: (file: EngineFile) => TranslationTarget[]
  applyTranslations: (file: EngineFile, translations: TranslatedText[]) => EngineFile
}

export function createStats(): TranslationStats {
  return {
    totalTokens: 0,
    totalCost: 0,
    averageConfidence: 0,
    failedTranslations: 0,
    successfulTranslations: 0,
    totalProcessingTime: 0
  }
}

export function updateStats(stats: TranslationStats, translations: TranslatedText[]): void {
  translations.forEach(trans => {
    if (trans.tokens) {
      stats.totalTokens += trans.tokens.total
    }
    if (trans.metadata) {
      stats.totalProcessingTime += trans.metadata.processingTime
      stats.averageConfidence += trans.metadata.qualityScore
    }
    if (trans.target) {
      stats.successfulTranslations++
    } else {
      stats.failedTranslations++
    }
  })

  // Calculate final average
  const totalTranslations = stats.successfulTranslations + stats.failedTranslations
  if (totalTranslations > 0) {
    stats.averageConfidence /= totalTranslations
  }
}

export function getFileType(file: EngineFile): string {
  return file.path.split('/').pop()?.split('.')[0].toLowerCase() || ''
} 