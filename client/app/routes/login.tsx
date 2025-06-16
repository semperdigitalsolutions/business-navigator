import { AuthLayout } from "~/ui-kit/catalyst/auth-layout";
import { Button } from "~/ui-kit/catalyst/button";
import { Checkbox, CheckboxField } from "~/ui-kit/catalyst/checkbox";
import { Field, Label } from "~/ui-kit/catalyst/fieldset";
import { Heading } from "~/ui-kit/catalyst/heading";
import { Input } from "~/ui-kit/catalyst/input";
import { Strong, Text, TextLink } from "~/ui-kit/catalyst/text";
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { supabase } from '~/lib/supabaseClient';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null); 
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);
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
        setMessage('You can request a new confirmation email if needed.'); 
      } else {
        setError(signInError.message);
      }
    } else if (data.session) {
      setMessage('Login successful! Redirecting...');
      navigate('/'); 
    } else {
      setError('An unexpected error occurred. Please try again.');
    }
  };

  return (
    <AuthLayout>
      <form
        onSubmit={handleLogin}
        className="grid w-full max-w-sm grid-cols-1 gap-8"
      >
        <div className="w-[500px] max-w-[100vw] p-4">
          <h1>Logo</h1>
        </div>{" "}
        <Heading>Sign in to your account</Heading>
        {error && <Text className="text-red-600">{error}</Text>}
        {message && <Text className="text-green-600">{message}</Text>}
        <Field>
          <Label>Email</Label>
          <Input 
            type="email" 
            name="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
        </Field>
        <Field>
          <Label>Password</Label>
          <Input 
            type="password" 
            name="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
        </Field>
        <div className="flex items-center justify-between">
          <CheckboxField>
            <Checkbox name="remember" />
            <Label>Remember me</Label>
          </CheckboxField>
          <Text>
            <TextLink href="/forgot-password"> 
              <Strong>Forgot password?</Strong>
            </TextLink>
          </Text>
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </Button>
        <Text>
          Don’t have an account?{" "}
          <TextLink href="/signup">
            <Strong>Sign up</Strong>
          </TextLink>
        </Text>
        <Text>
          Forgot password?{" "}
          <TextLink href="/forgot-password">
            <Strong>Reset password</Strong>
          </TextLink>
        </Text>
      </form>
    </AuthLayout>
  );
}
