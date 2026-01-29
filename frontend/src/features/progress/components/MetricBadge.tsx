import { cn } from '@/utils/classnames'
import { Icon } from '@/components/ui/Icon'

export interface MetricBadgeProps {
  icon: string
  label: string
  value: string
  status?: 'success' | 'warning' | 'default'
}

export function MetricBadge({ icon, label, value, status = 'default' }: MetricBadgeProps) {
  const statusColors = {
    success: 'text-emerald-600 dark:text-emerald-400',
    warning: 'text-amber-600 dark:text-amber-400',
    default: 'text-slate-600 dark:text-slate-400',
  }

  return (
    <div className="flex flex-col items-center rounded-lg bg-slate-50 p-4 dark:bg-zinc-700/50">
      <Icon name={icon} size={24} className="mb-2 text-slate-400" />
      <span className={cn('text-2xl font-bold', statusColors[status])}>{value}</span>
      <span className="text-xs text-slate-500 dark:text-slate-400">{label}</span>
    </div>
  )
}
