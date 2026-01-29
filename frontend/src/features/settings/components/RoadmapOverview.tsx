import { Icon } from '@/components/ui/Icon'

export interface RoadmapStage {
  label: string
  status: 'completed' | 'in_progress' | 'upcoming'
}

export interface RoadmapOverviewProps {
  currentStage: string
  progress: number
  stages: RoadmapStage[]
  onViewRoadmap?: () => void
}

export function RoadmapOverview({
  currentStage,
  progress,
  stages,
  onViewRoadmap,
}: RoadmapOverviewProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-800">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold text-slate-900 dark:text-white">Business Roadmap Overview</h3>
        <button
          onClick={onViewRoadmap}
          className="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400"
        >
          View Full Roadmap →
        </button>
      </div>

      <div className="mb-4">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium text-slate-900 dark:text-white">{currentStage}</span>
          <span className="font-semibold text-primary-600 dark:text-primary-400">
            {progress}% Complete
          </span>
        </div>
        <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-zinc-700">
          <div
            className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-blue-400 to-primary-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        {stages.map((stage, i) => (
          <div key={i} className="flex items-center gap-2">
            <Icon
              name={
                stage.status === 'completed'
                  ? 'check_circle'
                  : stage.status === 'in_progress'
                    ? 'radio_button_checked'
                    : 'radio_button_unchecked'
              }
              size={16}
              className={
                stage.status === 'completed'
                  ? 'text-emerald-500'
                  : stage.status === 'in_progress'
                    ? 'text-primary-600 dark:text-primary-400'
                    : 'text-slate-300 dark:text-slate-600'
              }
              filled={stage.status === 'completed'}
            />
            <span
              className={`text-xs ${
                stage.status === 'upcoming'
                  ? 'text-slate-400 dark:text-slate-500'
                  : 'text-slate-700 dark:text-slate-300'
              }`}
            >
              {stage.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
