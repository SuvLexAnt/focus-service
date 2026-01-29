import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PracticeCard } from './PracticeCard'
import { Practice } from '../../types/meditation'

const mockPractice: Practice = {
  id: 'day-1-practice-1',
  title: 'Дыхательная практика',
  duration: '5 минут',
  whatToDo: 'Сядьте удобно и закройте глаза',
  focusOn: 'На ощущениях дыхания',
  dontFocusOn: 'На посторонних мыслях',
  isMain: false,
}

describe('PracticeCard', () => {
  it('should render practice title', () => {
    render(
      <PracticeCard
        practice={mockPractice}
        isCompleted={false}
        onToggle={() => {}}
      />
    )

    expect(screen.getByText('Дыхательная практика')).toBeInTheDocument()
  })

  it('should render duration', () => {
    render(
      <PracticeCard
        practice={mockPractice}
        isCompleted={false}
        onToggle={() => {}}
      />
    )

    expect(screen.getByText('5 минут')).toBeInTheDocument()
  })

  it('should show main badge for main practice', () => {
    const mainPractice = { ...mockPractice, isMain: true }
    render(
      <PracticeCard
        practice={mainPractice}
        isCompleted={false}
        onToggle={() => {}}
      />
    )

    expect(screen.getByText('Основная')).toBeInTheDocument()
  })

  it('should not show main badge for regular practice', () => {
    render(
      <PracticeCard
        practice={mockPractice}
        isCompleted={false}
        onToggle={() => {}}
      />
    )

    expect(screen.queryByText('Основная')).not.toBeInTheDocument()
  })

  it('should render checkbox', () => {
    render(
      <PracticeCard
        practice={mockPractice}
        isCompleted={false}
        onToggle={() => {}}
      />
    )

    expect(screen.getByRole('checkbox')).toBeInTheDocument()
  })

  it('should show checked checkbox when completed', () => {
    render(
      <PracticeCard
        practice={mockPractice}
        isCompleted={true}
        onToggle={() => {}}
      />
    )

    expect(screen.getByRole('checkbox')).toBeChecked()
  })

  it('should call onToggle when checkbox is clicked', () => {
    const handleToggle = vi.fn()
    render(
      <PracticeCard
        practice={mockPractice}
        isCompleted={false}
        onToggle={handleToggle}
      />
    )

    fireEvent.click(screen.getByRole('checkbox'))

    expect(handleToggle).toHaveBeenCalledTimes(1)
  })

  it('should not show content by default', () => {
    render(
      <PracticeCard
        practice={mockPractice}
        isCompleted={false}
        onToggle={() => {}}
      />
    )

    expect(screen.queryByText('Что делать')).not.toBeInTheDocument()
  })

  it('should expand content when expand button is clicked', () => {
    render(
      <PracticeCard
        practice={mockPractice}
        isCompleted={false}
        onToggle={() => {}}
      />
    )

    const expandButton = screen.getByRole('button', { name: 'Развернуть' })
    fireEvent.click(expandButton)

    expect(screen.getByText('Что делать')).toBeInTheDocument()
    expect(screen.getByText('Сядьте удобно и закройте глаза')).toBeInTheDocument()
  })

  it('should show all sections when expanded', () => {
    render(
      <PracticeCard
        practice={mockPractice}
        isCompleted={false}
        onToggle={() => {}}
      />
    )

    const expandButton = screen.getByRole('button', { name: 'Развернуть' })
    fireEvent.click(expandButton)

    expect(screen.getByText('Что делать')).toBeInTheDocument()
    expect(screen.getByText('На чём фокусироваться')).toBeInTheDocument()
    expect(screen.getByText('На чём НЕ фокусироваться')).toBeInTheDocument()
  })

  it('should collapse content when expand button is clicked again', () => {
    render(
      <PracticeCard
        practice={mockPractice}
        isCompleted={false}
        onToggle={() => {}}
      />
    )

    const expandButton = screen.getByRole('button', { name: 'Развернуть' })
    fireEvent.click(expandButton)

    const collapseButton = screen.getByRole('button', { name: 'Свернуть' })
    fireEvent.click(collapseButton)

    expect(screen.queryByText('Что делать')).not.toBeInTheDocument()
  })

  it('should not render empty sections', () => {
    const practiceWithoutSections: Practice = {
      ...mockPractice,
      whatToDo: '',
      focusOn: '',
      dontFocusOn: '',
    }

    render(
      <PracticeCard
        practice={practiceWithoutSections}
        isCompleted={false}
        onToggle={() => {}}
      />
    )

    const expandButton = screen.getByRole('button', { name: 'Развернуть' })
    fireEvent.click(expandButton)

    expect(screen.queryByText('Что делать')).not.toBeInTheDocument()
  })
})
