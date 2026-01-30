import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  loadExtraPractices,
  saveExtraPractices,
  addBonusPractice,
  removeBonusPractice,
  replaceBonusPractice,
  getDayBonusPractices,
  canAddMoreBonusPractices,
  setReplacement,
  getReplacement,
  getDayReplacements,
  removeReplacement,
  toggleBonusPractice,
  isBonusPracticeCompleted,
  getBonusPracticesProgress,
  getShownIds,
  getAllShownIds,
  MAX_BONUS_PRACTICES,
} from './extraPracticesStorage'
import { Practice } from '../types/meditation'

const mockPractice: Practice = {
  id: 'test-practice-1',
  title: 'Test Practice',
  duration: 5,
  category: 'breathing',
  purpose: 'Test purpose',
  instructions: {
    whatToDo: 'Do this',
    focusOn: 'Focus here',
    dontFocusOn: 'Ignore this',
  },
  isFromProgram: false,
}

const mockPractice2: Practice = {
  ...mockPractice,
  id: 'test-practice-2',
  title: 'Test Practice 2',
}

describe('extraPracticesStorage', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  describe('loadExtraPractices', () => {
    it('should return empty object when no data', () => {
      const data = loadExtraPractices()
      expect(data).toEqual({})
    })

    it('should return saved data', () => {
      const testData = {
        'day-1': {
          bonusPractices: [mockPractice],
          replacements: {},
          progress: {},
          shownIds: [mockPractice.id],
        },
      }
      saveExtraPractices(testData)

      const data = loadExtraPractices()
      expect(data['day-1'].bonusPractices).toHaveLength(1)
      expect(data['day-1'].bonusPractices[0].id).toBe(mockPractice.id)
    })
  })

  describe('bonus practices', () => {
    it('should add bonus practice', () => {
      const result = addBonusPractice('day-1', mockPractice)

      expect(result).toBe(true)
      const practices = getDayBonusPractices('day-1')
      expect(practices).toHaveLength(1)
      expect(practices[0].id).toBe(mockPractice.id)
    })

    it('should not exceed max practices', () => {
      // Add max practices
      for (let i = 0; i < MAX_BONUS_PRACTICES; i++) {
        addBonusPractice('day-1', { ...mockPractice, id: `practice-${i}` })
      }

      const result = addBonusPractice('day-1', { ...mockPractice, id: 'extra' })
      expect(result).toBe(false)

      const practices = getDayBonusPractices('day-1')
      expect(practices).toHaveLength(MAX_BONUS_PRACTICES)
    })

    it('should remove bonus practice', () => {
      addBonusPractice('day-1', mockPractice)
      addBonusPractice('day-1', mockPractice2)

      removeBonusPractice('day-1', mockPractice.id)

      const practices = getDayBonusPractices('day-1')
      expect(practices).toHaveLength(1)
      expect(practices[0].id).toBe(mockPractice2.id)
    })

    it('should replace bonus practice', () => {
      addBonusPractice('day-1', mockPractice)

      replaceBonusPractice('day-1', mockPractice.id, mockPractice2)

      const practices = getDayBonusPractices('day-1')
      expect(practices).toHaveLength(1)
      expect(practices[0].id).toBe(mockPractice2.id)
    })

    it('should track shown IDs on add', () => {
      addBonusPractice('day-1', mockPractice)

      const shownIds = getShownIds('day-1')
      expect(shownIds).toContain(mockPractice.id)
    })

    it('should keep shown IDs on remove', () => {
      addBonusPractice('day-1', mockPractice)
      removeBonusPractice('day-1', mockPractice.id)

      const shownIds = getShownIds('day-1')
      expect(shownIds).toContain(mockPractice.id)
    })

    it('should check if can add more', () => {
      expect(canAddMoreBonusPractices('day-1')).toBe(true)

      for (let i = 0; i < MAX_BONUS_PRACTICES; i++) {
        addBonusPractice('day-1', { ...mockPractice, id: `practice-${i}` })
      }

      expect(canAddMoreBonusPractices('day-1')).toBe(false)
    })
  })

  describe('replacements', () => {
    it('should set replacement', () => {
      setReplacement('day-1', 'original-practice-1', mockPractice)

      const replacement = getReplacement('day-1', 'original-practice-1')
      expect(replacement).not.toBeNull()
      expect(replacement?.id).toBe(mockPractice.id)
    })

    it('should get day replacements', () => {
      setReplacement('day-1', 'original-1', mockPractice)
      setReplacement('day-1', 'original-2', mockPractice2)

      const replacements = getDayReplacements('day-1')
      expect(Object.keys(replacements)).toHaveLength(2)
    })

    it('should remove replacement', () => {
      setReplacement('day-1', 'original-1', mockPractice)

      removeReplacement('day-1', 'original-1')

      const replacement = getReplacement('day-1', 'original-1')
      expect(replacement).toBeNull()
    })

    it('should track shown IDs for replacements', () => {
      setReplacement('day-1', 'original-1', mockPractice)

      const shownIds = getShownIds('day-1')
      expect(shownIds).toContain(mockPractice.id)
    })
  })

  describe('progress', () => {
    it('should toggle bonus practice completion', () => {
      addBonusPractice('day-1', mockPractice)

      const result1 = toggleBonusPractice('day-1', mockPractice.id)
      expect(result1).toBe(true)
      expect(isBonusPracticeCompleted('day-1', mockPractice.id)).toBe(true)

      const result2 = toggleBonusPractice('day-1', mockPractice.id)
      expect(result2).toBe(false)
      expect(isBonusPracticeCompleted('day-1', mockPractice.id)).toBe(false)
    })

    it('should get progress stats', () => {
      addBonusPractice('day-1', mockPractice)
      addBonusPractice('day-1', mockPractice2)
      toggleBonusPractice('day-1', mockPractice.id)

      const progress = getBonusPracticesProgress('day-1')
      expect(progress.completed).toBe(1)
      expect(progress.total).toBe(2)
    })

    it('should return zero progress for empty day', () => {
      const progress = getBonusPracticesProgress('day-999')
      expect(progress.completed).toBe(0)
      expect(progress.total).toBe(0)
    })
  })

  describe('shown IDs', () => {
    it('should get all shown IDs across days', () => {
      addBonusPractice('day-1', mockPractice)
      addBonusPractice('day-2', mockPractice2)

      const allIds = getAllShownIds()
      expect(allIds).toContain(mockPractice.id)
      expect(allIds).toContain(mockPractice2.id)
    })

    it('should return empty array for day with no data', () => {
      const shownIds = getShownIds('day-999')
      expect(shownIds).toEqual([])
    })
  })
})
