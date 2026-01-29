import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  loadMeditationData,
  saveMeditationData,
  setStartDate,
  togglePractice,
  isPracticeCompleted,
  isDayCompleted,
  getDayProgress,
  getMaxAvailableDay,
} from './storage'

describe('storage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('loadMeditationData', () => {
    it('should return default data when localStorage is empty', () => {
      const result = loadMeditationData()

      expect(result).toEqual({
        startDate: null,
        currentDay: 1,
        progress: {},
      })
    })

    it('should return stored data from localStorage', () => {
      const storedData = {
        startDate: '2024-01-15',
        currentDay: 3,
        progress: { 'day-1': { 'day-1-practice-1': true } },
      }
      localStorage.setItem('meditation-data', JSON.stringify(storedData))

      const result = loadMeditationData()

      expect(result).toEqual(storedData)
    })

    it('should handle invalid JSON gracefully', () => {
      localStorage.setItem('meditation-data', 'invalid json')
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const result = loadMeditationData()

      expect(result).toEqual({
        startDate: null,
        currentDay: 1,
        progress: {},
      })
      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })
  })

  describe('saveMeditationData', () => {
    it('should save data to localStorage', () => {
      const data = {
        startDate: '2024-01-15',
        currentDay: 2,
        progress: { 'day-1': { 'day-1-practice-1': true } },
      }

      saveMeditationData(data)

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'meditation-data',
        JSON.stringify(data)
      )
    })
  })

  describe('setStartDate', () => {
    it('should set start date in stored data', () => {
      setStartDate('2024-02-01')

      const stored = JSON.parse(localStorage.getItem('meditation-data') || '{}')
      expect(stored.startDate).toBe('2024-02-01')
    })
  })

  describe('togglePractice', () => {
    it('should toggle practice from false to true', () => {
      const result = togglePractice('day-1', 'day-1-practice-1')

      expect(result).toBe(true)
      const stored = JSON.parse(localStorage.getItem('meditation-data') || '{}')
      expect(stored.progress['day-1']['day-1-practice-1']).toBe(true)
    })

    it('should toggle practice from true to false', () => {
      localStorage.setItem('meditation-data', JSON.stringify({
        startDate: null,
        currentDay: 1,
        progress: { 'day-1': { 'day-1-practice-1': true } },
      }))

      const result = togglePractice('day-1', 'day-1-practice-1')

      expect(result).toBe(false)
    })

    it('should create day object if not exists', () => {
      togglePractice('day-5', 'day-5-practice-1')

      const stored = JSON.parse(localStorage.getItem('meditation-data') || '{}')
      expect(stored.progress['day-5']).toBeDefined()
      expect(stored.progress['day-5']['day-5-practice-1']).toBe(true)
    })
  })

  describe('isPracticeCompleted', () => {
    it('should return false for non-existent practice', () => {
      const result = isPracticeCompleted('day-1', 'day-1-practice-1')

      expect(result).toBe(false)
    })

    it('should return true for completed practice', () => {
      localStorage.setItem('meditation-data', JSON.stringify({
        startDate: null,
        currentDay: 1,
        progress: { 'day-1': { 'day-1-practice-1': true } },
      }))

      const result = isPracticeCompleted('day-1', 'day-1-practice-1')

      expect(result).toBe(true)
    })
  })

  describe('isDayCompleted', () => {
    it('should return false when no practices completed', () => {
      const result = isDayCompleted('day-1', 3)

      expect(result).toBe(false)
    })

    it('should return false when some practices completed', () => {
      localStorage.setItem('meditation-data', JSON.stringify({
        startDate: null,
        currentDay: 1,
        progress: {
          'day-1': {
            'day-1-practice-1': true,
            'day-1-practice-2': false,
          },
        },
      }))

      const result = isDayCompleted('day-1', 3)

      expect(result).toBe(false)
    })

    it('should return true when all practices completed', () => {
      localStorage.setItem('meditation-data', JSON.stringify({
        startDate: null,
        currentDay: 1,
        progress: {
          'day-1': {
            'day-1-practice-1': true,
            'day-1-practice-2': true,
            'day-1-practice-3': true,
          },
        },
      }))

      const result = isDayCompleted('day-1', 3)

      expect(result).toBe(true)
    })
  })

  describe('getDayProgress', () => {
    it('should return zero progress for non-existent day', () => {
      const result = getDayProgress('day-1')

      expect(result).toEqual({ completed: 0, total: 0 })
    })

    it('should return correct progress', () => {
      localStorage.setItem('meditation-data', JSON.stringify({
        startDate: null,
        currentDay: 1,
        progress: {
          'day-1': {
            'day-1-practice-1': true,
            'day-1-practice-2': false,
            'day-1-practice-3': true,
          },
        },
      }))

      const result = getDayProgress('day-1')

      expect(result).toEqual({ completed: 2, total: 3 })
    })
  })

  describe('getMaxAvailableDay', () => {
    const createDays = (practicesPerDay: number[]) =>
      practicesPerDay.map((count, i) => ({
        number: i + 1,
        practices: Array.from({ length: count }, (_, j) => ({ id: `p${j + 1}` })),
      }))

    it('should return 1 when no progress', () => {
      const days = createDays([3, 3, 3])
      const result = getMaxAvailableDay(days)

      expect(result).toBe(1)
    })

    it('should return current day when has incomplete practices (some marked false)', () => {
      localStorage.setItem('meditation-data', JSON.stringify({
        startDate: null,
        currentDay: 1,
        progress: {
          'day-1': {
            'p1': true,
            'p2': false,
          },
        },
      }))

      const days = createDays([3, 3, 3])
      const result = getMaxAvailableDay(days)

      expect(result).toBe(1)
    })

    it('should return current day when some practices not tracked at all (bug fix)', () => {
      // This is the bug scenario: 2 practices completed, but day has 3 total
      // Old code would unlock day 2 because all TRACKED practices were true
      localStorage.setItem('meditation-data', JSON.stringify({
        startDate: null,
        currentDay: 1,
        progress: {
          'day-1': {
            'p1': true,
            'p2': true,
            // p3 not tracked at all
          },
        },
      }))

      const days = createDays([3, 3, 3]) // Day 1 has 3 practices
      const result = getMaxAvailableDay(days)

      expect(result).toBe(1) // Should still be day 1, not day 2
    })

    it('should return next day when current day is fully completed', () => {
      localStorage.setItem('meditation-data', JSON.stringify({
        startDate: null,
        currentDay: 1,
        progress: {
          'day-1': {
            'p1': true,
            'p2': true,
            'p3': true,
          },
        },
      }))

      const days = createDays([3, 3, 3])
      const result = getMaxAvailableDay(days)

      expect(result).toBe(2)
    })

    it('should return totalDays when all days completed', () => {
      localStorage.setItem('meditation-data', JSON.stringify({
        startDate: null,
        currentDay: 1,
        progress: {
          'day-1': { 'p1': true },
          'day-2': { 'p1': true },
          'day-3': { 'p1': true },
        },
      }))

      const days = createDays([1, 1, 1])
      const result = getMaxAvailableDay(days)

      expect(result).toBe(3)
    })

    it('should handle days with different practice counts', () => {
      localStorage.setItem('meditation-data', JSON.stringify({
        startDate: null,
        currentDay: 1,
        progress: {
          'day-1': { 'p1': true, 'p2': true }, // 2/2 complete
          'day-2': { 'p1': true }, // 1/5 complete
        },
      }))

      const days = createDays([2, 5, 3]) // Day 1: 2, Day 2: 5, Day 3: 3
      const result = getMaxAvailableDay(days)

      expect(result).toBe(2) // Day 2 is available but not complete
    })
  })
})
