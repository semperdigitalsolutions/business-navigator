import { cn } from '@/utils/classnames'
import { Icon } from '@/components/ui/Icon'
import { ReactNode } from 'react'

export type StageStatus = 'completed' | 'in_progress' | 'locked'

export interface StageCardProps {
  stageNumber: number
  title: string
  status: StageStatus
  children?: ReactNode
}

const STATUS_CONFIG = {
  completed: {
    icon: 'check_circle',
    iconClass: 'text-emerald-500',
    badgeClass:
      'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800',
    badgeText: 'COMPLETED',
  },
  in_progress: {
    icon: 'radio_button_checked',
    iconClass: 'text-primary-600 dark:text-primary-400',
    badgeClass:
      'bg-sky-50 text-sky-700 border-sky-100 dark:bg-sky-900/30 dark:text-sky-400 dark:border-sky-800',
    badgeText: 'IN PROGRESS',
  },
  locked: {
    icon: 'lock',
    iconClass: 'text-slate-400 dark:text-slate-500',
    badgeClass:
      'bg-slate-50 text-slate-500 border-slate-200 dark:bg-zinc-800 dark:text-slate-400 dark:border-zinc-700',
    badgeText: 'LOCKED',
  },
}

export function StageCard({ stageNumber, title, status, children }: StageCardProps) {
  const config = STATUS_CONFIG[status]
  const isLocked = status === 'locked'

  return (
    <div
      className={cn(
        'relative rounded-xl border p-6',
        isLocked
          ? 'border-slate-200 bg-slate-50/50 dark:border-zinc-700 dark:bg-zinc-800/50'
          : 'border-slate-200 bg-white dark:border-zinc-700 dark:bg-zinc-800'
      )}
    >
      {/* Header */}
      <div className="mb-4 flex items-center gap-3">
        <Icon
          name={config.icon}
          size={24}
          className={config.iconClass}
          filled={status === 'completed'}
        />
        <div className="flex-1">
          <h3
            className={cn(
              'text-lg font-bold',
              isLocked ? 'text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-white'
            )}
          >
            Stage {stageNumber}: {title}
          </h3>
        </div>
        <span
          className={cn(
            'rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wide',
            config.badgeClass
          )}
        >
          {config.badgeText}
        </span>
      </div>

      {/* Content */}
      {children && <div className={cn(isLocked && 'opacity-60')}>{children}</div>}
    </div>
  )
}
