import { describe, it, expect } from 'vitest'
import type { RPGMVActor, RPGMVActorTranslatable } from '../../../../../../src/types/engines/rpgmv/data/actors'
import actorsData from '../../../../../game/www/data/Actors.json'

describe('RPGMVActorTranslatable', () => {
  it('should validate translatable fields structure', () => {
    const translatable: RPGMVActorTranslatable = {
      name: 'Character Name',
      nickname: 'Character Title',
      profile: 'Character Biography'
    }

    expect(translatable.name).toBeDefined()
    expect(typeof translatable.name).toBe('string')
    expect(typeof translatable.nickname).toBe('string')
    expect(typeof translatable.profile).toBe('string')
  })

  it('should allow minimal translatable fields', () => {
    const minimal: RPGMVActorTranslatable = {
      name: 'Character Name',
      nickname: '',
      profile: ''
    }
    // note is not part of RPGMVActorTranslatable interface
    expect(Object.keys(minimal)).toHaveLength(3)
  })
})

describe('RPGMVActor', () => {
  // Filter out null entries and convert to RPGMVActor array
  const actors = actorsData.filter((actor): actor is NonNullable<typeof actor> => actor !== null) as RPGMVActor[]

  it('should have valid array structure', () => {
    expect(Array.isArray(actorsData)).toBe(true)
    expect(actorsData[0]).toBeNull() // First element should be null
    expect(actors.length).toBeGreaterThan(0)
  })

  it('should validate all actors have required fields', () => {
    actors.forEach(actor => {
      expect(actor.id).toBeTypeOf('number')
      expect(actor.name).toBeTypeOf('string')
      expect(actor.battlerName).toBeTypeOf('string')
      expect(actor.characterName).toBeTypeOf('string')
      expect(actor.faceName).toBeTypeOf('string')
      expect(actor.nickname).toBeTypeOf('string')
      expect(actor.profile).toBeTypeOf('string')
      expect(actor.note).toBeTypeOf('string')
      expect(actor.classId).toBeTypeOf('number')
      expect(actor.initialLevel).toBeTypeOf('number')
      expect(actor.maxLevel).toBeTypeOf('number')
      expect(Array.isArray(actor.traits)).toBe(true)
      expect(Array.isArray(actor.equips)).toBe(true)
      expect(actor.equips).toHaveLength(5)
    })
  })

  it('should validate all actors have valid level constraints', () => {
    actors.forEach(actor => {
      expect(actor.initialLevel).toBeGreaterThan(0)
      expect(actor.maxLevel).toBeGreaterThanOrEqual(actor.initialLevel)
      expect(actor.maxLevel).toBeLessThanOrEqual(99)
    })
  })

  it('should validate all actors have valid indices', () => {
    actors.forEach(actor => {
      expect(actor.characterIndex).toBeGreaterThanOrEqual(0)
      expect(actor.characterIndex).toBeLessThanOrEqual(7)
      expect(actor.faceIndex).toBeGreaterThanOrEqual(0)
      expect(actor.faceIndex).toBeLessThanOrEqual(7)
    })
  })

  it('should validate all equipment arrays', () => {
    actors.forEach(actor => {
      actor.equips.forEach(equipId => {
        expect(equipId).toBeTypeOf('number')
        expect(equipId).toBeGreaterThanOrEqual(0)
      })
    })
  })

  it('should validate all traits have correct structure', () => {
    actors.forEach(actor => {
      actor.traits.forEach(trait => {
        expect(trait.code).toBeTypeOf('number')
        expect(trait.dataId).toBeTypeOf('number')
        expect(trait.value).toBeTypeOf('number')
      })
    })
  })

  it('should identify actors with special traits', () => {
    const actorsWithTraits = actors.filter(actor => actor.traits.length > 0)
    expect(actorsWithTraits.length).toBeGreaterThan(0)
    
    actorsWithTraits.forEach(actor => {
      expect(actor.traits[0]).toEqual(expect.objectContaining({
        code: expect.any(Number),
        dataId: expect.any(Number),
        value: expect.any(Number)
      }))
    })
  })

  it('should identify actors with non-empty profiles', () => {
    const actorsWithProfiles = actors.filter(actor => actor.profile !== '')
    expect(actorsWithProfiles.length).toBeGreaterThan(0)
    
    actorsWithProfiles.forEach(actor => {
      expect(actor.profile.length).toBeGreaterThan(0)
    })
  })

  it('should validate specific actor examples', () => {
    // Harold (ハロルド)
    const harold = actors.find(a => a.name === 'ハロルド')
    expect(harold).toBeDefined()
    expect(harold?.id).toBe(1)
    expect(harold?.classId).toBe(1)
    expect(harold?.equips).toEqual([1, 1, 2, 3, 0])

    // Seren (セレン)
    const seren = actors.find(a => a.name === 'セレン')
    expect(seren).toBeDefined()
    expect(seren?.traits).toHaveLength(2)
    expect(seren?.initialLevel).toBe(99)
    expect(seren?.maxLevel).toBe(99)

    // Empty actor
    const emptyActor = actors.find(a => a.name === '')
    expect(emptyActor).toBeDefined()
    expect(emptyActor?.battlerName).toBe('')
    expect(emptyActor?.characterName).toBe('')
    expect(emptyActor?.faceName).toBe('')
    expect(emptyActor?.equips).toEqual([0, 0, 0, 0, 0])
  })
})
