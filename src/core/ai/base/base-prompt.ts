import type { 
  PromptManager, 
  LanguagePair, 
  PromptType, 
  CustomPrompt
} from '@/types/ai';

import { AIErrorFactory } from './base-error';

/**
 * Base class for prompt management in AI providers
 * Provides core functionality for creating and managing prompts
 */
export abstract class BasePromptManager implements PromptManager {
  /**
   * Get the provider name
   * @returns The provider name
   */
  public abstract get name(): string;

  /**
   * Get the system prompt for a specific task
   * @param task The translation task type
   * @param languagePair The source and target languages
   * @returns System prompt text
   */
  protected abstract getSystemPrompt(task: PromptType, languagePair: LanguagePair): string;

  /**
   * Get the user prompt for a specific text
   * @param text The text to translate
   * @param languagePair The source and target languages
   * @param type The prompt type
   * @returns User prompt text
   */
  protected abstract getUserPrompt(
    text: string, 
    languagePair: LanguagePair, 
    type?: PromptType
  ): string;

  /**
   * Create a prompt for translation
   * @param text The text to translate
   * @param languagePair The source and target languages
   * @param type The prompt type
   * @returns Prompt object with system and user prompts
   */
  public createPrompt(
    text: string,
    languagePair: LanguagePair,
    type?: PromptType
  ): CustomPrompt {
    this.validateInput(text, languagePair, type);
    
    const task = type || 'dialogue';
    return {
      system: this.getSystemPrompt(task, languagePair),
      user: this.getUserPrompt(text, languagePair, task)
    };
  }

  /**
   * Create a prompt for batch translation
   * @param texts Array of texts to translate
   * @param languagePair The source and target languages
   * @param type The prompt type
   * @returns Prompt object with system and user prompts
   */
  public createBatchPrompt(
    texts: string[],
    languagePair: LanguagePair,
    type?: PromptType
  ): CustomPrompt {
    if (!texts?.length) {
      throw AIErrorFactory.validation('At least one text is required', this.name);
    }
    
    return this.createPrompt(texts.join('\n\n'), languagePair, type);
  }

  /**
   * Get the default prompt for a specific type
   * @param type The prompt type
   * @returns Default prompt object
   */
  public getDefaultPrompt(type: PromptType): CustomPrompt {
    return {
      system: this.getSystemPrompt(type, { source: 'ja', target: 'en' }),
      user: this.getUserPrompt('', { source: 'ja', target: 'en' }, type)
    };
  }

  /**
   * Validate if a prompt is properly formed
   * @param prompt The prompt to validate
   * @returns True if the prompt is valid
   */
  public validatePrompt(prompt: CustomPrompt): boolean {
    return !!(
      prompt?.system && 
      prompt?.user && 
      typeof prompt.system === 'string' && 
      typeof prompt.user === 'string' &&
      prompt.system.trim().length > 0 &&
      prompt.user.trim().length > 0
    );
  }

  /**
   * Validate input parameters
   * @param text The text to validate
   * @param languagePair The language pair to validate
   * @param type The prompt type to validate
   * @throws AIProviderError if validation fails
   */
  protected validateInput(
    text: string,
    languagePair: LanguagePair,
    type?: PromptType
  ): void {
    if (!text?.trim()) {
      throw AIErrorFactory.validation('Text cannot be empty', this.name);
    }
    
    if (!languagePair?.source || !languagePair?.target) {
      throw AIErrorFactory.validation('Invalid language pair', this.name);
    }

    if (type && !['dialogue', 'menu', 'items', 'skills', 'name'].includes(type)) {
      throw AIErrorFactory.validation('Invalid prompt type', this.name);
    }
  }
} 