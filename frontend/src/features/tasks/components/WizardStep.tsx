/**
 * WizardStep Component
 * Issue #74: Individual step component for wizard-style tasks
 */
import { cn } from '@/utils/classnames'

interface WizardStepProps {
  stepNumber: number
  totalSteps: number
  title: string
  description?: string
  children: React.ReactNode
  onNext?: () => void
  onBack?: () => void
  onSkip?: () => void
  isLoading?: boolean
  isNextDisabled?: boolean
  nextLabel?: string
  showSkip?: boolean
  skipLabel?: string
  className?: string
}

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

function getStepDotClass(dotIndex: number, currentStep: number): string {
  if (dotIndex + 1 === currentStep) return 'bg-blue-600'
  if (dotIndex + 1 < currentStep) return 'bg-blue-300 dark:bg-blue-700'
  return 'bg-zinc-200 dark:bg-zinc-700'
}

function StepIndicator({ totalSteps, stepNumber }: { totalSteps: number; stepNumber: number }) {
  return (
    <div className="flex items-center justify-center gap-1.5 pt-4">
      {Array.from({ length: totalSteps }, (_, i) => (
        <div
          key={i}
          className={cn('h-2 w-2 rounded-full transition-colors', getStepDotClass(i, stepNumber))}
        />
      ))}
    </div>
  )
}

interface NavButtonsProps {
  isFirstStep: boolean
  isLastStep: boolean
  isLoading: boolean
  isNextDisabled: boolean
  nextLabel?: string
  showSkip: boolean
  skipLabel: string
  onBack?: () => void
  onSkip?: () => void
  onNext?: () => void
}

function NavButtons({
  isFirstStep,
  isLastStep,
  isLoading,
  isNextDisabled,
  nextLabel,
  showSkip,
  skipLabel,
  onBack,
  onSkip,
  onNext,
}: NavButtonsProps) {
  const defaultNextLabel = isLastStep ? 'Complete' : 'Continue'
  const nextBtnClass = cn(
    'inline-flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-medium text-white transition-colors disabled:cursor-not-allowed',
    isLastStep
      ? 'bg-green-600 hover:bg-green-700 disabled:bg-green-400'
      : 'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400'
  )

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
      <div className="flex items-center gap-3">
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
        {onNext && (
          <button
            type="button"
            onClick={onNext}
            disabled={isLoading || isNextDisabled}
            className={nextBtnClass}
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
  )
}

export function WizardStep(props: WizardStepProps) {
  const {
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
  } = props

  return (
    <div className={cn('space-y-6', className)}>
      <div className="text-center">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">{title}</h2>
        {description && (
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{description}</p>
        )}
      </div>
      <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-800">
        {children}
      </div>
      <NavButtons
        isFirstStep={stepNumber === 1}
        isLastStep={stepNumber === totalSteps}
        isLoading={isLoading}
        isNextDisabled={isNextDisabled}
        nextLabel={nextLabel}
        showSkip={showSkip}
        skipLabel={skipLabel}
        onBack={onBack}
        onSkip={onSkip}
        onNext={onNext}
      />
      <StepIndicator totalSteps={totalSteps} stepNumber={stepNumber} />
    </div>
  )
}
