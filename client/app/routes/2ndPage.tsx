import { Heading } from '~/ui-kit/catalyst/heading';
import { useAuth } from '~/root'; // Import useAuth

export default function SecondPage() {
  const { isAuthenticated } = useAuth(); // Consume AuthContext

  if (!isAuthenticated) {
    return <p>Please <a href="/login" style={{color: 'blue'}}>login</a> to view this page.</p>;
  }

  return (
    <div>
      <Heading level={1}>Idea Validation & Naming</Heading>
      <p>Content for Idea Validation & Naming will go here. (Authenticated)</p>
    </div>
  );
}
