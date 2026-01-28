/**
 * Problem Section - Highlights pain points for first-time founders
 */
const problems = [
  {
    title: 'Confusing legal requirements',
    description:
      'LLC vs S-Corp vs Sole Proprietorship? The options are overwhelming and the stakes are high.',
  },
  {
    title: 'Scattered information',
    description:
      'Hours spent googling across dozens of sites, never sure if the advice applies to your state.',
  },
  {
    title: 'Expensive professionals',
    description:
      'Lawyers and accountants charge hundreds per hour for answers to basic formation questions.',
  },
]

export function ProblemSection() {
  return (
    <section className="bg-zinc-50 px-4 py-20 sm:px-6 sm:py-28 lg:px-8 dark:bg-zinc-900">
      <div className="mx-auto max-w-5xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl dark:text-white">
            Starting a business shouldn&apos;t be this hard
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
            First-time founders face real challenges that slow them down or stop them entirely.
          </p>
        </div>
        <div className="mt-16 grid gap-8 sm:grid-cols-3">
          {problems.map((problem) => (
            <div
              key={problem.title}
              className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950"
            >
              <h3 className="text-lg font-semibold text-zinc-950 dark:text-white">
                {problem.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                {problem.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
