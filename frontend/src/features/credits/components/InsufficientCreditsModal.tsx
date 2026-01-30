/**
 * InsufficientCreditsModal Component - Modal shown when user lacks credits
 * Issue #214: Insufficient credits modal for Epic 9
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
import { cn } from '@/utils/classnames'
import { useCreditBalance } from '../hooks/useCreditBalance'

export interface InsufficientCreditsModalProps {
  isOpen: boolean
  onClose: () => void
  requiredCredits: number
  modelName?: string
}

/**
 * Insufficient credits modal - Shown when user tries an action without enough credits
 */
export function InsufficientCreditsModal({
  isOpen,
  onClose,
  requiredCredits,
  modelName,
}: InsufficientCreditsModalProps) {
  const navigate = useNavigate()
  const { balance, tier } = useCreditBalance()

  const shortfall = requiredCredits - balance

  const handleViewPlans = () => {
    onClose()
    navigate('/#pricing')
  }

  const handleViewBalance = () => {
    onClose()
    navigate('/settings?tab=billing')
  }

  return (
    <Dialog open={isOpen} onClose={onClose} size="sm">
      <DialogTitle className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
          <Icon name="warning" size={24} className="text-red-600 dark:text-red-400" />
        </div>
        <span>Insufficient Credits</span>
      </DialogTitle>

      <DialogDescription>You don't have enough credits to complete this action.</DialogDescription>

      <DialogBody>
        {/* Credit comparison */}
        <div className="mb-6 space-y-4">
          {modelName && (
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Selected Model</p>
              <p className="mt-1 font-medium text-zinc-900 dark:text-white">{modelName}</p>
            </div>
          )}

          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="rounded-lg bg-zinc-50 p-4 dark:bg-zinc-800">
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Required</p>
              <p className="mt-1 text-2xl font-bold text-zinc-900 dark:text-white">
                {requiredCredits}
              </p>
            </div>
            <div className="rounded-lg bg-zinc-50 p-4 dark:bg-zinc-800">
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Available</p>
              <p
                className={cn(
                  'mt-1 text-2xl font-bold',
                  balance < requiredCredits
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-zinc-900 dark:text-white'
                )}
              >
                {balance}
              </p>
            </div>
            <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
              <p className="text-xs text-red-600 dark:text-red-400">Shortfall</p>
              <p className="mt-1 text-2xl font-bold text-red-600 dark:text-red-400">{shortfall}</p>
            </div>
          </div>
        </div>

        {/* Suggestions */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-zinc-900 dark:text-white">What you can do:</h4>

          <div className="space-y-2">
            <div className="flex items-start gap-3 rounded-lg border border-zinc-200 p-3 dark:border-zinc-700">
              <Icon name="bolt" size={20} className="mt-0.5 text-indigo-600 dark:text-indigo-400" />
              <div>
                <p className="text-sm font-medium text-zinc-900 dark:text-white">
                  Upgrade your plan
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Get more credits with a higher tier subscription.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg border border-zinc-200 p-3 dark:border-zinc-700">
              <Icon
                name="schedule"
                size={20}
                className="mt-0.5 text-amber-600 dark:text-amber-400"
              />
              <div>
                <p className="text-sm font-medium text-zinc-900 dark:text-white">
                  Wait for monthly reset
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Credits refresh at the start of each billing cycle.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg border border-zinc-200 p-3 dark:border-zinc-700">
              <Icon
                name="swap_horiz"
                size={20}
                className="mt-0.5 text-green-600 dark:text-green-400"
              />
              <div>
                <p className="text-sm font-medium text-zinc-900 dark:text-white">
                  Use a different model
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Some models cost fewer credits per message.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Current tier info */}
        <div className="mt-4 rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800">
          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-500 dark:text-zinc-400">Current Plan</span>
            <span className="text-sm font-medium capitalize text-zinc-900 dark:text-white">
              {tier || 'Free'}
            </span>
          </div>
        </div>
      </DialogBody>

      <DialogActions>
        <Button variant="secondary" onClick={handleViewBalance}>
          <Icon name="account_balance_wallet" size={18} className="mr-1" />
          View Balance
        </Button>
        <Button variant="primary" onClick={handleViewPlans}>
          <Icon name="rocket_launch" size={18} className="mr-1" />
          Upgrade Plan
        </Button>
      </DialogActions>
    </Dialog>
  )
}
