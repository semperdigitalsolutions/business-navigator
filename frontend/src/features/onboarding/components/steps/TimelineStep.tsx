/**
 * Step 5: Timeline & Team Size
 * When they want to launch and team size
 */
import { Radio, RadioField, RadioGroup } from '@/components/catalyst-ui-kit/typescript/radio'
import { Field, Label } from '@/components/catalyst-ui-kit/typescript/fieldset'
import { Input } from '@/components/catalyst-ui-kit/typescript/input'
import { Text } from '@/components/catalyst-ui-kit/typescript/text'
import type { OnboardingData, Timeline } from '@shared/types'

interface TimelineStepProps {
  data: Partial<OnboardingData>
  onChange: (data: Partial<OnboardingData>) => void
}

const timelines: { value: Timeline; label: string; description: string }[] = [
  {
    value: 'asap',
    label: 'ASAP (Next 1-2 months)',
    description: 'Ready to launch quickly',
  },
  {
    value: 'soon',
    label: 'Soon (Next 3-6 months)',
    description: 'Planning to launch in the near future',
  },
  {
    value: 'later',
    label: 'Later (6+ months)',
    description: 'Taking time to plan and prepare',
  },
  {
    value: 'exploring',
    label: 'Just Exploring',
    description: 'Researching and considering options',
  },
]

export function TimelineStep({ data, onChange }: TimelineStepProps) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-zinc-950 dark:text-white mb-2">Timeline and team</h2>
        <Text>Help us understand your launch timeline and team structure</Text>
      </div>

      {/* Timeline */}
      <Field>
        <Label>When are you planning to launch?</Label>
        <RadioGroup
          name="timeline"
          value={data.timeline || ''}
          onChange={(value) => onChange({ timeline: value as Timeline })}
        >
          {timelines.map((timeline) => (
            <RadioField key={timeline.value}>
              <Radio value={timeline.value} />
              <div className="ml-3">
                <Label className="font-medium text-zinc-950 dark:text-white">
                  {timeline.label}
                </Label>
                <Text className="text-sm text-gray-500 dark:text-gray-400">
                  {timeline.description}
                </Text>
              </div>
            </RadioField>
          ))}
        </RadioGroup>
      </Field>

      {/* Team Size */}
      <Field>
        <Label>How many people are on your team?</Label>
        <Input
          name="teamSize"
          type="number"
          min="1"
          max="1000"
          value={data.teamSize || ''}
          onChange={(e) => onChange({ teamSize: parseInt(e.target.value, 10) || undefined })}
          placeholder="e.g., 1"
          autoFocus
        />
        <Text className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          Include yourself and any co-founders or employees
        </Text>
      </Field>
    </div>
  )
}
