/**
 * Stage Content Components
 * Content components for each stage in the progress page
 */
import { Icon } from '@/components/ui/Icon'
import { MetricBadge } from './MetricBadge'
import { getMetricStatus } from '../utils/progress-helpers'
import type { PhaseProgress, UserTask } from '@shared/types'

interface IdeationContentProps {
  phase: PhaseProgress
  ideationScore: number
}

export function IdeationContent({ phase, ideationScore }: IdeationContentProps) {
  if (phase.status === 'completed') {
    return (
      <>
        <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <Icon name="check" size={16} className="text-emerald-500" />
            <span>Problem Statement Definition</span>
            <span className="ml-auto text-xs text-slate-400">Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <Icon name="check" size={16} className="text-emerald-500" />
            <span>Business Concept Validated</span>
            <span className="ml-auto text-xs text-slate-400">AI-assisted</span>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3 dark:bg-zinc-700/50">
          <span className="text-sm font-medium text-slate-500">METRICS</span>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600 dark:text-slate-400">Confidence Score</span>
            <span className="font-bold text-emerald-600">{ideationScore}%</span>
          </div>
        </div>
      </>
    )
  }

  if (phase.status === 'in_progress') {
    return (
      <p className="text-sm text-slate-600 dark:text-slate-400">
        Currently working on ideation tasks. Complete your problem statement and validate your
        business concept to unlock the next stage.
      </p>
    )
  }

  return (
    <p className="text-sm text-slate-500 dark:text-slate-400">
      Start by defining your problem statement and validating your business concept.
    </p>
  )
}

interface FoundationContentProps {
  phase: PhaseProgress
  legalScore: number
  financialScore: number
  launchPrepScore: number
  heroTask: UserTask | null
}

export function FoundationContent({
  phase,
  legalScore,
  financialScore,
  launchPrepScore,
  heroTask,
}: FoundationContentProps) {
  if (phase.status === 'not_started') {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Complete the Ideation stage to unlock Foundation tasks including legal entity setup and
        compliance requirements.
      </p>
    )
  }

  const description =
    phase.status === 'completed'
      ? 'Legal foundation established. Entity formed and compliance requirements met.'
      : 'Current focus is on establishing the legal entity and preparing for compliance.'

  return (
    <>
      <p className="mb-6 text-sm text-slate-600 dark:text-slate-400">{description}</p>

      <div className="mb-6 grid grid-cols-3 gap-4">
        <MetricBadge
          icon="gavel"
          label="Legal"
          value={`${legalScore}%`}
          status={getMetricStatus(legalScore)}
        />
        <MetricBadge
          icon="account_balance"
          label="Financial"
          value={`${financialScore}%`}
          status={getMetricStatus(financialScore)}
        />
        <MetricBadge
          icon="rocket_launch"
          label="Launch"
          value={`${launchPrepScore}%`}
          status={getMetricStatus(launchPrepScore)}
        />
      </div>

      {phase.status === 'in_progress' && heroTask && (
        <div>
          <h4 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">
            IMMEDIATE ACTIONS
          </h4>
          <div className="space-y-2">
            <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 p-3 transition-all hover:border-primary-300 hover:bg-primary-50/50 dark:border-zinc-700 dark:hover:border-primary-600 dark:hover:bg-primary-900/20">
              <input
                type="checkbox"
                className="h-5 w-5 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="flex-1 text-sm text-slate-700 dark:text-slate-300">
                {heroTask.title}
              </span>
              <Icon name="arrow_forward" size={18} className="text-slate-400" />
            </label>
          </div>
        </div>
      )}
    </>
  )
}

interface GenericStageContentProps {
  phase: PhaseProgress
  inProgressText: string
  lockedText: string
  completedText: string
}

export function GenericStageContent({
  phase,
  inProgressText,
  lockedText,
  completedText,
}: GenericStageContentProps) {
  let text: string
  if (phase.status === 'completed') {
    text = completedText
  } else if (phase.status === 'in_progress') {
    text = inProgressText
  } else {
    text = lockedText
  }

  return <p className="text-sm text-slate-500 dark:text-slate-400">{text}</p>
}
