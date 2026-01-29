/**
 * ConfirmationStep Component
 * Issue #76: Confirmation step for entity selection wizard
 */
import { CheckCircleIcon, ArrowRightIcon } from '@heroicons/react/24/outline'
import { cn } from '@/utils/classnames'
import { ENTITY_TYPE_LABELS, ENTITY_TYPE_FULL_NAMES, type EntityType } from '../types'

interface ConfirmationStepProps {
  selectedEntity: EntityType
  onConfirm: () => void
  onChangeSelection: () => void
}

interface NextStep {
  title: string
  description: string
}

const NEXT_STEPS: NextStep[] = [
  {
    title: 'Register your business name',
    description: 'Check availability and register your business name with the state',
  },
  {
    title: 'Get an EIN',
    description: 'Apply for an Employer Identification Number from the IRS',
  },
  {
    title: 'File formation documents',
    description: 'Submit articles of organization or incorporation to your state',
  },
  {
    title: 'Create operating agreements',
    description: 'Draft legal documents outlining ownership and operations',
  },
]

function NextStepItem({ title, description }: NextStep) {
  return (
    <li className="flex items-start gap-3">
      <ArrowRightIcon className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
      <div>
        <p className="font-medium text-zinc-900 dark:text-white">{title}</p>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">{description}</p>
      </div>
    </li>
  )
}

export function ConfirmationStep({
  selectedEntity,
  onConfirm,
  onChangeSelection,
}: ConfirmationStepProps) {
  return (
    <div className="space-y-6">
      {/* Selection summary */}
      <div
        className={cn(
          'rounded-lg border-2 border-green-500 bg-green-50 p-6',
          'dark:border-green-600 dark:bg-green-900/20'
        )}
      >
        <div className="flex items-center gap-3">
          <CheckCircleIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
          <div>
            <p className="text-sm font-medium text-green-800 dark:text-green-300">
              You have chosen:
            </p>
            <h3 className="text-2xl font-bold text-green-900 dark:text-green-100">
              {ENTITY_TYPE_LABELS[selectedEntity]}
            </h3>
            <p className="text-sm text-green-700 dark:text-green-400">
              {ENTITY_TYPE_FULL_NAMES[selectedEntity]}
            </p>
          </div>
        </div>
      </div>

      {/* Entity-specific summary */}
      <div className="rounded-lg bg-zinc-50 p-4 dark:bg-zinc-800">
        <h4 className="font-medium text-zinc-900 dark:text-white">What this means:</h4>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          {getEntitySummary(selectedEntity)}
        </p>
      </div>

      {/* Next steps */}
      <div>
        <h4 className="mb-4 font-medium text-zinc-900 dark:text-white">Next steps to complete:</h4>
        <ul className="space-y-4">
          {NEXT_STEPS.map((step) => (
            <NextStepItem key={step.title} {...step} />
          ))}
        </ul>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col gap-3 pt-2">
        <button
          type="button"
          onClick={onConfirm}
          className={cn(
            'w-full rounded-lg bg-green-600 px-6 py-3',
            'font-semibold text-white transition-colors hover:bg-green-700',
            'focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2',
            'dark:focus:ring-offset-zinc-900'
          )}
        >
          Confirm and Continue
        </button>
        <button
          type="button"
          onClick={onChangeSelection}
          className={cn(
            'w-full rounded-lg border border-zinc-300 px-6 py-3',
            'font-medium text-zinc-700 transition-colors hover:bg-zinc-50',
            'dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800'
          )}
        >
          Change my selection
        </button>
      </div>
    </div>
  )
}

/** Get entity-specific summary text */
function getEntitySummary(entityType: EntityType): string {
  const summaries: Record<EntityType, string> = {
    llc:
      'Your LLC will provide personal liability protection while allowing flexible taxation. ' +
      'You can choose to be taxed as a sole proprietor, partnership, S-Corp, or C-Corp.',
    c_corp:
      'Your C-Corporation will be a separate legal entity, ideal for raising investment. ' +
      'Be aware of double taxation: the corporation pays taxes, and shareholders pay taxes on dividends.',
    s_corp:
      'Your S-Corporation provides pass-through taxation, avoiding double taxation. ' +
      'This can reduce self-employment taxes on business profits.',
    sole_prop:
      'As a sole proprietor, you and your business are legally the same entity. ' +
      'This is the simplest structure but offers no personal liability protection.',
  }
  return summaries[entityType]
}
