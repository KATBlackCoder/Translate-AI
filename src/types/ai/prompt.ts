/**
 * AI Prompt Type Definitions
 * 
 * This file contains types and interfaces for working with AI prompts.
 * Prompts are the templates used to instruct AI models on how to
 * perform translation tasks for different content types.
 */

import type { 
  PromptType, 
  TranslationPrompt 
} from '@/types/ai'

// ============================================================
// PROMPT CONFIGURATION TYPES
// ============================================================

/**
 * Custom prompt configuration for a specific content type
 * 
 * Extends TranslationPrompt but makes fields optional to allow
 * partial customization of prompts. Users can override either
 * the system prompt, user prompt, or both.
 */
export type CustomPrompt = Partial<TranslationPrompt>

/**
 * Collection of custom prompts by content type
 * 
 * Used to store user-defined prompt templates for different types of content.
 * These override the default prompts provided by the AI provider.
 */
export interface PromptSettings {
  /** Custom prompts organized by content type */
  customPrompts: Record<PromptType, CustomPrompt>
  
  /** Whether to use custom prompts instead of provider defaults */
  useCustomPrompts: boolean
} 