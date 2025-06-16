import { AuthLayout } from "~/ui-kit/catalyst/auth-layout";
import { Button } from "~/ui-kit/catalyst/button";
import { Checkbox, CheckboxField } from "~/ui-kit/catalyst/checkbox";
import { Field, Label } from "~/ui-kit/catalyst/fieldset";
import { Heading } from "~/ui-kit/catalyst/heading";
import { Input } from "~/ui-kit/catalyst/input";
import { Select } from "~/ui-kit/catalyst/select";
import { Strong, Text, TextLink } from "~/ui-kit/catalyst/text";
import { useState } from 'react';
import { useNavigate } from 'react-router'; // Or your preferred navigation method
import { supabase } from "~/lib/supabaseClient";

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    setLoading(false);

    if (signUpError) {
      setError(signUpError.message);
    } else if (data.user && data.user.identities?.length === 0) {
      // This case can happen with email confirmation disabled and auto-confirm enabled
      // or if an unconfirmed user tries to sign up again with the same email.
      // Supabase might return a user object but indicate it's an existing unconfirmed user.
      setMessage("User already exists but is unconfirmed. Please check your email to confirm or try logging in.");
    } else if (data.session) {
      // User is signed up and logged in (e.g. if email confirmation is disabled)
      setMessage("Signup successful! Redirecting...");
      // You might want to redirect to a dashboard or home page
      navigate('/'); // Adjust as needed
    } else if (data.user) {
      // User is signed up but needs to confirm their email
      setMessage("Signup successful! Please check your email to confirm your account.");
    } else {
      // Fallback, should ideally not happen if Supabase returns user or error
      setError("An unexpected issue occurred. Please try again.");
    }
  };

  return (
    <AuthLayout>
      <form
        onSubmit={handleSignup}
        className="grid w-full max-w-sm grid-cols-1 gap-8"
      >
        <div>
          <h1>Logo</h1>
        </div>
        <Heading>Create your account</Heading>
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
          <Label>Full name</Label>
          <Input 
            name="name" 
            value={fullName} 
            onChange={(e) => setFullName(e.target.value)} 
            required 
          />
        </Field>
        <Field>
          <Label>Password</Label>
          <Input 
            type="password" 
            name="password" 
            autoComplete="new-password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
        </Field>
        <Field>
          <Label>Country</Label>
          <Select name="country">
            <option>Canada</option>
            <option>Mexico</option>
            <option>United States</option>
          </Select>
        </Field>
        <CheckboxField>
          <Checkbox name="remember" />
          <Label>Get emails about product updates and news.</Label>
        </CheckboxField>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Creating account...' : 'Create account'}
        </Button>
        <Text>
          Already have an account?{" "}
          <TextLink href="/login">
            <Strong>Sign in</Strong>
          </TextLink>
        </Text>
      </form>
    </AuthLayout>
  );
}
