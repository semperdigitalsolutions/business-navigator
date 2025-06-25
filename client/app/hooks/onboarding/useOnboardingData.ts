import { useState, useEffect } from 'react';
import { supabase } from '~/lib/supabaseClient';

// Define the shapes of our data
export interface Industry {
  name: string;
  description: string;
  examples: string[];
}

export interface State {
  name: string;
  status: string;
  notes: string;
}

export interface EntityType {
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
  const [industryOptions, setIndustryOptions] = useState<Industry[]>([]);
  const [entityTypeOptions, setEntityTypeOptions] = useState<EntityType[]>([]);
  const [stateOptions, setStateOptions] = useState<State[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setLoading(true);
        const [industriesRes, entityTypesRes, statesRes] = await Promise.all([
          supabase.from('industries').select('name, description, examples'),
          supabase.from('entity_types').select('name, description, key_features, advantages, considerations, availability'),
          supabase.from('states').select('name, status, notes'),
        ]);

        if (industriesRes.error) throw industriesRes.error;
        if (entityTypesRes.error) throw entityTypesRes.error;
        if (statesRes.error) throw statesRes.error;

        setIndustryOptions(industriesRes.data || []);
        setEntityTypeOptions(entityTypesRes.data || []);
        setStateOptions(statesRes.data || []);
      } catch (error: any) {
        setError('Failed to load form options. Please try again later.');
        console.error('Error fetching options:', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOptions();
  }, []);

  return { industryOptions, entityTypeOptions, stateOptions, loading, error };
}
