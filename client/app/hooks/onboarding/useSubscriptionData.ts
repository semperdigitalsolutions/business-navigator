import { useState, useEffect } from 'react';
import { supabase } from '~/lib/supabaseClient';

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  features: string[];
  project_limit: number;
  ai_credit_limit: number;
}

export function useSubscriptionData() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPlans() {
      try {
        const { data, error } = await supabase.from('subscription_plans').select('*');
        if (error) throw error;
        setPlans(data || []);
      } catch (error: any) {
        setError('Failed to load subscription plans.');
        console.error('Error fetching subscription plans:', error.message);
      } finally {
        setLoading(false);
      }
    }

    fetchPlans();
  }, []);

  return { plans, loading, error };
}
