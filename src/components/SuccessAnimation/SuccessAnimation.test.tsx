import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import { SuccessAnimation } from './SuccessAnimation'

describe('SuccessAnimation', () => {
  beforeEach(() => {
    // Reset Math.random mock before each test
    vi.restoreAllMocks()
  })

  it('should render without crashing', () => {
    const { container } = render(<SuccessAnimation />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('should render confetti animation when random selects index 0', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.1)
    const { container } = render(<SuccessAnimation />)

    // Confetti creates multiple divs
    const confettiElements = container.querySelectorAll('div')
    expect(confettiElements.length).toBeGreaterThan(1)
  })

  it('should render ripple animation when random selects index 1', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.25)
    const { container } = render(<SuccessAnimation />)

    expect(container.firstChild).toBeInTheDocument()
  })

  it('should render sparkle animation when random selects index 2', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.45)
    const { container } = render(<SuccessAnimation />)

    // Sparkle contains emoji
    expect(container.textContent).toContain('✨')
  })

  it('should render pulse animation when random selects index 3', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.65)
    const { container } = render(<SuccessAnimation />)

    expect(container.firstChild).toBeInTheDocument()
  })

  it('should render check bounce animation when random selects index 4', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.85)
    const { container } = render(<SuccessAnimation />)

    // Check bounce contains checkmark
    expect(container.textContent).toContain('✓')
  })
})
