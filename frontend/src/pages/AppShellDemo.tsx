import { AppShell } from '@/components/layout'

export function AppShellDemo() {
  return (
    <AppShell
      leftSidebar={
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center px-4">
            <span className="font-bold text-slate-900 dark:text-white">Logo</span>
          </div>
          <nav className="flex-1 p-3">
            <div className="rounded-lg bg-sky-50 px-3 py-2 text-sm font-medium text-primary-600">
              Home
            </div>
          </nav>
        </div>
      }
      rightSidebar={
        <div className="p-6">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">
            Business Velocity
          </h3>
          <p className="mt-4 text-sm text-slate-600">Right sidebar content</p>
        </div>
      }
    >
      <header className="flex h-16 items-center border-b border-slate-100 px-8">
        <h1 className="text-lg font-bold text-slate-900 dark:text-white">Main Content</h1>
      </header>
      <div className="flex-1 overflow-y-auto p-8">
        <p className="text-slate-600 dark:text-slate-400">
          This is the main content area. It scrolls independently.
        </p>
        {/* Add lots of content to test scrolling */}
        {Array.from({ length: 50 }).map((_, i) => (
          <p key={i} className="my-4 text-slate-500">
            Paragraph {i + 1} - Lorem ipsum dolor sit amet.
          </p>
        ))}
      </div>
    </AppShell>
  )
}
