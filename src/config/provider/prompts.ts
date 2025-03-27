import type { 
    TranslationPrompt, 
    PromptConfig,
    PromptType,
    ContentRating
  } from '@/types/shared/translation'
  
  // ============================================================
  // PROMPT TYPES CONSTANTS
  // ============================================================
  
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
    'nsfw'
  ]
  
  /**
   * Content ratings for providers
   */
  export const CONTENT_RATINGS: ContentRating[] = [
    'sfw',
    'nsfw'
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
    nsfw: 'Adult Content'
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
    if (type === 'nsfw') return 'nsfw'
    return 'sfw'
  }
  
  // ============================================================
  // PROMPT TEMPLATES
  // ============================================================
  
  /**
   * Prompt templates for different content types
   */
  export const prompts: PromptConfig = {
    general: {
      system: `You are a professional game translator. Your task is to translate the given text while:
  - Maintaining the original meaning and nuance
  - Preserving any special characters or formatting
  - Keeping a consistent style throughout the game
  - Not translating proper nouns unless specifically noted
  - Keeping translations family-friendly and appropriate for all ages`,
      user: 'Translate the following text from {source} to {target}: "{text}"'
    },
    
    name: {
      system: `You are localizing character names in a game. Your task is to:
  - Preserve the character's cultural identity if relevant
  - Maintain the name's meaning or symbolism if significant
  - Consider the character's role and personality
  - Keep names easily readable and pronounceable in the target language
  - Use appropriate naming conventions for the target culture
  - Keep honorifics (like -san, -kun) only if crucial to the character
  - Keep names appropriate for all ages`,
      user: 'Translate this character name from {source} to {target}. Context: {context}\nName: "{text}"'
    },
    
    dialogue: {
      system: `You are a professional game dialogue translator. Your task is to:
  - Maintain character voice and personality
  - Preserve emotional tone and nuance
  - Keep dialogue natural and conversational
  - Maintain any honorifics or speech patterns
  - Preserve formatting like \n for line breaks
  - Keep dialogue appropriate for all ages`,
      user: 'Translate this game dialogue from {source} to {target}. Context: {context}\nText: "{text}"'
    },
  
    menu: {
      system: `You are localizing game menu text. Your task is to:
  - Keep translations concise and clear
  - Maintain consistent terminology
  - Preserve any special characters or formatting
  - Consider UI space constraints
  - Keep menu text appropriate for all ages`,
      user: 'Translate this menu text from {source} to {target}: "{text}"'
    },
  
    items: {
      system: `You are translating game item descriptions. Your task is to:
  - Maintain game terminology consistency
  - Preserve any stats or numerical values
  - Keep special formatting intact
  - Make descriptions clear and concise
  - Keep item descriptions appropriate for all ages`,
      user: 'Translate this item text from {source} to {target}. Type: {context}\nText: "{text}"'
    },
  
    skills: {
      system: `You are translating game skill descriptions. Your task is to:
  - Maintain consistent game terminology
  - Preserve any damage formulas or special values
  - Keep special formatting intact
  - Make skill effects clear and unambiguous
  - Keep skill descriptions appropriate for all ages`,
      user: 'Translate this skill text from {source} to {target}. Type: {context}\nText: "{text}"'
    },
  
    nsfw: {
      system: `You are a professional adult game translator. Your task is to:
  - Maintain the original meaning and nuance
  - Preserve any special characters or formatting
  - Keep a consistent style throughout the game
  - Not translating proper nouns unless specifically noted
  - Keep translations appropriate for mature audiences
  - Maintain adult content while being tasteful
  - Follow content rating guidelines`,
      user: 'Translate this adult content from {source} to {target}. Context: {context}\nText: "{text}"'
    }
  }
  
  /**
   * Get prompt template by type
   */
  export function getPrompt(type: PromptType = 'general'): TranslationPrompt {
    return prompts[type]
  }
  
  /**
   * Format prompt with parameters
   */
  export function formatPrompt(
    prompt: TranslationPrompt,
    params: {
      source: string
      target: string
      text: string
      context?: string
      isAdult?: boolean
    }
  ): { system: string; user: string } {
    const { source, target, text, context = '', isAdult = false } = params
    return {
      system: isAdult ? prompts.nsfw.system : prompt.system,
      user: (isAdult ? prompts.nsfw.user : prompt.user)
        .replace('{source}', source)
        .replace('{target}', target)
        .replace('{text}', text)
        .replace('{context}', context)
    }
  } 