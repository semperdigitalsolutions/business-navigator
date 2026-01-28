import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { KeyDecisionsCard } from './KeyDecisionsCard'
import type { KeyDecisions, KeyDecision } from '@shared/types'

// Helper to create a mock decision
function createMockDecision(overrides: Partial<KeyDecision> = {}): KeyDecision {
  return {
    id: 'decision-1',
    label: 'Business Name',
    value: 'Acme Corp',
    icon: 'building',
    status: 'decided',
    category: 'business',
    ...overrides,
  }
}

// Helper to create mock key decisions data
function createMockKeyDecisions(overrides: Partial<KeyDecisions> = {}): KeyDecisions {
  return {
    decisions: [
      createMockDecision({ id: 'decision-1', label: 'Business Name', value: 'Acme Corp' }),
      createMockDecision({
        id: 'decision-2',
        label: 'Entity Type',
        value: 'LLC',
        icon: 'document',
      }),
      createMockDecision({
        id: 'decision-3',
        label: 'State',
        value: 'Delaware',
        status: 'pending',
        icon: 'map',
      }),
    ],
    completedCount: 2,
    totalCount: 3,
    ...overrides,
  }
}

describe('KeyDecisionsCard', () => {
  describe('Rendering decisions', () => {
    it('renders decisions with correct labels and values', () => {
      const keyDecisions = createMockKeyDecisions()
      render(<KeyDecisionsCard keyDecisions={keyDecisions} />)

      expect(screen.getByText('Business Name')).toBeInTheDocument()
      expect(screen.getByText('Acme Corp')).toBeInTheDocument()
      expect(screen.getByText('Entity Type')).toBeInTheDocument()
      expect(screen.getByText('LLC')).toBeInTheDocument()
      expect(screen.getByText('State')).toBeInTheDocument()
      expect(screen.getByText('Delaware')).toBeInTheDocument()
    })

    it('renders the header with correct title', () => {
      const keyDecisions = createMockKeyDecisions()
      render(<KeyDecisionsCard keyDecisions={keyDecisions} />)

      expect(screen.getByText('Key Decisions')).toBeInTheDocument()
    })

    it('renders the completed count text', () => {
      const keyDecisions = createMockKeyDecisions({
        completedCount: 2,
        totalCount: 3,
      })
      render(<KeyDecisionsCard keyDecisions={keyDecisions} />)

      expect(screen.getByText('2 of 3 decided')).toBeInTheDocument()
    })
  })

  describe('Progress bar', () => {
    it('shows progress bar with correct percentage', () => {
      const keyDecisions = createMockKeyDecisions({
        completedCount: 2,
        totalCount: 4,
      })
      render(<KeyDecisionsCard keyDecisions={keyDecisions} />)

      // Progress bar should be 50% (2/4)
      const progressBar = document.querySelector('[style*="width: 50%"]')
      expect(progressBar).toBeInTheDocument()
    })

    it('shows 0% progress when no decisions are completed', () => {
      const keyDecisions = createMockKeyDecisions({
        completedCount: 0,
        totalCount: 4,
      })
      render(<KeyDecisionsCard keyDecisions={keyDecisions} />)

      const progressBar = document.querySelector('[style*="width: 0%"]')
      expect(progressBar).toBeInTheDocument()
    })

    it('shows 100% progress when all decisions are completed', () => {
      const keyDecisions = createMockKeyDecisions({
        completedCount: 4,
        totalCount: 4,
      })
      render(<KeyDecisionsCard keyDecisions={keyDecisions} />)

      const progressBar = document.querySelector('[style*="width: 100%"]')
      expect(progressBar).toBeInTheDocument()
    })

    it('handles zero total decisions gracefully', () => {
      const keyDecisions = createMockKeyDecisions({
        decisions: [],
        completedCount: 0,
        totalCount: 0,
      })
      render(<KeyDecisionsCard keyDecisions={keyDecisions} />)

      // Should show 0% (prevents division by zero)
      const progressBar = document.querySelector('[style*="width: 0%"]')
      expect(progressBar).toBeInTheDocument()
    })
  })

  describe('Empty state', () => {
    it('shows loading state when keyDecisions is null', () => {
      render(<KeyDecisionsCard keyDecisions={null} />)

      expect(screen.getByText('Loading decisions...')).toBeInTheDocument()
    })

    it('shows loading state when keyDecisions is undefined', () => {
      render(<KeyDecisionsCard keyDecisions={undefined} />)

      expect(screen.getByText('Loading decisions...')).toBeInTheDocument()
    })

    it('shows empty state message when decisions array is empty', () => {
      const keyDecisions = createMockKeyDecisions({
        decisions: [],
        completedCount: 0,
        totalCount: 0,
      })
      render(<KeyDecisionsCard keyDecisions={keyDecisions} />)

      expect(
        screen.getByText('Complete onboarding to see your key decisions here.')
      ).toBeInTheDocument()
    })
  })

  describe('Expand/collapse functionality', () => {
    it('does not show expand button when 4 or fewer decisions', () => {
      const keyDecisions = createMockKeyDecisions({
        decisions: [
          createMockDecision({ id: '1', label: 'Decision 1', value: 'Value 1' }),
          createMockDecision({ id: '2', label: 'Decision 2', value: 'Value 2' }),
          createMockDecision({ id: '3', label: 'Decision 3', value: 'Value 3' }),
          createMockDecision({ id: '4', label: 'Decision 4', value: 'Value 4' }),
        ],
      })
      render(<KeyDecisionsCard keyDecisions={keyDecisions} />)

      expect(screen.queryByText('Show All')).not.toBeInTheDocument()
      expect(screen.queryByText('Show Less')).not.toBeInTheDocument()
    })

    it('shows expand/collapse button when more than 4 decisions', () => {
      const keyDecisions = createMockKeyDecisions({
        decisions: [
          createMockDecision({ id: '1', label: 'Decision 1', value: 'Value 1' }),
          createMockDecision({ id: '2', label: 'Decision 2', value: 'Value 2' }),
          createMockDecision({ id: '3', label: 'Decision 3', value: 'Value 3' }),
          createMockDecision({ id: '4', label: 'Decision 4', value: 'Value 4' }),
          createMockDecision({ id: '5', label: 'Decision 5', value: 'Value 5' }),
        ],
      })
      render(<KeyDecisionsCard keyDecisions={keyDecisions} />)

      // Default state is expanded, so "Show Less" should appear
      expect(screen.getByText('Show Less')).toBeInTheDocument()
    })

    it('shows all decisions when expanded (default)', () => {
      const keyDecisions = createMockKeyDecisions({
        decisions: [
          createMockDecision({ id: '1', label: 'Decision 1', value: 'Value 1' }),
          createMockDecision({ id: '2', label: 'Decision 2', value: 'Value 2' }),
          createMockDecision({ id: '3', label: 'Decision 3', value: 'Value 3' }),
          createMockDecision({ id: '4', label: 'Decision 4', value: 'Value 4' }),
          createMockDecision({ id: '5', label: 'Decision 5', value: 'Value 5' }),
          createMockDecision({ id: '6', label: 'Decision 6', value: 'Value 6' }),
        ],
      })
      render(<KeyDecisionsCard keyDecisions={keyDecisions} />)

      // All 6 decisions should be visible
      expect(screen.getByText('Decision 1')).toBeInTheDocument()
      expect(screen.getByText('Decision 2')).toBeInTheDocument()
      expect(screen.getByText('Decision 3')).toBeInTheDocument()
      expect(screen.getByText('Decision 4')).toBeInTheDocument()
      expect(screen.getByText('Decision 5')).toBeInTheDocument()
      expect(screen.getByText('Decision 6')).toBeInTheDocument()
    })

    it('collapses to show only 4 decisions when clicking Show Less', () => {
      const keyDecisions = createMockKeyDecisions({
        decisions: [
          createMockDecision({ id: '1', label: 'Decision 1', value: 'Value 1' }),
          createMockDecision({ id: '2', label: 'Decision 2', value: 'Value 2' }),
          createMockDecision({ id: '3', label: 'Decision 3', value: 'Value 3' }),
          createMockDecision({ id: '4', label: 'Decision 4', value: 'Value 4' }),
          createMockDecision({ id: '5', label: 'Decision 5', value: 'Value 5' }),
          createMockDecision({ id: '6', label: 'Decision 6', value: 'Value 6' }),
        ],
      })
      render(<KeyDecisionsCard keyDecisions={keyDecisions} />)

      // Click "Show Less" to collapse
      fireEvent.click(screen.getByText('Show Less'))

      // Only first 4 decisions should be visible
      expect(screen.getByText('Decision 1')).toBeInTheDocument()
      expect(screen.getByText('Decision 2')).toBeInTheDocument()
      expect(screen.getByText('Decision 3')).toBeInTheDocument()
      expect(screen.getByText('Decision 4')).toBeInTheDocument()
      expect(screen.queryByText('Decision 5')).not.toBeInTheDocument()
      expect(screen.queryByText('Decision 6')).not.toBeInTheDocument()

      // Button should now say "Show All"
      expect(screen.getByText('Show All')).toBeInTheDocument()
    })

    it('expands to show all decisions when clicking Show All', () => {
      const keyDecisions = createMockKeyDecisions({
        decisions: [
          createMockDecision({ id: '1', label: 'Decision 1', value: 'Value 1' }),
          createMockDecision({ id: '2', label: 'Decision 2', value: 'Value 2' }),
          createMockDecision({ id: '3', label: 'Decision 3', value: 'Value 3' }),
          createMockDecision({ id: '4', label: 'Decision 4', value: 'Value 4' }),
          createMockDecision({ id: '5', label: 'Decision 5', value: 'Value 5' }),
        ],
      })
      render(<KeyDecisionsCard keyDecisions={keyDecisions} />)

      // Collapse first
      fireEvent.click(screen.getByText('Show Less'))
      expect(screen.queryByText('Decision 5')).not.toBeInTheDocument()

      // Then expand
      fireEvent.click(screen.getByText('Show All'))

      // All decisions should be visible again
      expect(screen.getByText('Decision 5')).toBeInTheDocument()
      expect(screen.getByText('Show Less')).toBeInTheDocument()
    })
  })

  describe('Status indicators', () => {
    it('displays decided status with green styling', () => {
      const keyDecisions = createMockKeyDecisions({
        decisions: [
          createMockDecision({
            id: '1',
            label: 'Decided Item',
            value: 'Complete',
            status: 'decided',
          }),
        ],
      })
      render(<KeyDecisionsCard keyDecisions={keyDecisions} />)

      // The decided item should have green border styling
      const decisionContainer = screen.getByText('Decided Item').closest('div')?.parentElement
      expect(decisionContainer).toHaveClass('bg-green-50')
    })

    it('displays pending status with gray styling and italic text', () => {
      const keyDecisions = createMockKeyDecisions({
        decisions: [
          createMockDecision({
            id: '1',
            label: 'Pending Item',
            value: 'Not yet decided',
            status: 'pending',
          }),
        ],
      })
      render(<KeyDecisionsCard keyDecisions={keyDecisions} />)

      // The pending value text should be italic
      const valueText = screen.getByText('Not yet decided')
      expect(valueText).toHaveClass('italic')
    })

    it('displays needs_attention status with yellow styling', () => {
      const keyDecisions = createMockKeyDecisions({
        decisions: [
          createMockDecision({
            id: '1',
            label: 'Needs Attention',
            value: 'Action required',
            status: 'needs_attention',
          }),
        ],
      })
      render(<KeyDecisionsCard keyDecisions={keyDecisions} />)

      // The needs_attention item should have yellow border styling
      const decisionContainer = screen.getByText('Needs Attention').closest('div')?.parentElement
      expect(decisionContainer).toHaveClass('bg-yellow-50')
    })

    it('renders check icon for decided status', () => {
      const keyDecisions = createMockKeyDecisions({
        decisions: [
          createMockDecision({
            id: '1',
            label: 'Decided Item',
            value: 'Complete',
            status: 'decided',
          }),
        ],
      })
      const { container } = render(<KeyDecisionsCard keyDecisions={keyDecisions} />)

      // Check for green-colored icon (CheckCircleIcon gets text-green-600 class)
      const greenIcon = container.querySelector('.text-green-600')
      expect(greenIcon).toBeInTheDocument()
    })

    it('renders clock icon for pending status', () => {
      const keyDecisions = createMockKeyDecisions({
        decisions: [
          createMockDecision({
            id: '1',
            label: 'Pending Item',
            value: 'Not decided',
            status: 'pending',
          }),
        ],
      })
      const { container } = render(<KeyDecisionsCard keyDecisions={keyDecisions} />)

      // Check for gray-colored icon (ClockIcon gets text-gray-400 class)
      const grayIcon = container.querySelector('.text-gray-400')
      expect(grayIcon).toBeInTheDocument()
    })
  })

  describe('Icon rendering', () => {
    it('renders building icon for building type', () => {
      const keyDecisions = createMockKeyDecisions({
        decisions: [createMockDecision({ id: '1', icon: 'building' })],
      })
      const { container } = render(<KeyDecisionsCard keyDecisions={keyDecisions} />)

      // Heroicons render as SVGs with specific paths
      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })

    it('renders default document icon when icon is not specified', () => {
      const keyDecisions = createMockKeyDecisions({
        decisions: [createMockDecision({ id: '1', icon: undefined })],
      })
      const { container } = render(<KeyDecisionsCard keyDecisions={keyDecisions} />)

      // Should still render an icon (DocumentTextIcon as fallback)
      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })

    it('renders default document icon for unknown icon type', () => {
      const keyDecisions = createMockKeyDecisions({
        decisions: [createMockDecision({ id: '1', icon: 'unknown-icon-type' })],
      })
      const { container } = render(<KeyDecisionsCard keyDecisions={keyDecisions} />)

      // Should still render an icon (DocumentTextIcon as fallback)
      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })
  })
})
