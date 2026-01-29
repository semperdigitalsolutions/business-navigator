/**
 * TaskCompletionModal Component
 * Celebration modal shown when a user completes a task or makes a decision.
 * Displays summary, confidence score update, encouragement, and next steps.
 */
import { useCallback, useEffect, useRef, useSyncExternalStore } from 'react'
import { Button } from '@/components/catalyst-ui-kit/typescript/button'
import { Dialog, DialogActions, DialogBody, DialogTitle } from '@/components/ui/dialog'
import { CelebrationConfetti } from '@/features/dashboard/components/celebration/CelebrationConfetti'

export interface TaskCompletionModalProps {
  /** Whether the modal is currently visible */
  isOpen: boolean
  /** Called when the modal should close */
  onClose: () => void
  /** Called when user clicks "Continue to next task" */
  onContinue: () => void
  /** Called when user clicks "Back to dashboard" */
  onBackToDashboard: () => void
  /** Modal heading text */
  title?: string
  /** Summary of what was saved/decided */
  summary?: string
  /** Confidence score change to display (e.g., { before: 40, after: 48 }) */
  confidenceScore?: { before: number; after: number }
  /** List of unlocked/upcoming items */
  nextSteps?: string[]
  /** Whether to show confetti animation */
  showConfetti?: boolean
}

/** Inline SVG checkmark icon in a circle */
function CheckmarkIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
        clipRule="evenodd"
      />
    </svg>
  )
}

/** Inline SVG arrow icon for confidence score display */
function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z"
        clipRule="evenodd"
      />
    </svg>
  )
}

/** Confidence score display with before/after animation */
function ConfidenceScoreDisplay({ before, after }: { before: number; after: number }) {
  const increase = after - before

  return (
    <div className="flex items-center justify-center gap-2 text-sm">
      <span className="text-zinc-600 dark:text-zinc-400">Confidence:</span>
      <span className="font-medium text-zinc-700 dark:text-zinc-300">{before}%</span>
      <ArrowRightIcon className="h-4 w-4 text-zinc-400 dark:text-zinc-500" />
      <span className="font-bold text-emerald-600 dark:text-emerald-400">{after}%</span>
      {increase > 0 && (
        <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
          (+{increase}%)
        </span>
      )}
    </div>
  )
}

/** Encouragement message box */
function EncouragementBox() {
  return (
    <div
      className="rounded-lg bg-gradient-to-r from-indigo-50 to-purple-50
        px-4 py-3 dark:from-indigo-950/30 dark:to-purple-950/30"
    >
      <p className="text-center text-sm font-medium text-indigo-700 dark:text-indigo-300">
        Great progress! You are building momentum.
      </p>
    </div>
  )
}

/** Next steps list component */
function NextStepsList({ steps }: { steps: string[] }) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Up next:</p>
      <ul className="space-y-1.5 pl-1">
        {steps.map((step, index) => (
          <li
            key={index}
            className="flex items-start gap-2 text-sm text-zinc-600 dark:text-zinc-400"
          >
            <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-zinc-400 dark:bg-zinc-500" />
            <span>{step}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** Hook to manage confetti visibility without setState in useEffect */
function useConfettiVisibility(isOpen: boolean, showConfetti: boolean): boolean {
  type Store = { visible: boolean; listeners: Set<() => void> }
  const storeRef = useRef<Store>({ visible: false, listeners: new Set() })

  const subscribe = useCallback((listener: () => void) => {
    storeRef.current.listeners.add(listener)
    return () => {
      storeRef.current.listeners.delete(listener)
    }
  }, [])

  const getSnapshot = useCallback(() => storeRef.current.visible, [])

  useEffect(() => {
    if (isOpen && showConfetti) {
      storeRef.current.visible = true
      storeRef.current.listeners.forEach((l) => l())
      const timer = setTimeout(() => {
        storeRef.current.visible = false
        storeRef.current.listeners.forEach((l) => l())
      }, 1000)
      return () => clearTimeout(timer)
    }
    storeRef.current.visible = false
    storeRef.current.listeners.forEach((l) => l())
    return undefined
  }, [isOpen, showConfetti])

  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}

export function TaskCompletionModal({
  isOpen,
  onClose,
  onContinue,
  onBackToDashboard,
  title = 'Task completed!',
  summary,
  confidenceScore,
  nextSteps,
  showConfetti = true,
}: TaskCompletionModalProps) {
  const showConfettiState = useConfettiVisibility(isOpen, showConfetti)

  return (
    <Dialog open={isOpen} onClose={onClose} size="sm">
      {/* Confetti overlay positioned within the dialog */}
      {showConfettiState && (
        <div className="pointer-events-none absolute inset-0 z-50 overflow-hidden">
          <CelebrationConfetti />
        </div>
      )}

      <DialogTitle className="flex items-center gap-2">
        <CheckmarkIcon className="h-6 w-6 text-emerald-500" />
        {title}
      </DialogTitle>

      <DialogBody className="space-y-4">
        {/* Summary of what was saved */}
        {summary && <p className="text-sm text-zinc-600 dark:text-zinc-400">{summary}</p>}

        {/* Confidence score update */}
        {confidenceScore && (
          <ConfidenceScoreDisplay before={confidenceScore.before} after={confidenceScore.after} />
        )}

        {/* Encouragement message */}
        <EncouragementBox />

        {/* Next steps list */}
        {nextSteps && nextSteps.length > 0 && <NextStepsList steps={nextSteps} />}
      </DialogBody>

      <DialogActions>
        <Button plain onClick={onBackToDashboard}>
          Back to dashboard
        </Button>
        <Button color="indigo" onClick={onContinue}>
          Continue to next task
        </Button>
      </DialogActions>
    </Dialog>
  )
}
