/**
 * QuestionsStep Component
 * Issue #76: Questions step for entity selection wizard
 */
import { RadioGroup, RadioField, Radio } from '@/components/catalyst-ui-kit/typescript/radio'
import { Label, Description } from '@/components/catalyst-ui-kit/typescript/fieldset'
import { cn } from '@/utils/classnames'
import type {
  EntitySelectionQuestions,
  InvestorAnswer,
  CofounderAnswer,
  RevenueRange,
} from '../types'

interface QuestionsStepProps {
  data: EntitySelectionQuestions
  onUpdate: (data: Partial<EntitySelectionQuestions>) => void
}

interface QuestionSectionProps {
  title: string
  description?: string
  children: React.ReactNode
}

function QuestionSection({ title, description, children }: QuestionSectionProps) {
  return (
    <div className="space-y-3">
      <div>
        <h3 className="font-medium text-zinc-900 dark:text-white">{title}</h3>
        {description && (
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{description}</p>
        )}
      </div>
      {children}
    </div>
  )
}

interface RadioOptionProps {
  value: string
  label: string
  description?: string
}

function RadioOption({ value, label, description }: RadioOptionProps) {
  return (
    <RadioField
      className={cn(
        'rounded-lg border border-zinc-200 p-3 transition-colors',
        'has-[[data-checked]]:border-blue-500 has-[[data-checked]]:bg-blue-50',
        'dark:border-zinc-700 dark:has-[[data-checked]]:border-blue-500',
        'dark:has-[[data-checked]]:bg-blue-900/20'
      )}
    >
      <Radio value={value} color="blue" />
      <Label className="cursor-pointer">{label}</Label>
      {description && <Description>{description}</Description>}
    </RadioField>
  )
}

export function QuestionsStep({ data, onUpdate }: QuestionsStepProps) {
  return (
    <div className="space-y-8">
      {/* Question 1: Investors */}
      <QuestionSection
        title="Will you have outside investors?"
        description="This includes venture capital, angel investors, or other equity investors."
      >
        <RadioGroup
          value={data.hasInvestors ?? ''}
          onChange={(value: InvestorAnswer) => onUpdate({ hasInvestors: value })}
        >
          <RadioOption value="yes" label="Yes" description="I plan to raise funding" />
          <RadioOption value="no" label="No" description="I will self-fund or bootstrap" />
          <RadioOption value="not_sure" label="Not sure yet" />
        </RadioGroup>
      </QuestionSection>

      {/* Question 2: Co-founders */}
      <QuestionSection
        title="How many co-founders will you have?"
        description="Include yourself in the count."
      >
        <RadioGroup
          value={data.cofounderCount ?? ''}
          onChange={(value: CofounderAnswer) => onUpdate({ cofounderCount: value })}
        >
          <RadioOption value="just_me" label="Just me" description="Solo founder" />
          <RadioOption value="2_to_3" label="2-3 people" description="Small founding team" />
          <RadioOption value="4_plus" label="4 or more" description="Larger founding team" />
        </RadioGroup>
      </QuestionSection>

      {/* Question 3: Revenue (optional) */}
      <QuestionSection
        title="Expected first-year revenue?"
        description="Optional - helps us refine our recommendation."
      >
        <RadioGroup
          value={data.expectedRevenue ?? ''}
          onChange={(value: RevenueRange) => onUpdate({ expectedRevenue: value || null })}
        >
          <RadioOption value="under_50k" label="Under $50,000" />
          <RadioOption value="50k_to_200k" label="$50,000 - $200,000" />
          <RadioOption value="over_200k" label="Over $200,000" />
        </RadioGroup>
        <button
          type="button"
          onClick={() => onUpdate({ expectedRevenue: null })}
          className={cn(
            'mt-2 text-sm text-zinc-500 underline transition-colors',
            'hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300'
          )}
        >
          Skip this question
        </button>
      </QuestionSection>
    </div>
  )
}
