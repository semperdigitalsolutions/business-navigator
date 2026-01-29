import { useState } from 'react'
import { AppShell, LeftSidebar, RightSidebar } from '@/components/layout'
import { Icon } from '@/components/ui/Icon'
import { ConversationCard } from '@/features/chat/components/ConversationCard'

const DEMO_CONVERSATIONS = [
  {
    id: '1',
    title: 'Entity Type Selection',
    summary:
      'Analyzed pros and cons of Delaware C-Corp formation. Discussed initial formation requirements and costs.',
    timestamp: '3 days ago',
    icon: 'account_balance',
    iconBgColor: '#EDE9FE',
    iconColor: 'text-purple-600',
  },
  {
    id: '2',
    title: 'Initial Market Research',
    summary:
      'Evaluated Total Addressable Market (TAM) for mid-market retail analytics. Identified 3 key competitors.',
    timestamp: '5 days ago',
    icon: 'trending_up',
    iconBgColor: '#D1FAE5',
    iconColor: 'text-emerald-600',
  },
  {
    id: '3',
    title: 'Co-founder Equity Split',
    summary:
      'Reviewed 4-year vesting schedule with 1-year cliff. Discussed cliff-based equity allocation and vesting.',
    timestamp: '1 week ago',
    icon: 'groups',
    iconBgColor: '#FEE2E2',
    iconColor: 'text-red-600',
  },
  {
    id: '4',
    title: 'Product Roadmap V1',
    summary:
      'Created MVP feature set focusing on inventory optimization module. Outlined 6-month development timeline.',
    timestamp: '1 week ago',
    icon: 'route',
    iconBgColor: '#DBEAFE',
    iconColor: 'text-blue-600',
  },
]

const DEMO_PHASES = [
  {
    id: 'foundation',
    title: 'Phase 1: Foundation',
    icon: 'foundation',
    tasks: [
      { id: '1', title: 'Business Concept', status: 'completed' as const },
      { id: '2', title: 'Market Research', status: 'completed' as const },
    ],
  },
  {
    id: 'legal',
    title: 'Phase 2: Legal & Compliance',
    icon: 'policy',
    tasks: [
      { id: '3', title: 'Operating Agreement', status: 'in_progress' as const },
      { id: '4', title: 'Tax ID (EIN)', status: 'pending' as const },
    ],
  },
]

export function ChatHistoryPage() {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredConversations = DEMO_CONVERSATIONS.filter(
    (conv) =>
      conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.summary.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <AppShell
      leftSidebar={<LeftSidebar userName="Erica" userPlan="Pro Plan" />}
      rightSidebar={
        <RightSidebar stageLabel="Stage 2: Foundation" progressPercent={65} phases={DEMO_PHASES} />
      }
    >
      {/* Header */}
      <header className="flex-shrink-0 border-b border-slate-100 px-8 py-6 dark:border-zinc-800">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Chat History</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Review past sessions and AI conversations
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition-all hover:bg-slate-50 dark:border-zinc-700 dark:text-slate-400 dark:hover:bg-zinc-800">
              <Icon name="filter_list" size={18} />
              Filter
            </button>
            <button className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-primary-700">
              <Icon name="add" size={18} />
              New Chat
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="mt-4">
          <div className="relative">
            <Icon
              name="search"
              size={20}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations by topic, keyword, or decision..."
              className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 transition-all focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:placeholder-slate-500"
            />
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="hide-scrollbar flex-1 overflow-y-auto p-8">
        {filteredConversations.length > 0 ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2">
              {filteredConversations.map((conv) => (
                <ConversationCard
                  key={conv.id}
                  {...conv}
                  onResume={() => console.warn('Resume conversation:', conv.id)}
                />
              ))}
            </div>
            <div className="mt-8 text-center">
              <button className="text-sm font-medium text-slate-500 transition-colors hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300">
                View older conversations
              </button>
            </div>
          </>
        ) : (
          <div className="py-12 text-center">
            <Icon name="chat_bubble" size={48} className="mx-auto mb-4 text-slate-300" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-white">
              No conversations found
            </h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {searchQuery ? 'Try a different search term' : 'Start a new chat to begin'}
            </p>
          </div>
        )}
      </div>
    </AppShell>
  )
}
