/**
 * Main configuration export
 * 
 * This file consolidates and exports all configuration from the various config modules.
 * It serves as the single entry point for accessing configuration throughout the application.
 */

// Re-export everything from the provider config
export * from '@/config/provider'

// Export any application-wide constants
export const APP_VERSION = '1.0.0'
export const APP_NAME = 'Translation AI'

// Default application settings
export const DEFAULT_SETTINGS = {
  autoSave: false,
  autoBatchSize: 10,
  defaultLanguage: 'en',
  defaultTargetLanguage: 'ja',
  theme: 'light',
  showAdvancedOptions: false
} 