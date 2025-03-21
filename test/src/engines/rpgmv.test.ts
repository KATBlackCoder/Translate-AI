import { describe, it, expect, vi, beforeEach } from 'vitest'
import { RPGMakerMVEngine } from '../../../src/engines/rpgmv'
import type { EngineFile, TranslationTarget } from '../../../src/types/engines/base'
import { readTextFile, exists } from '@tauri-apps/plugin-fs'

vi.mock('@tauri-apps/plugin-fs', () => ({
  readTextFile: vi.fn(),
  exists: vi.fn()
}))

describe('RPGMakerMVEngine', () => {
  let engine: RPGMakerMVEngine

  beforeEach(() => {
    engine = new RPGMakerMVEngine()
    vi.clearAllMocks()
  })

  describe('validateProject', () => {
    it('should validate project with all required files', async () => {
      vi.mocked(exists).mockResolvedValue(true)

      const result = await engine.validateProject('/game')
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should fail validation if data folder missing', async () => {
      vi.mocked(exists).mockResolvedValue(false)

      const result = await engine.validateProject('/game')
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Data folder not found')
    })

    it('should handle filesystem errors', async () => {
      vi.mocked(exists).mockRejectedValue(new Error('Access denied'))

      const result = await engine.validateProject('/game')
      expect(result.isValid).toBe(false)
      expect(result.errors[0]).toContain('Error checking data folder')
    })
  })

  describe('readProject', () => {
    it('should read project files successfully', async () => {
      const mockActors = [{ id: 1, name: 'Hero' }]
      vi.mocked(readTextFile).mockResolvedValue(JSON.stringify(mockActors))
      vi.mocked(exists).mockResolvedValue(true)

      const files = await engine.readProject('/game')
      expect(files).toHaveLength(1) // MVP: Only Actors.json
      expect(files[0].path).toBe('data/Actors.json')
      expect(files[0].content).toEqual(mockActors)
    })

    it('should handle read errors', async () => {
      vi.mocked(readTextFile).mockRejectedValue(new Error('Read failed'))
      vi.mocked(exists).mockResolvedValue(true)

      await expect(engine.readProject('/game')).rejects.toThrow('Error reading project files')
    })
  })

  describe('extractTranslations', () => {
    it('should extract translations from actor file', () => {
      const files: EngineFile[] = [{
        path: 'data/Actors.json',
        type: 'json',
        content: [
          null,
          {
            id: 1,
            name: "ハロルド",
            nickname: "",
            profile: "",
            note: "",
            battlerName: "Actor1_1",
            characterIndex: 0,
            characterName: "Actor1",
            classId: 1,
            equips: [1,1,2,3,0],
            faceIndex: 0,
            faceName: "Actor1",
            traits: [],
            initialLevel: 1,
            maxLevel: 99
          },
          {
            id: 2,
            name: "テレーゼ",
            nickname: "",
            profile: "",
            note: "",
            battlerName: "Actor1_8",
            characterIndex: 7,
            characterName: "Actor1",
            classId: 2,
            equips: [2,1,2,3,0],
            faceIndex: 7,
            faceName: "Actor1",
            traits: [],
            initialLevel: 1,
            maxLevel: 99
          }
        ]
      }]

      const translations = engine.extractTranslations(files)
      // Only extract non-empty strings
      const expected = [
        {
          key: '1',
          field: 'name',
          source: 'ハロルド',
          target: '',
          context: 'ActorCharacter Name',
          file: 'data/Actors.json'
        },
        {
          key: '2',
          field: 'name',
          source: 'テレーゼ',
          target: '',
          context: 'ActorCharacter Name',
          file: 'data/Actors.json'
        }
      ]

      expect(translations).toHaveLength(2)
      expect(translations).toEqual(expect.arrayContaining(expected))
    })

    it('should handle actors with traits and notes', () => {
      const files: EngineFile[] = [{
        path: 'data/Actors.json',
        type: 'json',
        content: [
          null,
          {
            id: 9,
            name: "セレン",
            nickname: "",
            profile: "素性は誰も知らない。暗器を隠している。\n振り向いて、彼女がいれば命はない！",
            note: "<Graphic:立ち絵用>\n",
            battlerName: "",
            characterIndex: 0,
            characterName: "暗殺者1-1",
            classId: 7,
            equips: [7,6,7,8,0],
            faceIndex: 0,
            faceName: "主人公1-3",
            traits: [{"code":62,"dataId":3,"value":1},{"code":23,"dataId":5,"value":0}],
            initialLevel: 99,
            maxLevel: 99
          },
          {
            id: 14,
            name: "エチル",
            nickname: "",
            profile: "素性は誰も知らない。\n左目には魔の力が宿っているとかいないとか。",
            note: "",
            battlerName: "",
            characterIndex: 0,
            characterName: "暗殺者2-2",
            classId: 7,
            equips: [7,6,7,8,0],
            faceIndex: 0,
            faceName: "主人公2-3",
            traits: [{"code":62,"dataId":3,"value":1},{"code":23,"dataId":5,"value":0}],
            initialLevel: 99,
            maxLevel: 99
          },
          {
            id: 15,
            name: "囚人0033番",
            nickname: "完全便器化済み",
            profile: "本名は\"エチル\"セレンの相棒である。現在、収監中。\nセレンにうしろめたさを感じている。",
            note: "33",
            battlerName: "",
            characterIndex: 0,
            characterName: "囚人2-2",
            classId: 8,
            equips: [0,0,11,12,13],
            faceIndex: 0,
            faceName: "主人公2-1",
            traits: [{"code":62,"dataId":3,"value":1},{"code":23,"dataId":5,"value":0}],
            initialLevel: 99,
            maxLevel: 99
          }
        ]
      }]

      const translations = engine.extractTranslations(files)
      const expected = [
        // Actor 9
        {
          key: '9',
          field: 'name',
          source: 'セレン',
          target: '',
          context: 'ActorCharacter Name',
          file: 'data/Actors.json'
        },
        {
          key: '9',
          field: 'profile',
          source: '素性は誰も知らない。暗器を隠している。\n振り向いて、彼女がいれば命はない！',
          target: '',
          context: 'ActorCharacter Bio',
          file: 'data/Actors.json'
        },
        {
          key: '9',
          field: 'note',
          source: '<Graphic:立ち絵用>\n',
          target: '',
          context: 'ActorCharacter Notes',
          file: 'data/Actors.json'
        },
        // Actor 14
        {
          key: '14',
          field: 'name',
          source: 'エチル',
          target: '',
          context: 'ActorCharacter Name',
          file: 'data/Actors.json'
        },
        {
          key: '14',
          field: 'profile',
          source: '素性は誰も知らない。\n左目には魔の力が宿っているとかいないとか。',
          target: '',
          context: 'ActorCharacter Bio',
          file: 'data/Actors.json'
        },
        // Actor 15
        {
          key: '15',
          field: 'name',
          source: '囚人0033番',
          target: '',
          context: 'ActorCharacter Name',
          file: 'data/Actors.json'
        },
        {
          key: '15',
          field: 'nickname',
          source: '完全便器化済み',
          target: '',
          context: 'ActorCharacter Title',
          file: 'data/Actors.json'
        },
        {
          key: '15',
          field: 'profile',
          source: '本名は\"エチル\"セレンの相棒である。現在、収監中。\nセレンにうしろめたさを感じている。',
          target: '',
          context: 'ActorCharacter Bio',
          file: 'data/Actors.json'
        },
        {
          key: '15',
          field: 'note',
          source: '33',
          target: '',
          context: 'ActorCharacter Notes',
          file: 'data/Actors.json'
        }
      ]

      expect(translations).toHaveLength(9)
      expect(translations).toEqual(expect.arrayContaining(expected))
    })

    it('should skip non-translatable files', () => {
      const files: EngineFile[] = [{
        path: 'data/unknown.json',
        type: 'json',
        content: { name: 'Test' }
      }]

      const translations = engine.extractTranslations(files)
      expect(translations).toHaveLength(0)
    })

    it('should preserve structure and formatting when applying translations', () => {
      const files: EngineFile[] = [{
        path: 'data/Actors.json',
        type: 'actors',
        content: [
          null,
          {
            id: 9,
            name: "セレン",
            nickname: "",
            profile: "素性は誰も知らない。暗器を隠している。\n振り向いて、彼女がいれば命はない！",
            note: "<Graphic:立ち絵用>\n",
            battlerName: "",
            characterIndex: 0,
            characterName: "暗殺者1-1",
            classId: 7,
            equips: [7,6,7,8,0],
            faceIndex: 0,
            faceName: "主人公1-3",
            traits: [{"code":62,"dataId":3,"value":1},{"code":23,"dataId":5,"value":0}],
            initialLevel: 99,
            maxLevel: 99
          }
        ]
      }]

      // First extract translations
      const extracted = engine.extractTranslations(files)
      
      // Verify extracted structure
      expect(extracted).toHaveLength(3) // name, profile, note
      expect(extracted[0]).toMatchObject({
        key: '9',
        field: 'name',
        source: 'セレン',
        context: 'ActorCharacter Name'
      })
      expect(extracted[1]).toMatchObject({
        key: '9',
        field: 'profile',
        source: '素性は誰も知らない。暗器を隠している。\n振り向いて、彼女がいれば命はない！',
        context: 'ActorCharacter Bio'
      })

      // Simulate translations by copying source to target
      const translations = extracted.map(t => ({
        ...t,
        target: t.source // Just copy source to target for structure test
      }))

      // Apply "translations" back
      const updated = engine.applyTranslations(files, translations)

      // Verify structure preservation
      expect(updated[0].content[1]).toMatchObject({
        id: 9,
        name: "セレン",
        profile: "素性は誰も知らない。暗器を隠している。\n振り向いて、彼女がいれば命はない！",
        battlerName: "",
        characterIndex: 0,
        characterName: "暗殺者1-1",
        // ... other fields should match original
      })

      // Verify newlines are preserved
      expect(updated[0].content[1].profile).toContain('\n')
      expect(updated[0].content[1].note).toContain('\n')

      // Verify non-translatable fields weren't touched
      expect(updated[0].content[1].characterName).toBe("暗殺者1-1")
      expect(updated[0].content[1].equips).toEqual([7,6,7,8,0])
    })
  })

  describe('applyTranslations', () => {
    it('should apply translations to actor file', () => {
      const files: EngineFile[] = [{
        path: 'data/Actors.json',
        type: 'json',
        content: [
          null,
          {
            id: 1,
            name: "ハロルド",
            nickname: "",
            profile: "",
            note: "",
            battlerName: "Actor1_1",
            characterIndex: 0,
            characterName: "Actor1",
            classId: 1,
            equips: [1,1,2,3,0],
            faceIndex: 0,
            faceName: "Actor1",
            traits: [],
            initialLevel: 1,
            maxLevel: 99
          }
        ]
      }]

      const translations: TranslationTarget[] = [{
        key: '1',
        field: 'name',
        source: 'ハロルド',
        target: 'Harold',
        context: 'ActorCharacter Name',
        file: 'data/Actors.json'
      }]

      const updated = engine.applyTranslations(files, translations)
      expect(updated[0].content[1].name).toBe('Harold')
      expect(updated[0].content[1].nickname).toBe('') // Unchanged
    })

    it('should handle missing translations', () => {
      const files: EngineFile[] = [{
        path: 'data/Actors.json',
        type: 'json',
        content: [{
          id: 1,
          name: 'Hero'
        }]
      }]

      const translations: TranslationTarget[] = []
      const updated = engine.applyTranslations(files, translations)
      expect(updated[0].content[0].name).toBe('Hero') // Unchanged
    })
  })
})
