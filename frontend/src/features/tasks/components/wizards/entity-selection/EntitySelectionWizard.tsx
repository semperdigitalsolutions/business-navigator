/**
 * EntitySelectionWizard Component
 * Issue #76: Main wizard for entity type selection
 */
import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { WizardTaskLayout } from '../../WizardTaskLayout'
import { WizardStep } from '../../WizardStep'
import { UnsavedChangesDialog } from '@/components/ui/unsaved-changes-dialog'
import { useNavigationGuard } from '@/hooks/use-navigation-guard'
import { IntroStep } from './steps/IntroStep'
import { QuestionsStep } from './steps/QuestionsStep'
import { RecommendationStep, generateMockRecommendation } from './steps/RecommendationStep'
import { ComparisonStep } from './steps/ComparisonStep'
import { ConfirmationStep } from './steps/ConfirmationStep'
import {
  ENTITY_SELECTION_STEPS,
  INITIAL_ENTITY_SELECTION_DATA,
  STEP_DESCRIPTIONS,
  STEP_TITLES,
  type EntitySelectionData,
  type EntitySelectionStep,
  type EntityType,
  type EntitySelectionQuestions,
} from './types'

interface EntitySelectionWizardProps {
  /** Initial data (for resuming) */
  initialData?: Partial<EntitySelectionData>
  /** Callback when wizard completes */
  onComplete?: (data: EntitySelectionData) => Promise<void>
  /** Task ID for the backend */
  taskId?: string
}

export function EntitySelectionWizard({
  initialData,
  onComplete,
  taskId: _taskId = '11111111-1111-1111-1111-111111111101',
}: EntitySelectionWizardProps) {
  const navigate = useNavigate()
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [data, setData] = useState<EntitySelectionData>({
    ...INITIAL_ENTITY_SELECTION_DATA,
    ...initialData,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Track if user has made changes
  const hasChanges =
    data.questions.hasInvestors !== null ||
    data.questions.cofounderCount !== null ||
    data.selectedEntity !== null

  const currentStep = ENTITY_SELECTION_STEPS[currentStepIndex]
  const isFirstStep = currentStepIndex === 0
  const isLastStep = currentStepIndex === ENTITY_SELECTION_STEPS.length - 1

  // Save handler for navigation guard
  const handleSave = useCallback(async () => {
    // In a full implementation, this would save to the backend
    return true
  }, [])

  // Navigation guard for unsaved changes
  const { dialogProps } = useNavigationGuard({
    isDirty: hasChanges,
    onSave: handleSave,
    enabled: hasChanges,
  })

  const updateData = (updates: Partial<EntitySelectionData>) => {
    setData((prev) => ({ ...prev, ...updates }))
    setError(null)
  }

  const updateQuestions = (updates: Partial<EntitySelectionQuestions>) => {
    setData((prev) => ({
      ...prev,
      questions: { ...prev.questions, ...updates },
    }))
    setError(null)
  }

  const handleSelectEntity = (entityType: EntityType) => {
    updateData({ selectedEntity: entityType })
    // Move to confirmation step
    const confirmationIndex = ENTITY_SELECTION_STEPS.indexOf('confirmation')
    setCurrentStepIndex(confirmationIndex)
  }

  const goToNextStep = async () => {
    // Step-specific validation
    if (currentStep === 'questions') {
      if (!data.questions.hasInvestors || !data.questions.cofounderCount) {
        setError('Please answer the required questions')
        return
      }
      // Generate recommendation when moving from questions to recommendation
      const recommendation = generateMockRecommendation()
      updateData({ recommendation })
    }

    if (currentStep === 'recommendation' && !data.selectedEntity) {
      // User clicked next without selecting - use recommended option
      const recommended = data.recommendation?.recommended ?? 'llc'
      updateData({ selectedEntity: recommended })
    }

    if (isLastStep) {
      // Complete the wizard
      setIsLoading(true)
      try {
        if (onComplete) {
          await onComplete(data)
        }
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
      setError(null)
    }
  }

  const handleBack = () => {
    if (isFirstStep) {
      navigate('/tasks')
    } else {
      goToPrevStep()
    }
  }

  const goToStep = (step: EntitySelectionStep) => {
    const index = ENTITY_SELECTION_STEPS.indexOf(step)
    if (index !== -1) {
      setCurrentStepIndex(index)
    }
  }

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 'intro':
        return <IntroStep onContinue={goToNextStep} />
      case 'questions':
        return <QuestionsStep data={data.questions} onUpdate={updateQuestions} />
      case 'recommendation':
        return (
          <RecommendationStep
            recommendation={data.recommendation}
            onSelect={handleSelectEntity}
            onViewComparison={() => goToStep('comparison')}
          />
        )
      case 'comparison':
        return (
          <ComparisonStep
            recommendedType={data.recommendation?.recommended ?? null}
            onSelect={handleSelectEntity}
          />
        )
      case 'confirmation':
        return data.selectedEntity ? (
          <ConfirmationStep
            selectedEntity={data.selectedEntity}
            onConfirm={goToNextStep}
            onChangeSelection={() => goToStep('comparison')}
          />
        ) : null
      default:
        return null
    }
  }

  // Determine if next button should be disabled
  const isNextDisabled =
    currentStep === 'questions' && (!data.questions.hasInvestors || !data.questions.cofounderCount)

  // Determine if we should show built-in navigation
  const showBuiltInNav = currentStep === 'questions'

  return (
    <WizardTaskLayout
      currentStep={currentStepIndex + 1}
      totalSteps={ENTITY_SELECTION_STEPS.length}
      title={STEP_TITLES[currentStep]}
      subtitle={STEP_DESCRIPTIONS[currentStep]}
      onBack={handleBack}
      isLoading={isLoading}
      dialog={<UnsavedChangesDialog {...dialogProps} />}
    >
      {showBuiltInNav ? (
        <WizardStep
          stepNumber={currentStepIndex + 1}
          totalSteps={ENTITY_SELECTION_STEPS.length}
          title={STEP_TITLES[currentStep]}
          description={STEP_DESCRIPTIONS[currentStep]}
          onNext={goToNextStep}
          onBack={goToPrevStep}
          isLoading={isLoading}
          isNextDisabled={isNextDisabled}
        >
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}
          {renderStepContent()}
        </WizardStep>
      ) : (
        <div className="space-y-6">
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}
          {renderStepContent()}
        </div>
      )}
    </WizardTaskLayout>
  )
}
