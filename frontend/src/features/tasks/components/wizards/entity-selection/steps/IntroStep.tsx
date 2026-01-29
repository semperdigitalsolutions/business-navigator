/**
 * IntroStep Component
 * Issue #76: Introduction step for entity selection wizard
 */
import { BuildingOfficeIcon, ShieldCheckIcon, BanknotesIcon } from '@heroicons/react/24/outline'
import { cn } from '@/utils/classnames'
import type { EntityType } from '../types'

interface IntroStepProps {
  onContinue: () => void
}

interface EntityCardProps {
  icon: React.ReactNode
  title: string
  description: string
  type: EntityType
}

const ENTITY_CARDS: EntityCardProps[] = [
  {
    icon: <ShieldCheckIcon className="h-8 w-8" />,
    title: 'LLC',
    description: 'Flexible structure with liability protection. Popular for small businesses.',
    type: 'llc',
  },
  {
    icon: <BuildingOfficeIcon className="h-8 w-8" />,
    title: 'C-Corp',
    description: 'Best for raising investment. Standard for startups seeking VC funding.',
    type: 'c_corp',
  },
  {
    icon: <BanknotesIcon className="h-8 w-8" />,
    title: 'S-Corp',
    description: 'Tax advantages for profitable businesses. Pass-through taxation.',
    type: 's_corp',
  },
]

function EntityCard({ icon, title, description }: EntityCardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-zinc-200 bg-white p-4',
        'transition-colors hover:border-blue-300 hover:bg-blue-50/50',
        'dark:border-zinc-700 dark:bg-zinc-800',
        'dark:hover:border-blue-600 dark:hover:bg-blue-900/20'
      )}
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 text-blue-600 dark:text-blue-400">{icon}</div>
        <div>
          <h3 className="font-semibold text-zinc-900 dark:text-white">{title}</h3>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{description}</p>
        </div>
      </div>
    </div>
  )
}

export function IntroStep({ onContinue }: IntroStepProps) {
  return (
    <div className="space-y-6">
      {/* Why it matters section */}
      <div className="rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 p-5 dark:from-blue-900/20 dark:to-indigo-900/20">
        <h3 className="font-semibold text-zinc-900 dark:text-white">Why does this matter?</h3>
        <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">
          Your business entity type determines how you pay taxes, your personal liability
          protection, and your ability to raise funding. Choosing the right structure from the start
          can save you time and money down the road.
        </p>
      </div>

      {/* Entity type cards */}
      <div>
        <h3 className="mb-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Common business structures:
        </h3>
        <div className="space-y-3">
          {ENTITY_CARDS.map((card) => (
            <EntityCard key={card.type} {...card} />
          ))}
        </div>
      </div>

      {/* CTA button */}
      <button
        type="button"
        onClick={onContinue}
        className={cn(
          'w-full rounded-lg bg-blue-600 px-6 py-3 text-center',
          'font-semibold text-white transition-colors hover:bg-blue-700',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
          'dark:focus:ring-offset-zinc-900'
        )}
      >
        Find the right fit for me
      </button>

      {/* Disclaimer */}
      <p className="text-center text-xs text-zinc-500 dark:text-zinc-500">
        This wizard provides educational guidance. Consult a legal or tax professional for advice
        specific to your situation.
      </p>
    </div>
  )
}
