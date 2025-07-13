import { useState } from 'react';
import { useNavigate } from 'react-router';
import { supabase } from '~/lib/supabaseClient';
import { useAuthStore } from '~/stores/authStore';

/**
 * Hook for managing onboarding form state and submission.
 * It handles form input state, selection logic, and submission.
 */
export function useOnboardingForm({ onComplete }: { onComplete?: () => void } = {}) {
  const [formData, setFormData] = useState({
    business_name: '',
    industry: '',
    entity_type: '',
    state_of_incorporation: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!user) {
      setError('You must be logged in to create a profile.');
      setLoading(false);
      return;
    }

    const projectData = {
      user_id: user.id,
      business_name: formData.business_name,
      industry: formData.industry,
      entity_type: formData.entity_type,
      state_of_incorporation: formData.state_of_incorporation,
      updated_at: new Date(),
    };

    const { data, error } = await supabase.from('business_projects').insert(projectData).select();

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      // Mark onboarding as complete in the correct 'users' table
      const { error: updateError } = await supabase
        .from('users')
        .update({ onboarding_completed: true })
        .eq('id', user.id);

      if (updateError) {
        setError(updateError.message);
      } else {
        useAuthStore.getState().setOnboardingCompleted(true);
        if (onComplete) onComplete();
        else navigate('/home');
      }
      setLoading(false);
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

    const defaultBusinessName = user.email ? user.email.split('@')[0] + "'s Business" : 'My Business';

    const projectData = {
      user_id: user.id,
      business_name: defaultBusinessName,
      industry: null,
      entity_type: null,
      state_of_incorporation: null,
      updated_at: new Date(),
    };

    const { data, error } = await supabase.from('business_projects').insert(projectData).select();

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      // Mark onboarding as complete in the correct 'users' table
      const { error: updateError } = await supabase
        .from('users')
        .update({ onboarding_completed: true })
        .eq('id', user.id);

      if (updateError) {
        setError(updateError.message);
      } else {
        useAuthStore.getState().setOnboardingCompleted(true);
        if (onComplete) onComplete();
        else navigate('/home');
      }
      setLoading(false);
    }
  };

  return { formData, loading, error, handleChange, handleSubmit, handleSkip };
}
