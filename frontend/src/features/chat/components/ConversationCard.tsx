import { Icon } from '@/components/ui/Icon'

export interface ConversationCardProps {
  id: string
  title: string
  summary: string
  timestamp: string
  icon: string
  iconBgColor: string
  iconColor: string
  onResume?: () => void
}

export function ConversationCard({
  title,
  summary,
  timestamp,
  icon,
  iconBgColor,
  iconColor,
  onResume,
}: ConversationCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 transition-all hover:border-slate-300 hover:shadow-md dark:border-zinc-700 dark:bg-zinc-800 dark:hover:border-zinc-600">
      <div className="mb-3 flex items-start justify-between">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-lg"
          style={{ backgroundColor: iconBgColor }}
        >
          <Icon name={icon} size={20} className={iconColor} />
        </div>
        <span className="text-xs text-slate-400 dark:text-slate-500">{timestamp}</span>
      </div>
      <h3 className="mb-2 font-semibold text-slate-900 dark:text-white">{title}</h3>
      <p className="mb-4 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">{summary}</p>
      <button
        onClick={onResume}
        className="inline-flex items-center gap-1 text-sm font-medium text-primary-600 transition-colors hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
      >
        Resume Chat
        <Icon name="arrow_forward" size={16} />
      </button>
    </div>
  )
}
