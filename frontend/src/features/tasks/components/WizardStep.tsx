/**
 * WizardStep Component
 * Issue #74: Individual step component for wizard-style tasks
 * Props: stepNumber, totalSteps, title, description, children, onNext, onBack, onSkip, isLoading
 */
import { cn } from '@/utils/classnames'

interface WizardStepProps {
  /** Current step number (1-indexed) */
  stepNumber: number
  /** Total number of steps */
  totalSteps: number
  /** Step title */
  title: string
  /** Step description/instructions */
  description?: string
  /** Step content (form fields, etc.) */
  children: React.ReactNode
  /** Callback when Next/Continue is clicked */
  onNext?: () => void
  /** Callback when Back is clicked */
  onBack?: () => void
  /** Callback when Skip is clicked (optional) */
  onSkip?: () => void
  /** Whether the step is processing (shows loading state) */
  isLoading?: boolean
  /** Whether the Next button should be disabled */
  isNextDisabled?: boolean
  /** Custom label for Next button (default: "Continue" or "Complete" on last step) */
  nextLabel?: string
  /** Whether to show the skip option */
  showSkip?: boolean
  /** Custom label for skip button */
  skipLabel?: string
  /** Additional class names */
  className?: string
}

export function WizardStep({
  stepNumber,
  totalSteps,
  title,
  description,
  children,
  onNext,
  onBack,
  onSkip,
  isLoading = false,
  isNextDisabled = false,
  nextLabel,
  showSkip = false,
  skipLabel = 'Skip for now',
  className,
}: WizardStepProps) {
  const isFirstStep = stepNumber === 1
  const isLastStep = stepNumber === totalSteps
  const defaultNextLabel = isLastStep ? 'Complete' : 'Continue'

  return (
    <div className={cn('space-y-6', className)}>
      {/* Step Header */}
      <div className="text-center">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">{title}</h2>
        {description && (
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{description}</p>
        )}
      </div>

      {/* Step Content */}
      <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-800">
        {children}
      </div>

      {/* Navigation Buttons */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Back Button (left side) */}
        <div>
          {!isFirstStep && onBack && (
            <button
              type="button"
              onClick={onBack}
              disabled={isLoading}
              className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 disabled:opacity-50 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
            >
              Back
            </button>
          )}
        </div>

        {/* Right Side: Skip + Next */}
        <div className="flex items-center gap-3">
          {/* Skip Button */}
          {showSkip && onSkip && (
            <button
              type="button"
              onClick={onSkip}
              disabled={isLoading}
              className="text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-700 disabled:opacity-50 dark:text-zinc-400 dark:hover:text-zinc-300"
            >
              {skipLabel}
            </button>
          )}

          {/* Next/Continue Button */}
          {onNext && (
            <button
              type="button"
              onClick={onNext}
              disabled={isLoading || isNextDisabled}
              className={cn(
                'inline-flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-medium text-white transition-colors',
                isLastStep
                  ? 'bg-green-600 hover:bg-green-700 disabled:bg-green-400'
                  : 'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400',
                'disabled:cursor-not-allowed'
              )}
            >
              {isLoading ? (
                <>
                  <LoadingSpinner />
                  Processing...
                </>
              ) : (
                nextLabel || defaultNextLabel
              )}
            </button>
          )}
        </div>
      </div>

      {/* Step Indicator Dots (optional visual) */}
      <div className="flex items-center justify-center gap-1.5 pt-4">
        {Array.from({ length: totalSteps }, (_, i) => (
          <div
            key={i}
            className={cn(
              'h-2 w-2 rounded-full transition-colors',
              i + 1 === stepNumber
                ? 'bg-blue-600'
                : i + 1 < stepNumber
                  ? 'bg-blue-300 dark:bg-blue-700'
                  : 'bg-zinc-200 dark:bg-zinc-700'
            )}
          />
        ))}
      </div>
    </div>
  )
}

/** Loading spinner component */
function LoadingSpinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin"
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
