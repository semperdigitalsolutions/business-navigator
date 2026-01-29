import { AppShell, LeftSidebar, RightSidebar } from '@/components/layout'
import { Icon } from '@/components/ui/Icon'
import { StageCard } from '@/features/progress/components/StageCard'
import { MetricBadge } from '@/features/progress/components/MetricBadge'

const DEMO_PHASES = [
  {
    id: 'legal',
    title: 'Phase 2: Legal & Compliance',
    icon: 'policy',
    tasks: [
      { id: '1', title: 'Legal Setup', status: 'in_progress' as const },
      { id: '2', title: 'Cap Table Draft', status: 'pending' as const },
    ],
  },
]

export function ProgressPage() {
  return (
    <AppShell
      leftSidebar={<LeftSidebar userName="Erica" userPlan="Pro Plan" />}
      rightSidebar={
        <RightSidebar
          stageLabel="Stage 2: Foundation"
          progressPercent={65}
          recommendedTask={{
            id: 'legal',
            title: 'Legal Setup',
            description: 'Selecting legal entity structure and registered agent.',
            icon: 'gavel',
          }}
          phases={DEMO_PHASES}
        />
      }
    >
      {/* Header */}
      <header className="flex-shrink-0 border-b border-slate-100 px-8 py-6 dark:border-zinc-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-1.5 dark:bg-zinc-800">
              <Icon name="show_chart" size={18} className="text-slate-500" />
              <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Progress View
              </span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">Growth Path</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Track milestones and unlock next stages of your venture.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex rounded-lg border border-slate-200 dark:border-zinc-700">
              <button className="rounded-l-lg bg-white px-4 py-2 text-sm font-medium text-slate-900 dark:bg-zinc-800 dark:text-white">
                Timeline
              </button>
              <button className="rounded-r-lg px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-zinc-700">
                Gantt View
              </button>
            </div>
            <button className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-all hover:bg-slate-50 dark:border-zinc-700 dark:text-slate-400 dark:hover:bg-zinc-800">
              <Icon name="download" size={18} />
              Export Report
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="hide-scrollbar flex-1 overflow-y-auto p-8">
        <div className="mx-auto max-w-4xl space-y-6">
          {/* Stage 1: Completed */}
          <StageCard stageNumber={1} title="Ideation" status="completed">
            <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <Icon name="check" size={16} className="text-emerald-500" />
                <span>Problem Statement Definition</span>
                <span className="ml-auto text-xs text-slate-400">Approved on Oct 12</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon name="check" size={16} className="text-emerald-500" />
                <span>Market Validation Survey</span>
                <span className="ml-auto text-xs text-slate-400">142 Responses collected</span>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3 dark:bg-zinc-700/50">
              <span className="text-sm font-medium text-slate-500">METRICS</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-600 dark:text-slate-400">Confidence Score</span>
                <span className="font-bold text-emerald-600">9.2/10</span>
              </div>
            </div>
          </StageCard>

          {/* Stage 2: In Progress */}
          <StageCard stageNumber={2} title="Foundation" status="in_progress">
            <p className="mb-6 text-sm text-slate-600 dark:text-slate-400">
              Current focus is on establishing the legal entity, setting up financial
              infrastructure, and preparing the initial capitalization table for early stakeholders.
            </p>

            <div className="mb-6 grid grid-cols-3 gap-4">
              <MetricBadge icon="gavel" label="Legal" value="80%" status="success" />
              <MetricBadge icon="account_balance" label="Banking" value="15%" status="warning" />
              <MetricBadge icon="group" label="Team" value="2/3" status="default" />
            </div>

            <div>
              <h4 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">
                IMMEDIATE ACTIONS
              </h4>
              <div className="space-y-2">
                <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 p-3 transition-all hover:border-primary-300 hover:bg-primary-50/50 dark:border-zinc-700 dark:hover:border-primary-600 dark:hover:bg-primary-900/20">
                  <input
                    type="checkbox"
                    className="h-5 w-5 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="flex-1 text-sm text-slate-700 dark:text-slate-300">
                    Select Registered Agent for Delaware Filing
                  </span>
                  <Icon name="arrow_forward" size={18} className="text-slate-400" />
                </label>
                <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 p-3 transition-all hover:border-primary-300 hover:bg-primary-50/50 dark:border-zinc-700 dark:hover:border-primary-600 dark:hover:bg-primary-900/20">
                  <input
                    type="checkbox"
                    className="h-5 w-5 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="flex-1 text-sm text-slate-700 dark:text-slate-300">
                    Upload EIN Confirmation Letter
                  </span>
                </label>
              </div>
            </div>
          </StageCard>

          {/* Stage 3: Locked */}
          <StageCard stageNumber={3} title="Launch Prep" status="locked">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Includes domain strategy, MVP beta testing, and initial marketing push. Complete
              &quot;Foundation&quot; to unlock detailed roadmap.
            </p>
          </StageCard>
        </div>
      </div>
    </AppShell>
  )
}
