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
    it('should return 1 when no progress', () => {
      const result = getMaxAvailableDay(10)

      expect(result).toBe(1)
    })

    it('should return current day when has incomplete practices', () => {
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

      const result = getMaxAvailableDay(10)

      expect(result).toBe(1)
    })

    it('should return next day when current day is completed', () => {
      localStorage.setItem('meditation-data', JSON.stringify({
        startDate: null,
        currentDay: 1,
        progress: {
          'day-1': {
            'day-1-practice-1': true,
            'day-1-practice-2': true,
          },
        },
      }))

      const result = getMaxAvailableDay(10)

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

      const result = getMaxAvailableDay(3)

      expect(result).toBe(3)
    })
  })
})
