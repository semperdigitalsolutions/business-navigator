import { useAuthStore } from '~/stores/authStore';
import { Navigate, useLocation } from 'react-router';
import type { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { authStatus, onboardingCompleted, isSubscribed } = useAuthStore();
  const location = useLocation();

  if (authStatus === 'loading') {
    return <div>Loading...</div>; // Or a spinner component
  }

  if (authStatus === 'unauthenticated') {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (onboardingCompleted === false) {
    return <Navigate to="/onboarding" replace />;
  }

  if (isSubscribed === false) {
    return <Navigate to="/subscribe" replace />;
  }

  return <>{children}</>;
}
