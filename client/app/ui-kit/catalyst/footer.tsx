// client/app/ui-kit/catalyst/footer.tsx
import type { ReactNode } from 'react';

export function Footer({ children }: { children: ReactNode }) {
  return <footer style={{ padding: '20px', textAlign: 'center', borderTop: '1px solid #eee' }}>{children}</footer>;
}

export function FooterLink({ href, children }: { href: string, children: ReactNode }) {
  return <a href={href} style={{ margin: '0 10px' }}>{children}</a>;
}
