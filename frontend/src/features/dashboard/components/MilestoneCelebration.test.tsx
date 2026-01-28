import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { act, fireEvent, render, renderHook, screen } from '@testing-library/react'
import { MilestoneCelebration } from './MilestoneCelebration'
import { useMilestoneState, type Milestone } from '../hooks/useMilestoneState'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      store = {}
    }),
    get store() {
      return store
    },
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Mock motion/react to avoid animation issues in tests
vi.mock('motion/react', () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  motion: {
    div: ({ children, ...props }: React.HTMLProps<HTMLDivElement>) => (
      <div {...props}>{children}</div>
    ),
    h2: ({ children, ...props }: React.HTMLProps<HTMLHeadingElement>) => (
      <h2 {...props}>{children}</h2>
    ),
    p: ({ children, ...props }: React.HTMLProps<HTMLParagraphElement>) => (
      <p {...props}>{children}</p>
    ),
    button: ({ children, ...props }: React.HTMLProps<HTMLButtonElement>) => (
      <button {...props}>{children}</button>
    ),
  },
}))

// Mock sub-components that have complex animations
vi.mock('./celebration', () => ({
  CelebrationModal: ({
    config,
    milestone,
    onDismiss,
  }: {
    config: { title: string; message: string; emoji: string }
    milestone: Milestone
    onDismiss: () => void
  }) => (
    <div data-testid="celebration-modal" data-milestone={milestone}>
      <h2>{config.title}</h2>
      <p>{config.message}</p>
      <span>{config.emoji}</span>
      <button onClick={onDismiss} aria-label="Dismiss celebration">
        Keep Going!
      </button>
    </div>
  ),
}))

const STORAGE_KEY = 'milestone-celebrations-shown'

