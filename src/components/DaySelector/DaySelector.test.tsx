import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DaySelector } from './DaySelector'
import { Day } from '../../types/meditation'

const mockDays: Day[] = [
  {
    number: 1,
    title: 'Основы внимания',
    goal: 'Цель 1',
    practices: [
      { id: 'day-1-practice-1', title: 'П1', duration: '5 минут', whatToDo: '', focusOn: '', dontFocusOn: '' },
      { id: 'day-1-practice-2', title: 'П2', duration: '5 минут', whatToDo: '', focusOn: '', dontFocusOn: '' },
    ],
  },
  {
    number: 2,
    title: 'Продвинутое внимание',
    goal: 'Цель 2',
    practices: [
      { id: 'day-2-practice-1', title: 'П1', duration: '10 минут', whatToDo: '', focusOn: '', dontFocusOn: '' },
    ],
  },
  {
    number: 3,
    title: 'Мастерство',
    goal: 'Цель 3',
    practices: [
      { id: 'day-3-practice-1', title: 'П1', duration: '15 минут', whatToDo: '', focusOn: '', dontFocusOn: '' },
    ],
  },
]

const mockGetDayProgress = vi.fn((dayId: string, totalPractices: number) => ({
  completed: 0,
  total: totalPractices,
  isCompleted: false,
}))

describe('DaySelector', () => {
  beforeEach(() => {
    mockGetDayProgress.mockClear()
  })

  it('should render title', () => {
    render(
      <DaySelector
        days={mockDays}
        selectedDay={1}
        onSelectDay={() => {}}
        getDayProgress={mockGetDayProgress}
        maxAvailableDay={1}
      />
    )

    expect(screen.getByText('10 дней к фокусу')).toBeInTheDocument()
  })

  it('should render all days', () => {
    render(
      <DaySelector
        days={mockDays}
        selectedDay={1}
        onSelectDay={() => {}}
        getDayProgress={mockGetDayProgress}
        maxAvailableDay={3}
      />
    )

    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('Основы внимания')).toBeInTheDocument()
    expect(screen.getByText('Продвинутое внимание')).toBeInTheDocument()
  })

  it('should call onSelectDay when available day is clicked', () => {
    const handleSelectDay = vi.fn()
    render(
      <DaySelector
        days={mockDays}
        selectedDay={1}
        onSelectDay={handleSelectDay}
        getDayProgress={mockGetDayProgress}
        maxAvailableDay={2}
      />
    )

    const day2Button = screen.getByText('2').closest('button')!
    fireEvent.click(day2Button)

    expect(handleSelectDay).toHaveBeenCalledWith(2)
  })

  it('should not call onSelectDay when locked day is clicked', () => {
    const handleSelectDay = vi.fn()
    render(
      <DaySelector
        days={mockDays}
        selectedDay={1}
        onSelectDay={handleSelectDay}
        getDayProgress={mockGetDayProgress}
        maxAvailableDay={1}
      />
    )

    const day2Button = screen.getByText('2').closest('button')!
    fireEvent.click(day2Button)

    expect(handleSelectDay).not.toHaveBeenCalled()
  })

  it('should disable locked days', () => {
    render(
      <DaySelector
        days={mockDays}
        selectedDay={1}
        onSelectDay={() => {}}
        getDayProgress={mockGetDayProgress}
        maxAvailableDay={1}
      />
    )

    const day2Button = screen.getByText('2').closest('button')!
    const day3Button = screen.getByText('3').closest('button')!

    expect(day2Button).toBeDisabled()
    expect(day3Button).toBeDisabled()
  })

  it('should show lock icon for locked days', () => {
    render(
      <DaySelector
        days={mockDays}
        selectedDay={1}
        onSelectDay={() => {}}
        getDayProgress={mockGetDayProgress}
        maxAvailableDay={1}
      />
    )

    const lockIcons = screen.getAllByText('🔒')
    expect(lockIcons).toHaveLength(2)
  })

  it('should show progress text for each day', () => {
    mockGetDayProgress.mockImplementation((dayId, totalPractices) => ({
      completed: dayId === 'day-1' ? 1 : 0,
      total: totalPractices,
      isCompleted: false,
    }))

    render(
      <DaySelector
        days={mockDays}
        selectedDay={1}
        onSelectDay={() => {}}
        getDayProgress={mockGetDayProgress}
        maxAvailableDay={1}
      />
    )

    expect(screen.getByText('1 / 2')).toBeInTheDocument()
    // Days 2 and 3 both have 1 practice each, so "0 / 1" appears twice
    const zeroProgressElements = screen.getAllByText('0 / 1')
    expect(zeroProgressElements).toHaveLength(2)
  })

  it('should show checkmark for completed days', () => {
    mockGetDayProgress.mockImplementation((dayId, totalPractices) => ({
      completed: dayId === 'day-1' ? 2 : 0,
      total: totalPractices,
      isCompleted: dayId === 'day-1',
    }))

    render(
      <DaySelector
        days={mockDays}
        selectedDay={1}
        onSelectDay={() => {}}
        getDayProgress={mockGetDayProgress}
        maxAvailableDay={2}
      />
    )

    expect(screen.getByText('✓')).toBeInTheDocument()
  })
})
