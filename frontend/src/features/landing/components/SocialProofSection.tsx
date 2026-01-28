/**
 * Social Proof Section - Testimonials and trust signals
 */
const testimonials = [
  {
    quote:
      'I had no idea where to start with forming my LLC. Business Navigator walked me through every step.',
    name: 'Sarah K.',
    role: 'Freelance Designer',
  },
  {
    quote:
      'The AI agents gave me clearer answers in 10 minutes than hours of googling. Game changer for new founders.',
    name: 'Marcus T.',
    role: 'First-time Founder',
  },
  {
    quote:
      'Finally, a tool that explains business formation in plain language. I actually understood my options.',
    name: 'Priya M.',
    role: 'E-commerce Entrepreneur',
  },
]

export function SocialProofSection() {
  return (
    <section className="bg-zinc-50 px-4 py-20 sm:px-6 sm:py-28 lg:px-8 dark:bg-zinc-900">
      <div className="mx-auto max-w-5xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl dark:text-white">
            Founders love Business Navigator
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
            Hear from early users who launched their businesses with our help.
          </p>
        </div>
        <div className="mt-16 grid gap-8 sm:grid-cols-3">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.name}
              className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950"
            >
              <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                &ldquo;{testimonial.quote}&rdquo;
              </p>
              <div className="mt-4 border-t border-zinc-100 pt-4 dark:border-zinc-800">
                <p className="text-sm font-semibold text-zinc-950 dark:text-white">
                  {testimonial.name}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">{testimonial.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
