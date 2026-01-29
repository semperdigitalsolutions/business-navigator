/**
 * ExternalTaskLayout Component
 * GitHub Issue #84: Layout for affiliate/external link tasks
 *
 * Provides option selection for external tasks with:
 * - AI-generated (Pro) option
 * - Partner affiliate link option
 * - "Already have one" option
 * - Affiliate disclosure text
 * - "Leaving app" modal for external links
 * - Return flow confirmation
 */
import { useState } from 'react'
import { Button } from '@/components/catalyst-ui-kit/typescript/button'
import { RadioGroup, RadioField, Radio } from '@/components/catalyst-ui-kit/typescript/radio'
import { Label, Description } from '@/components/catalyst-ui-kit/typescript/fieldset'
import { Badge } from '@/components/catalyst-ui-kit/typescript/badge'
import { LeavingAppModal } from './LeavingAppModal'
import { cn } from '@/utils/classnames'

export interface ExternalOption {
  /** Unique identifier for the option */
  id: string
  /** Display label for the option */
  label: string
  /** Description text shown below the label */
  description: string
  /** External URL to navigate to (optional for "already have" options) */
  url?: string
  /** Whether this is a Pro-only feature */
  isPro?: boolean
  /** Whether this is the "already have one" option */
  isAlreadyHave?: boolean
}

export interface ExternalTaskLayoutProps {
  /** Task title displayed at the top */
  title: string
  /** Task description/explanation */
  description: string
  /** Available options for the user to select */
  options: ExternalOption[]
  /** Optional affiliate disclosure text */
  affiliateDisclosure?: string
  /** Called when the user completes the task */
  onComplete: () => void
  /** Called when the user skips the task (optional) */
  onSkip?: () => void
  /** Whether the current user has Pro access */
  isProUser?: boolean
  /** Additional class name for the container */
  className?: string
}

type LayoutState = 'selecting' | 'confirming' | 'completed'

function ProBadge({ disabled }: { disabled?: boolean }) {
  return (
    <span className="relative inline-flex">
      <Badge color={disabled ? 'zinc' : 'purple'}>Pro</Badge>
      {disabled && (
        <span
          className="pointer-events-none absolute -top-8 left-1/2 z-10 hidden -translate-x-1/2
            whitespace-nowrap rounded bg-zinc-900 px-2 py-1 text-xs text-white
            group-hover:block dark:bg-zinc-700"
        >
          Upgrade to Pro
        </span>
      )}
    </span>
  )
}

function ExternalLinkIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M4.25 5.5a.75.75 0 0 0-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 0 0 .75-.75v-4a.75.75 0 0 1 1.5 0v4A2.25 2.25 0 0 1 12.75 17h-8.5A2.25 2.25 0 0 1 2 14.75v-8.5A2.25 2.25 0 0 1 4.25 4h5a.75.75 0 0 1 0 1.5h-5Z"
        clipRule="evenodd"
      />
      <path
        fillRule="evenodd"
        d="M6.194 12.753a.75.75 0 0 0 1.06.053L16.5 4.44v2.81a.75.75 0 0 0 1.5 0v-4.5a.75.75 0 0 0-.75-.75h-4.5a.75.75 0 0 0 0 1.5h2.553l-9.056 8.194a.75.75 0 0 0-.053 1.06Z"
        clipRule="evenodd"
      />
    </svg>
  )
}

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
        clipRule="evenodd"
      />
    </svg>
  )
}

