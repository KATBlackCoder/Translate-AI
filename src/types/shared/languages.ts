/**
 * Language type definitions
 * 
 * @module types/shared/languages
 * @description Core language types used throughout the application.
 * These types define the structure for language codes, language information,
 * and language pairs used in translation operations.
 */

/**
 * Supported language codes
 * 
 * @typedef {string} LanguageCode
 * @description ISO 639-1 language codes supported by the translation system
 */
export type LanguageCode = 'en' | 'ja' | 'zh' | 'ko' | 'fr' | 'de' | 'es' | 'it' | 'pt' | 'ru'

/**
 * Language information interface
 * 
 * @interface LanguageInfo
 * @description Contains metadata about a supported language
 * 
 * @property {LanguageCode} code - ISO 639-1 language code
 * @property {string} name - Display name of the language
 * @property {boolean} isSupported - Whether the language is supported for translation
 */
export interface LanguageInfo {
  code: LanguageCode
  name: string
  isSupported: boolean
}

/**
 * Language pair interface
 * 
 * @interface LanguagePair
 * @description Represents a source-target language pair for translation
 * 
 * @property {LanguageCode} source - Source language code
 * @property {LanguageCode} target - Target language code
 */
export interface LanguagePair {
  source: LanguageCode
  target: LanguageCode
}

/**
 * Language support configuration
 * 
 * @interface LanguageSupport
 * @description Configuration for language support in different contexts
 * 
 * @property {LanguageCode[]} supportedLanguages - List of supported language codes
 * @property {Record<LanguageCode, string>} displayNames - Map of language codes to display names
 */
export interface LanguageSupport {
  supportedLanguages: LanguageCode[]
  displayNames: Record<LanguageCode, string>
} 