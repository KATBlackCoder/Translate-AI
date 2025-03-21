import { describe, it, expect } from 'vitest'
import type {
  RPGMVBaseData,
  RPGMVTrait,
  RPGMVEquip,
  RPGMVTranslatableCore,
  RPGMVTranslatableExtended,
  RPGMVEffect
} from '../../../../../src/types/engines/rpgmv/common'

describe('RPGMVBaseData', () => {
  const baseData: RPGMVBaseData = {
    id: 1,
    name: 'Test Item',
    note: 'Optional note'
  }

  it('should validate required fields', () => {
    expect(baseData.id).toBeDefined()
    expect(baseData.name).toBeDefined()
    expect(typeof baseData.id).toBe('number')
    expect(typeof baseData.name).toBe('string')
  })

  it('should allow optional note field', () => {
    expect(typeof baseData.note).toBe('string')
    const withoutNote: RPGMVBaseData = { id: 2, name: 'No Note' }
    expect(withoutNote.note).toBeUndefined()
  })
})

describe('RPGMVTrait', () => {
  const trait: RPGMVTrait = {
    code: 11,    // Example: Element Rate
    dataId: 3,   // Example: Fire element
    value: 1.5   // Example: 150% damage
  }

  it('should validate trait structure', () => {
    expect(typeof trait.code).toBe('number')
    expect(typeof trait.dataId).toBe('number')
    expect(typeof trait.value).toBe('number')
  })
})

describe('RPGMVEquip', () => {
  const equip: RPGMVEquip = [1, 2, 3, 4, 5]

  it('should validate equipment slots', () => {
    expect(typeof equip[0]).toBe('number')
    expect(typeof equip[1]).toBe('number')
    expect(typeof equip[2]).toBe('number')
    expect(typeof equip[3]).toBe('number')
    expect(typeof equip[4]).toBe('number')
  })
})

describe('RPGMVTranslatableCore', () => {
  const core: RPGMVTranslatableCore = {
    name: 'Test Name',
    description: 'Test Description',
    note: 'Test Note',
    message: 'Test Message',
    help: 'Test Help'
  }

  it('should validate required name field', () => {
    expect(core.name).toBeDefined()
    expect(typeof core.name).toBe('string')
  })

  it('should allow optional fields', () => {
    const minimal: RPGMVTranslatableCore = { name: 'Just Name' }
    expect(minimal.description).toBeUndefined()
    expect(minimal.note).toBeUndefined()
    expect(minimal.message).toBeUndefined()
    expect(minimal.help).toBeUndefined()
  })
})

describe('RPGMVTranslatableExtended', () => {
  const extended: RPGMVTranslatableExtended = {
    name: 'Test Name',
    nickname: 'Test Nickname',
    profile: 'Test Profile',
    flavor: 'Test Flavor',
    command: 'Test Command',
    success: 'Success Message',
    failure: 'Failure Message',
    usage: 'Usage Instructions',
    requirements: 'Requirements Text'
  }

  it('should include core fields', () => {
    expect(extended.name).toBeDefined()
    expect(typeof extended.name).toBe('string')
  })

  it('should allow all extended fields', () => {
    expect(typeof extended.nickname).toBe('string')
    expect(typeof extended.profile).toBe('string')
    expect(typeof extended.flavor).toBe('string')
    expect(typeof extended.command).toBe('string')
    expect(typeof extended.success).toBe('string')
    expect(typeof extended.failure).toBe('string')
    expect(typeof extended.usage).toBe('string')
    expect(typeof extended.requirements).toBe('string')
  })

  it('should allow partial extended fields', () => {
    const partial: RPGMVTranslatableExtended = {
      name: 'Name',
      nickname: 'Nickname',
      profile: 'Profile'
    }
    expect(partial.flavor).toBeUndefined()
    expect(partial.command).toBeUndefined()
  })
})

describe('RPGMVEffect', () => {
  const effect: RPGMVEffect = {
    code: 11,     // Example: HP Recovery
    dataId: 0,    // Example: Direct value
    value1: 100,  // Example: Recovery amount
    value2: 0     // Example: No variance
  }

  it('should validate effect structure', () => {
    expect(typeof effect.code).toBe('number')
    expect(typeof effect.dataId).toBe('number')
    expect(typeof effect.value1).toBe('number')
    expect(typeof effect.value2).toBe('number')
  })

  it('should handle common effect types', () => {
    // HP Recovery
    const hpRecovery: RPGMVEffect = { code: 11, dataId: 0, value1: 100, value2: 0 }
    expect(hpRecovery.code).toBe(11)
    
    // Add State
    const addState: RPGMVEffect = { code: 21, dataId: 1, value1: 1, value2: 100 }
    expect(addState.code).toBe(21)
  })
})
