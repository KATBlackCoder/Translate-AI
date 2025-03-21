import type { EngineFile, TranslationTarget, TranslatedText } from '@/types/engines/base'
import type { RPGMVActorData, RPGMVActor, RPGMVActorTranslatable } from '@/types/engines/rpgmv'

export const translatableFields: Record<keyof RPGMVActorTranslatable, {
  field: string,
  context: string,
  promptType: string
}> = {
  name: {
    field: 'name',
    context: 'Actor Name',
    promptType: 'name'
  },
  nickname: {
    field: 'nickname',
    context: 'Actor Title',
    promptType: 'name'
  },
  profile: {
    field: 'profile',
    context: 'Actor Profile',
    promptType: 'dialogue'
  },
  note: {
    field: 'note',
    context: 'Actor Notes',
    promptType: 'general'
  }
}

export function extractTranslations(file: EngineFile): TranslationTarget[] {
  const actors = file.content as RPGMVActorData
  const translations: TranslationTarget[] = []
  
  for (let i = 1; i < actors.length; i++) {
    const actor = actors[i]
    if (!actor) continue

    (Object.keys(translatableFields) as Array<keyof RPGMVActorTranslatable>).forEach(key => {
      const value = actor[key]
      if (typeof value === 'string' && value !== '') {
        translations.push({
          id: `${actor.id}`,
          field: key,
          source: value,
          target: '',
          context: `${translatableFields[key].context} (${translatableFields[key].promptType})`,
          file: file.path
        })
      }
    })
  }
  
  return translations
}

export function applyTranslations(file: EngineFile, translations: TranslatedText[]): EngineFile {
  const actors = file.content as RPGMVActorData
  const updatedActors = [...actors] as RPGMVActorData

  translations.forEach(translation => {
    const index = parseInt(translation.id)
    const field = translation.field as keyof RPGMVActorTranslatable
    
    if (index > 0 && updatedActors[index] && translation.target && field in translatableFields) {
      const updatedActor: RPGMVActor = {
        ...updatedActors[index]!,
        [field]: translation.target
      }
      updatedActors[index] = updatedActor
    }
  })

  return {
    ...file,
    content: updatedActors
  }
} 