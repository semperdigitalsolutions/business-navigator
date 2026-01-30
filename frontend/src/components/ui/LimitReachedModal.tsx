/**
 * Limit Reached Modal - Shown when user hits their daily message limit
 * Displays upgrade options and navigates to pricing
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

export interface LimitReachedModalProps {
  /** Whether the modal is open */
  isOpen: boolean
  /** Called when the modal should close */
  onClose: () => void
  /** The daily message limit that was reached */
  messageLimit?: number
  /** Current plan name (defaults to 'Beta') */
  currentPlan?: string
  /** Number of seconds until limit resets (optional) */
  retryAfter?: number
}

/** Formats seconds into a human-readable time string */
function formatTimeUntilReset(seconds: number): string {
  if (seconds < 60) {
    return `${seconds} seconds`
  }
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) {
    return `${minutes} minute${minutes === 1 ? '' : 's'}`
  }
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  if (remainingMinutes === 0) {
    return `${hours} hour${hours === 1 ? '' : 's'}`
  }
  return `${hours} hour${hours === 1 ? '' : 's'} and ${remainingMinutes} minute${remainingMinutes === 1 ? '' : 's'}`
}

const planFeatures = [
  { icon: 'chat', label: 'Unlimited AI conversations' },
  { icon: 'speed', label: 'Priority response times' },
  { icon: 'auto_awesome', label: 'Advanced AI models' },
  { icon: 'support_agent', label: 'Priority support' },
]

/**
 * Modal displayed when the user reaches their daily message limit.
 * Shows current plan info and upgrade options.
 */
export function LimitReachedModal({
  isOpen,
  onClose,
  messageLimit = 20,
  currentPlan = 'Beta',
  retryAfter,
}: LimitReachedModalProps) {
  const navigate = useNavigate()

  const handleViewPlans = () => {
    onClose()
    // Navigate to landing page with pricing section anchor
    navigate('/#pricing')
  }

  return (
    <Dialog open={isOpen} onClose={onClose} size="md">
      <DialogTitle className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
          <Icon name="hourglass_empty" size={24} className="text-amber-600 dark:text-amber-400" />
        </div>
        <span>Daily Limit Reached</span>
      </DialogTitle>

      <DialogDescription>
        You've reached your daily limit of {messageLimit} messages on the {currentPlan} plan.
      </DialogDescription>

      <DialogBody>
        {retryAfter !== undefined && retryAfter > 0 && (
          <div className="mb-4 rounded-lg bg-slate-50 p-3 dark:bg-zinc-800">
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <Icon name="schedule" size={18} />
              <span>Your limit will reset in {formatTimeUntilReset(retryAfter)}</span>
            </div>
          </div>
        )}

        <div className="rounded-xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50 p-5 dark:border-indigo-800 dark:from-indigo-950/40 dark:to-purple-950/40">
          <div className="mb-3 flex items-center gap-2">
            <Icon name="rocket_launch" size={20} className="text-indigo-600 dark:text-indigo-400" />
            <span className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">
              Upgrade for More
            </span>
          </div>
          <ul className="space-y-2">
            {planFeatures.map((feature) => (
              <li
                key={feature.label}
                className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300"
              >
                <Icon
                  name={feature.icon}
                  size={18}
                  className="text-indigo-500 dark:text-indigo-400"
                />
                {feature.label}
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-4 text-center text-xs text-slate-500 dark:text-slate-400">
          Early adopters get special pricing when we launch paid plans
        </p>
      </DialogBody>

      <DialogActions>
        <Button variant="secondary" onClick={onClose}>
          Wait for Reset
        </Button>
        <Button variant="primary" onClick={handleViewPlans}>
          <Icon name="arrow_forward" size={18} className="mr-1" />
          View Plans
        </Button>
      </DialogActions>
    </Dialog>
  )
}
