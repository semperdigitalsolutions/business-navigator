import { AppShell, LeftSidebar } from '@/components/layout'
import { Icon } from '@/components/ui/Icon'
import { TaskCard } from '@/features/tasks/components/TaskCard'
import { PhaseSection } from '@/features/tasks/components/PhaseSection'
import { ActiveCategoryPanel } from '@/features/tasks/components/ActiveCategoryPanel'

const PHASE_1_TASKS = [
  {
    id: '1',
    title: 'Entity Selection',
    description: 'Choose the right business structure and prepare initial formation documents.',
    status: 'in_progress' as const,
    actionLabel: 'Continue',
  },
  {
    id: '2',
    title: 'Banking Setup',
    description: 'Open business bank accounts and issue corporate credit cards.',
    status: 'ready' as const,
    actionLabel: 'Start Setup',
  },
  {
    id: '3',
    title: 'Financial Modeling',
    description: 'Build 3-year financial projections and revenue models.',
    status: 'pending' as const,
    actionLabel: 'Initiate',
  },
]

const PHASE_2_TASKS = [
  {
    id: '4',
    title: 'Cap Table Management',
    description: 'Model equity distribution and manage performance milestones.',
    status: 'ready' as const,
    actionLabel: 'Configure',
  },
  {
    id: '5',
    title: 'IP Protection',
    description: 'Secure intellectual property through trademark filings and patents.',
    status: 'pending' as const,
    actionLabel: 'Review',
  },
  {
    id: '6',
    title: 'Operating Agreement',
    description: 'Define member operations, voting rights, and responsibilities.',
    status: 'pending' as const,
    actionLabel: 'Draft',
  },
  {
    id: '7',
    title: 'Trademark Filing',
    description: 'Protect your brand name and logo with official USPTO registration.',
    status: 'pending' as const,
    actionLabel: 'Start',
  },
]

const CATEGORY_MILESTONES = [
  { label: 'Articles of Incorporation', completed: true },
  { label: 'EIN Registration', completed: true },
  { label: 'Operating Agreement', completed: false },
  { label: 'Initial Bank Account', completed: false },
]

export function TaskLibraryPage() {
  return (
    <AppShell
      leftSidebar={<LeftSidebar userName="Erica" userPlan="Pro Plan" />}
      rightSidebar={
        <ActiveCategoryPanel
          phaseName="Phase 1: Foundation"
          progress={40}
          completedCount={2}
          totalCount={5}
          currentTask={{
            title: 'Prioritize Entity Selection',
            description:
              "Complete your funding forecast, securing your LLC today before it's too late.",
          }}
          milestones={CATEGORY_MILESTONES}
          onViewDetails={() => console.warn('View details')}
          onViewRoadmap={() => console.warn('View roadmap')}
        />
      }
    >
      {/* Header */}
      <header className="flex-shrink-0 border-b border-slate-100 px-8 py-6 dark:border-zinc-800">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Task Library</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Execute your roadmap with AI-guided workflows. Organized by business phase.
            </p>
          </div>
          <button className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition-all hover:bg-slate-50 dark:border-zinc-700 dark:text-slate-400 dark:hover:bg-zinc-800">
            <Icon name="filter_list" size={18} />
            Filter
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="hide-scrollbar flex-1 overflow-y-auto p-8">
        <PhaseSection phaseNumber={1} title="Foundation" taskCount={3} isActive>
          {PHASE_1_TASKS.map((task) => (
            <TaskCard
              key={task.id}
              {...task}
              onAction={() => console.warn('Task action:', task.id)}
            />
          ))}
        </PhaseSection>

        <PhaseSection phaseNumber={2} title="Legal & IP" taskCount={4}>
          {PHASE_2_TASKS.map((task) => (
            <TaskCard
              key={task.id}
              {...task}
              onAction={() => console.warn('Task action:', task.id)}
            />
          ))}
        </PhaseSection>
      </div>
    </AppShell>
  )
}
