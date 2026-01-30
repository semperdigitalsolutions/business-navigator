/**
 * CreditDetailsModal Component - Modal showing credit balance details
 * Issue #212: Credit balance display for Epic 9
 */
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogActions,
  DialogBody,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'
import { Icon } from '@/components/ui/Icon'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/utils/classnames'
import { formatTimeUntilReset, useCreditBalance } from '../hooks/useCreditBalance'
import { getStateColors } from './credit-utils'

export interface CreditDetailsModalProps {
  isOpen: boolean
  onClose: () => void
}

/**
 * Detail row for modal
 */
function DetailRow({
  label,
  value,
  capitalize = false,
  highlight = false,
}: {
  label: string
  value: string
  capitalize?: boolean
  highlight?: boolean
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-zinc-500 dark:text-zinc-400">{label}</span>
      <span
        className={cn(
          'text-sm font-medium',
          highlight ? 'text-blue-600 dark:text-blue-400' : 'text-zinc-900 dark:text-white',
          capitalize && 'capitalize'
        )}
      >
        {value}
      </span>
    </div>
  )
}

/**
 * Credit details modal - Shown when clicking header variant
 */
export function CreditDetailsModal({ isOpen, onClose }: CreditDetailsModalProps) {
  const navigate = useNavigate()
  const { balance, totalCredits, usedCredits, periodStart, periodEnd, tier, isLow, isCritical } =
    useCreditBalance()

  const colors = getStateColors(isLow, isCritical)
  const timeUntilReset = formatTimeUntilReset(periodEnd)

  const handleViewTransactions = () => {
    onClose()
    navigate('/settings?tab=billing')
  }

  const handleUpgrade = () => {
    onClose()
    navigate('/#pricing')
  }

  return (
    <Dialog open={isOpen} onClose={onClose} size="sm">
      <DialogTitle className="flex items-center gap-3">
        <div className={cn('flex h-10 w-10 items-center justify-center rounded-full', colors.bg)}>
          <Icon name="toll" size={24} className={colors.icon} />
        </div>
        <span>Credit Balance</span>
      </DialogTitle>

      <DialogDescription>Your current credit usage for this billing period.</DialogDescription>

      <DialogBody>
        {/* Balance display */}
        <div className="mb-6 text-center">
          <div className="mb-2">
            <span className={cn('text-5xl font-bold', colors.text)}>{balance}</span>
            <span className="text-xl text-zinc-400 dark:text-zinc-500"> / {totalCredits}</span>
          </div>
          <Progress
            value={balance}
            max={totalCredits}
            color={colors.progress}
            size="lg"
            showValue
          />
        </div>

        {/* Details list */}
        <div className="space-y-3 rounded-lg bg-zinc-50 p-4 dark:bg-zinc-800">
          <DetailRow label="Current Plan" value={tier || 'Free'} capitalize />
          <DetailRow label="Credits Used" value={`${usedCredits} credits`} />
          {periodStart && (
            <DetailRow label="Period Start" value={new Date(periodStart).toLocaleDateString()} />
          )}
          {periodEnd && (
            <DetailRow label="Period End" value={new Date(periodEnd).toLocaleDateString()} />
          )}
          {timeUntilReset && <DetailRow label="Resets In" value={timeUntilReset} highlight />}
        </div>

        {/* Warning banner */}
        {(isLow || isCritical) && tier !== 'enterprise' && (
          <div className={cn('mt-4 rounded-lg p-4', colors.bg)}>
            <div className="flex items-start gap-2">
              <Icon
                name={isCritical ? 'warning' : 'info'}
                size={20}
                className={cn(colors.icon, 'mt-0.5')}
              />
              <div>
                <p className={cn('text-sm font-medium', colors.text)}>
                  {isCritical
                    ? 'Your credits are almost depleted!'
                    : 'Your credits are running low'}
                </p>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  Upgrade your plan to get more credits and advanced features.
                </p>
              </div>
            </div>
          </div>
        )}
      </DialogBody>

      <DialogActions>
        <Button variant="secondary" onClick={handleViewTransactions}>
          <Icon name="receipt_long" size={18} className="mr-1" />
          Transaction History
        </Button>
        {tier !== 'enterprise' && (
          <Button variant="primary" onClick={handleUpgrade}>
            <Icon name="rocket_launch" size={18} className="mr-1" />
            Upgrade
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}