function SelectingView(props: {
  title: string
  description: string
  options: ExternalOption[]
  selectedOption: string | null
  onSelectOption: (id: string) => void
  onContinue: () => void
  isProUser: boolean
  affiliateDisclosure?: string
  onSkip?: () => void
}) {
  const {
    title,
    description,
    options,
    selectedOption,
    onSelectOption,
    onContinue,
    isProUser,
    affiliateDisclosure,
    onSkip,
  } = props

  const selectedOptionData = options.find((o) => o.id === selectedOption)
  const isDisabled = selectedOptionData?.isPro && !isProUser

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">{title}</h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{description}</p>
      </div>

      <RadioGroup value={selectedOption} onChange={onSelectOption} className="space-y-3">
        {options.map((option) => {
          const optionDisabled = option.isPro && !isProUser
          return (
            <RadioField
              key={option.id}
              className={cn(
                'group relative cursor-pointer rounded-lg border p-4 transition-colors',
                'border-zinc-200 hover:border-zinc-300 dark:border-zinc-700 dark:hover:border-zinc-600',
                selectedOption === option.id &&
                  'border-blue-500 bg-blue-50/50 dark:border-blue-500 dark:bg-blue-500/10',
                optionDisabled && 'cursor-not-allowed opacity-60'
              )}
            >
              <Radio value={option.id} color="blue" disabled={optionDisabled} />
              <Label className="flex items-center gap-2">
                {option.label}
                {option.isPro && <ProBadge disabled={!isProUser} />}
                {option.url && (
                  <ExternalLinkIcon className="h-4 w-4 text-zinc-400 dark:text-zinc-500" />
                )}
              </Label>
              <Description>{option.description}</Description>
            </RadioField>
          )
        })}
      </RadioGroup>

      {affiliateDisclosure && (
        <p className="text-xs text-zinc-500 dark:text-zinc-500">{affiliateDisclosure}</p>
      )}

      <div className="flex items-center justify-between gap-4 pt-2">
        {onSkip && (
          <Button plain onClick={onSkip}>
            Skip for now
          </Button>
        )}
        <div className={cn(!onSkip && 'ml-auto')}>
          <Button color="blue" onClick={onContinue} disabled={!selectedOption || isDisabled}>
            Continue
          </Button>
        </div>
      </div>
    </div>
  )
}

function ConfirmingView(props: { title: string; onYes: () => void; onNotYet: () => void }) {
  const { title, onYes, onNotYet } = props

  return (
    <div className="space-y-6 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-500/20">
        <CheckCircleIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
      </div>

      <div>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
          Did you complete this?
        </h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{title}</p>
      </div>

      <div className="flex justify-center gap-4">
        <Button outline onClick={onNotYet}>
          Not yet
        </Button>
        <Button color="green" onClick={onYes}>
          Yes, I did
        </Button>
      </div>
    </div>
  )
}

function CompletedView(props: { title: string }) {
  const { title } = props

  return (
    <div className="space-y-4 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-500/20">
        <CheckCircleIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
      </div>

      <div>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Completed</h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{title}</p>
      </div>
    </div>
  )
}

export function ExternalTaskLayout(props: ExternalTaskLayoutProps) {
  const {
    title,
    description,
    options,
    affiliateDisclosure,
    onComplete,
    onSkip,
    isProUser = false,
    className,
  } = props

  const [state, setState] = useState<LayoutState>('selecting')
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [showLeavingModal, setShowLeavingModal] = useState(false)
  const [pendingUrl, setPendingUrl] = useState<string | null>(null)

  const handleContinue = () => {
    if (!selectedOption) return

    const option = options.find((o) => o.id === selectedOption)
    if (!option) return

    // "Already have one" skips external link, goes straight to confirmation
    if (option.isAlreadyHave) {
      setState('confirming')
      return
    }

    // External link option - show leaving modal
    if (option.url) {
      setPendingUrl(option.url)
      setShowLeavingModal(true)
    }
  }

  const handleConfirmLeaving = () => {
    if (pendingUrl) {
      window.open(pendingUrl, '_blank', 'noopener,noreferrer')
    }
    setShowLeavingModal(false)
    setPendingUrl(null)
    setState('confirming')
  }

  const handleCloseLeavingModal = () => {
    setShowLeavingModal(false)
    setPendingUrl(null)
  }

  const handleYes = () => {
    setState('completed')
    onComplete()
  }

  const handleNotYet = () => {
    setState('selecting')
  }

  return (
    <div className={cn('w-full', className)}>
      {state === 'selecting' && (
        <SelectingView
          title={title}
          description={description}
          options={options}
          selectedOption={selectedOption}
          onSelectOption={setSelectedOption}
          onContinue={handleContinue}
          isProUser={isProUser}
          affiliateDisclosure={affiliateDisclosure}
          onSkip={onSkip}
        />
      )}

      {state === 'confirming' && (
        <ConfirmingView title={title} onYes={handleYes} onNotYet={handleNotYet} />
      )}

      {state === 'completed' && <CompletedView title={title} />}

      <LeavingAppModal
        isOpen={showLeavingModal}
        onClose={handleCloseLeavingModal}
        onConfirm={handleConfirmLeaving}
        destinationUrl={pendingUrl ?? ''}
        showAffiliateDisclosure={Boolean(affiliateDisclosure)}
      />
    </div>
  )
}
