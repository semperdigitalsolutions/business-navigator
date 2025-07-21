import { useState, useEffect } from 'react';
import { supabase } from '~/lib/supabaseClient';
import { useAuthStore } from '~/stores/authStore';

export function useSubscription() {
  const [isSubscribed, setIsSubscribed] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (user) {
      checkSubscriptionStatus(user.id);
    }
  }, [user]);

  async function checkSubscriptionStatus(userId: string) {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('subscription_plan_id')
        .eq('id', userId)
        .single();

      if (error) throw error;

      setIsSubscribed(!!data?.subscription_plan_id);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return { isSubscribed, loading, error };
}
