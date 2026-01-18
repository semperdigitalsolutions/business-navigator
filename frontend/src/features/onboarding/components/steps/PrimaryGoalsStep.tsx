/**
 * Step 4: Primary Goals
 * Multi-select checkboxes for business goals (1-5 selections)
 */
import { Checkbox, CheckboxField } from '@/components/catalyst-ui-kit/typescript/checkbox'
import { Field, Label } from '@/components/catalyst-ui-kit/typescript/fieldset'
import { Text } from '@/components/catalyst-ui-kit/typescript/text'
import type { OnboardingData } from '@shared/types'

interface PrimaryGoalsStepProps {
  data: Partial<OnboardingData>
  onChange: (data: Partial<OnboardingData>) => void
}

const goals = [
  { value: 'legal_compliance', label: 'Legal compliance & protection' },
  { value: 'financial_planning', label: 'Financial planning & bookkeeping' },
  { value: 'marketing_strategy', label: 'Marketing & customer acquisition' },
  { value: 'product_development', label: 'Product or service development' },
  { value: 'team_building', label: 'Hiring & team building' },
  { value: 'funding', label: 'Raising funding or investment' },
  { value: 'operations', label: 'Operations & processes' },
  { value: 'sales', label: 'Sales & revenue generation' },
  { value: 'customer_acquisition', label: 'Customer acquisition & retention' },
  { value: 'scaling', label: 'Scaling & growth' },
]

export function PrimaryGoalsStep({ data, onChange }: PrimaryGoalsStepProps) {
  const selectedGoals = data.primaryGoals || []
  const maxSelections = 5

  const handleToggleGoal = (goalValue: string) => {
    const currentGoals = [...selectedGoals]
    const index = currentGoals.indexOf(goalValue)

    if (index > -1) {
      // Remove if already selected
      currentGoals.splice(index, 1)
    } else {
      // Add if under max
      if (currentGoals.length < maxSelections) {
        currentGoals.push(goalValue)
      }
    }

    onChange({ primaryGoals: currentGoals })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-zinc-950 dark:text-white mb-2">
          What are your primary goals?
        </h2>
        <Text>Select up to {maxSelections} areas where you need the most help</Text>
      </div>

      <Field>
        <div className="flex items-center justify-between mb-4">
          <Label>
            Select your top priorities ({selectedGoals.length}/{maxSelections})
          </Label>
          {selectedGoals.length >= maxSelections && (
            <Text className="text-sm text-amber-600 dark:text-amber-400">
              Maximum {maxSelections} selections
            </Text>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {goals.map((goal) => {
            const isSelected = selectedGoals.includes(goal.value)
            const isDisabled = !isSelected && selectedGoals.length >= maxSelections

            return (
              <CheckboxField key={goal.value}>
                <Checkbox
                  name="primaryGoals"
                  value={goal.value}
                  checked={isSelected}
                  onChange={() => handleToggleGoal(goal.value)}
                  disabled={isDisabled}
                />
                <Label
                  className={`ml-3 ${
                    isDisabled
                      ? 'text-gray-400 dark:text-gray-600'
                      : 'text-zinc-950 dark:text-white'
                  }`}
                >
                  {goal.label}
                </Label>
              </CheckboxField>
            )
          })}
        </div>

        {selectedGoals.length === 0 && (
          <Text className="text-sm text-gray-500 dark:text-gray-400 mt-3">
            Please select at least one goal to continue
          </Text>
        )}
      </Field>
    </div>
  )
}
