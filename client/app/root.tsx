import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLocation,
  useNavigate,
} from 'react-router';
import React, { useEffect } from 'react';
import { useAuthStore } from '~/stores/authStore';
import AuthLoader from './components/ui/AuthLoader';
import AppLayout from './layouts/AppLayout';
import AuthLayout from './layouts/AuthLayout';

import type { Route } from "./+types/root";
import "./app.css";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export default function DocumentRoot() {
  const { session, authStatus, initializeAuthListener, onboardingCompleted, isSubscribed } = useAuthStore();
  const isAuthenticated = !!session;
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (authStatus === 'initial') {
      const unsubscribe = initializeAuthListener();
      return unsubscribe;
    }
  }, [initializeAuthListener, authStatus]);

  useEffect(() => {
    // Wait for auth, onboarding, and subscription status to be determined
    if (
      authStatus === 'loading' ||
      authStatus === 'initial' ||
      (isAuthenticated && (onboardingCompleted === null || isSubscribed === null))
    ) {
      return;
    }

    const publicPaths = ['/', '/login', '/signup', '/forgot-password', '/tos', '/privacy'];
    const isPublicPath = publicPaths.includes(location.pathname);
    const isOnboardingPath = location.pathname === '/onboarding';

    if (isAuthenticated) {
      if (!onboardingCompleted && !isOnboardingPath) {
        // If onboarding is not complete, force user to the onboarding page
        navigate('/onboarding', { replace: true });
      } else if (onboardingCompleted && !isSubscribed && !isOnboardingPath) {
        // If onboarded but not subscribed, force to subscription step
        navigate('/onboarding', { replace: true });
      } else if (onboardingCompleted && isSubscribed && (isOnboardingPath || isPublicPath)) {
        // If onboarding is complete, send them home from onboarding or public pages
        navigate('/home', { replace: true });
      }
    } else {
      // Unauthenticated users on a protected page get sent to login
      if (!isPublicPath && !isOnboardingPath) {
        navigate('/login', { replace: true });
      }
    }
  }, [isAuthenticated, authStatus, onboardingCompleted, isSubscribed, location.pathname, navigate]);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {authStatus === 'loading' || authStatus === 'initial' ? (
          <AuthLoader />
        ) : location.pathname === '/login' || location.pathname === '/signup' || location.pathname === '/forgot-password' ? (
          <AuthLayout>
            <Outlet />
          </AuthLayout>
        ) : (
          <AppLayout isAuthenticated={isAuthenticated}>
            <Outlet />
          </AppLayout>
        )}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
