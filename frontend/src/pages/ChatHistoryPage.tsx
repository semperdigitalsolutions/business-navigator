import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '@/components/ui/Icon'
import { ConversationCard } from '@/features/chat/components/ConversationCard'
import { chatApi, type ChatSession } from '@/features/chat/api/chat.api'
import { Skeleton } from '@/components/skeletons'

/** Maps agent_type to display icon and colors */
function getAgentDisplayInfo(agentType: string): {
  icon: string
  iconBgColor: string
  iconColor: string
} {
  switch (agentType) {
    case 'legal':
      return { icon: 'account_balance', iconBgColor: '#EDE9FE', iconColor: 'text-purple-600' }
    case 'financial':
      return { icon: 'trending_up', iconBgColor: '#D1FAE5', iconColor: 'text-emerald-600' }
    case 'tasks':
      return { icon: 'task_alt', iconBgColor: '#DBEAFE', iconColor: 'text-blue-600' }
    default:
      return { icon: 'chat_bubble', iconBgColor: '#FEE2E2', iconColor: 'text-red-600' }
  }
}

/** Formats a date string to a relative time string */
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 14) return '1 week ago'
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  if (diffDays < 60) return '1 month ago'
  return `${Math.floor(diffDays / 30)} months ago`
}

/** Generates a title from agent type */
function generateSessionTitle(session: ChatSession): string {
  const agentTitles: Record<string, string> = {
    legal: 'Legal Consultation',
    financial: 'Financial Planning',
    tasks: 'Task Management',
    triage: 'General Inquiry',
  }
  return agentTitles[session.agent_type] || 'Chat Session'
}

/** Loading skeleton for chat history */
function ChatHistorySkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="rounded-xl border border-slate-200 bg-white p-5 dark:border-zinc-700 dark:bg-zinc-800"
        >
          <div className="mb-3 flex items-start justify-between">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton className="mb-2 h-5 w-3/4" />
          <Skeleton className="mb-4 h-8 w-full" />
          <Skeleton className="h-4 w-24" />
        </div>
      ))}
    </div>
  )
}

export function ChatHistoryPage() {
  const navigate = useNavigate()

  const [searchQuery, setSearchQuery] = useState('')
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch chat sessions on mount
  const fetchSessions = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await chatApi.getSessions()
      if (response.success && response.data) {
        setSessions(response.data.sessions)
      } else {
        setError('Failed to load chat sessions')
      }
    } catch (err) {
      console.error('Failed to fetch chat sessions:', err)
      setError(err instanceof Error ? err.message : 'Failed to load chat sessions')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSessions()
  }, [fetchSessions])

  // Handle resuming a chat session
  const handleResume = useCallback(
    (sessionId: string) => {
      // Navigate to dashboard with session query param
      navigate(`/dashboard?session=${sessionId}`)
    },
    [navigate]
  )

  // Transform sessions to conversation card format
  const conversations = sessions.map((session) => {
    const displayInfo = getAgentDisplayInfo(session.agent_type)
    return {
      id: session.id,
      title: generateSessionTitle(session),
      summary: `Session with ${session.agent_type} agent. Status: ${session.status}`,
      timestamp: formatRelativeTime(session.created_at),
      ...displayInfo,
    }
  })

  const filteredConversations = conversations.filter(
    (conv) =>
      conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.summary.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <>
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
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-primary-700"
            >
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
        {/* Loading State */}
        {isLoading && <ChatHistorySkeleton />}

        {/* Error State */}
        {!isLoading && error && (
          <div className="py-12 text-center">
            <Icon name="error" size={48} className="mx-auto mb-4 text-red-400" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-white">
              Failed to load chat history
            </h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{error}</p>
            <button
              onClick={fetchSessions}
              className="mt-4 text-sm font-medium text-primary-600 hover:text-primary-700"
            >
              Try again
            </button>
          </div>
        )}

        {/* Sessions List */}
        {!isLoading && !error && filteredConversations.length > 0 && (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2">
              {filteredConversations.map((conv) => (
                <ConversationCard key={conv.id} {...conv} onResume={() => handleResume(conv.id)} />
              ))}
            </div>
            <div className="mt-8 text-center">
              <button className="text-sm font-medium text-slate-500 transition-colors hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300">
                View older conversations
              </button>
            </div>
          </>
        )}

        {/* Empty State */}
        {!isLoading && !error && filteredConversations.length === 0 && (
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
    </>
  )
}
