// src/services/ai/prompt/ollama-prompt.ts
import { BasePromptManager } from '@/core/ai/base/base-prompt';
import type { LanguagePair, PromptType } from '@/types/ai';

/**
 * Prompt manager implementation for Ollama provider
 * Extends BasePromptManager with Ollama-specific prompt handling
 */
export class OllamaPromptManager extends BasePromptManager {
  /**
   * Get the provider name
   * @returns The provider name
   */
  public get name(): string {
    return 'ollama';
  }

  /**
   * Get the system prompt for a specific task and language pair
   * @param task The translation task
   * @param languagePair The source and target languages
   * @returns System prompt text
   */
  protected getSystemPrompt(task: PromptType, languagePair: LanguagePair): string {
    const { source, target } = languagePair;
    
    switch (task) {
      case 'dialogue':
        return `You are an expert translator using Ollama, specializing in game dialogue and character interactions.
                Translate the following ${source} dialogue to ${target}.
                Maintain the character's personality, tone, and speech patterns.
                Keep the tone consistent.
                Preserve any special formatting, placeholders, or variables.
                Do not add any explanations or notes.`;
                
      case 'menu':
        return `You are an expert translator using Ollama, specializing in game UI and interface elements.
                Translate the following ${source} menu text to ${target}.
                Keep it concise and clear.
                Ensure it fits in the UI.
                Preserve any special formatting, placeholders, or variables.
                Do not add any explanations or notes.`;
                
      case 'items':
        return `You are an expert translator using Ollama, specializing in game items, equipment, and inventory.
                Translate the following ${source} item description to ${target}.
                Preserve item properties and game mechanics.
                Keep descriptions accurate.
                Preserve any special formatting, placeholders, or variables.
                Do not add any explanations or notes.`;
                
      case 'skills':
        return `You are an expert translator using Ollama, specializing in game abilities, spells, and combat mechanics.
                Translate the following ${source} skill description to ${target}.
                Maintain skill effects and gameplay balance.
                Keep mechanics clear.
                Preserve any special formatting, placeholders, or variables.
                Do not add any explanations or notes.`;
                
      case 'name':
        return `You are an expert translator using Ollama, specializing in game characters, locations, and proper nouns.
                Translate the following ${source} name to ${target}.
                Consider cultural context and pronunciation.
                Keep names memorable.
                Preserve any special formatting, placeholders, or variables.
                Do not add any explanations or notes.`;
                
      default:
        return `You are an expert translator using Ollama, specializing in game translation.
                Translate the following ${source} text to ${target}.
                Maintain accuracy and preserve game context.
                Preserve any special formatting, placeholders, or variables.
                Do not add any explanations or notes.`;
    }
  }

  /**
   * Get the user prompt for a specific text and language pair
   * @param text The text to translate
   * @param languagePair The source and target languages
   * @param type The prompt type
   * @returns User prompt text
   */
  protected getUserPrompt(
    text: string, 
    languagePair: LanguagePair, 
    type?: PromptType
  ): string {
    const { source, target } = languagePair;
    return `Translate this ${type || 'dialogue'} from ${source} to ${target}.\n\nText to translate:\n${text}`;
  }
}