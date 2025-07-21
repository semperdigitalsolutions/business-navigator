import { useState } from 'react';
import { useNavigate } from 'react-router';
import { supabase } from '~/lib/supabaseClient';
import { useAuthStore } from '~/stores/authStore';

export function useSubscriptionForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const user = useAuthStore((state) => state.user);
  const setSubscriptionStatus = useAuthStore((state) => state.setSubscriptionStatus);
  const navigate = useNavigate();

  const handleSelectPlan = async (planId: string) => {
    setLoading(true);
    setError(null);

    if (!user) {
      setError('You must be logged in to select a plan.');
      setLoading(false);
      return;
    }

    const { error } = await supabase
      .from('users')
      .update({ subscription_plan_id: planId })
      .eq('id', user.id);

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setLoading(false);
      setSubscriptionStatus(true);
      navigate('/home');
    }
  };

  return { handleSelectPlan, loading, error };
}
