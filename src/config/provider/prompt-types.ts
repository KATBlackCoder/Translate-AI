import type { PromptType, ContentRating } from '@/types/shared/translation'

/**
 * Supported prompt types for translation
 */
export const SUPPORTED_PROMPT_TYPES: PromptType[] = [
  'general',
  'dialogue',
  'menu',
  'items',
  'skills',
  'name',
  'adult'
]

/**
 * Content ratings for providers
 */
export const CONTENT_RATINGS: ContentRating[] = [
  'general',
  'teen',
  'mature',
  'adult'
]

/**
 * Display names for prompt types
 */
export const PROMPT_TYPE_DISPLAY_NAMES: Record<PromptType, string> = {
  general: 'General',
  dialogue: 'Dialogue',
  menu: 'Menu/UI',
  items: 'Items',
  skills: 'Skills/Abilities',
  name: 'Names',
  adult: 'Adult Content'
}

/**
 * Check if a prompt type is supported
 */
export function isPromptTypeSupported(type: string): boolean {
  return SUPPORTED_PROMPT_TYPES.includes(type as PromptType)
}

/**
 * Get the appropriate content rating based on prompt type
 */
export function getContentRatingForPromptType(type: PromptType): ContentRating {
  if (type === 'adult') return 'adult'
  return 'general'
} 