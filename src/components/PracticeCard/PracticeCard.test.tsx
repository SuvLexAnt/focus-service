import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PracticeCard } from './PracticeCard'
import { Practice } from '../../types/meditation'

const mockPractice: Practice = {
  id: 'day-1-practice-1',
  title: 'Дыхательная практика',
  duration: 5,
  category: 'program',
  instructions: {
    whatToDo: 'Сядьте удобно и закройте глаза',
    focusOn: 'На ощущениях дыхания',
    dontFocusOn: 'На посторонних мыслях',
  },
  isMain: false,
  isFromProgram: true,
}

const mockReplacement: Practice = {
  id: 'replacement-1',
  title: 'Замещающая практика',
  category: 'grounding',
  purpose: 'Альтернативная практика для заземления',
  duration: 5,
  instructions: {
    whatToDo: 'Почувствуйте опору под ногами',
    focusOn: 'На ощущениях в стопах',
    dontFocusOn: 'На тревожных мыслях',
  },
  isFromProgram: false,
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

    expect(screen.getByText('5 мин')).toBeInTheDocument()
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
      instructions: {
        whatToDo: '',
        focusOn: '',
        dontFocusOn: '',
      },
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

  describe('replace functionality', () => {
    it('should show replace button when onReplace is provided and not completed', () => {
      render(
        <PracticeCard
          practice={mockPractice}
          isCompleted={false}
          onToggle={() => {}}
          onReplace={() => {}}
        />
      )

      expect(screen.getByRole('button', { name: 'Заменить практику' })).toBeInTheDocument()
    })

    it('should not show replace button when completed', () => {
      render(
        <PracticeCard
          practice={mockPractice}
          isCompleted={true}
          onToggle={() => {}}
          onReplace={() => {}}
        />
      )

      expect(screen.queryByRole('button', { name: 'Заменить практику' })).not.toBeInTheDocument()
    })

    it('should not show replace button when onReplace is not provided', () => {
      render(
        <PracticeCard
          practice={mockPractice}
          isCompleted={false}
          onToggle={() => {}}
        />
      )

      expect(screen.queryByRole('button', { name: 'Заменить практику' })).not.toBeInTheDocument()
    })

    it('should call onReplace when replace button is clicked', () => {
      const handleReplace = vi.fn()
      render(
        <PracticeCard
          practice={mockPractice}
          isCompleted={false}
          onToggle={() => {}}
          onReplace={handleReplace}
        />
      )

      fireEvent.click(screen.getByRole('button', { name: 'Заменить практику' }))
      expect(handleReplace).toHaveBeenCalledTimes(1)
    })

    it('should show replacement content when replacedWith is provided', () => {
      render(
        <PracticeCard
          practice={mockPractice}
          isCompleted={false}
          onToggle={() => {}}
          onReplace={() => {}}
          replacedWith={mockReplacement}
        />
      )

      expect(screen.getByText('Замещающая практика')).toBeInTheDocument()
      expect(screen.getByText('5 мин')).toBeInTheDocument()
      expect(screen.getByText('Замена')).toBeInTheDocument()
    })

    it('should show replacement purpose', () => {
      render(
        <PracticeCard
          practice={mockPractice}
          isCompleted={false}
          onToggle={() => {}}
          replacedWith={mockReplacement}
        />
      )

      expect(screen.getByText('Альтернативная практика для заземления')).toBeInTheDocument()
    })

    it('should show replacement instructions when expanded', () => {
      render(
        <PracticeCard
          practice={mockPractice}
          isCompleted={false}
          onToggle={() => {}}
          replacedWith={mockReplacement}
        />
      )

      const expandButton = screen.getByRole('button', { name: 'Развернуть' })
      fireEvent.click(expandButton)

      expect(screen.getByText('Почувствуйте опору под ногами')).toBeInTheDocument()
      expect(screen.getByText('На ощущениях в стопах')).toBeInTheDocument()
    })

    it('should not show main badge when replaced', () => {
      const mainPractice = { ...mockPractice, isMain: true }
      render(
        <PracticeCard
          practice={mainPractice}
          isCompleted={false}
          onToggle={() => {}}
          replacedWith={mockReplacement}
        />
      )

      expect(screen.queryByText('Основная')).not.toBeInTheDocument()
      expect(screen.getByText('Замена')).toBeInTheDocument()
    })
  })
})
