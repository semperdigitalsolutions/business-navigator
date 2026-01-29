/**
 * EducationTaskLayout Component
 * Issue #82: Layout for educational "learn + action" tasks
 * Features: Tab navigation, markdown content, requirements checklist, external links
 */
import { useState } from 'react'
import { cn } from '@/utils/classnames'
import { Button } from '@/components/catalyst-ui-kit/typescript/button'
import { MarkdownContent } from './MarkdownContent'
import { LeavingAppModal } from './LeavingAppModal'

export interface ExternalLink {
  label: string
  url: string
  description?: string
}

export interface EducationTaskLayoutProps {
  title: string
  content: string
  requirements?: string[]
  externalLinks?: ExternalLink[]
  onComplete: () => void
  onRemindLater?: () => void
}

type TabId = 'learn' | 'requirements' | 'done'

const TABS: { id: TabId; label: string }[] = [
  { id: 'learn', label: 'Learn' },
  { id: 'requirements', label: 'Check Requirements' },
  { id: 'done', label: 'Done' },
]

function TabButton({
  id: _id,
  label,
  isActive,
  onClick,
}: {
  id: TabId
  label: string
  isActive: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'relative px-4 py-2 text-sm font-medium transition-colors',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2',
        isActive
          ? 'text-indigo-600 dark:text-indigo-400'
          : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
      )}
      aria-selected={isActive}
      role="tab"
    >
      {label}
      {isActive && (
        <span className="absolute inset-x-0 bottom-0 h-0.5 bg-indigo-600 dark:bg-indigo-400" />
      )}
    </button>
  )
}

function TabNavigation({
  activeTab,
  onTabChange,
}: {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
}) {
  return (
    <div className="flex border-b border-zinc-200 dark:border-zinc-700" role="tablist">
      {TABS.map((tab) => (
        <TabButton
          key={tab.id}
          id={tab.id}
          label={tab.label}
          isActive={activeTab === tab.id}
          onClick={() => onTabChange(tab.id)}
        />
      ))}
    </div>
  )
}

function RequirementItem({
  requirement,
  isChecked,
  onToggle,
}: {
  requirement: string
  isChecked: boolean
  onToggle: () => void
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-lg p-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
      <input
        type="checkbox"
        checked={isChecked}
        onChange={onToggle}
        className="mt-0.5 h-5 w-5 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500 dark:border-zinc-600 dark:bg-zinc-700"
      />
      <span
        className={cn(
          'text-sm text-zinc-700 dark:text-zinc-300',
          isChecked && 'text-zinc-500 line-through dark:text-zinc-500'
        )}
      >
        {requirement}
      </span>
    </label>
  )
}

function RequirementsTabContent({ requirements }: { requirements: string[] }) {
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set())

  const toggleItem = (index: number) => {
    setCheckedItems((prev) => {
      const next = new Set(prev)
      if (next.has(index)) {
        next.delete(index)
      } else {
        next.add(index)
      }
      return next
    })
  }

  if (requirements.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-zinc-500 dark:text-zinc-400">No specific requirements for this task.</p>
      </div>
    )
  }

  return (
    <div className="py-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-medium text-zinc-900 dark:text-white">Your Requirements</h3>
        <span className="text-sm text-zinc-500 dark:text-zinc-400">
          {checkedItems.size} of {requirements.length} completed
        </span>
      </div>
      <div className="divide-y divide-zinc-100 rounded-lg border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-700">
        {requirements.map((req, i) => (
          <RequirementItem
            key={i}
            requirement={req}
            isChecked={checkedItems.has(i)}
            onToggle={() => toggleItem(i)}
          />
        ))}
      </div>
    </div>
  )
}

function ExternalLinkIcon() {
  return (
    <svg
      className="h-5 w-5 flex-shrink-0 text-zinc-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
      />
    </svg>
  )
}

function ExternalLinkButton({
  link,
  onOpenModal,
}: {
  link: ExternalLink
  onOpenModal: (url: string) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onOpenModal(link.url)}
      className="flex w-full items-center justify-between rounded-lg border border-zinc-200 p-4 text-left hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800/50"
    >
      <div>
        <span className="text-sm font-medium text-zinc-900 dark:text-white">{link.label}</span>
        {link.description && (
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{link.description}</p>
        )}
      </div>
      <ExternalLinkIcon />
    </button>
  )
}

function DoneTabContent({
  title,
  externalLinks,
  onComplete,
  onRemindLater,
  onOpenModal,
}: {
  title: string
  externalLinks?: ExternalLink[]
  onComplete: () => void
  onRemindLater?: () => void
  onOpenModal: (url: string) => void
}) {
  return (
    <div className="py-4">
      <div className="mb-6 rounded-lg bg-zinc-50 p-4 dark:bg-zinc-800/50">
        <h3 className="mb-2 text-sm font-medium text-zinc-900 dark:text-white">Task Summary</h3>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Complete "{title}" by reviewing the educational content and checking off your
          requirements.
        </p>
      </div>

      {externalLinks && externalLinks.length > 0 && (
        <div className="mb-6">
          <h4 className="mb-3 text-sm font-medium text-zinc-900 dark:text-white">Helpful Links</h4>
          <div className="space-y-3">
            {externalLinks.map((link, i) => (
              <ExternalLinkButton key={i} link={link} onOpenModal={onOpenModal} />
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button color="indigo" onClick={onComplete} className="flex-1">
          I completed this
        </Button>
        {onRemindLater && (
          <Button outline onClick={onRemindLater} className="flex-1">
            Remind me later
          </Button>
        )}
      </div>
    </div>
  )
}

export function EducationTaskLayout({
  title,
  content,
  requirements = [],
  externalLinks,
  onComplete,
  onRemindLater,
}: EducationTaskLayoutProps) {
  const [activeTab, setActiveTab] = useState<TabId>('learn')
  const [modalUrl, setModalUrl] = useState<string | null>(null)

  const handleConfirmNavigation = () => {
    if (modalUrl) {
      window.open(modalUrl, '_blank', 'noopener,noreferrer')
      setModalUrl(null)
    }
  }

  return (
    <div className="flex flex-col">
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="min-h-[300px]" role="tabpanel" aria-label={`${activeTab} content`}>
        {activeTab === 'learn' && (
          <div className="py-4">
            <MarkdownContent content={content} showReadingTime />
          </div>
        )}
        {activeTab === 'requirements' && <RequirementsTabContent requirements={requirements} />}
        {activeTab === 'done' && (
          <DoneTabContent
            title={title}
            externalLinks={externalLinks}
            onComplete={onComplete}
            onRemindLater={onRemindLater}
            onOpenModal={setModalUrl}
          />
        )}
      </div>

      <LeavingAppModal
        isOpen={modalUrl !== null}
        onClose={() => setModalUrl(null)}
        onConfirm={handleConfirmNavigation}
        destinationUrl={modalUrl ?? ''}
      />
    </div>
  )
}
