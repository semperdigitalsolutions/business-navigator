import { useState, useEffect } from 'react';
import BusinessProfileStep from '~/components/onboarding/BusinessProfileStep';
import SubscriptionStep from '~/components/onboarding/SubscriptionStep';
import { useAuthStore } from '~/stores/authStore';

export default function OnboardingPage() {
  const { onboardingCompleted } = useAuthStore();
  const [step, setStep] = useState(onboardingCompleted ? 2 : 1);

  useEffect(() => {
    if (onboardingCompleted) {
      setStep(2);
    }
  }, [onboardingCompleted]);

  const handleProfileComplete = () => {
    setStep(2);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      {onboardingCompleted === false && step === 1 && <BusinessProfileStep onComplete={handleProfileComplete} />}
      {(onboardingCompleted || step === 2) && <SubscriptionStep />}
    </div>
  );
}
