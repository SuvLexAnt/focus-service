import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Checkbox } from './Checkbox'

describe('Checkbox', () => {
  it('should render unchecked checkbox', () => {
    render(<Checkbox checked={false} onChange={() => {}} id="test-checkbox" />)

    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).not.toBeChecked()
  })

  it('should render checked checkbox', () => {
    render(<Checkbox checked={true} onChange={() => {}} id="test-checkbox" />)

    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toBeChecked()
  })

  it('should call onChange when clicked', () => {
    const handleChange = vi.fn()
    render(<Checkbox checked={false} onChange={handleChange} id="test-checkbox" />)

    const checkbox = screen.getByRole('checkbox')
    fireEvent.click(checkbox)

    expect(handleChange).toHaveBeenCalledTimes(1)
  })

  it('should have correct id attribute', () => {
    render(<Checkbox checked={false} onChange={() => {}} id="my-unique-id" />)

    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toHaveAttribute('id', 'my-unique-id')
  })

  it('should have label associated with checkbox', () => {
    render(<Checkbox checked={false} onChange={() => {}} id="test-checkbox" />)

    const label = document.querySelector('label[for="test-checkbox"]')
    expect(label).toBeInTheDocument()
  })

  it('should show checkmark icon when checked', () => {
    const { container } = render(
      <Checkbox checked={true} onChange={() => {}} id="test-checkbox" />
    )

    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })

  it('should not show checkmark icon when unchecked', () => {
    const { container } = render(
      <Checkbox checked={false} onChange={() => {}} id="test-checkbox" />
    )

    const svg = container.querySelector('svg')
    expect(svg).not.toBeInTheDocument()
  })
})
