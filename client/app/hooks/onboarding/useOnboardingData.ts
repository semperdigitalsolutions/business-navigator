import { useState, useEffect } from 'react';
import { supabase } from '~/lib/supabaseClient';

// Define the shapes of our data
export interface Industry {
  id: string;
  name: string;
  description: string;
  examples: string[];
}

export interface State {
  id: string;
  name: string;
  status: string;
  notes: string;
}

export interface EntityType {
  id: string;
  name: string;
  description: string;
  key_features: string[];
  advantages: string[];
  considerations: string[];
  availability: string;
}

/**
 * Custom hook to fetch all the necessary data for the onboarding form dropdowns.
 * It handles loading and error states for the data fetching process.
 */
export function useOnboardingData() {
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [entityTypes, setEntityTypes] = useState<EntityType[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setLoading(true);
        const [industriesRes, entityTypesRes, statesRes] = await Promise.all([
          supabase.from('industries').select('id, name, description, examples'),
          supabase.from('entity_types').select('id, name, description, key_features, advantages, considerations, availability'),
          supabase.from('states').select('id, name, status, notes'),
        ]);

        if (industriesRes.error) throw industriesRes.error;
        if (entityTypesRes.error) throw entityTypesRes.error;
        if (statesRes.error) throw statesRes.error;

        setIndustries(industriesRes.data || []);
        setEntityTypes(entityTypesRes.data || []);
        setStates(statesRes.data || []);
      } catch (error: any) {
        setError('Failed to load form options. Please try again later.');
        console.error('Error fetching options:', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOptions();
  }, []);

  return { industries, entityTypes, states, loading, error };
}
