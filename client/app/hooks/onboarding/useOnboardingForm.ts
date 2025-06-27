import { useState } from 'react';
import { supabase } from '~/lib/supabaseClient';
import { useAuthStore } from '~/stores/authStore';
import type { Industry, EntityType, State } from './useOnboardingData';
import { useNavigate } from 'react-router';

export function useOnboardingForm() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const setOnboardingCompleted = useAuthStore((state) => state.setOnboardingCompleted);

  // Form input state
  const [businessName, setBusinessName] = useState('');
  const [industry, setIndustry] = useState('');
  const [otherIndustry, setOtherIndustry] = useState('');
  const [entityType, setEntityType] = useState('');
  const [otherEntityType, setOtherEntityType] = useState('');
  const [stateOfIncorporation, setStateOfIncorporation] = useState('');
  const [otherState, setOtherState] = useState('');

  // State for displaying details of selected items
  const [selectedIndustry, setSelectedIndustry] = useState<Industry | null>(null);
  const [selectedEntityType, setSelectedEntityType] = useState<EntityType | null>(null);
  const [selectedState, setSelectedState] = useState<State | null>(null);

  // Form submission state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleIndustryChange = (e: React.ChangeEvent<HTMLSelectElement>, options: Industry[]) => {
    const selectedName = e.target.value;
    setIndustry(selectedName);
    if (selectedName === 'Other') {
      setSelectedIndustry(null);
    } else {
      const details = options.find(opt => opt.name === selectedName) || null;
      setSelectedIndustry(details);
    }
  };

  const handleEntityTypeChange = (e: React.ChangeEvent<HTMLSelectElement>, options: EntityType[]) => {
    const selectedName = e.target.value;
    setEntityType(selectedName);
    if (selectedName === 'Other') {
      setSelectedEntityType(null);
    } else {
      const details = options.find(opt => opt.name === selectedName) || null;
      setSelectedEntityType(details);
    }
  };

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>, options: State[]) => {
    const selectedName = e.target.value;
    setStateOfIncorporation(selectedName);
    if (selectedName === 'Other') {
      setSelectedState(null);
    } else {
      const details = options.find(opt => opt.name === selectedName) || null;
      setSelectedState(details);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    if (!user) {
      setError('You must be logged in to create a profile.');
      setLoading(false);
      return;
    }

    const finalIndustry = industry === 'Other' ? otherIndustry : industry;
    const finalEntityType = entityType === 'Other' ? otherEntityType : entityType;
    const finalState = stateOfIncorporation === 'Other' ? otherState : stateOfIncorporation;

    const profileData = {
      id: user.id,
      business_name: businessName,
      industry: finalIndustry,
      entity_type: finalEntityType,
      state_of_incorporation: finalState,
      updated_at: new Date(),
    };

    const { error } = await supabase.from('profiles').upsert(profileData);

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setLoading(false);
      setOnboardingCompleted(true); // Mark onboarding as complete
      navigate('/home');
    }
  };

  const handleSkip = async () => {
    setLoading(true);
    setError(null);

    if (!user) {
      setError('You must be logged in to create a profile.');
      setLoading(false);
      return;
    }

    // Default business name from user's email, or a fallback
    const defaultBusinessName = user.email ? user.email.split('@')[0] + "'s Business" : 'My Business';

    const profileData = {
      id: user.id,
      business_name: defaultBusinessName,
      industry: null,
      entity_type: null,
      state_of_incorporation: null,
      updated_at: new Date(),
    };

    const { error } = await supabase.from('profiles').upsert(profileData);

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setLoading(false);
      setOnboardingCompleted(true);
      navigate('/home');
    }
  };

  return {
    businessName, setBusinessName,
    industry, otherIndustry, setOtherIndustry,
    entityType, otherEntityType, setOtherEntityType,
    stateOfIncorporation, otherState, setOtherState,
    selectedIndustry,
    selectedEntityType,
    selectedState,
    loading,
    error,
    handleIndustryChange,
    handleEntityTypeChange,
    handleStateChange,
    handleSubmit,
    handleSkip,
  };
}
