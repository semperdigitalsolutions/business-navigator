import { AuthLayout } from "~/ui-kit/catalyst/auth-layout";
import { Button } from "~/ui-kit/catalyst/button";
import { Checkbox, CheckboxField } from "~/ui-kit/catalyst/checkbox";
import { Field, Label } from "~/ui-kit/catalyst/fieldset";
import { Heading } from "~/ui-kit/catalyst/heading";
import { Input } from "~/ui-kit/catalyst/input";
import { Select } from "~/ui-kit/catalyst/select";
import { Strong, Text, TextLink } from "~/ui-kit/catalyst/text";
import { Alert, AlertActions, AlertDescription, AlertTitle } from '~/ui-kit/catalyst/alert';
import { useSignupForm } from '~/hooks/auth/useSignupForm';

export default function SignupPage() {
  const {
    email, setEmail,
    password, setPassword,
    fullName, setFullName,
    error,
    loading,
    isAlertOpen,
    handleSignup,
    handleCloseAlert,
  } = useSignupForm();

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
      <Alert open={isAlertOpen} onClose={handleCloseAlert}>
        <AlertTitle>Check your email</AlertTitle>
        <AlertDescription>
          We've sent a confirmation link to your email address. Please check your inbox (and spam folder) to complete the signup process.
        </AlertDescription>
        <AlertActions>
          <Button onClick={handleCloseAlert}>Got it!</Button>
        </AlertActions>
      </Alert>
    </AuthLayout>
  );
}
