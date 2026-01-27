/**
 * Step 7: Final Details
 * Funding approach, experience, and primary concerns
 */
import { Radio, RadioField, RadioGroup } from '@/components/catalyst-ui-kit/typescript/radio'
import { Field, Label } from '@/components/catalyst-ui-kit/typescript/fieldset'
import { Text } from '@/components/catalyst-ui-kit/typescript/text'
import type {
  OnboardingData,
  FundingApproach,
  PreviousExperience,
  PrimaryConcern,
} from '@shared/types'

interface FinalDetailsStepProps {
  data: Partial<OnboardingData>
  onChange: (data: Partial<OnboardingData>) => void
}

const fundingOptions: { value: FundingApproach; label: string }[] = [
  { value: 'personal_savings', label: 'Personal savings' },
  { value: 'investment', label: 'Seeking investment or venture capital' },
  { value: 'loan', label: 'Business loan or financing' },
  { value: 'multiple', label: 'Multiple sources' },
  { value: 'none', label: 'Not planning to raise funds' },
]

const experiences: { value: PreviousExperience; label: string }[] = [
  { value: 'first_business', label: 'This is my first business' },
  { value: 'experienced', label: 'I have started businesses before' },
]

const concerns: { value: PrimaryConcern; label: string; description: string }[] = [
  { value: 'legal', label: 'Legal compliance', description: 'Formation, contracts, regulations' },
  { value: 'financial', label: 'Financial setup', description: 'Accounting, taxes, funding' },
  { value: 'marketing', label: 'Marketing', description: 'Finding and reaching customers' },
  { value: 'product', label: 'Product/Service', description: 'Building and refining offering' },
  { value: 'time', label: 'Time management', description: 'Balancing priorities and tasks' },
]

export function FinalDetailsStep({ data, onChange }: FinalDetailsStepProps) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-zinc-950 dark:text-white mb-2">Final details</h2>
        <Text>Just a few more questions to personalize your experience</Text>
      </div>

      {/* Funding Approach */}
      <Field>
        <Label>How do you plan to fund your business?</Label>
        <RadioGroup
          name="fundingApproach"
          value={data.fundingApproach || ''}
          onChange={(value) => onChange({ fundingApproach: value as FundingApproach })}
        >
          {fundingOptions.map((option) => (
            <RadioField key={option.value}>
              <Radio value={option.value} />
              <Label className="ml-3 text-zinc-950 dark:text-white">{option.label}</Label>
            </RadioField>
          ))}
        </RadioGroup>
      </Field>

      {/* Previous Experience */}
      <Field>
        <Label>Have you started a business before?</Label>
        <RadioGroup
          name="previousExperience"
          value={data.previousExperience || ''}
          onChange={(value) => onChange({ previousExperience: value as PreviousExperience })}
        >
          {experiences.map((exp) => (
            <RadioField key={exp.value}>
              <Radio value={exp.value} />
              <Label className="ml-3 text-zinc-950 dark:text-white">{exp.label}</Label>
            </RadioField>
          ))}
        </RadioGroup>
      </Field>

      {/* Primary Concern */}
      <Field>
        <Label>What's your biggest concern right now?</Label>
        <RadioGroup
          name="primaryConcern"
          value={data.primaryConcern || ''}
          onChange={(value) => onChange({ primaryConcern: value as PrimaryConcern })}
        >
          {concerns.map((concern) => (
            <RadioField key={concern.value}>
              <Radio value={concern.value} />
              <div className="ml-3">
                <Label className="font-medium text-zinc-950 dark:text-white">{concern.label}</Label>
                <Text className="text-sm text-gray-500 dark:text-gray-400">
                  {concern.description}
                </Text>
              </div>
            </RadioField>
          ))}
        </RadioGroup>
      </Field>
    </div>
  )
}
