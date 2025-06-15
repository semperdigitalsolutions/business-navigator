import { Heading } from '~/ui-kit/catalyst/heading';
import { useAuth } from '~/root'; // Import useAuth

export default function ProfilePage() {
  const { isAuthenticated } = useAuth(); // Consume AuthContext

  if (!isAuthenticated) {
    // Optional: Could add a redirect here if a non-auth user somehow lands here,
    // but AppLayout structure should prevent this page from being easily accessible.
    return <p>You must be logged in to view this page.</p>;
  }

  return (
    <div>
      <Heading level={1}>User Profile</Heading>
      <p>This is the user profile page. (Authenticated)</p>
    </div>
  );
}
