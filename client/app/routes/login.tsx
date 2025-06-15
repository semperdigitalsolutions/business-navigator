import { AuthLayout } from "~/ui-kit/catalyst/auth-layout";
import { Button } from "~/ui-kit/catalyst/button";
import { Checkbox, CheckboxField } from "~/ui-kit/catalyst/checkbox";
import { Field, Label } from "~/ui-kit/catalyst/fieldset";
import { Heading } from "~/ui-kit/catalyst/heading";
import { Input } from "~/ui-kit/catalyst/input";
import { Strong, Text, TextLink } from "~/ui-kit/catalyst/text";

export default function LoginPage() {
  return (
    <AuthLayout>
      <form
        action="#"
        method="POST"
        className="grid w-full max-w-sm grid-cols-1 gap-8"
      >
        <div className="w-[500px] max-w-[100vw] p-4">
          <h1>Logo</h1>
        </div>{" "}
        <Heading>Sign in to your account</Heading>
        <Field>
          <Label>Email</Label>
          <Input type="email" name="email" />
        </Field>
        <Field>
          <Label>Password</Label>
          <Input type="password" name="password" />
        </Field>
        <div className="flex items-center justify-between">
          <CheckboxField>
            <Checkbox name="remember" />
            <Label>Remember me</Label>
          </CheckboxField>
          <Text>
            <TextLink href="#">
              <Strong>Forgot password?</Strong>
            </TextLink>
          </Text>
        </div>
        <Button type="submit" className="w-full">
          Login
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
