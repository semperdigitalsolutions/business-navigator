import { AuthLayout } from "~/ui-kit/catalyst/auth-layout";
import { Button } from "~/ui-kit/catalyst/button";
import { Field, Label } from "~/ui-kit/catalyst/fieldset";
import { Heading } from "~/ui-kit/catalyst/heading";
import { Input } from "~/ui-kit/catalyst/input";
import { Strong, Text, TextLink } from "~/ui-kit/catalyst/text";
import { useState } from 'react';
import { supabase } from '~/lib/supabaseClient';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handlePasswordReset = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    // IMPORTANT: Replace 'YOUR_SITE_URL' with your actual deployed site URL
    // or localhost for development, e.g., 'http://localhost:5173/update-password'
    // This is where the user will be redirected after clicking the email link.
    const redirectTo = `${window.location.origin}/update-password`; 

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectTo,
    });

    setLoading(false);

    if (resetError) {
      setError(resetError.message);
    } else {
      setMessage("If an account exists for this email, a password reset link has been sent. Please check your inbox.");
    }
  };

  return (
    <AuthLayout>
      <form
        onSubmit={handlePasswordReset}
        className="grid w-full max-w-sm grid-cols-1 gap-8"
      >
        <div>Logo</div> <Heading>Reset your password</Heading>
        {error && <Text className="text-red-600">{error}</Text>}
        {message && <Text className="text-green-600">{message}</Text>}
        <Text>
          Enter your email and we’ll send you a link to reset your password.
        </Text>
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
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Sending...' : 'Reset password'}
        </Button>
        <Text>
          Don’t have an account?{" "}
          <TextLink href="/signup">
            <Strong>Sign up</Strong>
          </TextLink>
        </Text>
      </form>
    </AuthLayout>
  );
}
