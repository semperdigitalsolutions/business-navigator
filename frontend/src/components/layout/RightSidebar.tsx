import { cn } from '@/utils/classnames'
import { Icon } from '@/components/ui/Icon'

export interface Task {
  id: string
  title: string
  description?: string
  status: 'completed' | 'in_progress' | 'pending'
}

export interface Phase {
  id: string
  title: string
  icon: string
  tasks: Task[]
  isExpanded?: boolean
}

export interface RecommendedTask {
  id: string
  title: string
  description: string
  icon: string
}

export interface RightSidebarProps {
  /** Current stage label */
  stageLabel?: string
  /** Progress percentage (0-100) */
  progressPercent?: number
  /** AI recommended task */
  recommendedTask?: RecommendedTask
  /** Task phases */
  phases?: Phase[]
  /** Callback when "Start Task" is clicked */
  onStartTask?: (taskId: string) => void
  /** Callback when "View Full Roadmap" is clicked */
  onViewRoadmap?: () => void
}

function ProgressHeader({
  stageLabel,
  progressPercent,
}: {
  stageLabel: string
  progressPercent: number
}) {
  return (
    <div className="flex-shrink-0 border-b border-slate-200/60 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-800">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">
          Business Velocity
        </h3>
        <span className="inline-flex items-center rounded border border-emerald-100 bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-600 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
          <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500" />
          On Track
        </span>
      </div>
      <div className="space-y-2">
        <div className="flex items-baseline justify-between">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Overall Progress
            </span>
            <div className="mt-0.5 text-sm font-bold text-slate-900 dark:text-white">
              {stageLabel}
            </div>
          </div>
          <span className="text-sm font-bold text-primary-600 dark:text-primary-400">
            {progressPercent}%
          </span>
        </div>
        <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-zinc-700">
          <div
            className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-blue-400 to-primary-500 transition-all duration-1000"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  )
}

function RecommendedTaskCard({ task, onStart }: { task: RecommendedTask; onStart: () => void }) {
  return (
    <div className="group relative rounded-xl border border-sky-100 bg-white p-1 shadow-soft transition-all duration-300 hover:border-sky-300 dark:border-sky-800 dark:bg-zinc-800">
      <div className="absolute bottom-0 left-0 top-0 w-1 rounded-l-xl bg-primary-500" />
      <div className="p-4 pl-5">
        <div className="mb-3 flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 rounded border border-sky-100 bg-sky-50 px-2 py-1 text-[10px] font-extrabold uppercase tracking-wider text-primary-600 dark:border-sky-800 dark:bg-sky-900/30 dark:text-primary-400">
            <Icon name="auto_awesome" size={16} />
            AI Recommended
          </span>
        </div>
        <div className="mb-4 flex gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-sky-100 bg-sky-50 text-primary-600 dark:border-sky-800 dark:bg-sky-900/30 dark:text-primary-400">
            <Icon name={task.icon} size={22} />
          </div>
          <div>
            <h4 className="text-sm font-bold leading-tight text-slate-900 dark:text-white">
              {task.title}
            </h4>
            <p className="mt-1 text-[11px] leading-snug text-slate-500 dark:text-slate-400">
              {task.description}
            </p>
          </div>
        </div>
        <button
          onClick={onStart}
          className="group/btn flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 py-2 text-xs font-bold text-white shadow-md transition-all hover:bg-slate-800 hover:shadow-lg dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
        >
          Start Task
          <Icon
            name="arrow_forward"
            size={16}
            className="transition-transform group-hover/btn:translate-x-0.5"
          />
        </button>
      </div>
    </div>
  )
}

const TASK_STATUS_CONFIG = {
  completed: {
    icon: 'check_circle',
    iconClass: 'text-emerald-500',
    bgClass: 'bg-emerald-50/50 dark:bg-emerald-900/10',
    textClass: 'text-slate-700 dark:text-slate-300',
  },
  in_progress: {
    icon: 'radio_button_checked',
    iconClass: 'text-primary-600 dark:text-primary-400',
    bgClass: 'bg-white border border-blue-100 shadow-sm dark:bg-zinc-800 dark:border-blue-800',
    textClass: 'font-bold text-slate-900 dark:text-white',
  },
  pending: {
    icon: 'radio_button_unchecked',
    iconClass: 'text-slate-300 group-hover:text-primary-600 dark:text-slate-600',
    bgClass: 'hover:bg-white hover:shadow-sm dark:hover:bg-zinc-800',
    textClass:
      'text-slate-600 group-hover:text-slate-900 dark:text-slate-400 dark:group-hover:text-white',
  },
} as const

function TaskItem({ task }: { task: Task }) {
  const config = TASK_STATUS_CONFIG[task.status]

  return (
    <div
      className={cn(
        'group flex cursor-pointer items-center gap-3 rounded-lg border border-transparent p-2.5 transition-all',
        config.bgClass,
        task.status === 'pending' && 'hover:border-slate-100 dark:hover:border-zinc-700'
      )}
    >
      <div className="relative flex h-5 w-5 items-center justify-center">
        {task.status === 'in_progress' && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-100 opacity-75" />
        )}
        <Icon
          name={config.icon}
          size={20}
          className={cn('relative', config.iconClass)}
          filled={task.status === 'completed'}
        />
      </div>
      <p className={cn('text-xs transition-colors', config.textClass)}>{task.title}</p>
      {task.status === 'in_progress' && (
        <span className="ml-auto rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-bold text-primary-600 dark:bg-blue-900/30 dark:text-primary-400">
          IN PROGRESS
        </span>
      )}
    </div>
  )
}

