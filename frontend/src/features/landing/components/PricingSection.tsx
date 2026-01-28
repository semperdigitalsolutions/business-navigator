/**
 * Pricing Section - Beta pricing and value proposition
 */
import { Button } from '@/components/catalyst-ui-kit/typescript/button'

interface PricingSectionProps {
  onJoinBeta: () => void
}

const betaPerks = [
  'Full access to all AI agents',
  'Personalized business formation guidance',
  'Task tracking and step-by-step checklists',
  'Early adopter pricing locked in',
  'Direct feedback channel to the team',
]

export function PricingSection({ onJoinBeta }: PricingSectionProps) {
  return (
    <section className="px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl dark:text-white">
          Free during beta
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-lg text-zinc-600 dark:text-zinc-400">
          Join the beta and get full access while we refine the platform. Early adopters will
          receive special pricing when we launch.
        </p>
        <div className="mx-auto mt-12 max-w-md rounded-2xl border border-indigo-200 bg-indigo-50/50 p-8 dark:border-indigo-800 dark:bg-indigo-950/20">
          <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
            Beta Access
          </p>
          <p className="mt-2 text-4xl font-bold text-zinc-950 dark:text-white">
            $0
            <span className="text-base font-normal text-zinc-500">/month</span>
          </p>
          <ul className="mt-6 space-y-3 text-left">
            {betaPerks.map((perk) => (
              <li
                key={perk}
                className="flex items-start gap-3 text-sm text-zinc-700 dark:text-zinc-300"
              >
                <svg
                  className="mt-0.5 h-5 w-5 shrink-0 text-indigo-600 dark:text-indigo-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                {perk}
              </li>
            ))}
          </ul>
          <Button color="indigo" className="mt-8 w-full" onClick={onJoinBeta}>
            Join the Beta
          </Button>
        </div>
      </div>
    </section>
  )
}
