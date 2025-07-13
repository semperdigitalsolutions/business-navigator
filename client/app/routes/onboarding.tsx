import { useState } from 'react';
import BusinessProfileStep from '~/components/onboarding/BusinessProfileStep';
import SubscriptionStep from '~/components/onboarding/SubscriptionStep';

export default function OnboardingPage() {
  const [step, setStep] = useState(1);

  const handleProfileComplete = () => {
    setStep(2);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      {step === 1 && <BusinessProfileStep onComplete={handleProfileComplete} />}
      {step === 2 && <SubscriptionStep />}
    </div>
  );
}
