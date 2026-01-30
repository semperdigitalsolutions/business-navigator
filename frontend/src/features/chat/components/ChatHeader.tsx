import { Icon } from '@/components/ui/Icon'
import { ChatUsageIndicator } from './ChatUsageIndicator'

export interface ChatHeaderProps {
  title: string
  onShare?: () => void
  /** Whether to show the usage indicator */
  showUsage?: boolean
}

function AudioVisualizer() {
  return (
    <div className="flex h-6 w-12 items-end justify-center gap-[2px]">
      {[0, 0.2, 0.1, 0.3, 0].map((delay, i) => (
        <div key={i} className="visualizer-node" style={{ animationDelay: `${delay}s` }} />
      ))}
    </div>
  )
}

export function ChatHeader({ title, onShare, showUsage = true }: ChatHeaderProps) {
  return (
    <header className="flex h-16 flex-shrink-0 items-center justify-between border-b border-slate-100 px-8 dark:border-zinc-800">
      <div className="flex items-center gap-4">
        <AudioVisualizer />
        <h2 className="text-base font-bold leading-none text-slate-900 dark:text-white">{title}</h2>
      </div>
      <div className="flex items-center gap-3">
        {/* Usage indicator */}
        {showUsage && <ChatUsageIndicator />}

        {/* Share button */}
        {onShare && (
          <button
            onClick={onShare}
            className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition-all hover:bg-slate-50 dark:border-zinc-700 dark:text-slate-400 dark:hover:bg-zinc-800"
          >
            <Icon name="share" size={16} />
            Share
          </button>
        )}
      </div>
    </header>
  )
}
