/**
 * TaskNavigation Component
 * Issue #69: Back, Save, Complete buttons
 * Sticky on mobile, inline on desktop
 */
import { useNavigate } from 'react-router-dom'
import { ArrowLeftIcon, CheckIcon } from '@heroicons/react/24/outline'
import { cn } from '@/utils/classnames'

interface TaskNavigationProps {
  /** Callback when back button clicked (default: navigate(-1)) */
  onBack?: () => void
  /** Callback when save button clicked */
  onSave?: () => void
  /** Callback when complete button clicked */
  onComplete?: () => void
  /** Whether save is in progress */
  isSaving?: boolean
  /** Whether complete is in progress */
  isCompleting?: boolean
  /** Whether save button should be shown */
  showSave?: boolean
  /** Whether complete button should be shown */
  showComplete?: boolean
  /** Whether task is already completed */
  isCompleted?: boolean
  /** Text for save button */
  saveLabel?: string
  /** Text for complete button */
  completeLabel?: string
  /** Custom back label */
  backLabel?: string
  /** Additional class names */
  className?: string
}

function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={cn('animate-spin', className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  )
}

interface SaveButtonProps {
  onSave: () => void
  isSaving: boolean
  label: string
}

function SaveButton({ onSave, isSaving, label }: SaveButtonProps) {
  const baseClass =
    'inline-flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50'
  return (
    <button onClick={onSave} disabled={isSaving} className={baseClass}>
      {isSaving ? (
        <>
          <Spinner className="h-4 w-4" />
          Saving...
        </>
      ) : (
        label
      )}
    </button>
  )
}

interface CompleteButtonProps {
  onComplete: () => void
  isCompleting: boolean
  label: string
}

function CompleteButton({ onComplete, isCompleting, label }: CompleteButtonProps) {
  const baseClass =
    'inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50'
  return (
    <button onClick={onComplete} disabled={isCompleting} className={baseClass}>
      {isCompleting ? (
        <>
          <Spinner className="h-4 w-4" />
          Completing...
        </>
      ) : (
        <>
          <CheckIcon className="h-4 w-4" />
          {label}
        </>
      )}
    </button>
  )
}

function CompletedBadge() {
  return (
    <span className="inline-flex items-center gap-2 rounded-lg bg-green-100 px-4 py-2.5 text-sm font-medium text-green-700 dark:bg-green-900/30 dark:text-green-300">
      <CheckIcon className="h-4 w-4" />
      Completed
    </span>
  )
}

function RightSideButtons(props: {
  showSave: boolean
  onSave?: () => void
  isSaving: boolean
  saveLabel: string
  showComplete: boolean
  onComplete?: () => void
  isCompleting: boolean
  isCompleted: boolean
  completeLabel: string
}) {
  const {
    showSave,
    onSave,
    isSaving,
    saveLabel,
    showComplete,
    onComplete,
    isCompleting,
    isCompleted,
    completeLabel,
  } = props
  const showSaveBtn = showSave && onSave
  const showCompleteBtn = showComplete && onComplete && !isCompleted

  return (
    <div className="flex items-center gap-2">
      {showSaveBtn && <SaveButton onSave={onSave} isSaving={isSaving} label={saveLabel} />}
      {showCompleteBtn && (
        <CompleteButton onComplete={onComplete} isCompleting={isCompleting} label={completeLabel} />
      )}
      {isCompleted && <CompletedBadge />}
    </div>
  )
}

export function TaskNavigation(props: TaskNavigationProps) {
  const {
    onBack,
    onSave,
    onComplete,
    isSaving = false,
    isCompleting = false,
    showSave = true,
    showComplete = true,
    isCompleted = false,
    saveLabel = 'Save Draft',
    completeLabel = 'Mark Complete',
    backLabel = 'Back',
    className,
  } = props
  const navigate = useNavigate()
  const handleBack = onBack ?? (() => navigate(-1))

  return (
    <div className={cn('flex items-center justify-between gap-3', className)}>
      <button
        onClick={handleBack}
        className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        {backLabel}
      </button>
      <RightSideButtons
        showSave={showSave}
        onSave={onSave}
        isSaving={isSaving}
        saveLabel={saveLabel}
        showComplete={showComplete}
        onComplete={onComplete}
        isCompleting={isCompleting}
        isCompleted={isCompleted}
        completeLabel={completeLabel}
      />
    </div>
  )
}
