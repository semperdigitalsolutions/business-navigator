import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/catalyst-ui-kit/typescript/button'
import {
  Dialog,
  DialogActions,
  DialogBody,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'
import { DECISION_IMPLICATIONS } from './decision-change-modal.config'

export type { DecisionType, DecisionImplication } from './decision-change-modal.config'

export interface DecisionChangeModalProps {
  /** Whether the modal is open */
  isOpen: boolean
  /** The type of decision being changed */
  decisionType: keyof typeof DECISION_IMPLICATIONS
  /** Current value being changed from */
  currentValue?: string
  /** New value being changed to */
  newValue?: string
  /** Called when user cancels the change */
  onCancel: () => void
  /** Called when user confirms the change */
  onConfirm: () => void
  /** Whether confirm action is in progress */
  isConfirming?: boolean
  /** Custom title override */
  title?: string
  /** Custom description override */
  description?: string
  /** Additional custom implications to display */
  additionalImplications?: string[]
}

/** Displays the from/to value change */
function ValueChangeDisplay({ from, to }: { from: string; to: string }) {
  return (
    <div className="mb-4 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
      <div className="flex items-center gap-2 text-sm">
        <span className="text-zinc-500 dark:text-zinc-400">From:</span>
        <span className="font-medium text-zinc-700 dark:text-zinc-300">{from}</span>
      </div>
      <div className="flex items-center gap-2 text-sm mt-1">
        <span className="text-zinc-500 dark:text-zinc-400">To:</span>
        <span className="font-medium text-zinc-900 dark:text-white">{to}</span>
      </div>
    </div>
  )
}

/** Displays the list of implications */
function ImplicationsList({
  implications,
  bulletColor,
}: {
  implications: string[]
  bulletColor: string
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
        This change may affect:
      </p>
      <ul className="space-y-2">
        {implications.map((implication, index) => (
          <li
            key={index}
            className="flex items-start gap-2 text-sm text-zinc-600 dark:text-zinc-400"
          >
            <span className={`mt-1.5 h-1.5 w-1.5 rounded-full flex-shrink-0 ${bulletColor}`} />
            {implication}
          </li>
        ))}
      </ul>
    </div>
  )
}

/** Critical change warning box */
function CriticalWarning() {
  return (
    <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
      <p className="text-sm text-red-700 dark:text-red-400">
        This is a significant change. Please ensure you understand the implications before
        proceeding.
      </p>
    </div>
  )
}

/** Returns styling config based on severity */
function getSeverityStyles(severity: 'warning' | 'critical') {
  return severity === 'critical'
    ? { iconColor: 'text-red-500', confirmColor: 'red' as const, bulletColor: 'bg-red-400' }
    : { iconColor: 'text-amber-500', confirmColor: 'amber' as const, bulletColor: 'bg-amber-400' }
}

/**
 * Confirmation modal shown when user attempts to change a key business decision.
 * Explains the implications of the change and requires explicit confirmation.
 */
export function DecisionChangeModal(props: DecisionChangeModalProps) {
  const {
    isOpen,
    decisionType,
    currentValue,
    newValue,
    onCancel,
    onConfirm,
    isConfirming = false,
  } = props
  const { title, description, additionalImplications = [] } = props

  const config = DECISION_IMPLICATIONS[decisionType]
  const styles = getSeverityStyles(config.severity)
  const allImplications = [...config.implications, ...additionalImplications]

  return (
    <Dialog open={isOpen} onClose={onCancel} size="md">
      <DialogTitle className="flex items-center gap-2">
        <ExclamationTriangleIcon className={`h-5 w-5 ${styles.iconColor}`} />
        {title ?? config.title}
      </DialogTitle>
      <DialogDescription>{description ?? config.description}</DialogDescription>
      <DialogBody>
        {currentValue && newValue && <ValueChangeDisplay from={currentValue} to={newValue} />}
        <ImplicationsList implications={allImplications} bulletColor={styles.bulletColor} />
        {config.severity === 'critical' && <CriticalWarning />}
      </DialogBody>
      <DialogActions>
        <Button outline onClick={onCancel} disabled={isConfirming}>
          Cancel
        </Button>
        <Button color={styles.confirmColor} onClick={onConfirm} disabled={isConfirming}>
          {isConfirming ? 'Confirming...' : 'Confirm Change'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
