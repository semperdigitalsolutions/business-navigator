import { Heading } from '~/ui-kit/catalyst/heading';
import { useAuth } from '~/root'; // Import useAuth
// import { Navigate } from 'react-router-dom'; // If redirecting non-auth users

export default function HomePage() {
  const { isAuthenticated } = useAuth(); // Consume AuthContext

  if (!isAuthenticated) {
    // This page should ideally not be reachable if not authenticated due to AppLayout behavior,
    // but as a fallback, redirect or show a message.
    // return <Navigate to="/login" replace />;
    return <p>Please <a href="/login" style={{color: 'blue'}}>login</a> to view the dashboard.</p>;
  }

  return (
    <div>
      <Heading level={1}>Home Dashboard</Heading>
      <p>Welcome to your personalized dashboard! (Authenticated)</p>
      <p>Toggle auth state with Ctrl+A (defined in root.tsx for testing).</p>
    </div>
  );
}
