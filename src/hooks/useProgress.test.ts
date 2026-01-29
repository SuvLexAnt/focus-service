import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useProgress } from './useProgress'

describe('useProgress', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('initial state', () => {
    it('should return default data when no stored data', () => {
      const { result } = renderHook(() => useProgress())

      expect(result.current.data).toEqual({
        startDate: null,
        currentDay: 1,
        progress: {},
      })
    })

    it('should return stored data', () => {
      localStorage.setItem('meditation-data', JSON.stringify({
        startDate: '2024-01-15',
        currentDay: 2,
        progress: { 'day-1': { 'p1': true } },
      }))

      const { result } = renderHook(() => useProgress())

      expect(result.current.data.startDate).toBe('2024-01-15')
      expect(result.current.data.currentDay).toBe(2)
    })
  })

  describe('setStartDate', () => {
    it('should update start date', () => {
      const { result } = renderHook(() => useProgress())

      act(() => {
        result.current.setStartDate('2024-03-01')
      })

      expect(result.current.data.startDate).toBe('2024-03-01')
    })

    it('should persist start date to localStorage', () => {
      const { result } = renderHook(() => useProgress())

      act(() => {
        result.current.setStartDate('2024-03-01')
      })

      const stored = JSON.parse(localStorage.getItem('meditation-data') || '{}')
      expect(stored.startDate).toBe('2024-03-01')
    })
  })

  describe('togglePractice', () => {
    it('should toggle practice and update state', () => {
      const { result } = renderHook(() => useProgress())

      let toggleResult: boolean
      act(() => {
        toggleResult = result.current.togglePractice('day-1', 'day-1-practice-1')
      })

      expect(toggleResult!).toBe(true)
      expect(result.current.isPracticeCompleted('day-1', 'day-1-practice-1')).toBe(true)
    })

    it('should toggle practice back to false', () => {
      localStorage.setItem('meditation-data', JSON.stringify({
        startDate: null,
        currentDay: 1,
        progress: { 'day-1': { 'day-1-practice-1': true } },
      }))

      const { result } = renderHook(() => useProgress())

      let toggleResult: boolean
      act(() => {
        toggleResult = result.current.togglePractice('day-1', 'day-1-practice-1')
      })

      expect(toggleResult!).toBe(false)
    })
  })

  describe('isPracticeCompleted', () => {
    it('should return false for incomplete practice', () => {
      const { result } = renderHook(() => useProgress())

      expect(result.current.isPracticeCompleted('day-1', 'day-1-practice-1')).toBe(false)
    })

    it('should return true for completed practice', () => {
      localStorage.setItem('meditation-data', JSON.stringify({
        startDate: null,
        currentDay: 1,
        progress: { 'day-1': { 'day-1-practice-1': true } },
      }))

      const { result } = renderHook(() => useProgress())

      expect(result.current.isPracticeCompleted('day-1', 'day-1-practice-1')).toBe(true)
    })
  })

  describe('getDayProgress', () => {
    it('should return correct progress for empty day', () => {
      const { result } = renderHook(() => useProgress())

      const progress = result.current.getDayProgress('day-1', 3)

      expect(progress).toEqual({
        completed: 0,
        total: 3,
        isCompleted: false,
      })
    })

    it('should return correct progress for partial completion', () => {
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

      const { result } = renderHook(() => useProgress())

      const progress = result.current.getDayProgress('day-1', 3)

      expect(progress).toEqual({
        completed: 1,
        total: 3,
        isCompleted: false,
      })
    })

    it('should return isCompleted true when all practices done', () => {
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

      const { result } = renderHook(() => useProgress())

      const progress = result.current.getDayProgress('day-1', 3)

      expect(progress.isCompleted).toBe(true)
    })

    it('should return isCompleted false for empty totalPractices', () => {
      const { result } = renderHook(() => useProgress())

      const progress = result.current.getDayProgress('day-1', 0)

      expect(progress.isCompleted).toBe(false)
    })
  })
})
