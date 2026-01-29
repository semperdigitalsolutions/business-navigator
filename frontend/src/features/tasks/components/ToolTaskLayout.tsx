/**
 * ToolTaskLayout Component
 * Issue #79: Layout for interactive calculator/builder tasks
 * Provides tab navigation, content area, results panel, and action buttons
 */
import type { ReactNode } from 'react'
import { CheckIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline'
import { cn } from '@/utils/classnames'
import { SaveIndicator } from './SaveIndicator'

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

interface ToolTaskLayoutProps {
  /** Task title displayed in the header */
  title: string
  /** Tab labels (e.g., ['Year 1', 'Year 2', 'Year 3']) */
  tabs: string[]
  /** Currently active tab index */
  activeTab: number
  /** Callback when tab changes */
  onTabChange: (index: number) => void
  /** Main content area (calculator inputs) */
  children: ReactNode
  /** Results panel content (optional) */
  results?: ReactNode
  /** Chart placeholder content (optional) */
  chart?: ReactNode
  /** Callback when save is triggered */
  onSave: () => void
  /** Callback when export is triggered (optional, hides button if not provided) */
  onExport?: () => void
  /** Callback when task is marked complete */
  onComplete: () => void
  /** Current save status for SaveIndicator */
  saveStatus?: SaveStatus
  /** Last saved timestamp */
  lastSavedAt?: Date | null
  /** Whether save is in progress */
  isSaving?: boolean
  /** Whether complete is in progress */
  isCompleting?: boolean
  /** Additional class names */
  className?: string
}

function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={cn('animate-spin', className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  )
}

interface TabBarProps {
  tabs: string[]
  activeTab: number
  onTabChange: (index: number) => void
}

function TabBar({ tabs, activeTab, onTabChange }: TabBarProps) {
  return (
    <div className="border-b border-zinc-200 dark:border-zinc-700">
      <nav className="-mb-px flex space-x-1 overflow-x-auto px-1" aria-label="Tabs">
        {tabs.map((tab, index) => (
          <button
            key={tab}
            type="button"
            onClick={() => onTabChange(index)}
            className={cn(
              'whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-inset',
              index === activeTab
                ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                : 'border-transparent text-zinc-500 hover:border-zinc-300 hover:text-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:text-zinc-300'
            )}
            aria-current={index === activeTab ? 'page' : undefined}
          >
            {tab}
          </button>
        ))}
      </nav>
    </div>
  )
}

interface ActionButtonsProps {
  onSave: () => void
  onExport?: () => void
  onComplete: () => void
  isSaving?: boolean
  isCompleting?: boolean
}

function ActionButtons(props: ActionButtonsProps) {
  const { onSave, onExport, onComplete, isSaving, isCompleting } = props
  const secondaryClass = cn(
    'inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors',
    'border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50',
    'dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700',
    'disabled:cursor-not-allowed disabled:opacity-50'
  )
  const primaryClass = cn(
    'inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors',
    'bg-blue-600 text-white hover:bg-blue-700',
    'disabled:cursor-not-allowed disabled:opacity-50'
  )

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <button type="button" onClick={onSave} disabled={isSaving} className={secondaryClass}>
        {isSaving ? (
          <>
            <Spinner className="h-4 w-4" />
            Saving...
          </>
        ) : (
          'Save Draft'
        )}
      </button>
      {onExport && (
        <button type="button" onClick={onExport} className={secondaryClass}>
          <DocumentArrowDownIcon className="h-4 w-4" />
          Export PDF
        </button>
      )}
      <button type="button" onClick={onComplete} disabled={isCompleting} className={primaryClass}>
        {isCompleting ? (
          <>
            <Spinner className="h-4 w-4" />
            Completing...
          </>
        ) : (
          <>
            <CheckIcon className="h-4 w-4" />
            Mark Complete
          </>
        )}
      </button>
    </div>
  )
}

interface ResultsPanelProps {
  results?: ReactNode
  chart?: ReactNode
}

function ResultsPanel({ results, chart }: ResultsPanelProps) {
  if (!results && !chart) return null

  return (
    <div className="flex flex-col gap-4">
      {results && (
        <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800/50">
          <h3 className="mb-3 text-sm font-medium text-zinc-900 dark:text-white">Results</h3>
          {results}
        </div>
      )}
      {chart && (
        <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
          {chart}
        </div>
      )}
    </div>
  )
}

export function ToolTaskLayout(props: ToolTaskLayoutProps) {
  const {
    title,
    tabs,
    activeTab,
    onTabChange,
    children,
    results,
    chart,
    onSave,
    onExport,
    onComplete,
    saveStatus = 'idle',
    lastSavedAt,
    isSaving = false,
    isCompleting = false,
    className,
  } = props

  return (
    <div className={cn('flex min-h-screen flex-col', className)}>
      <div className="flex-1 pb-24">
        <div className="mx-auto max-w-6xl px-4 py-6">
          {/* Header with title and save indicator */}
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">{title}</h1>
            <SaveIndicator status={saveStatus} lastSavedAt={lastSavedAt} />
          </div>

          {/* Tab navigation */}
          <TabBar tabs={tabs} activeTab={activeTab} onTabChange={onTabChange} />

          {/* Main content grid: inputs on left, results on right (desktop) */}
          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            {/* Calculator content area */}
            <div className="lg:col-span-2">
              <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-800">
                {children}
              </div>
            </div>

            {/* Results panel (right side on desktop, below on mobile) */}
            <div className="lg:col-span-1">
              <ResultsPanel results={results} chart={chart} />
            </div>
          </div>
        </div>
      </div>

      {/* Fixed bottom action bar */}
      <div className="fixed inset-x-0 bottom-0 border-t border-zinc-200 bg-white/95 backdrop-blur dark:border-zinc-700 dark:bg-zinc-900/95">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <ActionButtons
            onSave={onSave}
            onExport={onExport}
            onComplete={onComplete}
            isSaving={isSaving}
            isCompleting={isCompleting}
          />
        </div>
      </div>
    </div>
  )
}
