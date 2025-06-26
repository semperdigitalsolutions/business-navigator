import { create } from 'zustand';
import { supabase } from '~/lib/supabaseClient';
import { useAuthStore } from '~/stores/authStore';

interface Business {
  id: string;
  name: string;
}

interface BusinessState {
  businesses: Business[];
  currentBusiness: Business | null;
  isSubscribed: boolean;
  fetchBusinesses: () => Promise<void>;
}

export const useBusinessStore = create<BusinessState>((set) => ({
  businesses: [],
  currentBusiness: null,
  isSubscribed: false,

  fetchBusinesses: async () => {
    const { user } = useAuthStore.getState();
    if (!user) {
      set({ businesses: [], currentBusiness: null, isSubscribed: false });
      return;
    }

    try {
      const [profilesResult, subscriptionResult] = await Promise.all([
        supabase.from('profiles').select('id, business_name').eq('id', user.id),
        supabase
          .from('subscriptions')
          .select('status')
          .eq('user_id', user.id)
          .in('status', ['trialing', 'active'])
          .maybeSingle(),
      ]);

      const { data: profilesData, error: profilesError } = profilesResult;
      const { data: subscriptionData, error: subscriptionError } = subscriptionResult;

      if (profilesError) throw profilesError;
      if (subscriptionError) throw subscriptionError;

      const isSubscribed = !!subscriptionData;

      if (profilesData && profilesData.length > 0) {
        const businesses = profilesData.map((profile) => ({
          id: profile.id,
          name: profile.business_name,
        }));

        set({
          businesses,
          currentBusiness: businesses[0],
          isSubscribed,
        });
      } else {
        set({ businesses: [], currentBusiness: null, isSubscribed });
      }
    } catch (error) {
      console.error('Error fetching business data:', error);
      set({ businesses: [], currentBusiness: null, isSubscribed: false });
    }
  },
}));

// Automatically fetch businesses when the user is authenticated and clear on logout.
useAuthStore.subscribe((state, prevState) => {
  if (state.user && !prevState.user) {
    useBusinessStore.getState().fetchBusinesses();
  } else if (!state.user && prevState.user) {
    useBusinessStore.setState({ businesses: [], currentBusiness: null, isSubscribed: false });
  }
});