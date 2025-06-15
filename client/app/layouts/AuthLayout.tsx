import type { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <header style={{ padding: '20px' }}>
        {/* Placeholder for App Logo */}
        <h1>App Logo</h1>
      </header>
      <main>
        {children}
      </main>
    </div>
  );
}