describe('useMilestoneState', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('milestone detection', () => {
    it('shows 25% milestone when completion is at exactly 25%', () => {
      const { result } = renderHook(() => useMilestoneState(25))

      expect(result.current.currentMilestone).toBe(25)
      expect(result.current.isVisible).toBe(true)
    })

    it('shows 50% milestone when 25% is already shown and completion is at 50%', () => {
      localStorageMock.setItem(STORAGE_KEY, JSON.stringify({ default: [25] }))
      const { result } = renderHook(() => useMilestoneState(50))

      expect(result.current.currentMilestone).toBe(50)
      expect(result.current.isVisible).toBe(true)
    })

    it('shows 75% milestone when 25% and 50% are already shown and completion is at 75%', () => {
      localStorageMock.setItem(STORAGE_KEY, JSON.stringify({ default: [25, 50] }))
      const { result } = renderHook(() => useMilestoneState(75))

      expect(result.current.currentMilestone).toBe(75)
      expect(result.current.isVisible).toBe(true)
    })

    it('shows 100% milestone when all prior milestones are shown and completion is at 100%', () => {
      localStorageMock.setItem(STORAGE_KEY, JSON.stringify({ default: [25, 50, 75] }))
      const { result } = renderHook(() => useMilestoneState(100))

      expect(result.current.currentMilestone).toBe(100)
      expect(result.current.isVisible).toBe(true)
    })

    it('detects the lowest unshown milestone when percentage exceeds it', () => {
      // At 30%, milestone 25 should be detected (first unshown milestone)
      const { result } = renderHook(() => useMilestoneState(30))

      expect(result.current.currentMilestone).toBe(25)
    })

    it('shows first unshown milestone even when at higher percentage', () => {
      // At 75%, with no prior milestones shown, 25 should be shown first
      const { result } = renderHook(() => useMilestoneState(75))

      expect(result.current.currentMilestone).toBe(25)
    })

    it('returns null for non-milestone percentages below 25', () => {
      const { result } = renderHook(() => useMilestoneState(24))

      expect(result.current.currentMilestone).toBeNull()
      expect(result.current.isVisible).toBe(false)
    })

    it('returns null for 0% completion', () => {
      const { result } = renderHook(() => useMilestoneState(0))

      expect(result.current.currentMilestone).toBeNull()
      expect(result.current.isVisible).toBe(false)
    })
  })

  describe('localStorage persistence', () => {
    it('persists shown milestones to localStorage on dismiss', () => {
      const { result } = renderHook(() => useMilestoneState(25, 'test-business'))

      expect(result.current.currentMilestone).toBe(25)

      act(() => {
        result.current.handleDismiss()
      })

      const stored = JSON.parse(localStorageMock.store[STORAGE_KEY])
      expect(stored['test-business']).toContain(25)
    })

    it('reads previously shown milestones from localStorage', () => {
      // Pre-populate localStorage with already shown milestones
      localStorageMock.setItem(STORAGE_KEY, JSON.stringify({ 'test-business': [25, 50] }))

      const { result } = renderHook(() => useMilestoneState(75, 'test-business'))

      // Should detect 75 as the next milestone since 25 and 50 are already shown
      expect(result.current.currentMilestone).toBe(75)
    })

    it('tracks milestones separately per businessId', () => {
      // Business 1 has already seen 25%
      localStorageMock.setItem(STORAGE_KEY, JSON.stringify({ 'business-1': [25] }))

      // Business 1 should see 50 next at 50%
      const { result: result1 } = renderHook(() => useMilestoneState(50, 'business-1'))
      expect(result1.current.currentMilestone).toBe(50)

      // Business 2 should see 25 at 50% since it hasn't seen any
      const { result: result2 } = renderHook(() => useMilestoneState(50, 'business-2'))
      expect(result2.current.currentMilestone).toBe(25)
    })
  })

  describe('does not repeat milestones', () => {
    it('does not show already-shown milestone again', () => {
      localStorageMock.setItem(STORAGE_KEY, JSON.stringify({ default: [25] }))

      const { result } = renderHook(() => useMilestoneState(25))

      expect(result.current.currentMilestone).toBeNull()
      expect(result.current.isVisible).toBe(false)
    })

    it('skips to next unshown milestone when earlier ones are shown', () => {
      localStorageMock.setItem(STORAGE_KEY, JSON.stringify({ default: [25, 50] }))

      const { result } = renderHook(() => useMilestoneState(100))

      expect(result.current.currentMilestone).toBe(75)
    })

    it('returns null when all applicable milestones have been shown', () => {
      localStorageMock.setItem(STORAGE_KEY, JSON.stringify({ default: [25, 50, 75, 100] }))

      const { result } = renderHook(() => useMilestoneState(100))

      expect(result.current.currentMilestone).toBeNull()
      expect(result.current.isVisible).toBe(false)
    })
  })

  describe('dismiss functionality', () => {
    it('sets isVisible to false after dismiss', () => {
      const { result } = renderHook(() => useMilestoneState(25))

      expect(result.current.isVisible).toBe(true)

      act(() => {
        result.current.handleDismiss()
      })

      expect(result.current.isVisible).toBe(false)
    })

    it('adds milestone to shown list after dismiss', () => {
      const { result } = renderHook(() => useMilestoneState(50))

      // Dismiss 25 first
      act(() => {
        result.current.handleDismiss()
      })

      const stored = JSON.parse(localStorageMock.store[STORAGE_KEY])
      expect(stored['default']).toContain(25)
    })

    it('does not duplicate milestone in storage on multiple dismiss calls', () => {
      const { result } = renderHook(() => useMilestoneState(25))

      act(() => {
        result.current.handleDismiss()
      })

      // Try to dismiss again (should be a no-op since already dismissed)
      act(() => {
        result.current.handleDismiss()
      })

      const stored = JSON.parse(localStorageMock.store[STORAGE_KEY])
      expect(stored['default'].filter((m: number) => m === 25)).toHaveLength(1)
    })
  })
})

