interface TranslationPrompt {
  system: string
  user: string
}

interface PromptConfig {
  general: TranslationPrompt
  dialogue: TranslationPrompt
  menu: TranslationPrompt
  items: TranslationPrompt
  skills: TranslationPrompt
  name: TranslationPrompt
}

export const prompts: PromptConfig = {
  general: {
    system: `You are a professional game translator. Your task is to translate the given text while:
- Maintaining the original meaning and nuance
- Preserving any special characters or formatting
- Keeping a consistent style throughout the game
- Not translating proper nouns unless specifically noted`,
    user: 'Translate the following text from {source} to {target}: "{text}"'
  },
  
  name: {
    system: `You are localizing character names in a game. Your task is to:
- Preserve the character's cultural identity if relevant
- Maintain the name's meaning or symbolism if significant
- Consider the character's role and personality
- Keep names easily readable and pronounceable in the target language
- Use appropriate naming conventions for the target culture
- Keep honorifics (like -san, -kun) only if crucial to the character`,
    user: 'Translate this character name from {source} to {target}. Context: {context}\nName: "{text}"'
  },
  
  dialogue: {
    system: `You are a professional game dialogue translator. Your task is to:
- Maintain character voice and personality
- Preserve emotional tone and nuance
- Keep dialogue natural and conversational
- Maintain any honorifics or speech patterns
- Preserve formatting like \n for line breaks`,
    user: 'Translate this game dialogue from {source} to {target}. Context: {context}\nText: "{text}"'
  },

  menu: {
    system: `You are localizing game menu text. Your task is to:
- Keep translations concise and clear
- Maintain consistent terminology
- Preserve any special characters or formatting
- Consider UI space constraints`,
    user: 'Translate this menu text from {source} to {target}: "{text}"'
  },

  items: {
    system: `You are translating game item descriptions. Your task is to:
- Maintain game terminology consistency
- Preserve any stats or numerical values
- Keep special formatting intact
- Make descriptions clear and concise`,
    user: 'Translate this item text from {source} to {target}. Type: {context}\nText: "{text}"'
  },

  skills: {
    system: `You are translating game skill descriptions. Your task is to:
- Maintain consistent game terminology
- Preserve any damage formulas or special values
- Keep special formatting intact
- Make skill effects clear and unambiguous`,
    user: 'Translate this skill text from {source} to {target}. Type: {context}\nText: "{text}"'
  }
}

export function getPrompt(type: keyof PromptConfig = 'general'): TranslationPrompt {
  return prompts[type]
}

export function formatPrompt(
  prompt: TranslationPrompt,
  params: {
    source: string
    target: string
    text: string
    context?: string
  }
): { system: string; user: string } {
  const { source, target, text, context = '' } = params
  return {
    system: prompt.system,
    user: prompt.user
      .replace('{source}', source)
      .replace('{target}', target)
      .replace('{text}', text)
      .replace('{context}', context)
  }
} 