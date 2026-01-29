import { Icon } from '@/components/ui/Icon'

export interface DataRoomItem {
  label: string
  completed: boolean
}

export interface UpcomingRequirement {
  title: string
  subtitle: string
}

export interface DataRoomPanelProps {
  milestone: string
  progress: number
  items: DataRoomItem[]
  upcomingRequirements?: UpcomingRequirement[]
  onOpenDataRoom?: () => void
  onScheduleReview?: () => void
}

export function DataRoomPanel({
  milestone,
  progress,
  items,
  upcomingRequirements = [],
  onOpenDataRoom,
  onScheduleReview,
}: DataRoomPanelProps) {
  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-slate-200/60 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-800">
        <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-400">
          Business Velocity
        </h3>
        <div className="space-y-2">
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-slate-600 dark:text-slate-400">{milestone}</span>
            <span className="text-sm font-bold text-primary-600 dark:text-primary-400">
              {progress}%
            </span>
          </div>
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-zinc-700">
            <div
              className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-blue-400 to-primary-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="hide-scrollbar flex-1 overflow-y-auto p-6">
        {/* Data Room Prep Card */}
        <div className="rounded-xl border border-sky-100 bg-white p-5 shadow-soft dark:border-sky-800 dark:bg-zinc-800">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-50 text-primary-600 dark:bg-sky-900/30 dark:text-primary-400">
              <Icon name="folder_open" size={22} />
            </div>
            <h4 className="font-bold text-slate-900 dark:text-white">Data Room Prep</h4>
          </div>
          <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
            Organize key documents for due diligence review.
          </p>
          <div className="mb-4 space-y-2">
            {items.map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <Icon
                  name={item.completed ? 'check_circle' : 'radio_button_unchecked'}
                  size={18}
                  className={
                    item.completed ? 'text-emerald-500' : 'text-slate-300 dark:text-slate-600'
                  }
                  filled={item.completed}
                />
                <span className="text-sm text-slate-700 dark:text-slate-300">{item.label}</span>
              </div>
            ))}
          </div>
          <button
            onClick={onOpenDataRoom}
            className="w-full rounded-lg bg-primary-600 py-2.5 text-sm font-semibold text-white transition-all hover:bg-primary-700"
          >
            Open Data Room
          </button>
        </div>

        {/* Upcoming Requirements */}
        {upcomingRequirements.length > 0 && (
          <div className="mt-6">
            <h4 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">
              Upcoming Requirements
            </h4>
            <div className="space-y-3">
              {upcomingRequirements.map((req, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 dark:bg-zinc-700">
                    <Icon name="description" size={18} className="text-slate-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {req.title}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{req.subtitle}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 border-t border-slate-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-800">
        <button
          onClick={onScheduleReview}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50 dark:border-zinc-600 dark:text-slate-300 dark:hover:bg-zinc-700"
        >
          <Icon name="calendar_today" size={18} />
          Schedule Review
        </button>
      </div>
    </div>
  )
}
