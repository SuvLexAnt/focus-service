import { describe, it, expect } from 'vitest'
import {
  generateRandomPractice,
  generateReplacementPractice,
  getAvailableDurations,
  getNearbyDurations,
  getCategoryInfo,
  getAllCategories,
  getPracticeCountByDuration,
} from './practiceGenerator'

describe('practiceGenerator', () => {
  describe('getAvailableDurations', () => {
    it('should return array of available durations', () => {
      const durations = getAvailableDurations()
      expect(durations).toBeInstanceOf(Array)
      expect(durations.length).toBeGreaterThan(0)
    })
  })

  describe('getNearbyDurations', () => {
    it('should return nearby durations for middle value', () => {
      const nearby = getNearbyDurations('3')
      expect(nearby).toContain('2')
      expect(nearby).toContain('5')
    })

    it('should return only one duration for first value', () => {
      const nearby = getNearbyDurations('1')
      expect(nearby).toHaveLength(1)
      expect(nearby).toContain('2')
    })

    it('should return only one duration for last value', () => {
      const nearby = getNearbyDurations('10')
      expect(nearby).toHaveLength(1)
      expect(nearby).toContain('7')
    })
  })

  describe('generateRandomPractice', () => {
    it('should generate a practice with required fields', () => {
      const practice = generateRandomPractice()

      expect(practice).not.toBeNull()
      if (practice) {
        expect(practice.id).toBeDefined()
        expect(practice.title).toBeDefined()
        expect(practice.duration).toBeTypeOf('number')
        expect(practice.category).toBeDefined()
        expect(practice.purpose).toBeDefined()
        expect(practice.instructions).toBeDefined()
        expect(practice.instructions.whatToDo).toBeDefined()
        expect(practice.instructions.focusOn).toBeDefined()
        expect(practice.instructions.dontFocusOn).toBeDefined()
      }
    })

    it('should generate practice with specific duration', () => {
      const practice = generateRandomPractice({ duration: '5' })

      expect(practice).not.toBeNull()
      if (practice) {
        expect(practice.duration).toBe(5)
      }
    })

    it('should exclude specified IDs', () => {
      // Get all practices to find IDs
      const practice1 = generateRandomPractice({ duration: '1' })
      if (!practice1) return

      // Try to generate another one excluding the first
      const practice2 = generateRandomPractice({
        duration: '1',
        excludeIds: [practice1.id]
      })

      if (practice2) {
        expect(practice2.id).not.toBe(practice1.id)
      }
    })

    it('should return null when all practices are excluded', () => {
      // Get all 1-minute practices
      const excludeIds: string[] = []
      for (let i = 0; i < 100; i++) {
        const practice = generateRandomPractice({ duration: '1', excludeIds })
        if (!practice) break
        excludeIds.push(practice.id)
      }

      const result = generateRandomPractice({ duration: '1', excludeIds })
      expect(result).toBeNull()
    })

    it('should mark generated practice as not from program', () => {
      const practice = generateRandomPractice()

      expect(practice).not.toBeNull()
      if (practice) {
        expect(practice.isFromProgram).toBe(false)
      }
    })
  })

  describe('generateReplacementPractice', () => {
    it('should generate practice with same duration', () => {
      const replacement = generateReplacementPractice(
        { id: 'test-id', duration: 5 },
        []
      )

      expect(replacement).not.toBeNull()
      if (replacement) {
        expect(replacement.duration).toBe(5)
      }
    })

    it('should fall back to nearby duration if exact not available', () => {
      // Get all 5-minute practices
      const excludeIds: string[] = []
      for (let i = 0; i < 100; i++) {
        const practice = generateRandomPractice({ duration: '5', excludeIds })
        if (!practice) break
        excludeIds.push(practice.id)
      }

      const replacement = generateReplacementPractice(
        { id: 'test-id', duration: 5 },
        excludeIds
      )

      // Should get a 3 or 7 minute practice instead
      if (replacement) {
        expect([3, 5, 7]).toContain(replacement.duration)
      }
    })

    it('should exclude original practice ID', () => {
      const replacement = generateReplacementPractice(
        { id: 'breath-reset-1', duration: 1 },
        []
      )

      if (replacement) {
        expect(replacement.id).not.toBe('breath-reset-1')
      }
    })
  })

  describe('getCategoryInfo', () => {
    it('should return category info for valid key', () => {
      const info = getCategoryInfo('breathing')

      expect(info).toBeDefined()
      expect(info?.name).toBeDefined()
      expect(info?.description).toBeDefined()
      expect(info?.icon).toBeDefined()
    })

    it('should return undefined for invalid key', () => {
      const info = getCategoryInfo('invalid-category')
      expect(info).toBeUndefined()
    })
  })

  describe('getAllCategories', () => {
    it('should return array of categories', () => {
      const categories = getAllCategories()

      expect(categories).toBeInstanceOf(Array)
      expect(categories.length).toBeGreaterThan(0)
      expect(categories[0]).toHaveProperty('key')
      expect(categories[0]).toHaveProperty('name')
      expect(categories[0]).toHaveProperty('description')
      expect(categories[0]).toHaveProperty('icon')
    })
  })

  describe('getPracticeCountByDuration', () => {
    it('should return count for valid duration', () => {
      const count = getPracticeCountByDuration('1')
      expect(count).toBeGreaterThan(0)
    })

    it('should return 0 for duration with no practices', () => {
      // Use a duration that doesn't exist
      const count = getPracticeCountByDuration('99' as any)
      expect(count).toBe(0)
    })
  })
})
