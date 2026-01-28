/**
 * Features Section - Showcases key product capabilities
 */
const features = [
  {
    title: 'Legal Navigator',
    description:
      'Get guidance on business structures, formation requirements, and compliance obligations for your state.',
    icon: 'scale',
  },
  {
    title: 'Financial Planner',
    description:
      'Understand tax implications, create basic projections, and explore funding options for your business.',
    icon: 'chart',
  },
  {
    title: 'Task Tracker',
    description:
      'Follow a personalized checklist of formation steps, with AI help available at every stage.',
    icon: 'check',
  },
  {
    title: 'Multi-Agent AI',
    description:
      'Specialist AI agents for legal, financial, and operational questions route you to the right expertise.',
    icon: 'brain',
  },
]

const iconPaths: Record<string, string> = {
  scale:
    'M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5',
  chart:
    'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z',
  check: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  brain:
    'M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z',
}

function FeatureIcon({ icon }: { icon: string }) {
  return (
    <svg
      className="h-6 w-6 text-indigo-600 dark:text-indigo-400"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d={iconPaths[icon]} />
    </svg>
  )
}

export function FeaturesSection() {
  return (
    <section
      id="features"
      className="bg-zinc-50 px-4 py-20 sm:px-6 sm:py-28 lg:px-8 dark:bg-zinc-900"
    >
      <div className="mx-auto max-w-5xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl dark:text-white">
            Everything you need to launch
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
            Specialized AI agents work together to guide you through every aspect of business
            formation.
          </p>
        </div>
        <div className="mt-16 grid gap-8 sm:grid-cols-2">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950"
            >
              <FeatureIcon icon={feature.icon} />
              <h3 className="mt-4 text-lg font-semibold text-zinc-950 dark:text-white">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
