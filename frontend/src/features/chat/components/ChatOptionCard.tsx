import { Icon } from '@/components/ui/Icon'

export interface ChatOptionCardProps {
  icon: string
  title: string
  description: string
  variant?: 'primary' | 'secondary'
  onClick?: () => void
}

export function ChatOptionCard({
  icon,
  title,
  description,
  variant = 'primary',
  onClick,
}: ChatOptionCardProps) {
  const isPrimary = variant === 'primary'

  return (
    <button
      onClick={onClick}
      className={`group p-5 text-left active:scale-95 rounded-2xl bg-slate-50 border border-slate-200 shadow-catalyst transition-all duration-300 hover:bg-white hover:-translate-y-1 hover:shadow-lg dark:bg-zinc-800 dark:border-zinc-700 dark:hover:bg-zinc-700 ${
        isPrimary
          ? 'hover:border-primary-500 hover:shadow-primary-500/5'
          : 'hover:border-secondary-500 hover:shadow-secondary-500/5'
      }`}
    >
      <div className="mb-3 flex items-center justify-between">
        <Icon
          name={icon}
          size={24}
          className={isPrimary ? 'text-primary-600' : 'text-secondary-500'}
        />
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-bold opacity-0 transition-opacity group-hover:opacity-100 ${
            isPrimary
              ? 'bg-sky-50 text-primary-600 dark:bg-primary-900/30'
              : 'bg-indigo-50 text-secondary-500 dark:bg-secondary-900/30'
          }`}
        >
          SELECT OPTION
        </span>
      </div>
      <h4 className="mb-1 text-sm font-bold text-slate-900 dark:text-white">{title}</h4>
      <p className="text-xs leading-relaxed text-slate-500 group-hover:text-slate-600 dark:text-slate-400 dark:group-hover:text-slate-300">
        {description}
      </p>
    </button>
  )
}
