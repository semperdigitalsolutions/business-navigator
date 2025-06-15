import { Heading } from '~/ui-kit/catalyst/heading';
import { useAuth } from '~/root'; // Import useAuth

export default function LegalRegistrationPage() {
  const { isAuthenticated } = useAuth(); // Consume AuthContext

  if (!isAuthenticated) {
    return <p>You must be logged in to view this page.</p>;
  }

  return (
    <div>
      <Heading level={1}>Legal Registration</Heading>
      <p>This is the Legal Registration module. (Authenticated)</p>
    </div>
  );
}
