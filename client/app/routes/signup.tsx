import { AuthLayout } from "~/ui-kit/catalyst/auth-layout";
import { Button } from "~/ui-kit/catalyst/button";
import { Checkbox, CheckboxField } from "~/ui-kit/catalyst/checkbox";
import { Field, Label } from "~/ui-kit/catalyst/fieldset";
import { Heading } from "~/ui-kit/catalyst/heading";
import { Input } from "~/ui-kit/catalyst/input";
import { Select } from "~/ui-kit/catalyst/select";
import { Strong, Text, TextLink } from "~/ui-kit/catalyst/text";

export default function SignupPage() {
  return (
    <AuthLayout>
      <form
        action="#"
        method="POST"
        className="grid w-full max-w-sm grid-cols-1 gap-8"
      >
        <div>
          <h1>Logo</h1>
        </div>
        <Heading>Create your account</Heading>
        <Field>
          <Label>Email</Label>
          <Input type="email" name="email" />
        </Field>
        <Field>
          <Label>Full name</Label>
          <Input name="name" />
        </Field>
        <Field>
          <Label>Password</Label>
          <Input type="password" name="password" autoComplete="new-password" />
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
        <Button type="submit" className="w-full">
          Create account
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
