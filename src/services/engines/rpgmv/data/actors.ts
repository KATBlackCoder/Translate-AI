// src/services/engines/rpgmv/data/actors.ts
import type { ResourceTranslation } from '@/types/shared/translation'
import type { GameResourceFile } from '@/types/engines/base'
import type { RPGMVActorData, RPGMVActor, RPGMVActorTranslatable } from '@/types/engines/rpgmv'

/**
 * Map of translatable actor fields with metadata
 * Defines which fields should be extracted and how they should be processed
 */
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

/**
 * Extract translatable content from an Actors.json file
 * 
 * @param file - The actor data file to process
 * @returns Array of translatable resources from the file
 */
export function extractTranslations(file: GameResourceFile): ResourceTranslation[] {
  try {
    // Validate input
    if (!file || !file.content) {
      console.warn('Invalid actor file provided to extractTranslations')
      return []
    }
    
    const actors = file.content as RPGMVActorData
    const translations: ResourceTranslation[] = []
    
    // RPG Maker actor arrays typically start at index 1 (index 0 is null/empty)
    for (let i = 1; i < actors.length; i++) {
      const actor = actors[i] as RPGMVActor
      
      // Skip null/undefined actors (common in RPG Maker data)
      if (!actor) continue
      
      // Process each translatable field
      (Object.keys(translatableFields) as Array<keyof RPGMVActorTranslatable>).forEach(key => {
        const value = actor[key]
        
        // Only process non-empty string values
        if (typeof value === 'string' && value.trim() !== '') {
          translations.push({
            resourceId: `${actor.id}`,
            field: key,
            source: value,
            target: '',
            context: `${translatableFields[key].context} for Actor #${actor.id}`,
            file: file.path,
            section: 'actors'
          })
        }
      })
    }
    
    return translations
  } catch (error) {
    console.error('Error extracting actor translations:', error)
    return []
  }
}

/**
 * Apply translations back to an Actors.json file
 * 
 * @param file - The actor data file to update
 * @param translations - The translations to apply
 * @returns Updated actor file with translations applied
 */
export function applyTranslations(file: GameResourceFile, translations: ResourceTranslation[]): GameResourceFile {
  try {
    // Validate input
    if (!file || !file.content) {
      console.warn('Invalid actor file provided to applyTranslations')
      return file
    }
    
    const actors = file.content as RPGMVActorData
    
    // Create a deep copy to avoid mutating the original
    const updatedActors = Array.isArray(actors) ? [...actors] : []
    
    // Apply each translation
    translations.forEach(translation => {
      // Parse actor ID from resource ID
      const actorId = parseInt(translation.resourceId)
      const field = translation.field as keyof RPGMVActorTranslatable
      
      // Validate the actor exists and has the field
      if (
        !isNaN(actorId) && 
        actorId > 0 && 
        actorId < updatedActors.length && 
        updatedActors[actorId] && 
        translation.target && 
        field in translatableFields
      ) {
        // Create updated actor with the translation applied
        const updatedActor = {
          ...updatedActors[actorId] as RPGMVActor,
          [field]: translation.target
        }
        
        // Update the actor in the array
        updatedActors[actorId] = updatedActor
      }
    })
    
    // Return updated file
    return {
      ...file,
      content: updatedActors
    }
  } catch (error) {
    console.error('Error applying actor translations:', error)
    return file
  }
}