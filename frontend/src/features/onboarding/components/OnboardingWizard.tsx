/**
 * OnboardingWizard Component
 * Main container for 6-step onboarding wizard
 * Features: Auto-save, progress tracking, dual persistence
 */
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/catalyst-ui-kit/typescript/button'
import { useOnboardingStore } from '../hooks/useOnboardingStore'
import { useAuthStore } from '@/features/auth/hooks/useAuthStore'
import { onboardingApi } from '../api/onboarding.api'
import { OnboardingProgress } from './OnboardingProgress'
import { OnboardingCompletion } from './OnboardingCompletion'
import { BusinessNameStep } from './steps/BusinessNameStep'
import { BusinessCategoryStep } from './steps/BusinessCategoryStep'
import { StateSelectionStep } from './steps/StateSelectionStep'
import { PrimaryGoalsStep } from './steps/PrimaryGoalsStep'
import { TimelineStep } from './steps/TimelineStep'
import { FinalDetailsStep } from './steps/FinalDetailsStep'

export function OnboardingWizard() {
  const navigate = useNavigate()
  const updateUser = useAuthStore((state) => state.updateUser)
  const {
    data,
    currentStep,
    stepsCompleted,
    isCompleted,
    setData,
    setCurrentStep,
    markStepCompleted,
    setSaving,
    setCompleted,
  } = useOnboardingStore()

  const [error, setError] = useState<string | null>(null)
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false)

  // Auto-save with debounce
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (currentStep > 0 && !isCompleted) {
        try {
          setSaving(true)
          await onboardingApi.saveProgress({
            data,
            currentStep,
            completedSteps: stepsCompleted,
          })
        } catch (err) {
          console.error('Auto-save failed:', err)
        } finally {
          setSaving(false)
        }
      }
    }, 2000) // 2 second debounce

    return () => clearTimeout(timeoutId)
  }, [data, currentStep, stepsCompleted, isCompleted, setSaving])

  const handleNext = () => {
    if (isStepValid(currentStep)) {
      markStepCompleted(currentStep)
      if (currentStep < 6) {
        setCurrentStep(currentStep + 1)
      } else {
        // Final step - complete onboarding
        handleComplete()
      }
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSkip = () => {
    if (currentStep < 6) {
      setCurrentStep(currentStep + 1)
    }
  }

  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 1:
        // Business name is optional
        return true
      case 2:
        return !!data.businessCategory && !!data.currentStage
      case 3:
        return !!data.stateCode
      case 4:
        return !!data.primaryGoals && data.primaryGoals.length > 0
      case 5:
        return !!data.timeline && !!data.teamSize
      case 6:
        return !!data.fundingApproach && !!data.previousExperience && !!data.primaryConcern
      default:
        return true
    }
  }

  const handleComplete = async () => {
    setError(null)
    setIsGeneratingPlan(true)

    try {
      const response = await onboardingApi.complete({ data })

      if (response.success) {
        setCompleted()
        // Update auth store to mark onboarding as completed
        updateUser({
          onboardingCompleted: true,
          onboardingCompletedAt: new Date(),
        })
        // Plan generated successfully
        setTimeout(() => {
          setIsGeneratingPlan(false)
        }, 2000) // Show success for 2 seconds
      } else {
        throw new Error(response.error || 'Failed to complete onboarding')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete onboarding')
      setIsGeneratingPlan(false)
    }
  }

  const handleContinueToDashboard = () => {
    navigate('/dashboard')
  }

  // Show completion screen if onboarding is completed
  if (isCompleted || isGeneratingPlan) {
    return (
      <OnboardingCompletion
        isGeneratingPlan={isGeneratingPlan}
        onContinueToDashboard={handleContinueToDashboard}
      />
    )
  }

  // Render current step
  const renderStep = () => {
    const stepProps = {
      data,
      onChange: setData,
    }

    switch (currentStep) {
      case 1:
        return <BusinessNameStep {...stepProps} />
      case 2:
        return <BusinessCategoryStep {...stepProps} />
      case 3:
        return <StateSelectionStep {...stepProps} />
      case 4:
        return <PrimaryGoalsStep {...stepProps} />
      case 5:
        return <TimelineStep {...stepProps} />
      case 6:
        return <FinalDetailsStep {...stepProps} />
      default:
        return null
    }
  }

  const canGoNext = isStepValid(currentStep)
  const canSkip = currentStep === 1 // Only business name is skippable

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-900 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Progress Indicator */}
        <div className="mb-12">
          <OnboardingProgress
            currentStep={currentStep}
            completedSteps={stepsCompleted}
            totalSteps={6}
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Step Content */}
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm p-8 mb-8">
          {renderStep()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between">
          <Button type="button" onClick={handleBack} color="white" disabled={currentStep === 1}>
            Back
          </Button>

          <div className="flex items-center gap-3">
            {canSkip && (
              <Button type="button" onClick={handleSkip} color="white">
                Skip
              </Button>
            )}
            <Button type="button" onClick={handleNext} color="indigo" disabled={!canGoNext}>
              {currentStep === 6 ? 'Complete' : 'Continue'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
