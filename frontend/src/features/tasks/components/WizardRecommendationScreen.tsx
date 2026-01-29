/**
 * WizardRecommendationScreen Component
 * Issue #75: AI recommendations screen for wizard-style tasks
 */
import { useState } from 'react'
import { ChevronDownIcon, ChevronUpIcon, SparklesIcon } from '@heroicons/react/24/outline'
import { CheckCircleIcon } from '@heroicons/react/24/solid'
import { cn } from '@/utils/classnames'

export interface RecommendationOption {
  id: string
  name: string
  description: string
  pros?: string[]
  cons?: string[]
}

interface Recommendation {
  option: string
  confidence: number
  reasoning: string[]
}

interface WizardRecommendationScreenProps {
  recommendation: Recommendation
  options: RecommendationOption[]
  onSelect: (optionId: string) => void
  onRequestDifferent?: () => void
  className?: string
}

function getConfidenceBadgeClasses(confidence: number): string {
  if (confidence >= 80) {
    return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
  }
  if (confidence >= 60) {
    return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
  }
  return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
}

function ConfidenceBadge({ confidence }: { confidence: number }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        getConfidenceBadgeClasses(confidence)
      )}
    >
      {confidence}% match
    </span>
  )
}

function ReasoningBox({ reasoning }: { reasoning: string[] }) {
  return (
    <div className="rounded-lg bg-indigo-50 p-4 dark:bg-indigo-900/20">
      <div className="mb-2 flex items-center gap-2 text-sm font-medium text-indigo-900 dark:text-indigo-300">
        <SparklesIcon className="h-4 w-4" />
        Why we recommend this
      </div>
      <ul className="space-y-1.5 text-sm text-indigo-800 dark:text-indigo-200">
        {reasoning.map((reason, index) => (
          <li key={index} className="flex items-start gap-2">
            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" />
            {reason}
          </li>
        ))}
      </ul>
    </div>
  )
}

interface OptionCardProps {
  option: RecommendationOption
  isRecommended: boolean
  onSelect: () => void
}

function OptionCard({ option, isRecommended, onSelect }: OptionCardProps) {
  const cardClasses = cn(
    'relative rounded-lg border p-4 transition-all',
    isRecommended
      ? 'border-indigo-500 bg-indigo-50/50 ring-1 ring-indigo-500 dark:border-indigo-400 dark:bg-indigo-900/10 dark:ring-indigo-400'
      : 'border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:border-zinc-600'
  )

  return (
    <div className={cardClasses}>
      {isRecommended && (
        <div className="absolute -top-2.5 left-3 inline-flex items-center gap-1 rounded-full bg-indigo-600 px-2 py-0.5 text-xs font-medium text-white">
          <CheckCircleIcon className="h-3 w-3" />
          Recommended
        </div>
      )}
      <div className={isRecommended ? 'pt-1' : ''}>
        <h3 className="text-base font-semibold text-zinc-900 dark:text-white">{option.name}</h3>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{option.description}</p>
        <button
          type="button"
          onClick={onSelect}
          className={cn(
            'mt-3 w-full rounded-lg px-4 py-2 text-sm font-medium transition-colors',
            isRecommended
              ? 'bg-indigo-600 text-white hover:bg-indigo-700'
              : 'bg-zinc-100 text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-700 dark:text-white dark:hover:bg-zinc-600'
          )}
        >
          Select {option.name}
        </button>
      </div>
    </div>
  )
}

