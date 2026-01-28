/**
 * Landing Layout - Clean wrapper for the public landing page
 * No sidebar, no app navigation - just a minimal container
 */
export function LandingLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-white dark:bg-zinc-950">{children}</div>
}
