import { Icon } from '@/components/ui/Icon'

export function ChatWelcome() {
  return (
    <div className="mb-16 text-center">
      <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-full bg-slate-50 text-slate-900 dark:bg-zinc-800 dark:text-white">
        <Icon name="lightbulb" size={32} />
      </div>
      <h1 className="mb-3 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
        Launch your vision.
      </h1>
      <p className="mx-auto max-w-md leading-relaxed text-slate-500 dark:text-slate-400">
        I'm your strategic partner from ideation to launch. What are we building today?
      </p>
    </div>
  )
}
