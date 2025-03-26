import type { ResourceTranslation } from '@/types/shared/translation'
import type { GameResourceFile } from '@/types/engines/base'
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

export function extractTranslations(file: GameResourceFile): ResourceTranslation[] {
  const actors = file.content as RPGMVActorData
  const translations: ResourceTranslation[] = []

  for (let i = 1; i < actors.length; i++) {
    const actor = actors[i] as RPGMVActor
    if (!actor) continue

    (Object.keys(translatableFields) as Array<keyof RPGMVActorTranslatable>).forEach(key => {
      const value = actor[key]
      if (typeof value === 'string' && value !== '') {
        translations.push({
          resourceId: `${actor.id}`, // Use actor.id for resourceId
          field: key,
          source: value,
          target: '',
          context: `${translatableFields[key].context}`,
          file: file.path,
          section: 'actors'
        })
      }
    })
  }
  
  return translations
}

export function applyTranslations(file: GameResourceFile, translations: ResourceTranslation[]): GameResourceFile {
  const actors = file.content as RPGMVActorData
  const updatedActors = [...actors] as RPGMVActorData

  translations.forEach(translation => {
    const actorId = parseInt(translation.resourceId) // Use resourceId instead of id
    const field = translation.field as keyof RPGMVActorTranslatable
    
    if (actorId > 0 && updatedActors[actorId] && translation.target && field in translatableFields) {
      const updatedActor = {
        ...updatedActors[actorId] as RPGMVActor,
        [field]: translation.target
      }
      updatedActors[actorId] = updatedActor
    }
  })

  return {
    ...file,
    content: updatedActors
  }
} 