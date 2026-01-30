/**
 * Chat Context Header - Shows AI context about the user
 * Collapsible header displaying what information the AI has access to
 */
import { useState } from 'react'
import { Icon } from '@/components/ui/Icon'
import { cn } from '@/utils/classnames'
import {
  useChatContext,
  CATEGORY_LABELS,
  STAGE_LABELS,
  PHASE_LABELS,
} from '../hooks/useChatContext'

export interface ChatContextHeaderProps {
  className?: string
}

export function ChatContextHeader({ className }: ChatContextHeaderProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const context = useChatContext()

  // If no context available, don't render
  if (!context.hasContext) {
    return null
  }

  return (
    <div
      className={cn(
        'border-b border-slate-100 bg-slate-50/50 dark:border-zinc-800 dark:bg-zinc-900/50',
        className
      )}
    >
      <ContextSummaryBar
        summaryParts={context.summaryParts}
        isExpanded={isExpanded}
        onToggle={() => setIsExpanded(!isExpanded)}
      />

      {isExpanded && <ContextDetailsPanel context={context} />}
    </div>
  )
}

// --- Sub-components ---

interface ContextSummaryBarProps {
  summaryParts: string[]
  isExpanded: boolean
  onToggle: () => void
}

function ContextSummaryBar({ summaryParts, isExpanded, onToggle }: ContextSummaryBarProps) {
  return (
    <button
      onClick={onToggle}
      className="flex w-full items-center justify-between px-6 py-2.5 text-left transition-colors hover:bg-slate-100/50 dark:hover:bg-zinc-800/50"
      aria-expanded={isExpanded}
      aria-controls="context-details"
    >
      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
        <Icon name="psychology" size={16} className="text-slate-400 dark:text-slate-500" />
        <span>
          AI knows:{' '}
          <span className="font-medium text-slate-600 dark:text-slate-300">
            {summaryParts.join(' \u2022 ') || 'Basic context'}
          </span>
        </span>
      </div>
      <Icon
        name="expand_more"
        size={18}
        className={cn(
          'text-slate-400 transition-transform duration-200 dark:text-slate-500',
          isExpanded && 'rotate-180'
        )}
      />
    </button>
  )
}

interface ContextDetailsPanelProps {
  context: ReturnType<typeof useChatContext>
}

function ContextDetailsPanel({ context }: ContextDetailsPanelProps) {
  return (
    <div id="context-details" className="border-t border-slate-100 px-6 py-4 dark:border-zinc-800">
      <div className="grid gap-4 text-xs sm:grid-cols-2">
        <BusinessContextSection context={context} />
        <ProgressContextSection context={context} />
      </div>
    </div>
  )
}

function BusinessContextSection({ context }: ContextDetailsPanelProps) {
  return (
    <ContextSection title="Business" icon="storefront">
      <ContextItem label="Name" value={context.businessName} />
      <ContextItem
        label="Category"
        value={context.businessCategory ? CATEGORY_LABELS[context.businessCategory] : undefined}
      />
      <ContextItem label="State" value={context.stateCode} />
      <ContextItem
        label="Stage"
        value={context.currentStage ? STAGE_LABELS[context.currentStage] : undefined}
      />
    </ContextSection>
  )
}

function ProgressContextSection({ context }: ContextDetailsPanelProps) {
  return (
    <ContextSection title="Progress" icon="trending_up">
      <ContextItem
        label="Current Phase"
        value={context.currentPhase ? PHASE_LABELS[context.currentPhase] : 'Not started'}
      />
      <ContextItem
        label="Tasks"
        value={
          context.totalTasks > 0
            ? `${context.completedTasks}/${context.totalTasks} complete`
            : undefined
        }
      />
      <ContextItem label="Recent Task" value={context.recentCompletedTask?.title} />
      <ContextItem label="Current Focus" value={context.heroTask?.title} highlight />
    </ContextSection>
  )
}

interface ContextSectionProps {
  title: string
  icon: string
  children: React.ReactNode
}

function ContextSection({ title, icon, children }: ContextSectionProps) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
        <Icon name={icon} size={14} />
        <span className="font-semibold uppercase tracking-wider">{title}</span>
      </div>
      <div className="space-y-1">{children}</div>
    </div>
  )
}

interface ContextItemProps {
  label: string
  value?: string
  highlight?: boolean
}

function ContextItem({ label, value, highlight }: ContextItemProps) {
  if (!value) return null

  return (
    <div className="flex items-baseline gap-2">
      <span className="text-slate-400 dark:text-slate-500">{label}:</span>
      <span
        className={cn(
          'font-medium',
          highlight
            ? 'text-primary-600 dark:text-primary-400'
            : 'text-slate-700 dark:text-slate-300'
        )}
      >
        {value}
      </span>
    </div>
  )
}
