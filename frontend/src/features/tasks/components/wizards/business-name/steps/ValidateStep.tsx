/**
 * ValidateStep Component
 * Issue #88: Step 2 of Business Name wizard - check availability
 */
import {
  GlobeAltIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  ArrowTopRightOnSquareIcon,
} from '@heroicons/react/24/outline'
import { CheckCircleIcon } from '@heroicons/react/24/solid'
import type { BusinessNameData } from '../types'

interface ValidateStepProps {
  data: BusinessNameData
  onUpdate: (data: Partial<BusinessNameData>) => void
}

interface CheckItemProps {
  title: string
  description: string
  icon: React.ReactNode
  checked: boolean
  onCheck: () => void
  externalLink?: { url: string; label: string }
}

function CheckItem({ title, description, icon, checked, onCheck, externalLink }: CheckItemProps) {
  return (
    <div
      className={`rounded-lg border p-4 transition-colors ${
        checked
          ? 'border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-900/20'
          : 'border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800'
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex-shrink-0 rounded-lg p-2 ${
            checked
              ? 'bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400'
              : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400'
          }`}
        >
          {icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-zinc-900 dark:text-white">{title}</h3>
            {checked && <CheckCircleIcon className="h-5 w-5 text-green-500" />}
          </div>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{description}</p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            {externalLink && (
              <a
                href={externalLink.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                {externalLink.label}
                <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5" />
              </a>
            )}
            <button
              type="button"
              onClick={onCheck}
              className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                checked
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300'
                  : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-600'
              }`}
            >
              {checked ? 'Checked ✓' : 'Mark as checked'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function ValidateStep({ data, onUpdate }: ValidateStepProps) {
  // Generate domain search URL
  const domainSearchUrl = data.selectedName
    ? `https://www.namecheap.com/domains/registration/results/?domain=${encodeURIComponent(data.selectedName.toLowerCase().replace(/\s+/g, ''))}`
    : 'https://www.namecheap.com'

  // Generate trademark search URL
  const trademarkSearchUrl = 'https://www.uspto.gov/trademarks/search'

  return (
    <div className="space-y-6">
      {/* Selected name reminder */}
      <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
        <p className="text-sm text-blue-700 dark:text-blue-300">
          Checking availability for:{' '}
          <span className="font-bold">{data.selectedName || 'No name selected'}</span>
        </p>
      </div>

      {/* Warning */}
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-700 dark:bg-amber-900/20">
        <div className="flex gap-3">
          <ExclamationTriangleIcon className="h-5 w-5 flex-shrink-0 text-amber-600 dark:text-amber-400" />
          <div>
            <h3 className="text-sm font-medium text-amber-800 dark:text-amber-200">
              Important Disclaimer
            </h3>
            <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">
              These checks are for guidance only. For legal protection, consult with a trademark
              attorney before finalizing your business name.
            </p>
          </div>
        </div>
      </div>

      {/* Check items */}
      <div className="space-y-4">
        <CheckItem
          title="Domain Availability"
          description="Check if your business name is available as a domain (.com, .io, etc.)"
          icon={<GlobeAltIcon className="h-5 w-5" />}
          checked={data.domainChecked}
          onCheck={() => onUpdate({ domainChecked: !data.domainChecked })}
          externalLink={{ url: domainSearchUrl, label: 'Search domains' }}
        />

        <CheckItem
          title="Trademark Search"
          description="Search the USPTO database to ensure no existing trademark conflicts"
          icon={<ShieldCheckIcon className="h-5 w-5" />}
          checked={data.trademarkAcknowledged}
          onCheck={() => onUpdate({ trademarkAcknowledged: !data.trademarkAcknowledged })}
          externalLink={{ url: trademarkSearchUrl, label: 'Search USPTO' }}
        />
      </div>

      {/* Additional tips */}
      <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-700">
        <h3 className="text-sm font-medium text-zinc-900 dark:text-white">Also consider:</h3>
        <ul className="mt-2 space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
          <li>
            • Social media handle availability (@
            {data.selectedName?.replace(/\s+/g, '') || 'yourname'})
          </li>
          <li>• State business name availability (varies by state)</li>
          <li>• Google search for similar businesses</li>
        </ul>
      </div>
    </div>
  )
}
