/**
 * CostPreview - Displays message cost before sending
 * Shows credit cost and remaining balance with color indicators
 */
import { cn } from '@/utils/classnames'
import { Tooltip } from '@/components/ui/tooltip'
import { Skeleton } from '@/components/ui/skeleton'
import { useModelsStore } from '../hooks/useModelsStore'
import { useCreditsStore } from '../hooks/useCreditsStore'

export interface CostPreviewProps {
  /** Model ID to calculate cost for (uses selected model if not provided) */
  modelId?: string
  /** Additional CSS classes */
  className?: string
}

type CostStatus = 'affordable' | 'low' | 'insufficient'

const STATUS_COLORS: Record<CostStatus, { text: string; bg: string; dot: string }> = {
  affordable: {
    text: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    dot: 'bg-emerald-400',
  },
  low: {
    text: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    dot: 'bg-amber-400',
  },
  insufficient: {
    text: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-900/20',
    dot: 'bg-red-400',
  },
}

function getCostStatus(balance: number, cost: number): CostStatus {
  if (balance < cost) return 'insufficient'
  if (balance - cost < cost * 5) return 'low'
  return 'affordable'
}

interface TooltipContentProps {
  modelName: string
  cost: number
  balance: number
  balanceAfter: number
  canAfford: boolean
}

function CostTooltipContent({
  modelName,
  cost,
  balance,
  balanceAfter,
  canAfford,
}: TooltipContentProps) {
  return (
    <div className="space-y-1.5 text-left">
      <div className="font-medium">{modelName}</div>
      <div className="space-y-0.5 text-xs opacity-90">
        <div className="flex justify-between gap-4">
          <span>Cost per message:</span>
          <span>{cost} credits</span>
        </div>
        <div className="flex justify-between gap-4">
          <span>Current balance:</span>
          <span>{balance} credits</span>
        </div>
        <div className="my-1 border-t border-white/20" />
        <div className="flex justify-between gap-4">
          <span>After sending:</span>
          <span className={canAfford ? '' : 'text-red-300'}>{balanceAfter} credits</span>
        </div>
      </div>
      {!canAfford && <div className="mt-2 text-xs text-red-300">Insufficient credits</div>}
    </div>
  )
}

function CostPreviewLoading({ className }: { className?: string }) {
  return (
    <div className={cn('inline-flex items-center gap-1.5', className)}>
      <Skeleton variant="text" width={80} height={14} />
    </div>
  )
}

function CostPreviewError({ error, className }: { error: string; className?: string }) {
  return (
    <Tooltip content={<span className="text-xs">Error: {error}</span>} placement="top" size="sm">
      <span
        className={cn(
          'inline-flex items-center gap-1 text-[10px] font-medium text-slate-400',
          className
        )}
      >
        <span>?</span>
        <span>credits</span>
      </span>
    </Tooltip>
  )
}

export function CostPreview({ modelId, className }: CostPreviewProps) {
  const { getSelectedModel, models, selectedModelId, isLoading: modelsLoading } = useModelsStore()
  const { balance, isLoading: creditsLoading, error: creditsError } = useCreditsStore()

  const effectiveModelId = modelId ?? selectedModelId
  const model = effectiveModelId
    ? models.find((m) => m.id === effectiveModelId)
    : getSelectedModel()

  if (!effectiveModelId || !model) return null
  if (modelsLoading || creditsLoading) return <CostPreviewLoading className={className} />
  if (creditsError) return <CostPreviewError error={creditsError} className={className} />

  const { creditCost: cost, name: modelName } = model
  const balanceAfter = Math.max(0, balance - cost)
  const canAfford = balance >= cost
  const colors = STATUS_COLORS[getCostStatus(balance, cost)]

  return (
    <Tooltip
      content={<CostTooltipContent {...{ modelName, cost, balance, balanceAfter, canAfford }} />}
      placement="top"
      size="sm"
    >
      <div
        className={cn(
          'inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 cursor-default',
          colors.bg,
          className
        )}
      >
        <div className={cn('h-1.5 w-1.5 rounded-full', colors.dot)} />
        <span className={cn('text-[10px] font-medium', colors.text)}>
          {cost} credit{cost !== 1 ? 's' : ''}
        </span>
        <span className={cn('text-[10px] opacity-50', colors.text)}>|</span>
        <span className={cn('text-[10px] font-medium opacity-75', colors.text)}>
          {balanceAfter} left
        </span>
      </div>
    </Tooltip>
  )
}
