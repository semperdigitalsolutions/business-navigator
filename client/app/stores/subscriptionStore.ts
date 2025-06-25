import { create } from 'zustand';
import { supabase } from '~/lib/supabaseClient';
import { loadStripe } from '@stripe/stripe-js';

export type SubscriptionStatus = 'active' | 'trialing' | 'past_due' | 'canceled' | 'unpaid';

export interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: SubscriptionStatus;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  current_period_start: string;
  current_period_end: string;
}

interface SubscriptionState {
  subscription: Subscription | null;
  loading: boolean;
  error: string | null;
  fetchSubscription: (userId: string) => Promise<void>;
  redirectToCheckout: (planId: string, userEmail: string) => Promise<void>;
}

export const useSubscriptionStore = create<SubscriptionState>((set) => ({
  subscription: null,
  loading: false,
  error: null,

  fetchSubscription: async (userId: string) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // Ignore 'single row not found' errors
        throw error;
      }

      set({ subscription: data, loading: false });
    } catch (error: any) {
      console.error('Error fetching subscription:', error);
      set({ error: error.message, loading: false });
    }
  },

  redirectToCheckout: async (planId: string, userEmail: string) => {
    set({ loading: true, error: null });
    try {
      const stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY!);
      if (!stripe) {
        throw new Error('Stripe.js failed to load.');
      }

      const { error } = await stripe.redirectToCheckout({
        lineItems: [{ price: planId, quantity: 1 }],
        mode: 'subscription',
        successUrl: `${window.location.origin}/home`,
        cancelUrl: `${window.location.origin}/pricing`,
        customerEmail: userEmail,
      });

      if (error) {
        console.error('Stripe redirectToCheckout error:', error);
        throw error;
      }
    } catch (error: any) {
      console.error('Error in redirectToCheckout:', error);
      set({ error: error.message, loading: false });
    }
  },
}));
