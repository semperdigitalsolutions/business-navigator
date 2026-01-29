import { cn } from '@/utils/classnames'
import { Icon } from '@/components/ui/Icon'

export interface CategoryMilestone {
  label: string
  completed: boolean
}

export interface ActiveCategoryPanelProps {
  phaseName: string
  progress: number
  completedCount: number
  totalCount: number
  currentTask?: {
    title: string
    description: string
  }
  milestones?: CategoryMilestone[]
  onViewDetails?: () => void
  onViewRoadmap?: () => void
}

export function ActiveCategoryPanel({
  phaseName,
  progress,
  completedCount,
  totalCount,
  currentTask,
  milestones = [],
  onViewDetails,
  onViewRoadmap,
}: ActiveCategoryPanelProps) {
  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-slate-200/60 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-800">
        <h3 className="mb-1 text-xs font-bold uppercase tracking-widest text-slate-400">
          Active Category
        </h3>
        <p className="mb-4 text-lg font-bold text-slate-900 dark:text-white">{phaseName}</p>
        <div className="space-y-2">
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {completedCount} of {totalCount} complete
            </span>
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
        {/* Prioritized Task */}
        {currentTask && (
          <div className="mb-6 rounded-xl border border-sky-100 bg-white p-5 shadow-soft dark:border-sky-800 dark:bg-zinc-800">
            <div className="mb-3 flex items-center gap-2">
              <Icon name="priority_high" size={18} className="text-amber-500" />
              <span className="text-xs font-bold uppercase tracking-wide text-slate-400">
                Prioritized
              </span>
            </div>
            <h4 className="mb-2 font-bold text-slate-900 dark:text-white">{currentTask.title}</h4>
            <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
              {currentTask.description}
            </p>
            <button
              onClick={onViewDetails}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary-600 py-2.5 text-sm font-semibold text-white transition-all hover:bg-primary-700"
            >
              View Task Details
              <Icon name="arrow_forward" size={16} />
            </button>
          </div>
        )}

        {/* Milestones */}
        {milestones.length > 0 && (
          <div>
            <h4 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">
              Category Milestones
            </h4>
            <div className="space-y-2">
              {milestones.map((milestone, i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg p-2">
                  <Icon
                    name={milestone.completed ? 'check_circle' : 'radio_button_unchecked'}
                    size={18}
                    className={
                      milestone.completed
                        ? 'text-emerald-500'
                        : 'text-slate-300 dark:text-slate-600'
                    }
                    filled={milestone.completed}
                  />
                  <span
                    className={cn(
                      'text-sm',
                      milestone.completed
                        ? 'text-slate-500 line-through dark:text-slate-400'
                        : 'text-slate-700 dark:text-slate-300'
                    )}
                  >
                    {milestone.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 border-t border-slate-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-800">
        <button
          onClick={onViewRoadmap}
          className="group flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-sm font-bold text-white shadow-lg transition-all hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
        >
          <Icon
            name="map"
            size={18}
            className="transition-transform group-hover:-translate-y-0.5"
          />
          View Full Roadmap
        </button>
      </div>
    </div>
  )
}
