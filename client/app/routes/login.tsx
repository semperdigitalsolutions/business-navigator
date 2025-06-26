import { AuthLayout } from "~/ui-kit/catalyst/auth-layout";
import { Button } from "~/ui-kit/catalyst/button";
import { Checkbox, CheckboxField } from "~/ui-kit/catalyst/checkbox";
import { Field, Label } from "~/ui-kit/catalyst/fieldset";
import { Heading } from "~/ui-kit/catalyst/heading";
import { Input } from "~/ui-kit/catalyst/input";
import { Strong, Text, TextLink } from "~/ui-kit/catalyst/text";
import { useLoginForm } from '~/hooks/auth/useLoginForm';

export default function LoginPage() {
  const {
    email, setEmail,
    password, setPassword,
    error,
    loading,
    handleLogin,
  } = useLoginForm();

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
        {error && <Text className="text-red-600 login-error-message">{error}</Text>}
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
