import { create } from 'zustand';
import type { Session, User, Subscription, AuthError } from '@supabase/supabase-js';
import { supabase } from '~/lib/supabaseClient';

type AuthStatus = 'initial' | 'loading' | 'authenticated' | 'unauthenticated';

interface AuthState {
  session: Session | null;
  user: User | null;
  authStatus: AuthStatus;
  error: string | null;
  loading: boolean; // For initial load and onAuthStateChange processing
  setSession: (session: Session | null) => void;
  setError: (error: string | null) => void;
  initializeAuthListener: () => () => void; // Returns the unsubscribe function
  signOutUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  authStatus: 'initial',
  error: null,
  loading: true, // Start as true until first auth state is determined

  setSession: (session) => {
    set({
      session,
      user: session?.user ?? null,
      authStatus: session ? 'authenticated' : 'unauthenticated',
      loading: false,
      error: null, // Clear error on successful session update
    });
  },

  setError: (error) => set({ error, loading: false }),

  initializeAuthListener: () => {
    set({ loading: true, authStatus: 'loading' });

    // Attempt to set up the auth state change listener
    const authListener = supabase.auth.onAuthStateChange((_event, session) => {
      // This callback now only handles successful auth state changes
      get().setSession(session);
      // console.log('Auth state changed, new session:', session ? 'active' : 'null');
    }) as { data: { subscription: Subscription | null }; error: AuthError | null };

    // Check if there was an error setting up the listener itself
    if (authListener.error) {
      console.error('Error setting up onAuthStateChange listener:', authListener.error);
      get().setError('Failed to subscribe to auth state changes.');
      set({ loading: false, authStatus: 'unauthenticated' });
      return () => { /* No-op unsubscribe if setup failed */ };
    }

    // If setup was successful, `authListener.data.subscription` contains the subscription object
    const { subscription } = authListener.data;

    // Check initial session, in case onAuthStateChange doesn't fire immediately
    // or if the listener is set up after the initial auth check by Supabase client
    supabase.auth.getSession().then(({ data: { session: currentSession }, error }) => {
      if (error) {
        console.error('Error fetching initial session:', error);
        // Don't necessarily set authStatus to unauthenticated here if listener is active
        // The listener will eventually fire and set the correct state.
        // We could set an error in the store if desired: get().setError('Failed to fetch initial session.');
      } else {
        // Only set session if the listener hasn't already (e.g., if it fired sync)
        // A more robust check might involve comparing timestamps or a flag
        if (get().loading) { // Check if still in initial loading state
          get().setSession(currentSession);
        }
      }
      // Ensure loading is false after initial check, regardless of outcome, 
      // as the listener will take over.
      set(state => ({ ...state, loading: state.authStatus === 'loading' ? false : state.loading }));
    });

    return () => {
      subscription?.unsubscribe();
    };
  },

  signOutUser: async () => {
    set({ loading: true }); // Optionally set loading state during sign out
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
      get().setError(error.message);
      set({ loading: false }); // Reset loading state on error
    } else {
      // setSession(null) will handle setting user, authStatus, and loading to false
      get().setSession(null); 
      window.location.href = '/';
      // console.log('User signed out successfully.');
    }
  },
}));

// Initialize the auth listener when the store is first imported/used.
// This is a common pattern, but consider if you want to control initialization more explicitly.
// For example, in your main App component's useEffect.
// const unsubscribe = useAuthStore.getState().initializeAuthListener();
// If you call it here, it runs once when this module is imported.
// To manage it via React lifecycle, you'd call initializeAuthListener in a useEffect hook in your root component.

// Example of explicit initialization (recommended for React apps):
// In your App.tsx or main layout component:
// useEffect(() => {
//   const unsubscribe = useAuthStore.getState().initializeAuthListener();
//   return () => unsubscribe();
// }, []);
