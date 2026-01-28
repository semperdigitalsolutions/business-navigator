/**
 * WizardTaskLayout Component
 * Issue #73: Step indicator, progress bar, navigation for wizard-style tasks
 */
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import { cn } from '@/utils/classnames'

interface WizardTaskLayoutProps {
  currentStep: number
  totalSteps: number
  title: string
  subtitle?: string
  children: React.ReactNode
  onBack?: () => void
  isLoading?: boolean
  className?: string
  /** Optional dialog to render (e.g., UnsavedChangesDialog) */
  dialog?: React.ReactNode
}

interface WizardHeaderProps {
  currentStep: number
  totalSteps: number
  progress: number
  isFirstStep: boolean
  isLoading: boolean
  onBack?: () => void
}

function WizardHeader({
  currentStep,
  totalSteps,
  progress,
  isFirstStep,
  isLoading,
  onBack,
}: WizardHeaderProps) {
  return (
    <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/95 backdrop-blur dark:border-zinc-700 dark:bg-zinc-900/95">
      <div className="mx-auto max-w-2xl px-4 py-4">
        <div className="flex items-center justify-between">
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
          <div className="text-center">
            <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
              Step {currentStep} of {totalSteps}
            </span>
          </div>
          <div className="w-20" />
        </div>
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
  )
}

function LoadingOverlay() {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-white/80 dark:bg-zinc-900/80">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
    </div>
  )
}

export function WizardTaskLayout(props: WizardTaskLayoutProps) {
  const {
    currentStep,
    totalSteps,
    title,
    subtitle,
    children,
    onBack,
    isLoading = false,
    className,
    dialog,
  } = props
  const progress = (currentStep / totalSteps) * 100

  return (
    <div className={cn('flex min-h-screen flex-col bg-white dark:bg-zinc-900', className)}>
      <WizardHeader
        currentStep={currentStep}
        totalSteps={totalSteps}
        progress={progress}
        isFirstStep={currentStep === 1}
        isLoading={isLoading}
        onBack={onBack}
      />
      <main className="flex-1">
        <div className="mx-auto max-w-2xl px-4 py-8">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">{title}</h1>
            {subtitle && <p className="mt-2 text-zinc-600 dark:text-zinc-400">{subtitle}</p>}
          </div>
          <div className="relative">
            {isLoading && <LoadingOverlay />}
            {children}
          </div>
        </div>
      </main>
      {dialog}
    </div>
  )
}
