/**
 * CreditBalance Component - Display credit balance in various formats
 * Issue #212: Credit balance display for Epic 9
 *
 * Supports three variants:
 * - header: Compact icon + number, click opens details popover
 * - dashboard: Large display with progress bar and upgrade CTA
 * - chat: Small inline text for chat input area
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/Icon'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/skeletons/Skeleton'
import { cn } from '@/utils/classnames'
import { formatTimeUntilReset, useCreditBalance } from '../hooks/useCreditBalance'
import { CreditDetailsModal } from './CreditDetailsModal'
import { getStateColors } from './credit-utils'

export type CreditBalanceVariant = 'header' | 'dashboard' | 'chat'

export interface CreditBalanceProps {
  /** Display variant */
  variant?: CreditBalanceVariant
  /** Additional CSS classes */
  className?: string
}

/**
 * Header variant - Compact display for navigation
 */
function HeaderVariant({ className }: { className?: string }) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const { balance, isLow, isCritical, isLoading } = useCreditBalance()
  const colors = getStateColors(isLow, isCritical)

  if (isLoading) {
    return (
      <div className={cn('flex items-center gap-1.5', className)}>
        <Skeleton variant="circular" width={20} height={20} />
        <Skeleton variant="text" width={32} height={16} />
      </div>
    )
  }

  return (
    <>
      <button
        onClick={() => setIsDetailsOpen(true)}
        className={cn(
          'flex items-center gap-1.5 rounded-lg px-2 py-1 transition-colors',
          'hover:bg-zinc-100 dark:hover:bg-zinc-800',
          className
        )}
        title="View credit details"
      >
        <Icon name="toll" size={20} className={colors.icon} />
        <span className={cn('text-sm font-medium', colors.text)}>{balance}</span>
      </button>

      <CreditDetailsModal isOpen={isDetailsOpen} onClose={() => setIsDetailsOpen(false)} />
    </>
  )
}

/**
 * Dashboard variant - Large detailed display
 */
function DashboardVariant({ className }: { className?: string }) {
  const navigate = useNavigate()
  const { balance, totalCredits, usedCredits, periodEnd, tier, isLow, isCritical, isLoading } =
    useCreditBalance()
  const colors = getStateColors(isLow, isCritical)
  const timeUntilReset = formatTimeUntilReset(periodEnd)

  if (isLoading) {
    return (
      <div className={cn('rounded-lg border bg-white p-6 shadow-sm dark:bg-zinc-900', className)}>
        <Skeleton variant="text" width={120} height={20} className="mb-4" />
        <Skeleton variant="text" width={80} height={40} className="mb-4" />
        <Skeleton variant="rectangular" width="100%" height={8} className="mb-4" />
        <Skeleton variant="text" width={160} height={16} />
      </div>
    )
  }

  const shouldShowUpgrade = (isLow || isCritical) && tier !== 'enterprise'

  return (
    <div
      className={cn(
        'rounded-lg border bg-white p-6 shadow-sm dark:bg-zinc-900',
        colors.border,
        className
      )}
    >
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon name="toll" size={24} className={colors.icon} />
          <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Credits Remaining
          </span>
        </div>
        {tier && (
          <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium capitalize text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
            {tier}
          </span>
        )}
      </div>

      {/* Balance */}
      <div className="mb-4">
        <span className={cn('text-4xl font-bold', colors.text)}>{balance}</span>
        <span className="text-lg text-zinc-400 dark:text-zinc-500"> / {totalCredits}</span>
      </div>

      {/* Progress bar */}
      <Progress
        value={balance}
        max={totalCredits}
        color={colors.progress}
        size="md"
        className="mb-4"
      />

      {/* Stats row */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-zinc-500 dark:text-zinc-400">{usedCredits} used this period</span>
        {timeUntilReset && (
          <span className="text-zinc-500 dark:text-zinc-400">Resets in {timeUntilReset}</span>
        )}
      </div>

      {/* Upgrade CTA */}
      {shouldShowUpgrade && (
        <div className={cn('mt-4 rounded-lg p-4', colors.bg)}>
          <div className="mb-2 flex items-center gap-2">
            <Icon name={isCritical ? 'warning' : 'info'} size={18} className={colors.icon} />
            <span className={cn('text-sm font-medium', colors.text)}>
              {isCritical ? 'Credits almost depleted' : 'Running low on credits'}
            </span>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/#pricing')}
            className="w-full"
          >
            <Icon name="rocket_launch" size={16} className="mr-1" />
            Upgrade Plan
          </Button>
        </div>
      )}
    </div>
  )
}

/**
 * Chat variant - Minimal inline display
 */
function ChatVariant({ className }: { className?: string }) {
  const { balance, isLow, isCritical, isLoading } = useCreditBalance()
  const colors = getStateColors(isLow, isCritical)

  if (isLoading) {
    return <Skeleton variant="text" width={60} height={14} className={className} />
  }

  return (
    <span className={cn('flex items-center gap-1 text-xs', colors.text, className)}>
      <Icon name="toll" size={14} className={colors.icon} />
      {balance} credits
    </span>
  )
}

/**
 * Main CreditBalance component
 */
export function CreditBalance({ variant = 'header', className }: CreditBalanceProps) {
  switch (variant) {
    case 'dashboard':
      return <DashboardVariant className={className} />
    case 'chat':
      return <ChatVariant className={className} />
    case 'header':
    default:
      return <HeaderVariant className={className} />
  }
}
