import { Button } from '~/ui-kit/catalyst/button';
import { Field, Label } from '~/ui-kit/catalyst/fieldset';
import { Heading } from '~/ui-kit/catalyst/heading';
import { Input } from '~/ui-kit/catalyst/input';
import { Select } from '~/ui-kit/catalyst/select';
import { useOnboardingData } from '~/hooks/onboarding/useOnboardingData';
import { useOnboardingForm, UNDECIDED_OPTION } from '~/hooks/onboarding/useOnboardingForm';

export default function OnboardingPage() {
  const { industryOptions, entityTypeOptions, stateOptions, loading: dataLoading, error: dataError } = useOnboardingData();
  const {
    businessName, setBusinessName,
    industry, otherIndustry, setOtherIndustry,
    entityType, otherEntityType, setOtherEntityType,
    stateOfIncorporation, otherState, setOtherState,
    selectedIndustry,
    selectedEntityType,
    selectedState,
    loading: formLoading,
    error: formError,
    handleIndustryChange,
    handleEntityTypeChange,
    handleStateChange,
    handleSubmit,
  } = useOnboardingForm();

  if (dataLoading) {
    return <div>Loading form...</div>;
  }

  if (dataError) {
    return <div className="text-red-600">{dataError}</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <Heading level={1} className="text-center">Welcome!</Heading>
          <p className="mt-2 text-center text-sm text-gray-600">
            Let's set up your business profile to get started.
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <Field>
            <Label>Business Name</Label>
            <Input type="text" value={businessName} onChange={(e) => setBusinessName(e.target.value)} required />
          </Field>
          <Field>
            <Label>Industry</Label>
            <Select value={industry} onChange={(e) => handleIndustryChange(e, industryOptions)} required>
              <option value="" disabled>Select an industry</option>
              {industryOptions.map((option) => (
                <option key={option.name} value={option.name}>{option.name}</option>
              ))}
              <option value="Other">Other</option>
              <option value={UNDECIDED_OPTION}>{UNDECIDED_OPTION}</option>
            </Select>
            {industry === 'Other' && (
              <Input type="text" value={otherIndustry} onChange={(e) => setOtherIndustry(e.target.value)} placeholder="Please specify your industry" className="mt-2" required />
            )}
            {selectedIndustry && (
              <div className="mt-3 p-3 bg-gray-100 rounded-md border border-gray-200">
                <p className="text-sm text-gray-700">{selectedIndustry.description}</p>
                <ul className="mt-2 list-disc list-inside text-xs text-gray-600">
                  {selectedIndustry.examples.map(ex => <li key={ex}>{ex}</li>)}
                </ul>
              </div>
            )}
          </Field>
          <Field>
            <Label>Legal Entity Type</Label>
            <Select value={entityType} onChange={(e) => handleEntityTypeChange(e, entityTypeOptions)} required>
              <option value="" disabled>Select an entity type</option>
              {entityTypeOptions.map((option) => (
                <option key={option.name} value={option.name}>{option.name}</option>
              ))}
              <option value="Other">Other</option>
              <option value={UNDECIDED_OPTION}>{UNDECIDED_OPTION}</option>
            </Select>
            {entityType === 'Other' && (
              <Input type="text" value={otherEntityType} onChange={(e) => setOtherEntityType(e.target.value)} placeholder="Please specify your entity type" className="mt-2" required />
            )}
            {selectedEntityType && (
              <div className="mt-3 p-3 bg-gray-100 rounded-md border border-gray-200 space-y-3">
                <p className="text-sm text-gray-700">{selectedEntityType.description}</p>
                <div>
                  <p className="text-sm font-semibold text-gray-800">Key Features:</p>
                  <ul className="mt-1 list-disc list-inside text-xs text-gray-600">
                    {selectedEntityType.key_features.map(ex => <li key={ex}>{ex}</li>)}
                  </ul>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">Advantages:</p>
                  <ul className="mt-1 list-disc list-inside text-xs text-gray-600">
                    {selectedEntityType.advantages.map(ex => <li key={ex}>{ex}</li>)}
                  </ul>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">Considerations:</p>
                  <ul className="mt-1 list-disc list-inside text-xs text-gray-600">
                    {selectedEntityType.considerations.map(ex => <li key={ex}>{ex}</li>)}
                  </ul>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">Availability:</p>
                  <p className="mt-1 text-xs text-gray-600">{selectedEntityType.availability}</p>
                </div>
              </div>
            )}
          </Field>
          <Field>
            <Label>State of Incorporation</Label>
            <Select value={stateOfIncorporation} onChange={(e) => handleStateChange(e, stateOptions)} required>
              <option value="" disabled>Select a state</option>
              {stateOptions.map((option) => (
                <option key={option.name} value={option.name}>{option.name}</option>
              ))}
              <option value="Other">Other</option>
              <option value={UNDECIDED_OPTION}>{UNDECIDED_OPTION}</option>
            </Select>
            {stateOfIncorporation === 'Other' && (
              <Input type="text" value={otherState} onChange={(e) => setOtherState(e.target.value)} placeholder="Please specify your state" className="mt-2" required />
            )}
            {selectedState && (
              <div className="mt-3 p-3 bg-gray-100 rounded-md border border-gray-200">
                <p className="text-sm font-semibold text-gray-800">{selectedState.status}</p>
                <p className="mt-1 text-sm text-gray-700">{selectedState.notes}</p>
              </div>
            )}
          </Field>

          {formError && <p className="text-sm text-red-600">{formError}</p>}

          <div>
            <Button type="submit" className="w-full" disabled={formLoading}>
              {formLoading ? 'Saving...' : 'Complete Profile'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