function ComparisonOptionCard({
  option,
  isRecommended,
}: {
  option: RecommendationOption
  isRecommended: boolean
}) {
  return (
    <div
      className={cn(
        'rounded-lg border p-4',
        isRecommended
          ? 'border-indigo-200 bg-indigo-50/30 dark:border-indigo-800 dark:bg-indigo-900/10'
          : 'border-zinc-200 dark:border-zinc-700'
      )}
    >
      <h4 className="font-medium text-zinc-900 dark:text-white">
        {option.name}
        {isRecommended && (
          <span className="ml-2 text-xs text-indigo-600 dark:text-indigo-400">(Recommended)</span>
        )}
      </h4>
      <div className="mt-3 grid gap-4 sm:grid-cols-2">
        {option.pros && option.pros.length > 0 && (
          <div>
            <div className="mb-1.5 text-xs font-medium uppercase tracking-wide text-green-700 dark:text-green-400">
              Pros
            </div>
            <ul className="space-y-1 text-sm text-zinc-700 dark:text-zinc-300">
              {option.pros.map((pro, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-green-500" />
                  {pro}
                </li>
              ))}
            </ul>
          </div>
        )}
        {option.cons && option.cons.length > 0 && (
          <div>
            <div className="mb-1.5 text-xs font-medium uppercase tracking-wide text-red-700 dark:text-red-400">
              Cons
            </div>
            <ul className="space-y-1 text-sm text-zinc-700 dark:text-zinc-300">
              {option.cons.map((con, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                  {con}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

interface ComparisonSectionProps {
  options: RecommendationOption[]
  recommendedOptionId: string
}

function ComparisonSection({ options, recommendedOptionId }: ComparisonSectionProps) {
  const optionsWithProsOrCons = options.filter(
    (opt) => (opt.pros && opt.pros.length > 0) || (opt.cons && opt.cons.length > 0)
  )

  if (optionsWithProsOrCons.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      {optionsWithProsOrCons.map((option) => (
        <ComparisonOptionCard
          key={option.id}
          option={option}
          isRecommended={option.id === recommendedOptionId}
        />
      ))}
    </div>
  )
}

interface ComparisonToggleProps {
  isOpen: boolean
  onToggle: () => void
  options: RecommendationOption[]
  recommendedOptionId: string
}

function ComparisonToggle({
  isOpen,
  onToggle,
  options,
  recommendedOptionId,
}: ComparisonToggleProps) {
  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
      >
        Compare all options
        {isOpen ? <ChevronUpIcon className="h-5 w-5" /> : <ChevronDownIcon className="h-5 w-5" />}
      </button>
      {isOpen && (
        <div className="mt-3">
          <ComparisonSection options={options} recommendedOptionId={recommendedOptionId} />
        </div>
      )}
    </div>
  )
}

interface RecommendationHeaderProps {
  optionName: string
  confidence: number
}

function RecommendationHeader({ optionName, confidence }: RecommendationHeaderProps) {
  return (
    <div className="text-center">
      <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
        We recommend: {optionName}
      </h2>
      <div className="mt-2">
        <ConfidenceBadge confidence={confidence} />
      </div>
    </div>
  )
}

interface OptionsGridProps {
  options: RecommendationOption[]
  recommendedOptionId: string
  onSelect: (optionId: string) => void
}

function OptionsGrid({ options, recommendedOptionId, onSelect }: OptionsGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {options.map((option) => (
        <OptionCard
          key={option.id}
          option={option}
          isRecommended={option.id === recommendedOptionId}
          onSelect={() => onSelect(option.id)}
        />
      ))}
    </div>
  )
}

function RequestDifferentLink({ onClick }: { onClick: () => void }) {
  return (
    <div className="text-center">
      <button
        type="button"
        onClick={onClick}
        className="text-sm font-medium text-zinc-500 underline decoration-zinc-400 underline-offset-2 transition-colors hover:text-zinc-700 dark:text-zinc-400 dark:decoration-zinc-600 dark:hover:text-zinc-300"
      >
        I want a different option
      </button>
    </div>
  )
}

export function WizardRecommendationScreen(props: WizardRecommendationScreenProps) {
  const { recommendation, options, onSelect, onRequestDifferent, className } = props
  const [isComparisonOpen, setIsComparisonOpen] = useState(false)

  const recommendedOption = options.find((opt) => opt.id === recommendation.option)
  const displayName = recommendedOption?.name ?? recommendation.option

  return (
    <div className={cn('space-y-6', className)}>
      <RecommendationHeader optionName={displayName} confidence={recommendation.confidence} />
      <ReasoningBox reasoning={recommendation.reasoning} />
      <ComparisonToggle
        isOpen={isComparisonOpen}
        onToggle={() => setIsComparisonOpen(!isComparisonOpen)}
        options={options}
        recommendedOptionId={recommendation.option}
      />
      <OptionsGrid
        options={options}
        recommendedOptionId={recommendation.option}
        onSelect={onSelect}
      />
      {onRequestDifferent && <RequestDifferentLink onClick={onRequestDifferent} />}
    </div>
  )
}
