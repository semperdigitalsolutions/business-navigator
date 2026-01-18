/**
 * OnboardingCompletion Component
 * Shows success screen with AI plan generation progress
 */
import { CheckCircleIcon, SparklesIcon } from '@heroicons/react/24/solid'
import { Button } from '@/components/catalyst-ui-kit/typescript/button'
import { Text } from '@/components/catalyst-ui-kit/typescript/text'

interface OnboardingCompletionProps {
  isGeneratingPlan: boolean
  onContinueToDashboard: () => void
}

export function OnboardingCompletion({
  isGeneratingPlan,
  onContinueToDashboard,
}: OnboardingCompletionProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-900 px-4">
      <div className="max-w-md w-full text-center space-y-6">
        {isGeneratingPlan ? (
          <>
            {/* Generating AI Plan */}
            <div className="relative inline-flex">
              <div className="absolute inset-0 bg-indigo-200 dark:bg-indigo-800 rounded-full animate-ping opacity-75" />
              <div className="relative bg-indigo-600 p-6 rounded-full">
                <SparklesIcon className="h-12 w-12 text-white animate-pulse" />
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-zinc-950 dark:text-white mb-2">
                Creating Your Business Plan
              </h2>
              <Text className="text-lg text-gray-600 dark:text-gray-300">
                Our AI is analyzing your responses and generating a customized roadmap for your
                business formation...
              </Text>
            </div>

            <div className="space-y-2 pt-4">
              <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
              <Text className="text-sm text-gray-500 dark:text-gray-400">
                This usually takes about 10-15 seconds
              </Text>
            </div>
          </>
        ) : (
          <>
            {/* Success - Plan Ready */}
            <div className="relative inline-flex">
              <div className="bg-green-600 p-6 rounded-full">
                <CheckCircleIcon className="h-12 w-12 text-white" />
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-zinc-950 dark:text-white mb-2">
                You're All Set!
              </h2>
              <Text className="text-lg text-gray-600 dark:text-gray-300">
                We've created a personalized business formation roadmap tailored to your needs.
                Let's get started on your entrepreneurial journey!
              </Text>
            </div>

            <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-6 text-left space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircleIcon className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <Text className="font-medium text-zinc-950 dark:text-white">
                    Customized Task Roadmap
                  </Text>
                  <Text className="text-sm text-gray-600 dark:text-gray-400">
                    Step-by-step guidance from formation to launch
                  </Text>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircleIcon className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <Text className="font-medium text-zinc-950 dark:text-white">
                    AI Business Assistant
                  </Text>
                  <Text className="text-sm text-gray-600 dark:text-gray-400">
                    Legal, financial, and operational advice on demand
                  </Text>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircleIcon className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <Text className="font-medium text-zinc-950 dark:text-white">
                    Progress Tracking
                  </Text>
                  <Text className="text-sm text-gray-600 dark:text-gray-400">
                    Monitor your confidence score as you complete tasks
                  </Text>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <Button onClick={onContinueToDashboard} color="indigo" className="w-full">
                Continue to Dashboard
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
