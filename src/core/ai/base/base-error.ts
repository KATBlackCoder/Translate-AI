/**
 * Base error class for AI provider errors
 * Provides standardized error handling across the AI provider system
 */
export class AIProviderError extends Error {
  /**
   * Create a new AI provider error
   * @param message The error message
   * @param type The error type (default: 'validation')
   * @param provider The provider name
   */
  constructor(
    message: string,
    public readonly type: string = 'validation',
    public readonly provider: string
  ) {
    super(`[${type}] ${message} is not supported by ${provider}`);
    this.name = 'AIProviderError';
  }
}

/**
 * Error types for AI providers
 */
export enum AIErrorType {
  VALIDATION = 'validation',
  CAPABILITY = 'capability',
  LANGUAGE = 'language',
  PROMPT = 'prompt',
  CONFIG = 'config',
  API = 'api',
  NETWORK = 'network',
  UNKNOWN = 'unknown'
}

/**
 * Factory for creating AI provider errors
 */
export class AIErrorFactory {
  /**
   * Create a validation error
   * @param message The error message
   * @param provider The provider name
   * @returns An AIProviderError
   */
  static validation(message: string, provider: string): AIProviderError {
    return new AIProviderError(message, AIErrorType.VALIDATION, provider);
  }

  /**
   * Create a capability error
   * @param capability The capability name
   * @param provider The provider name
   * @returns An AIProviderError
   */
  static capability(capability: string, provider: string): AIProviderError {
    return new AIProviderError(
      `${capability} is not supported`,
      AIErrorType.CAPABILITY,
      provider
    );
  }

  /**
   * Create a language error
   * @param language The language code
   * @param provider The provider name
   * @returns An AIProviderError
   */
  static language(language: string, provider: string): AIProviderError {
    return new AIProviderError(
      `Language ${language}`,
      AIErrorType.LANGUAGE,
      provider
    );
  }

  /**
   * Create a prompt error
   * @param message The error message
   * @param provider The provider name
   * @returns An AIProviderError
   */
  static prompt(message: string, provider: string): AIProviderError {
    return new AIProviderError(message, AIErrorType.PROMPT, provider);
  }

  /**
   * Create a config error
   * @param message The error message
   * @param provider The provider name
   * @returns An AIProviderError
   */
  static config(message: string, provider: string): AIProviderError {
    return new AIProviderError(message, AIErrorType.CONFIG, provider);
  }

  /**
   * Create an API error
   * @param message The error message
   * @param provider The provider name
   * @returns An AIProviderError
   */
  static api(message: string, provider: string): AIProviderError {
    return new AIProviderError(message, AIErrorType.API, provider);
  }

  /**
   * Create a network error
   * @param message The error message
   * @param provider The provider name
   * @returns An AIProviderError
   */
  static network(message: string, provider: string): AIProviderError {
    return new AIProviderError(message, AIErrorType.NETWORK, provider);
  }

  /**
   * Create an unknown error
   * @param message The error message
   * @param provider The provider name
   * @returns An AIProviderError
   */
  static unknown(message: string, provider: string): AIProviderError {
    return new AIProviderError(message, AIErrorType.UNKNOWN, provider);
  }
} 