/**
 * Supported languages for translation
 */
export const AI_SUPPORTED_LANGUAGES = [
  'en', // English
  'ja', // Japanese
  'zh', // Chinese
  'ko', // Korean
  'fr', // French
  'de', // German
  'es', // Spanish
  'it', // Italian
  'pt', // Portuguese
  'ru'  // Russian
]

/**
 * Language display names for UI purposes
 */
export const AI_LANGUAGE_DISPLAY_NAMES: Record<string, string> = {
  en: 'English',
  ja: 'Japanese',
  zh: 'Chinese',
  ko: 'Korean',
  fr: 'French',
  de: 'German',
  es: 'Spanish',
  it: 'Italian',
  pt: 'Portuguese',
  ru: 'Russian'
}

/**
 * Check if a language is supported
 */
export function isLanguageSupported(language: string): boolean {
  return AI_SUPPORTED_LANGUAGES.includes(language)
} 