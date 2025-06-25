import { useEffect } from 'react';
import { useSubscriptionStore } from '~/stores/subscriptionStore';
import { useAuthStore } from '~/stores/authStore';
import { Heading } from '~/ui-kit/catalyst/heading';
import { Button } from '~/ui-kit/catalyst/button';

const plans = [
  {
    id: 'free',
    name: 'Free Tier',
    price: '$0/mo',
    features: ['Access to core modules', 'Basic progress tracking', 'Community support'],
    stripePriceId: null, // No checkout for the free plan
  },
  {
    id: 'pro',
    name: 'Pro Tier',
    price: '$25/mo',
    features: [
      'Access to all modules',
      'Advanced progress tracking',
      'AI-powered assistance',
      'Priority support',
    ],
    stripePriceId: import.meta.env.VITE_STRIPE_PRO_PLAN_ID,
  },
];

export default function PricingPage() {
  const { user } = useAuthStore();
  const { subscription, loading, error, fetchSubscription, redirectToCheckout } = useSubscriptionStore();

  useEffect(() => {
    if (user) {
      fetchSubscription(user.id);
    }
  }, [user, fetchSubscription]);

  const handleChoosePlan = (planId: string) => {
    if (!user) {
      console.error('User must be logged in to choose a plan.');
      // Optionally, you can redirect to a login page here.
      return;
    }
    const selectedPlan = plans.find(p => p.id === planId);
    if (selectedPlan && selectedPlan.stripePriceId) {
      redirectToCheckout(selectedPlan.stripePriceId, user.email!);
    } else {
      console.log('No Stripe Price ID for this plan or plan not found.');
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Heading level={1} className="text-center">Choose Your Plan</Heading>
      <p className="mt-2 text-center text-lg text-gray-600">Select the plan that best fits your business needs.</p>

      {loading && <p className="text-center mt-8">Loading your subscription details...</p>}
      {error && <p className="text-center mt-8 text-red-600">Error: {error}</p>}

      <div className="mt-8 grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
        {plans.map(plan => (
          <div key={plan.id} className={`p-8 border rounded-lg shadow-lg flex flex-col ${subscription?.plan_id === plan.id ? 'border-blue-500' : 'border-gray-200'}`}>
            <h3 className="text-2xl font-semibold">{plan.name}</h3>
            <p className="mt-4 text-4xl font-bold">{plan.price}</p>
            <ul className="mt-6 space-y-4 text-gray-600 flex-grow">
              {plan.features.map(feature => (
                <li key={feature} className="flex items-center">
                  <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <Button 
              onClick={() => handleChoosePlan(plan.id)}
              disabled={subscription?.plan_id === plan.id}
              className="mt-8 w-full"
            >
              {subscription?.plan_id === plan.id ? 'Current Plan' : 'Choose Plan'}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
