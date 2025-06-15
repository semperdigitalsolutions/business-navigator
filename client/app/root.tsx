import {
  isRouteErrorResponse,
  Links,
  Meta,
  // Outlet, -- Outlet will be used inside App component
  Scripts,
  ScrollRestoration,
  useLocation, // Added useLocation
  Outlet,      // Added Outlet for use in App
} from "react-router";
// import { useState, useEffect } from 'react'; // Moved to top for AuthContext
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'; // AuthContext imports
import AppLayout from '~/layouts/AppLayout';   // Added AppLayout import
import AuthLayout from '~/layouts/AuthLayout'; // Added AuthLayout import

import type { Route } from "./+types/root";
import "./app.css";

// Context creation
interface AuthContextType {
  isAuthenticated: boolean;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

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

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Mock state
  const location = useLocation();

  // Optional: Add a simple way to toggle authentication for testing (Ctrl+A)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'a' && event.ctrlKey) {
        event.preventDefault(); // Prevent default browser action for Ctrl+A (select all)
        setIsAuthenticated(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Provide the context
  return (
    <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated }}>
      {location.pathname === '/login' || location.pathname === '/signup' ? (
        <AuthLayout>
          <Outlet />
        </AuthLayout>
      ) : (
        <AppLayout isAuthenticated={isAuthenticated}>
          <Outlet />
        </AppLayout>
      )}
    </AuthContext.Provider>
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
