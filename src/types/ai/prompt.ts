/**
 * AI Prompt Type Definitions
 * 
 * This file contains types and interfaces for working with AI prompts.
 * Prompts are the templates used to instruct AI models on how to
 * perform translation tasks for different content types.
 */

import type { PromptType, TranslationPrompt } from '@/types/shared/translation'

// ============================================================
// PROMPT CONFIGURATION TYPES
// ============================================================

/**
 * Custom prompt configuration for a specific content type
 * 
 * Defines the system and user messages for a specific prompt type.
 * These prompts can be customized by users to tailor the AI's behavior.
 */
export interface CustomPrompt {
  /** 
   * System prompt that defines the context and instructions 
   * This sets the overall behavior and role of the AI model
   */
  system?: string
  
  /** 
   * User prompt template for this content type 
   * This is the prompt that will have placeholders replaced with actual content
   */
  user?: string
}

/**
 * Collection of custom prompts by content type
 * 
 * Used to store user-defined prompt templates for different types of content.
 * These override the default prompts provided by the AI provider.
 */
export interface PromptSettings {
  /** Custom prompts organized by content type */
  customPrompts: Record<PromptType, CustomPrompt>
} 