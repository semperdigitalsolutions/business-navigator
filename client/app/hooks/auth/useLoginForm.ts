import { useState } from 'react';
import { useNavigate } from 'react-router';
import { supabase } from '~/lib/supabaseClient';
import { useAuthStore } from '~/stores/authStore';

export function useLoginForm() {
  const setAuthSession = useAuthStore((state) => state.setSession);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (signInError) {
      if (signInError.message === 'Invalid login credentials') {
        setError('Invalid email or password. Please try again.');
      } else if (signInError.message === 'Email not confirmed') {
        setError('Email not confirmed. Please check your inbox for a confirmation link.');
      } else {
        setError(signInError.message);
      }
    } else if (data.session) {
      setAuthSession(data.session);
      navigate('/home');
    } else {
      setError('An unexpected error occurred. Please try again.');
    }
  };

  return {
    email, setEmail,
    password, setPassword,
    error,
    loading,
    handleLogin,
  };
}
