/**
 * BusinessNameWizard Component
 * Issue #88: Wizard for selecting and validating a business name
 */
import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { WizardTaskLayout } from '../../WizardTaskLayout'
import { WizardStep } from '../../WizardStep'
import { UnsavedChangesDialog } from '@/components/ui/unsaved-changes-dialog'
import { useNavigationGuard } from '@/hooks/use-navigation-guard'
import { BrainstormStep } from './steps/BrainstormStep'
import { ValidateStep } from './steps/ValidateStep'
import { ConfirmStep } from './steps/ConfirmStep'
import {
  BUSINESS_NAME_STEPS,
  INITIAL_BUSINESS_NAME_DATA,
  STEP_DESCRIPTIONS,
  STEP_TITLES,
  type BusinessNameData,
} from './types'

interface BusinessNameWizardProps {
  /** Initial data (for resuming) */
  initialData?: Partial<BusinessNameData>
  /** Callback when wizard completes */
  onComplete?: (data: BusinessNameData) => Promise<void>
  /** Task ID for the backend */
  taskId?: string
}

export function BusinessNameWizard({
  initialData,
  onComplete,
  taskId: _taskId = '11111111-1111-1111-1111-111111111108',
}: BusinessNameWizardProps) {
  const navigate = useNavigate()
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [data, setData] = useState<BusinessNameData>({
    ...INITIAL_BUSINESS_NAME_DATA,
    ...initialData,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Track if user has made changes
  const hasChanges =
    data.nameIdeas.length > 0 ||
    data.selectedName !== '' ||
    data.domainChecked ||
    data.trademarkAcknowledged ||
    data.notes !== ''

  const currentStep = BUSINESS_NAME_STEPS[currentStepIndex]
  const isFirstStep = currentStepIndex === 0
  const isLastStep = currentStepIndex === BUSINESS_NAME_STEPS.length - 1

  // Save handler for navigation guard
  const handleSave = useCallback(async () => {
    // In a full implementation, this would save to the backend
    // For now, just resolve successfully
    return true
  }, [])

  // Navigation guard for unsaved changes
  const { dialogProps } = useNavigationGuard({
    isDirty: hasChanges,
    onSave: handleSave,
    enabled: hasChanges,
  })

  const updateData = (updates: Partial<BusinessNameData>) => {
    setData((prev) => ({ ...prev, ...updates }))
    setError(null)
  }

  const goToNextStep = async () => {
    // Validation
    if (currentStep === 'brainstorm' && !data.selectedName) {
      setError('Please select a business name before continuing')
      return
    }

    if (isLastStep) {
      // Complete the wizard
      setIsLoading(true)
      try {
        if (onComplete) {
          await onComplete(data)
        }
        // Navigate back to tasks
        navigate('/tasks')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to save')
      } finally {
        setIsLoading(false)
      }
    } else {
      setCurrentStepIndex((prev) => prev + 1)
    }
  }

  const goToPrevStep = () => {
    if (!isFirstStep) {
      setCurrentStepIndex((prev) => prev - 1)
    }
  }

  const handleBack = () => {
    if (isFirstStep) {
      navigate('/tasks')
    } else {
      goToPrevStep()
    }
  }

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 'brainstorm':
        return <BrainstormStep data={data} onUpdate={updateData} />
      case 'validate':
        return <ValidateStep data={data} onUpdate={updateData} />
      case 'confirm':
        return <ConfirmStep data={data} onUpdate={updateData} />
      default:
        return null
    }
  }

  // Determine if next button should be disabled
  const isNextDisabled = currentStep === 'brainstorm' && !data.selectedName

  return (
    <WizardTaskLayout
      currentStep={currentStepIndex + 1}
      totalSteps={BUSINESS_NAME_STEPS.length}
      title="Select Your Business Name"
      subtitle="Choose a memorable, available name for your business"
      onBack={handleBack}
      isLoading={isLoading}
      dialog={<UnsavedChangesDialog {...dialogProps} />}
    >
      <WizardStep
        stepNumber={currentStepIndex + 1}
        totalSteps={BUSINESS_NAME_STEPS.length}
        title={STEP_TITLES[currentStep]}
        description={STEP_DESCRIPTIONS[currentStep]}
        onNext={goToNextStep}
        onBack={goToPrevStep}
        isLoading={isLoading}
        isNextDisabled={isNextDisabled}
        nextLabel={isLastStep ? 'Save & Complete' : undefined}
      >
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}
        {renderStepContent()}
      </WizardStep>
    </WizardTaskLayout>
  )
}
