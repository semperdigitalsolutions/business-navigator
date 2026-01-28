/**
 * Solution Section - Explains how Business Navigator solves the problems
 */
const steps = [
  {
    number: '01',
    title: 'Tell us about your idea',
    description:
      'Answer a few simple questions about your business goals, location, and preferences.',
  },
  {
    number: '02',
    title: 'Get personalized guidance',
    description:
      'Our AI agents analyze your situation and provide tailored recommendations for structure, compliance, and next steps.',
  },
  {
    number: '03',
    title: 'Take action with confidence',
    description:
      'Follow clear, step-by-step tasks with AI assistance available whenever you have questions.',
  },
]

export function SolutionSection() {
  return (
    <section className="px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl dark:text-white">
            Your AI-powered business formation guide
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
            Three simple steps to go from idea to legally formed business.
          </p>
        </div>
        <div className="mt-16 grid gap-12 sm:grid-cols-3">
          {steps.map((step) => (
            <div key={step.number} className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-lg font-bold text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                {step.number}
              </div>
              <h3 className="mt-4 text-lg font-semibold text-zinc-950 dark:text-white">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
