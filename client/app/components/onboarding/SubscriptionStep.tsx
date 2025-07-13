import { useSubscriptionData } from '~/hooks/onboarding/useSubscriptionData';
import { useSubscriptionForm } from '~/hooks/onboarding/useSubscriptionForm';
import { Heading } from '~/ui-kit/catalyst/heading';
import { Button } from '~/ui-kit/catalyst/button';

export default function SubscriptionStep() {
  const { plans, loading: dataLoading, error: dataError } = useSubscriptionData();
  const { handleSelectPlan, loading: formLoading, error: formError } = useSubscriptionForm();

  if (dataLoading) {
    return <div>Loading plans...</div>;
  }

  if (dataError) {
    return <div className="text-red-600">{dataError}</div>;
  }

  return (
    <div className="max-w-4xl w-full space-y-8">
      <Heading level={2} className="text-center">Choose Your Plan</Heading>
      <p className="mt-2 text-center text-sm text-gray-600">
        Select a plan that best fits your business needs.
      </p>
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map(plan => (
          <div key={plan.id} className="border rounded-lg p-6 flex flex-col">
            <h3 className="text-lg font-semibold">{plan.name}</h3>
            <p className="mt-4 text-4xl font-bold">${plan.price}<span className="text-lg font-normal">/mo</span></p>
            <ul className="mt-6 space-y-4 text-sm text-gray-600 flex-grow">
              {plan.features.map(feature => (
                <li key={feature} className="flex items-center">
                  <svg className="h-5 w-5 text-green-500 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
            <Button onClick={() => handleSelectPlan(plan.id)} className="mt-8 w-full" disabled={formLoading}>
              {formLoading ? 'Selecting...' : 'Select Plan'}
            </Button>
          </div>
        ))}
      </div>
      {formError && <p className="mt-4 text-sm text-red-600 text-center">{formError}</p>}
    </div>
  );
}