function PhaseSection({ phase }: { phase: Phase }) {
  const isCurrentPhase = phase.tasks.some((t) => t.status === 'in_progress')

  return (
    <div>
      <button className="group mb-3 flex w-full items-center justify-between">
        <h4
          className={cn(
            'flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest',
            isCurrentPhase
              ? 'text-primary-600 dark:text-primary-400'
              : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'
          )}
        >
          <Icon name={phase.icon} size={16} />
          {phase.title}
        </h4>
        <Icon
          name={phase.isExpanded !== false ? 'expand_less' : 'expand_more'}
          size={16}
          className="text-slate-300 group-hover:text-slate-500"
        />
      </button>
      {phase.isExpanded !== false && (
        <div className="space-y-1 pl-1">
          {phase.tasks.map((task) => (
            <TaskItem key={task.id} task={task} />
          ))}
        </div>
      )}
    </div>
  )
}

export function RightSidebar({
  stageLabel = 'Stage 2: Foundation',
  progressPercent = 65,
  recommendedTask,
  phases = [],
  onStartTask,
  onViewRoadmap,
}: RightSidebarProps) {
  return (
    <div className="flex h-full flex-col">
      <ProgressHeader stageLabel={stageLabel} progressPercent={progressPercent} />

      <div className="hide-scrollbar flex-1 space-y-8 overflow-y-auto scroll-smooth px-6 py-6">
        {recommendedTask && (
          <RecommendedTaskCard
            task={recommendedTask}
            onStart={() => onStartTask?.(recommendedTask.id)}
          />
        )}

        {phases.length > 0 && (
          <div className="space-y-6">
            {phases.map((phase) => (
              <PhaseSection key={phase.id} phase={phase} />
            ))}
          </div>
        )}
      </div>

      <div className="flex-shrink-0 border-t border-slate-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-800">
        <button
          onClick={onViewRoadmap}
          className="group flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-xs font-bold text-white shadow-lg transition-all hover:bg-slate-800 hover:shadow-xl dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
        >
          <Icon
            name="map"
            size={20}
            className="transition-transform group-hover:-translate-y-0.5"
          />
          View Full Roadmap
        </button>
      </div>
    </div>
  )
}
