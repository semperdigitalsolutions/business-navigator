import { cn } from '@/utils/classnames'

export type TaskStatus = 'in_progress' | 'ready' | 'pending'

export interface TaskCardProps {
  id: string
  title: string
  description: string
  status: TaskStatus
  actionLabel?: string
  onAction?: () => void
}

const STATUS_CONFIG = {
  in_progress: {
    dotClass: 'bg-primary-500',
    badgeClass:
      'bg-sky-50 text-sky-700 border-sky-100 dark:bg-sky-900/30 dark:text-sky-400 dark:border-sky-800',
    badgeText: 'In Progress',
  },
  ready: {
    dotClass: 'bg-emerald-500',
    badgeClass:
      'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800',
    badgeText: 'Ready',
  },
  pending: {
    dotClass: 'bg-slate-300 dark:bg-slate-600',
    badgeClass:
      'bg-slate-50 text-slate-500 border-slate-200 dark:bg-zinc-800 dark:text-slate-400 dark:border-zinc-700',
    badgeText: 'Pending',
  },
}

export function TaskCard({ title, description, status, actionLabel, onAction }: TaskCardProps) {
  const config = STATUS_CONFIG[status]

  return (
    <div className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 transition-all hover:border-slate-300 hover:shadow-md dark:border-zinc-700 dark:bg-zinc-800 dark:hover:border-zinc-600">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={cn('h-2.5 w-2.5 rounded-full', config.dotClass)} />
          <span
            className={cn(
              'rounded-full border px-2.5 py-0.5 text-[10px] font-bold',
              config.badgeClass
            )}
          >
            {config.badgeText}
          </span>
        </div>
      </div>
      <h3 className="mb-2 font-semibold text-slate-900 dark:text-white">{title}</h3>
      <p className="mb-4 flex-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>
      {onAction && (
        <button
          onClick={onAction}
          className={cn(
            'w-full rounded-lg py-2.5 text-sm font-medium transition-all',
            status === 'in_progress'
              ? 'bg-primary-600 text-white hover:bg-primary-700'
              : status === 'ready'
                ? 'bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100'
                : 'border border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-zinc-600 dark:text-slate-400 dark:hover:bg-zinc-700'
          )}
        >
          {actionLabel ||
            (status === 'in_progress' ? 'Continue' : status === 'ready' ? 'Start' : 'View')}
        </button>
      )}
    </div>
  )
}
