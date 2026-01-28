/**
 * Hero Section - Landing page hero with headline and CTA
 */
import { Button } from '@/components/catalyst-ui-kit/typescript/button'

interface HeroSectionProps {
  onJoinBeta: () => void
}

export function HeroSection({ onJoinBeta }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden px-4 pb-20 pt-32 sm:px-6 sm:pb-32 sm:pt-40 lg:px-8">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-950 sm:text-5xl lg:text-6xl dark:text-white">
          Launch your first business{' '}
          <span className="text-indigo-600 dark:text-indigo-400">with confidence</span>
        </h1>
        <p className="mt-6 text-lg leading-8 text-zinc-600 dark:text-zinc-400">
          AI-powered guidance through every step of business formation. From choosing your structure
          to filing paperwork, Business Navigator makes it simple for first-time founders.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Button color="indigo" onClick={onJoinBeta}>
            Join the Beta
          </Button>
          <Button outline href="#features">
            See How It Works
          </Button>
        </div>
      </div>
    </section>
  )
}
