/**
 * CTA Section - Final call to action before footer
 */
import { Button } from '@/components/catalyst-ui-kit/typescript/button'

interface CTASectionProps {
  onJoinBeta: () => void
}

export function CTASection({ onJoinBeta }: CTASectionProps) {
  return (
    <section className="px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
      <div className="mx-auto max-w-3xl rounded-2xl bg-indigo-600 px-8 py-16 text-center dark:bg-indigo-700">
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Ready to launch your business?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-lg text-indigo-100">
          Join the beta today and get AI-powered guidance through every step of business formation.
          Free while in beta.
        </p>
        <Button color="white" className="mt-8" onClick={onJoinBeta}>
          Join the Beta — It&apos;s Free
        </Button>
      </div>
    </section>
  )
}
