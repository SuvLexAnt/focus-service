import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { StartDateModal } from './StartDateModal'

describe('StartDateModal', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-01-15'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should render welcome message', () => {
    render(<StartDateModal onStart={() => {}} />)

    expect(screen.getByText('Добро пожаловать')).toBeInTheDocument()
  })

  it('should render description', () => {
    render(<StartDateModal onStart={() => {}} />)

    expect(screen.getByText(/10-дневный путь/)).toBeInTheDocument()
  })

  it('should render date input with today as default', () => {
    render(<StartDateModal onStart={() => {}} />)

    const dateInput = screen.getByLabelText('Дата начала')
    expect(dateInput).toHaveValue('2024-01-15')
  })

  it('should render start button', () => {
    render(<StartDateModal onStart={() => {}} />)

    expect(screen.getByRole('button', { name: 'Начать путь' })).toBeInTheDocument()
  })

  it('should call onStart with selected date when button is clicked', () => {
    const handleStart = vi.fn()
    render(<StartDateModal onStart={handleStart} />)

    const dateInput = screen.getByLabelText('Дата начала')
    fireEvent.change(dateInput, { target: { value: '2024-02-01' } })

    const startButton = screen.getByRole('button', { name: 'Начать путь' })
    fireEvent.click(startButton)

    expect(handleStart).toHaveBeenCalledWith('2024-02-01')
  })

  it('should call onStart with default date if not changed', () => {
    const handleStart = vi.fn()
    render(<StartDateModal onStart={handleStart} />)

    const startButton = screen.getByRole('button', { name: 'Начать путь' })
    fireEvent.click(startButton)

    expect(handleStart).toHaveBeenCalledWith('2024-01-15')
  })

  it('should render note about program adaptation', () => {
    render(<StartDateModal onStart={() => {}} />)

    expect(screen.getByText(/Программа адаптируется/)).toBeInTheDocument()
  })
})
