import { describe, it, expect, vi, beforeEach } from 'vitest'
import { RPGMakerMVEngine } from '../../../src/engines/rpgmv'
import type { EngineFile, TranslationTarget, TranslatedText } from '../../../src/types/engines/base'
import { readTextFile, exists } from '@tauri-apps/plugin-fs'
import { join } from '@tauri-apps/api/path'

vi.mock('@tauri-apps/plugin-fs', () => ({
  readTextFile: vi.fn(),
  exists: vi.fn()
}))

vi.mock('@tauri-apps/api/path', () => ({
  join: vi.fn(async (base, ...parts) => Promise.resolve(parts.join('/')))
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
      vi.mocked(join).mockImplementation(async (base, ...parts) => Promise.resolve([...parts].join('/')))

      const result = await engine.validateProject('/game')
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.requiredFiles).toEqual(['www/data/Actors.json'])
    })

    it('should fail validation when data folder is missing', async () => {
      vi.mocked(exists).mockResolvedValue(false)
      vi.mocked(join).mockImplementation(async (base, ...parts) => Promise.resolve([...parts].join('/')))

      const result = await engine.validateProject('/game')
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Data folder not found')
      expect(result.requiredFiles).toEqual(['www/data/Actors.json'])
    })

    it('should handle filesystem errors', async () => {
      vi.mocked(exists).mockRejectedValue(new Error('Access denied'))
      vi.mocked(join).mockImplementation(async (base, ...parts) => Promise.resolve([...parts].join('/')))

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
      vi.mocked(join).mockImplementation(async (base, ...parts) => Promise.resolve([...parts].join('/')))

      const files = await engine.readProject('/game')
      expect(files).toHaveLength(1) // MVP: Only Actors.json
      expect(files[0].path).toBe('www/data/Actors.json')
      expect(files[0].content).toEqual(mockActors)
    })

    it('should handle read errors', async () => {
      vi.mocked(readTextFile).mockRejectedValue(new Error('Read failed'))
      vi.mocked(exists).mockResolvedValue(true)
      vi.mocked(join).mockImplementation(async (base, ...parts) => Promise.resolve([...parts].join('/')))

      await expect(engine.readProject('/game')).rejects.toThrow('Error reading project files')
    })
  })

  describe('extractTranslations', () => {
    it('should extract translations from actor file', () => {
      const files: EngineFile[] = [{
        path: 'www/data/Actors.json',
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
      const expected: TranslationTarget[] = [
        {
          id: '1',
          field: 'name',
          source: 'ハロルド',
          target: '',
          context: 'Actor Name (general)',
          file: 'www/data/Actors.json'
        },
        {
          id: '2',
          field: 'name',
          source: 'テレーゼ',
          target: '',
          context: 'Actor Name (general)',
          file: 'www/data/Actors.json'
        }
      ]

      expect(translations).toHaveLength(2)
      expect(translations).toEqual(expect.arrayContaining(expected))
    })

    it('should handle actors with traits and notes', () => {
      const files: EngineFile[] = [{
        path: 'www/data/Actors.json',
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
          }
        ]
      }]

      const translations = engine.extractTranslations(files)
      const expected: TranslationTarget[] = [
        {
          id: '9',
          field: 'name',
          source: 'セレン',
          target: '',
          context: 'Actor Name (general)',
          file: 'www/data/Actors.json'
        },
        {
          id: '9',
          field: 'profile',
          source: '素性は誰も知らない。暗器を隠している。\n振り向いて、彼女がいれば命はない！',
          target: '',
          context: 'Actor Profile (dialogue)',
          file: 'www/data/Actors.json'
        },
        {
          id: '9',
          field: 'note',
          source: '<Graphic:立ち絵用>\n',
          target: '',
          context: 'Actor Notes (general)',
          file: 'www/data/Actors.json'
        }
      ]

      expect(translations).toHaveLength(3)
      expect(translations).toEqual(expect.arrayContaining(expected))
    })

    it('should skip non-translatable files', () => {
      const files: EngineFile[] = [{
        path: 'www/data/unknown.json',
        type: 'json',
        content: { name: 'Test' }
      }]

      const translations = engine.extractTranslations(files)
      expect(translations).toHaveLength(0)
    })

    it('should preserve structure and formatting when applying translations', () => {
      const files: EngineFile[] = [{
        path: 'www/data/Actors.json',
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
        id: '9',
        field: 'name',
        source: 'セレン',
        context: 'Actor Name (general)'
      })
      expect(extracted[1]).toMatchObject({
        id: '9',
        field: 'profile',
        source: '素性は誰も知らない。暗器を隠している。\n振り向いて、彼女がいれば命はない！',
        context: 'Actor Profile (dialogue)'
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
    it('should apply translations and track stats', () => {
      const files: EngineFile[] = [{
        path: 'www/data/Actors.json',
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

      const translations: TranslatedText[] = [{
        id: '1',
        field: 'name',
        source: 'ハロルド',
        target: 'Harold',
        context: 'Actor Name (general)',
        file: 'www/data/Actors.json',
        tokens: {
          prompt: 10,
          completion: 5,
          total: 15
        },
        metadata: {
          promptType: 'general',
          modelUsed: 'gpt-4',
          processingTime: 1000,
          qualityScore: 0.95
        }
      }]

      const updated = engine.applyTranslations(files, translations)
      
      // Check translation was applied
      expect(updated[0].content[1].name).toBe('Harold')
      expect(updated[0].content[1].nickname).toBe('') // Unchanged
    })

    it('should handle missing translations', () => {
      const files: EngineFile[] = [{
        path: 'www/data/Actors.json',
        type: 'json',
        content: [
          null,
          {
            id: 1,
            name: 'Hero',
            nickname: '',
            profile: '',
            note: ''
          }
        ]
      }]

      const translations: TranslatedText[] = []
      const updated = engine.applyTranslations(files, translations)
      expect(updated[0].content[1].name).toBe('Hero') // Unchanged
    })

    it('should preserve structure and formatting', () => {
      const files: EngineFile[] = [{
        path: 'www/data/Actors.json',
        type: 'json',
        content: [
          null,
          {
            id: 9,
            name: "セレン",
            profile: "素性は誰も知らない。\n暗器を隠している。",
            note: "<Graphic:立ち絵用>\n",
            battlerName: "Actor1_1",
            characterIndex: 0,
            characterName: "Actor1",
            traits: [{"code":62,"dataId":3,"value":1}]
          }
        ]
      }]

      // First extract translations
      const extracted = engine.extractTranslations(files)
      
      // Create mock translations with same text (no actual translation)
      const translations: TranslatedText[] = [{
        id: '9',
        field: 'name',
        source: 'セレン',
        target: 'セレン', // Same as source - we're testing structure preservation, not translation
        context: 'Actor Name (general)',
        file: 'www/data/Actors.json',
        tokens: {
          prompt: 10,
          completion: 5,
          total: 15
        },
        metadata: {
          promptType: 'general',
          modelUsed: 'gpt-4',
          processingTime: 1000,
          qualityScore: 0.95
        }
      }, {
        id: '9',
        field: 'profile',
        source: '素性は誰も知らない。\n暗器を隠している。',
        target: '素性は誰も知らない。\n暗器を隠している。', // Same as source
        context: 'Actor Profile (dialogue)',
        file: 'www/data/Actors.json',
        tokens: {
          prompt: 20,
          completion: 10,
          total: 30
        },
        metadata: {
          promptType: 'dialogue',
          modelUsed: 'gpt-4',
          processingTime: 1500,
          qualityScore: 0.92
        }
      }]

      const updated = engine.applyTranslations(files, translations)
      
      // Check structure preservation
      expect(updated[0].content[1]).toMatchObject({
        id: 9,
        name: "セレン",
        profile: "素性は誰も知らない。\n暗器を隠している。",
        battlerName: "Actor1_1",
        characterIndex: 0,
        characterName: "Actor1",
        traits: [{"code":62,"dataId":3,"value":1}]
      })
      
      // Check newline preservation
      expect(updated[0].content[1].profile).toContain('\n')
      expect(updated[0].content[1].note).toContain('\n')
      
      // Verify non-translatable fields weren't touched
      expect(updated[0].content[1].battlerName).toBe('Actor1_1')
      expect(updated[0].content[1].traits).toEqual([{"code":62,"dataId":3,"value":1}])
    })
  })
})
