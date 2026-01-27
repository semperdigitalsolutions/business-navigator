/**
 * OnboardingProgress Component
 * Progress indicator for 6-step onboarding wizard
 */
import { CheckIcon } from '@heroicons/react/24/solid'

interface OnboardingProgressProps {
  currentStep: number
  completedSteps: number[]
  totalSteps?: number
}

export function OnboardingProgress({
  currentStep,
  completedSteps,
  totalSteps = 6,
}: OnboardingProgressProps) {
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1)
  const progressPercentage = Math.round((completedSteps.length / totalSteps) * 100)

  return (
    <div className="w-full">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-gray-700 dark:text-gray-300 font-medium">
            Step {currentStep} of {totalSteps}
          </span>
          <span className="text-gray-500 dark:text-gray-400">{progressPercentage}% complete</span>
        </div>
        <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-600 transition-all duration-300 ease-in-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Step indicators */}
      <nav aria-label="Progress" className="hidden sm:block">
        <ol className="flex items-center justify-between">
          {steps.map((step, index) => {
            const isCompleted = completedSteps.includes(step)
            const isCurrent = step === currentStep
            const isAccessible = step <= currentStep || isCompleted

            return (
              <li key={step} className="relative flex-1">
                {/* Connector line */}
                {index !== 0 && (
                  <div
                    className={`absolute top-4 -left-1/2 w-full h-0.5 ${
                      isCompleted || step < currentStep
                        ? 'bg-indigo-600'
                        : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                    aria-hidden="true"
                  />
                )}

                <div className="relative flex flex-col items-center group">
                  {/* Step circle */}
                  <div
                    className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-200 ${
                      isCompleted
                        ? 'bg-indigo-600 border-indigo-600'
                        : isCurrent
                          ? 'bg-white dark:bg-zinc-900 border-indigo-600'
                          : isAccessible
                            ? 'bg-white dark:bg-zinc-900 border-gray-300 dark:border-gray-600'
                            : 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckIcon className="w-5 h-5 text-white" aria-hidden="true" />
                    ) : (
                      <span
                        className={`text-sm font-medium ${
                          isCurrent
                            ? 'text-indigo-600'
                            : isAccessible
                              ? 'text-gray-500 dark:text-gray-400'
                              : 'text-gray-300 dark:text-gray-600'
                        }`}
                      >
                        {step}
                      </span>
                    )}
                  </div>

                  {/* Step label (visible on hover) */}
                  <span
                    className={`mt-2 text-xs font-medium ${
                      isCurrent
                        ? 'text-indigo-600'
                        : isCompleted
                          ? 'text-gray-700 dark:text-gray-300'
                          : 'text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {step === 1 && 'Basics'}
                    {step === 2 && 'Category'}
                    {step === 3 && 'Location'}
                    {step === 4 && 'Goals'}
                    {step === 5 && 'Timeline'}
                    {step === 6 && 'Details'}
                  </span>
                </div>
              </li>
            )
          })}
        </ol>
      </nav>

      {/* Mobile step indicator */}
      <div className="sm:hidden flex items-center justify-center gap-2">
        {steps.map((step) => (
          <div
            key={step}
            className={`h-2 w-2 rounded-full transition-all duration-200 ${
              completedSteps.includes(step) || step === currentStep
                ? 'bg-indigo-600 w-8'
                : 'bg-gray-300 dark:bg-gray-600'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
