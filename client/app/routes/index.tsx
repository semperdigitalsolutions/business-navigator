import { useAuth } from '~/root';
import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Heading } from '~/ui-kit/catalyst/heading';

export default function LandingPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If user is authenticated, redirect to home
    if (isAuthenticated) {
      navigate('/home', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Show landing page for unauthenticated users
  return (
    <main className="flex items-center justify-center pt-16 pb-4">
      <div className="flex-1 flex flex-col items-center gap-16 min-h-0">
        <header className="flex flex-col items-center gap-9">
          <div className="w-[500px] max-w-[100vw] p-4">
            <Heading level={1} className="text-center mb-8">
              Welcome to Business Navigator
            </Heading>
          </div>
          <p className="text-center text-lg text-gray-600 dark:text-gray-300 max-w-md">
            Your comprehensive business management platform. Sign in to access your dashboard.
          </p>
        </header>
        
        <div className="flex gap-4">
          <a 
            href="/login" 
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Sign In
          </a>
          <a 
            href="/signup" 
            className="px-6 py-3 border border-gray-300 text-gray-700 dark:text-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Sign Up
          </a>
        </div>
        
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Press Ctrl+A to toggle authentication state (for testing)
        </div>
      </div>
    </main>
  );
}
