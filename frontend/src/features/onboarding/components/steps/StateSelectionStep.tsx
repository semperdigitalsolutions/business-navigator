/**
 * Step 3: State Selection
 * Searchable dropdown for selecting US state
 */
import { useState, useMemo } from 'react'
import { Field, Label } from '@/components/catalyst-ui-kit/typescript/fieldset'
import { Input } from '@/components/catalyst-ui-kit/typescript/input'
import { Text } from '@/components/catalyst-ui-kit/typescript/text'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import type { OnboardingData } from '@shared/types'

interface StateSelectionStepProps {
  data: Partial<OnboardingData>
  onChange: (data: Partial<OnboardingData>) => void
}

const US_STATES = [
  { code: 'AL', name: 'Alabama' },
  { code: 'AK', name: 'Alaska' },
  { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' },
  { code: 'CA', name: 'California' },
  { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' },
  { code: 'DE', name: 'Delaware' },
  { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' },
  { code: 'HI', name: 'Hawaii' },
  { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' },
  { code: 'IN', name: 'Indiana' },
  { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' },
  { code: 'KY', name: 'Kentucky' },
  { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' },
  { code: 'MD', name: 'Maryland' },
  { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' },
  { code: 'MN', name: 'Minnesota' },
  { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' },
  { code: 'MT', name: 'Montana' },
  { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' },
  { code: 'NH', name: 'New Hampshire' },
  { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' },
  { code: 'NY', name: 'New York' },
  { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' },
  { code: 'OH', name: 'Ohio' },
  { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' },
  { code: 'PA', name: 'Pennsylvania' },
  { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' },
  { code: 'SD', name: 'South Dakota' },
  { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' },
  { code: 'UT', name: 'Utah' },
  { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' },
  { code: 'WA', name: 'Washington' },
  { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' },
  { code: 'WY', name: 'Wyoming' },
  { code: 'DC', name: 'Washington, D.C.' },
]

export function StateSelectionStep({ data, onChange }: StateSelectionStepProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredStates = useMemo(() => {
    if (!searchQuery.trim()) return US_STATES

    const query = searchQuery.toLowerCase()
    return US_STATES.filter(
      (state) =>
        state.name.toLowerCase().includes(query) || state.code.toLowerCase().includes(query)
    )
  }, [searchQuery])

  const selectedState = US_STATES.find((s) => s.code === data.stateCode)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-zinc-950 dark:text-white mb-2">
          Where will you form your business?
        </h2>
        <Text>Select the state where you plan to register your business</Text>
      </div>

      <Field>
        <Label>State</Label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
          <Input
            type="text"
            placeholder="Search states..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            autoFocus
          />
        </div>

        {selectedState && (
          <div className="mt-2 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
            <Text className="text-sm font-medium text-indigo-900 dark:text-indigo-100">
              Selected: {selectedState.name} ({selectedState.code})
            </Text>
          </div>
        )}

        <div className="mt-3 max-h-96 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
          {filteredStates.length > 0 ? (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredStates.map((state) => (
                <button
                  key={state.code}
                  type="button"
                  onClick={() => onChange({ stateCode: state.code })}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                    data.stateCode === state.code
                      ? 'bg-indigo-50 dark:bg-indigo-900/20 border-l-4 border-indigo-600'
                      : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-zinc-950 dark:text-white">
                      {state.name}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{state.code}</span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
              <Text>No states found matching "{searchQuery}"</Text>
            </div>
          )}
        </div>

        <Text className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          Tip: Delaware and Wyoming are popular for their business-friendly laws, but most founders
          choose their home state.
        </Text>
      </Field>
    </div>
  )
}
