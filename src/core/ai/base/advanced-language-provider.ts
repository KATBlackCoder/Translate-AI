import { BaseTranslationProvider } from './base-translation';
import type { LanguageCode, LanguagePair } from '@/types/ai';
import { AIErrorFactory } from './base-error';

/**
 * Extension of BaseTranslationProvider for providers that need advanced language support
 * This class adds language quality scoring and advanced language pair validation
 */
export abstract class AdvancedLanguageProvider extends BaseTranslationProvider {
  /**
   * Get quality score for a specific language
   * @param language The language to get quality score for
   * @returns Quality score between 0-1
   */
  public getLanguageQualityScore(language: LanguageCode): number {
    // Default implementation returns the provider's overall quality score
    return this.qualityScore;
  }
  
  /**
   * Get best supported languages for a given source language
   * @param sourceLanguage The source language
   * @returns Array of target languages sorted by quality score
   */
  public getBestSupportedLanguages(sourceLanguage: LanguageCode): LanguageCode[] {
    if (!this.isLanguageSupported(sourceLanguage)) {
      throw AIErrorFactory.validation(`Source language ${sourceLanguage} is not supported by ${this.name}`, this.name);
    }
    
    // Return all supported languages except the source language
    return this.supportedLanguages
      .filter(lang => lang !== sourceLanguage)
      .sort((a, b) => this.getLanguageQualityScore(b) - this.getLanguageQualityScore(a));
  }
  
  /**
   * Get best language pairs for a given source language
   * @param sourceLanguage The source language
   * @returns Array of language pairs sorted by quality score
   */
  public getBestLanguagePairs(sourceLanguage: LanguageCode): LanguagePair[] {
    const targetLanguages = this.getBestSupportedLanguages(sourceLanguage);
    
    return targetLanguages.map(target => ({
      source: sourceLanguage,
      target
    }));
  }
  
  /**
   * Get language support information
   * @param language The language to get support info for
   * @returns Language support information
   */
  public getLanguageSupportInfo(language: LanguageCode): {
    isSupported: boolean;
    qualityScore: number;
    bestTargetLanguages: LanguageCode[];
  } {
    const isSupported = this.isLanguageSupported(language);
    
    return {
      isSupported,
      qualityScore: isSupported ? this.getLanguageQualityScore(language) : 0,
      bestTargetLanguages: isSupported ? this.getBestSupportedLanguages(language) : []
    };
  }
  
  /**
   * Check if a specific language pair is supported
   * @param languagePair The language pair to check
   * @returns True if the language pair is supported
   */
  public isLanguagePairSupported(languagePair: LanguagePair): boolean {
    return this.isLanguageSupported(languagePair.source) && 
           this.isLanguageSupported(languagePair.target);
  }
  
  /**
   * Get language-specific configuration
   * @param language The language to get configuration for
   * @returns Language-specific configuration
   */
  public getLanguageSpecificConfig(language: LanguageCode): Record<string, any> {
    if (!this.isLanguageSupported(language)) {
      throw AIErrorFactory.validation(`Language ${language} is not supported by ${this.name}`, this.name);
    }
    
    // Default implementation returns empty object
    return {};
  }
  
  /**
   * Check if a language is supported by this provider
   * @param language The language to check
   * @returns True if the language is supported
   */
  protected isLanguageSupported(language: LanguageCode): boolean {
    return this.supportedLanguages.includes(language);
  }
  
  /**
   * Get the provider name
   * @returns The provider name
   */
  public abstract get name(): string;
  
  /**
   * Get the quality score
   * @returns The quality score
   */
  public abstract get qualityScore(): number;
  
  /**
   * Get the supported languages
   * @returns The supported languages
   */
  public abstract get supportedLanguages(): LanguageCode[];
} 