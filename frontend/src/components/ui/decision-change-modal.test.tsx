import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DecisionChangeModal } from './decision-change-modal'
import { DECISION_IMPLICATIONS } from './decision-change-modal.config'

describe('DecisionChangeModal', () => {
  const defaultProps = {
    isOpen: true,
    decisionType: 'business_name' as const,
    onCancel: vi.fn(),
    onConfirm: vi.fn(),
    isConfirming: false,
  }

  it('renders modal when isOpen is true', () => {
    render(<DecisionChangeModal {...defaultProps} />)

    expect(screen.getByText('Change Business Name')).toBeInTheDocument()
    expect(screen.getByText('You are about to change your business name.')).toBeInTheDocument()
  })

  it('does not render modal content when isOpen is false', () => {
    render(<DecisionChangeModal {...defaultProps} isOpen={false} />)

    expect(screen.queryByText('Change Business Name')).not.toBeInTheDocument()
  })

  describe('shows correct implications for each decision type', () => {
    it('shows entity_type implications', () => {
      render(<DecisionChangeModal {...defaultProps} decisionType="entity_type" />)

      expect(screen.getByText('Change Entity Type')).toBeInTheDocument()
      DECISION_IMPLICATIONS.entity_type.implications.forEach((implication) => {
        expect(screen.getByText(implication)).toBeInTheDocument()
      })
    })

    it('shows formation_state implications', () => {
      render(<DecisionChangeModal {...defaultProps} decisionType="formation_state" />)

      expect(screen.getByText('Change Formation State')).toBeInTheDocument()
      DECISION_IMPLICATIONS.formation_state.implications.forEach((implication) => {
        expect(screen.getByText(implication)).toBeInTheDocument()
      })
    })

    it('shows business_name implications', () => {
      render(<DecisionChangeModal {...defaultProps} decisionType="business_name" />)

      expect(screen.getByText('Change Business Name')).toBeInTheDocument()
      DECISION_IMPLICATIONS.business_name.implications.forEach((implication) => {
        expect(screen.getByText(implication)).toBeInTheDocument()
      })
    })

    it('shows business_category implications', () => {
      render(<DecisionChangeModal {...defaultProps} decisionType="business_category" />)

      expect(screen.getByText('Change Business Category')).toBeInTheDocument()
      DECISION_IMPLICATIONS.business_category.implications.forEach((implication) => {
        expect(screen.getByText(implication)).toBeInTheDocument()
      })
    })

    it('shows funding_approach implications', () => {
      render(<DecisionChangeModal {...defaultProps} decisionType="funding_approach" />)

      expect(screen.getByText('Change Funding Approach')).toBeInTheDocument()
      DECISION_IMPLICATIONS.funding_approach.implications.forEach((implication) => {
        expect(screen.getByText(implication)).toBeInTheDocument()
      })
    })
  })

  it('displays current and new values when provided', () => {
    render(
      <DecisionChangeModal
        {...defaultProps}
        currentValue="Old Business Name"
        newValue="New Business Name"
      />
    )

    expect(screen.getByText('From:')).toBeInTheDocument()
    expect(screen.getByText('Old Business Name')).toBeInTheDocument()
    expect(screen.getByText('To:')).toBeInTheDocument()
    expect(screen.getByText('New Business Name')).toBeInTheDocument()
  })

  it('does not display value change section when values are not provided', () => {
    render(<DecisionChangeModal {...defaultProps} />)

    expect(screen.queryByText('From:')).not.toBeInTheDocument()
    expect(screen.queryByText('To:')).not.toBeInTheDocument()
  })

  it('calls onCancel when Cancel button is clicked', () => {
    const onCancel = vi.fn()
    render(<DecisionChangeModal {...defaultProps} onCancel={onCancel} />)

    fireEvent.click(screen.getByText('Cancel'))
    expect(onCancel).toHaveBeenCalled()
  })

  it('calls onConfirm when Confirm Change button is clicked', () => {
    const onConfirm = vi.fn()
    render(<DecisionChangeModal {...defaultProps} onConfirm={onConfirm} />)

    fireEvent.click(screen.getByText('Confirm Change'))
    expect(onConfirm).toHaveBeenCalled()
  })

  it('shows loading state when isConfirming is true', () => {
    render(<DecisionChangeModal {...defaultProps} isConfirming={true} />)

    expect(screen.getByText('Confirming...')).toBeInTheDocument()
    expect(screen.queryByText('Confirm Change')).not.toBeInTheDocument()
  })

  it('disables buttons when isConfirming is true', () => {
    render(<DecisionChangeModal {...defaultProps} isConfirming={true} />)

    expect(screen.getByText('Cancel')).toBeDisabled()
    expect(screen.getByText('Confirming...')).toBeDisabled()
  })

  describe('critical severity styling', () => {
    it('shows critical warning box for entity_type (critical severity)', () => {
      render(<DecisionChangeModal {...defaultProps} decisionType="entity_type" />)

      expect(
        screen.getByText(
          'This is a significant change. Please ensure you understand the implications before proceeding.'
        )
      ).toBeInTheDocument()
    })

    it('shows critical warning box for formation_state (critical severity)', () => {
      render(<DecisionChangeModal {...defaultProps} decisionType="formation_state" />)

      expect(
        screen.getByText(
          'This is a significant change. Please ensure you understand the implications before proceeding.'
        )
      ).toBeInTheDocument()
    })

    it('does not show critical warning box for warning severity decisions', () => {
      render(<DecisionChangeModal {...defaultProps} decisionType="business_name" />)

      expect(
        screen.queryByText(
          'This is a significant change. Please ensure you understand the implications before proceeding.'
        )
      ).not.toBeInTheDocument()
    })
  })

  it('renders custom title when provided', () => {
    render(<DecisionChangeModal {...defaultProps} title="Custom Title Override" />)

    expect(screen.getByText('Custom Title Override')).toBeInTheDocument()
    expect(screen.queryByText('Change Business Name')).not.toBeInTheDocument()
  })

  it('renders custom description when provided', () => {
    render(<DecisionChangeModal {...defaultProps} description="Custom description override" />)

    expect(screen.getByText('Custom description override')).toBeInTheDocument()
    expect(
      screen.queryByText('You are about to change your business name.')
    ).not.toBeInTheDocument()
  })

  it('includes additional implications when provided', () => {
    const additionalImplications = ['Custom implication 1', 'Custom implication 2']
    render(
      <DecisionChangeModal {...defaultProps} additionalImplications={additionalImplications} />
    )

    // Should show both default and additional implications
    DECISION_IMPLICATIONS.business_name.implications.forEach((implication) => {
      expect(screen.getByText(implication)).toBeInTheDocument()
    })
    additionalImplications.forEach((implication) => {
      expect(screen.getByText(implication)).toBeInTheDocument()
    })
  })

  it('displays "This change may affect:" label', () => {
    render(<DecisionChangeModal {...defaultProps} />)

    expect(screen.getByText('This change may affect:')).toBeInTheDocument()
  })
})
