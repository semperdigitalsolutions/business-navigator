import { useOnboardingForm } from '~/hooks/onboarding/useOnboardingForm';
import { useOnboardingData } from '~/hooks/onboarding/useOnboardingData';
import { Button } from '~/ui-kit/catalyst/button';
import { Field, Label } from '~/ui-kit/catalyst/fieldset';
import { Input } from '~/ui-kit/catalyst/input';
import { Select } from '~/ui-kit/catalyst/select';
import { Heading } from '~/ui-kit/catalyst/heading';

interface BusinessProfileStepProps {
  onComplete: () => void;
}

export default function BusinessProfileStep({ onComplete }: BusinessProfileStepProps) {
  const { formData, loading, error, handleChange, handleSubmit, handleSkip } = useOnboardingForm({ onComplete });
  const { industries, entityTypes, states, loading: dataLoading, error: dataError } = useOnboardingData();

  if (dataLoading) {
    return <div>Loading form...</div>;
  }

  if (dataError) {
    return <div className="text-red-600">{dataError}</div>;
  }

  return (
    <div className="max-w-2xl w-full space-y-8">
      <Heading level={2} className="text-center">Tell us about your business</Heading>
      <p className="mt-2 text-center text-sm text-gray-600">
        This helps us tailor your experience.
      </p>
      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        <Field>
          <Label>Business Name</Label>
          <Input name="business_name" value={formData.business_name} onChange={handleChange} required />
        </Field>
        <Field>
          <Label>Industry</Label>
          <Select name="industry" value={formData.industry} onChange={handleChange} disabled={dataLoading}>
            <option value="">Select an industry</option>
            {industries.map((industry) => (
              <option key={industry.id} value={industry.name}>{industry.name}</option>
            ))}
          </Select>
        </Field>
        <Field>
          <Label>Entity Type</Label>
          <Select name="entity_type" value={formData.entity_type} onChange={handleChange} disabled={dataLoading}>
            <option value="">Select an entity type</option>
            {entityTypes.map((type) => (
              <option key={type.id} value={type.name}>{type.name}</option>
            ))}
          </Select>
        </Field>
        <Field>
          <Label>State of Incorporation</Label>
          <Select name="state_of_incorporation" value={formData.state_of_incorporation} onChange={handleChange} disabled={dataLoading}>
            <option value="">Select a state</option>
            {states.map((state) => (
              <option key={state.id} value={state.name}>{state.name}</option>
            ))}
          </Select>
        </Field>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {dataError && <p className="text-sm text-red-600">{dataError}</p>}

        <div className="flex items-center justify-between">
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Continue'}
          </Button>
          <button type="button" onClick={handleSkip} className="text-sm font-medium text-indigo-600 hover:text-indigo-500" disabled={loading}>
            Unsure of the details? No worries, we can figure it out as we go.
          </button>
        </div>
      </form>
    </div>
  );
}
