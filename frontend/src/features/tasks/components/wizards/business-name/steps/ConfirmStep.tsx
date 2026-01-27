/**
 * ConfirmStep Component
 * Issue #88: Step 3 of Business Name wizard - confirm and save
 */
import { CheckCircleIcon, SparklesIcon } from '@heroicons/react/24/solid'
import type { BusinessNameData } from '../types'

interface ConfirmStepProps {
  data: BusinessNameData
  onUpdate: (data: Partial<BusinessNameData>) => void
}

export function ConfirmStep({ data, onUpdate }: ConfirmStepProps) {
  const allChecksComplete = data.domainChecked && data.trademarkAcknowledged

  return (
    <div className="space-y-6">
      {/* Success banner */}
      <div className="rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 p-6 text-center text-white">
        <SparklesIcon className="mx-auto h-12 w-12" />
        <h2 className="mt-4 text-2xl font-bold">{data.selectedName}</h2>
        <p className="mt-2 text-green-100">Your chosen business name</p>
      </div>

      {/* Checklist summary */}
      <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-700">
        <h3 className="font-medium text-zinc-900 dark:text-white">Verification Summary</h3>
        <div className="mt-3 space-y-2">
          <div className="flex items-center gap-2">
            <CheckCircleIcon
              className={`h-5 w-5 ${data.domainChecked ? 'text-green-500' : 'text-zinc-300'}`}
            />
            <span
              className={`text-sm ${
                data.domainChecked
                  ? 'text-zinc-900 dark:text-white'
                  : 'text-zinc-400 dark:text-zinc-500'
              }`}
            >
              Domain availability checked
            </span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircleIcon
              className={`h-5 w-5 ${data.trademarkAcknowledged ? 'text-green-500' : 'text-zinc-300'}`}
            />
            <span
              className={`text-sm ${
                data.trademarkAcknowledged
                  ? 'text-zinc-900 dark:text-white'
                  : 'text-zinc-400 dark:text-zinc-500'
              }`}
            >
              Trademark search completed
            </span>
          </div>
        </div>
        {!allChecksComplete && (
          <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">
            You can still save, but we recommend completing all checks first.
          </p>
        )}
      </div>

      {/* Notes field */}
      <div>
        <label
          htmlFor="notes"
          className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Notes (optional)
        </label>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          Add any notes about your name choice, alternative options considered, or next steps.
        </p>
        <textarea
          id="notes"
          rows={4}
          value={data.notes}
          onChange={(e) => onUpdate({ notes: e.target.value })}
          placeholder="e.g., Domain registered on Namecheap, trademark search showed no conflicts..."
          className="mt-2 w-full rounded-lg border border-zinc-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-700 dark:text-white dark:placeholder-zinc-400"
        />
      </div>

      {/* Alternative names */}
      {data.nameIdeas.length > 1 && (
        <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-700">
          <h3 className="text-sm font-medium text-zinc-900 dark:text-white">
            Other names you considered:
          </h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {data.nameIdeas
              .filter((name) => name !== data.selectedName)
              .map((name) => (
                <span
                  key={name}
                  className="rounded-full bg-zinc-100 px-3 py-1 text-sm text-zinc-600 dark:bg-zinc-700 dark:text-zinc-400"
                >
                  {name}
                </span>
              ))}
          </div>
        </div>
      )}

      {/* Next steps */}
      <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
        <h3 className="font-medium text-blue-900 dark:text-blue-100">What happens next?</h3>
        <ul className="mt-2 space-y-1 text-sm text-blue-800 dark:text-blue-200">
          <li>• Your business name will be saved to your profile</li>
          <li>• You can use this name for your business formation documents</li>
          <li>• The next task will help you secure your domain and social handles</li>
        </ul>
      </div>
    </div>
  )
}
