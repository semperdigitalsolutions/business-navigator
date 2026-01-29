import { Icon } from '@/components/ui/Icon'
import { cn } from '@/utils/classnames'

export type DocumentStatus = 'finalized' | 'draft' | 'template'

export interface DocumentCardProps {
  id: string
  title: string
  subtitle?: string
  icon: string
  status: DocumentStatus
  onOpen?: () => void
  onEdit?: () => void
}

const STATUS_CONFIG = {
  finalized: {
    label: 'FINALIZED',
    className:
      'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800',
  },
  draft: {
    label: 'DRAFT',
    className:
      'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
  },
  template: {
    label: 'TEMPLATE',
    className:
      'bg-sky-50 text-sky-700 border-sky-100 dark:bg-sky-900/30 dark:text-sky-400 dark:border-sky-800',
  },
}

export function DocumentCard({ title, subtitle, icon, status, onOpen, onEdit }: DocumentCardProps) {
  const statusConfig = STATUS_CONFIG[status]

  return (
    <div className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 transition-all hover:border-slate-300 hover:shadow-md dark:border-zinc-700 dark:bg-zinc-800 dark:hover:border-zinc-600">
      <div className="mb-4 flex items-start justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 dark:bg-zinc-700">
          <Icon name={icon} size={24} className="text-slate-600 dark:text-slate-400" />
        </div>
        <span
          className={cn(
            'rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide',
            statusConfig.className
          )}
        >
          {statusConfig.label}
        </span>
      </div>
      <h3 className="mb-1 font-semibold text-slate-900 dark:text-white">{title}</h3>
      {subtitle && <p className="mb-4 text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>}
      <div className="mt-auto flex items-center gap-2">
        <button
          onClick={onOpen}
          className="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-all hover:bg-slate-50 dark:border-zinc-600 dark:text-slate-300 dark:hover:bg-zinc-700"
        >
          Open
        </button>
        {onEdit && (
          <button
            onClick={onEdit}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition-all hover:bg-slate-50 hover:text-slate-600 dark:border-zinc-600 dark:hover:bg-zinc-700"
          >
            <Icon name="edit" size={18} />
          </button>
        )}
      </div>
    </div>
  )
}