describe('MilestoneCelebration Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.clear()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  describe('milestone display', () => {
    it('shows 25% celebration with title "Great Start!" at 25% completion', () => {
      render(<MilestoneCelebration completionPercentage={25} />)

      expect(screen.getByTestId('celebration-modal')).toBeInTheDocument()
      expect(screen.getByText('Great Start!')).toBeInTheDocument()
    })

    it('shows 50% celebration with title "Halfway There!" when 25% is already shown', () => {
      localStorageMock.setItem(STORAGE_KEY, JSON.stringify({ default: [25] }))
      render(<MilestoneCelebration completionPercentage={50} />)

      expect(screen.getByTestId('celebration-modal')).toBeInTheDocument()
      expect(screen.getByText('Halfway There!')).toBeInTheDocument()
    })

    it('shows 75% celebration with title "Almost There!" when earlier milestones are shown', () => {
      localStorageMock.setItem(STORAGE_KEY, JSON.stringify({ default: [25, 50] }))
      render(<MilestoneCelebration completionPercentage={75} />)

      expect(screen.getByTestId('celebration-modal')).toBeInTheDocument()
      expect(screen.getByText('Almost There!')).toBeInTheDocument()
    })

    it('shows 100% celebration with title "Congratulations!" when all prior milestones are shown', () => {
      localStorageMock.setItem(STORAGE_KEY, JSON.stringify({ default: [25, 50, 75] }))
      render(<MilestoneCelebration completionPercentage={100} />)

      expect(screen.getByTestId('celebration-modal')).toBeInTheDocument()
      expect(screen.getByText('Congratulations!')).toBeInTheDocument()
    })

    it('shows correct message for 25% milestone', () => {
      render(<MilestoneCelebration completionPercentage={25} />)

      expect(
        screen.getByText("You've completed 25% of your business formation journey.")
      ).toBeInTheDocument()
    })

    it('shows correct message for 100% milestone', () => {
      // Need to pre-populate so 100% is the next milestone
      localStorageMock.setItem(STORAGE_KEY, JSON.stringify({ default: [25, 50, 75] }))

      render(<MilestoneCelebration completionPercentage={100} />)

      expect(
        screen.getByText('You did it! Your business formation is complete!')
      ).toBeInTheDocument()
    })
  })

  describe('non-milestone percentages', () => {
    it('does not show celebration for 30%', () => {
      // First show and dismiss 25% milestone
      localStorageMock.setItem(STORAGE_KEY, JSON.stringify({ default: [25] }))

      render(<MilestoneCelebration completionPercentage={30} />)

      expect(screen.queryByTestId('celebration-modal')).not.toBeInTheDocument()
    })

    it('does not show celebration for 0%', () => {
      render(<MilestoneCelebration completionPercentage={0} />)

      expect(screen.queryByTestId('celebration-modal')).not.toBeInTheDocument()
    })

    it('does not show celebration for 24%', () => {
      render(<MilestoneCelebration completionPercentage={24} />)

      expect(screen.queryByTestId('celebration-modal')).not.toBeInTheDocument()
    })
  })

  describe('dismiss functionality', () => {
    it('hides current milestone modal when Keep Going button is clicked', () => {
      render(<MilestoneCelebration completionPercentage={25} />)

      expect(screen.getByTestId('celebration-modal')).toBeInTheDocument()
      expect(screen.getByTestId('celebration-modal')).toHaveAttribute('data-milestone', '25')

      fireEvent.click(screen.getByRole('button', { name: /dismiss celebration/i }))

      // Modal should be dismissed (at 25%, there's no next milestone to show)
      expect(screen.queryByTestId('celebration-modal')).not.toBeInTheDocument()
    })

    it('persists dismissed milestone to localStorage', () => {
      render(<MilestoneCelebration completionPercentage={25} businessId="my-business" />)

      fireEvent.click(screen.getByRole('button', { name: /dismiss celebration/i }))

      const stored = JSON.parse(localStorageMock.store[STORAGE_KEY])
      expect(stored['my-business']).toContain(25)
    })

    it('shows next milestone after dismissing current one when percentage qualifies', () => {
      // At 50%, first milestone shown is 25%
      render(<MilestoneCelebration completionPercentage={50} />)

      expect(screen.getByTestId('celebration-modal')).toHaveAttribute('data-milestone', '25')

      // Dismiss 25% - the 50% milestone should appear since we're at 50%
      fireEvent.click(screen.getByRole('button', { name: /dismiss celebration/i }))

      // After dismissing 25%, the component should now show 50%
      expect(screen.getByTestId('celebration-modal')).toHaveAttribute('data-milestone', '50')
    })
  })

  describe('already-shown milestones', () => {
    it('does not show celebration for already-shown milestone', () => {
      localStorageMock.setItem(STORAGE_KEY, JSON.stringify({ default: [25] }))

      render(<MilestoneCelebration completionPercentage={25} />)

      expect(screen.queryByTestId('celebration-modal')).not.toBeInTheDocument()
    })

    it('shows next unshown milestone when earlier ones are dismissed', () => {
      localStorageMock.setItem(STORAGE_KEY, JSON.stringify({ default: [25] }))

      render(<MilestoneCelebration completionPercentage={50} />)

      expect(screen.getByTestId('celebration-modal')).toBeInTheDocument()
      expect(screen.getByText('Halfway There!')).toBeInTheDocument()
    })
  })

  describe('businessId isolation', () => {
    it('uses default businessId when not provided', () => {
      render(<MilestoneCelebration completionPercentage={25} />)

      fireEvent.click(screen.getByRole('button', { name: /dismiss celebration/i }))

      const stored = JSON.parse(localStorageMock.store[STORAGE_KEY])
      expect(stored['default']).toContain(25)
    })

    it('tracks milestones separately per businessId', () => {
      localStorageMock.setItem(STORAGE_KEY, JSON.stringify({ 'business-a': [25, 50] }))

      // Business A at 75% should see 75% celebration
      const { rerender } = render(
        <MilestoneCelebration completionPercentage={75} businessId="business-a" />
      )
      expect(screen.getByTestId('celebration-modal')).toHaveAttribute('data-milestone', '75')

      // Business B at 75% should see 25% celebration (first milestone)
      rerender(<MilestoneCelebration completionPercentage={75} businessId="business-b" />)
      expect(screen.getByTestId('celebration-modal')).toHaveAttribute('data-milestone', '25')
    })
  })

  describe('percentage updates', () => {
    it('shows new milestone when percentage increases past threshold', () => {
      // Start at 25% with 25% already shown
      localStorageMock.setItem(STORAGE_KEY, JSON.stringify({ default: [25] }))

      const { rerender } = render(<MilestoneCelebration completionPercentage={25} />)

      // No modal shown since 25% is already shown and percentage is exactly 25%
      expect(screen.queryByTestId('celebration-modal')).not.toBeInTheDocument()

      // Move to 50% - should show 50% milestone
      rerender(<MilestoneCelebration completionPercentage={50} />)

      expect(screen.getByText('Halfway There!')).toBeInTheDocument()
    })

    it('progresses through all milestones as percentage increases', () => {
      const { rerender } = render(<MilestoneCelebration completionPercentage={25} />)

      // First shows 25%
      expect(screen.getByTestId('celebration-modal')).toHaveAttribute('data-milestone', '25')

      // Dismiss 25%
      fireEvent.click(screen.getByRole('button', { name: /dismiss celebration/i }))

      // At 25%, no more milestones to show
      expect(screen.queryByTestId('celebration-modal')).not.toBeInTheDocument()

      // Move to 50%
      rerender(<MilestoneCelebration completionPercentage={50} />)

      // Should now show 50%
      expect(screen.getByTestId('celebration-modal')).toHaveAttribute('data-milestone', '50')
    })
  })
})
