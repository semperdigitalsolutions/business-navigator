import { AuthLayout } from "~/ui-kit/catalyst/auth-layout";
import { Button } from "~/ui-kit/catalyst/button";
import { Field, Label } from "~/ui-kit/catalyst/fieldset";
import { Heading } from "~/ui-kit/catalyst/heading";
import { Input } from "~/ui-kit/catalyst/input";
import { Strong, Text, TextLink } from "~/ui-kit/catalyst/text";

export default function ForgotPassword() {
  return (
    <AuthLayout>
      <form
        action=""
        method="POST"
        className="grid w-full max-w-sm grid-cols-1 gap-8"
      >
        <div>Logo</div> <Heading>Reset your password</Heading>
        <Text>
          Enter your email and we’ll send you a link to reset your password.
        </Text>
        <Field>
          <Label>Email</Label>
          <Input type="email" name="email" />
        </Field>
        <Button type="submit" className="w-full">
          Reset password
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
