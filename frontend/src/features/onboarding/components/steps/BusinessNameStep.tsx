/**
 * Step 1: Business Name (Optional)
 * Collects business name if user has one
 */
import { Field, Label } from '@/components/catalyst-ui-kit/typescript/fieldset'
import { Input } from '@/components/catalyst-ui-kit/typescript/input'
import { Text } from '@/components/catalyst-ui-kit/typescript/text'
import type { OnboardingData } from '@shared/types'

interface BusinessNameStepProps {
  data: Partial<OnboardingData>
  onChange: (data: Partial<OnboardingData>) => void
}

export function BusinessNameStep({ data, onChange }: BusinessNameStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-zinc-950 dark:text-white mb-2">
          Let's start with the basics
        </h2>
        <Text>What's your business name? (You can skip this if you haven't decided yet)</Text>
      </div>

      <Field>
        <Label>Business Name (Optional)</Label>
        <Input
          name="businessName"
          type="text"
          value={data.businessName || ''}
          onChange={(e) => onChange({ businessName: e.target.value })}
          placeholder="e.g., Acme Corporation"
          autoFocus
        />
        <Text className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          Don't worry if you haven't chosen a name yet. We'll help you with that later.
        </Text>
      </Field>
    </div>
  )
}
