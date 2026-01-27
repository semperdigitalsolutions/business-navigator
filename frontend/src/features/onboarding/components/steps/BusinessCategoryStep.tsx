/**
 * Step 2: Business Category & Current Stage
 * Collects business type and where they are in the journey
 */
import { Radio, RadioField, RadioGroup } from '@/components/catalyst-ui-kit/typescript/radio'
import { Field, Label } from '@/components/catalyst-ui-kit/typescript/fieldset'
import { Text } from '@/components/catalyst-ui-kit/typescript/text'
import type { OnboardingData, BusinessCategory, CurrentStage } from '@shared/types'

interface BusinessCategoryStepProps {
  data: Partial<OnboardingData>
  onChange: (data: Partial<OnboardingData>) => void
}

const categories: { value: BusinessCategory; label: string; description: string }[] = [
  {
    value: 'tech_saas',
    label: 'Tech/SaaS',
    description: 'Software, apps, or technology services',
  },
  {
    value: 'service',
    label: 'Service Business',
    description: 'Consulting, freelancing, or professional services',
  },
  {
    value: 'ecommerce',
    label: 'E-commerce',
    description: 'Online store or physical products',
  },
  {
    value: 'local',
    label: 'Local Business',
    description: 'Restaurant, retail, or brick-and-mortar',
  },
]

const stages: { value: CurrentStage; label: string; description: string }[] = [
  {
    value: 'idea',
    label: 'Just an Idea',
    description: 'Still exploring and validating the concept',
  },
  {
    value: 'planning',
    label: 'Planning Stage',
    description: 'Working on business plan and preparation',
  },
  {
    value: 'started',
    label: 'Already Started',
    description: 'Operating but not officially formed yet',
  },
]

export function BusinessCategoryStep({ data, onChange }: BusinessCategoryStepProps) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-zinc-950 dark:text-white mb-2">
          Tell us about your business
        </h2>
        <Text>This helps us tailor our guidance to your specific needs</Text>
      </div>

      {/* Business Category */}
      <Field>
        <Label>What type of business are you starting?</Label>
        <RadioGroup
          name="businessCategory"
          value={data.businessCategory || ''}
          onChange={(value) => onChange({ businessCategory: value as BusinessCategory })}
        >
          {categories.map((category) => (
            <RadioField key={category.value}>
              <Radio value={category.value} />
              <div className="ml-3">
                <Label className="font-medium text-zinc-950 dark:text-white">
                  {category.label}
                </Label>
                <Text className="text-sm text-gray-500 dark:text-gray-400">
                  {category.description}
                </Text>
              </div>
            </RadioField>
          ))}
        </RadioGroup>
      </Field>

      {/* Current Stage */}
      <Field>
        <Label>What stage are you at?</Label>
        <RadioGroup
          name="currentStage"
          value={data.currentStage || ''}
          onChange={(value) => onChange({ currentStage: value as CurrentStage })}
        >
          {stages.map((stage) => (
            <RadioField key={stage.value}>
              <Radio value={stage.value} />
              <div className="ml-3">
                <Label className="font-medium text-zinc-950 dark:text-white">{stage.label}</Label>
                <Text className="text-sm text-gray-500 dark:text-gray-400">
                  {stage.description}
                </Text>
              </div>
            </RadioField>
          ))}
        </RadioGroup>
      </Field>
    </div>
  )
}
