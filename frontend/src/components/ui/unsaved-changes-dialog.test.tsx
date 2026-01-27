import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { UnsavedChangesDialog } from './unsaved-changes-dialog'

describe('UnsavedChangesDialog', () => {
  const defaultProps = {
    isOpen: true,
    onCancel: vi.fn(),
    onConfirmLeave: vi.fn(),
    onSaveAndLeave: vi.fn(),
    isSaving: false,
  }

  it('renders the dialog when open', () => {
    render(<UnsavedChangesDialog {...defaultProps} />)

    expect(screen.getByText('You have unsaved changes')).toBeInTheDocument()
    expect(
      screen.getByText(
        "Your progress hasn't been saved yet. Would you like to save before leaving?"
      )
    ).toBeInTheDocument()
  })

  it('renders custom title and description', () => {
    render(
      <UnsavedChangesDialog
        {...defaultProps}
        title="Custom Title"
        description="Custom description"
      />
    )

    expect(screen.getByText('Custom Title')).toBeInTheDocument()
    expect(screen.getByText('Custom description')).toBeInTheDocument()
  })

  it('calls onCancel when Cancel button is clicked', () => {
    const onCancel = vi.fn()
    render(<UnsavedChangesDialog {...defaultProps} onCancel={onCancel} />)

    fireEvent.click(screen.getByText('Cancel'))
    expect(onCancel).toHaveBeenCalled()
  })

  it('calls onConfirmLeave when Discard Changes button is clicked', () => {
    const onConfirmLeave = vi.fn()
    render(<UnsavedChangesDialog {...defaultProps} onConfirmLeave={onConfirmLeave} />)

    fireEvent.click(screen.getByText('Discard Changes'))
    expect(onConfirmLeave).toHaveBeenCalled()
  })

  it('calls onSaveAndLeave when Save & Leave button is clicked', () => {
    const onSaveAndLeave = vi.fn()
    render(<UnsavedChangesDialog {...defaultProps} onSaveAndLeave={onSaveAndLeave} />)

    fireEvent.click(screen.getByText('Save & Leave'))
    expect(onSaveAndLeave).toHaveBeenCalled()
  })

  it('shows Saving... text when isSaving is true', () => {
    render(<UnsavedChangesDialog {...defaultProps} isSaving={true} />)

    expect(screen.getByText('Saving...')).toBeInTheDocument()
  })

  it('disables buttons when isSaving is true', () => {
    render(<UnsavedChangesDialog {...defaultProps} isSaving={true} />)

    expect(screen.getByText('Cancel')).toBeDisabled()
    expect(screen.getByText('Discard Changes')).toBeDisabled()
    expect(screen.getByText('Saving...')).toBeDisabled()
  })
})
