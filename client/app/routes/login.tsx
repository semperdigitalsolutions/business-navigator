// import { Fieldset, Input, Button } from '~/ui-kit/catalyst'; // Assuming these exist for a form
import { Heading } from '~/ui-kit/catalyst/heading'; // Assuming Heading exists

export default function LoginPage() {
  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <Heading level={1}>Login</Heading>
      <p>Login form will be here.</p>
      {/* Example of Catalyst components (placeholder)
      <Fieldset>
        <Input name="email" placeholder="Email" />
        <Input name="password" type="password" placeholder="Password" />
        <Button type="submit">Login</Button>
      </Fieldset>
      */}
    </div>
  );
}
