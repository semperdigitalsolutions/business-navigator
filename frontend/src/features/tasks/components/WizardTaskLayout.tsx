/**
 * WizardTaskLayout Component
 * Issue #73: Step indicator, progress bar, navigation for wizard-style tasks
 * Shows "Step X of Y" indicator, back button (except step 1), progress bar
 */
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import { cn } from '@/utils/classnames'

interface WizardTaskLayoutProps {
  /** Current step number (1-indexed) */
  currentStep: number
  /** Total number of steps */
  totalSteps: number
  /** Wizard title */
  title: string
  /** Optional subtitle/description */
  subtitle?: string
  /** Content for current step */
  children: React.ReactNode
  /** Callback when back button clicked */
  onBack?: () => void
  /** Whether wizard is loading */
  isLoading?: boolean
  /** Additional class names */
  className?: string
}

export function WizardTaskLayout({
  currentStep,
  totalSteps,
  title,
  subtitle,
  children,
  onBack,
  isLoading = false,
  className,
}: WizardTaskLayoutProps) {
  const progress = (currentStep / totalSteps) * 100
  const isFirstStep = currentStep === 1

  return (
    <div className={cn('flex min-h-screen flex-col bg-white dark:bg-zinc-900', className)}>
      {/* Header with Step Indicator */}
      <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/95 backdrop-blur dark:border-zinc-700 dark:bg-zinc-900/95">
        <div className="mx-auto max-w-2xl px-4 py-4">
          {/* Top Row: Back button + Step indicator */}
          <div className="flex items-center justify-between">
            {/* Back Button (hidden on step 1) */}
            <div className="w-20">
              {!isFirstStep && onBack && (
                <button
                  onClick={onBack}
                  disabled={isLoading}
                  className="inline-flex items-center gap-1 text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 disabled:opacity-50 dark:text-zinc-400 dark:hover:text-zinc-100"
                >
                  <ArrowLeftIcon className="h-4 w-4" />
                  Back
                </button>
              )}
            </div>

            {/* Step Indicator */}
            <div className="text-center">
              <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Step {currentStep} of {totalSteps}
              </span>
            </div>

            {/* Spacer for alignment */}
            <div className="w-20" />
          </div>

          {/* Progress Bar */}
          <div className="mt-3">
            <div className="h-1.5 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
                role="progressbar"
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Progress: ${currentStep} of ${totalSteps} steps`}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="mx-auto max-w-2xl px-4 py-8">
          {/* Title and Subtitle */}
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">{title}</h1>
            {subtitle && <p className="mt-2 text-zinc-600 dark:text-zinc-400">{subtitle}</p>}
          </div>

          {/* Step Content */}
          <div className="relative">
            {isLoading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-white/80 dark:bg-zinc-900/80">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
              </div>
            )}
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}
