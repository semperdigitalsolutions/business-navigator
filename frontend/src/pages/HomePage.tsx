import { useCallback, useEffect } from 'react'
import {
  ChatHeader,
  ChatInput,
  ChatMessage,
  ChatOptionCard,
  ChatWelcome,
  type SuggestedAction,
} from '@/features/chat/components'
import { useDashboardStore } from '@/features/dashboard/hooks/useDashboardStore'
import { dashboardApi } from '@/features/dashboard/api/dashboard.api'
import { Skeleton } from '@/components/skeletons'

const SUGGESTED_ACTIONS: SuggestedAction[] = [
  { label: 'Draft Operating Agreement', icon: 'add', variant: 'primary' },
  { label: 'Research Competitors', icon: 'search' },
  { label: 'Brainstorm Names', icon: 'lightbulb' },
]

function HomePageSkeleton() {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-slate-200 p-4 dark:border-zinc-700">
        <Skeleton className="h-6 w-24" />
      </div>
      <div className="flex-1 p-6">
        <div className="mx-auto max-w-3xl">
          <Skeleton className="mb-6 h-24 w-full rounded-xl" />
          <div className="space-y-4">
            <Skeleton className="h-16 w-3/4" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function HomePage() {
  const { dashboardData, isLoading, setDashboardData, setLoading, setError } = useDashboardStore()

  // Fetch dashboard data on mount
  const fetchDashboardData = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await dashboardApi.getDashboard()
      if (response.success && response.data) {
        setDashboardData(response.data)
      } else {
        setError(response.error || 'Failed to load dashboard')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }, [setDashboardData, setError, setLoading])

  useEffect(() => {
    // Only fetch if we don't have data yet
    if (!dashboardData) {
      fetchDashboardData()
    }
  }, [dashboardData, fetchDashboardData])

  // Show loading skeleton while data is loading
  if (isLoading && !dashboardData) {
    return <HomePageSkeleton />
  }

  return (
    <>
      <ChatHeader title="Home" onShare={() => console.warn('Share clicked')} />

      <div className="hide-scrollbar flex-1 overflow-y-auto scroll-smooth">
        <div className="mx-auto max-w-3xl px-6 py-12">
          <ChatWelcome />

          <div className="space-y-4">
            <ChatMessage
              role="user"
              content="I need help deciding between an LLC and a C-Corp for my tech startup. We plan to raise venture capital later this year."
            />

            <ChatMessage
              role="assistant"
              content={
                <>
                  <p>
                    If you plan to raise venture capital, a{' '}
                    <strong className="text-slate-900 dark:text-white">
                      Delaware C-Corporation
                    </strong>{' '}
                    is almost universally required by institutional investors. While an LLC offers
                    tax flexibility, C-Corps are built for scale and equity distribution.
                  </p>
                  <div className="grid grid-cols-1 gap-4 py-4 md:grid-cols-2">
                    <ChatOptionCard
                      icon="account_balance"
                      title="Delaware C-Corp"
                      description="The standard for startups seeking VC. Optimized for complex equity and preferred stock."
                      variant="primary"
                    />
                    <ChatOptionCard
                      icon="payments"
                      title="LLC (Pass-through)"
                      description="Best for bootstrapped businesses. Avoids double taxation but complicates equity for VCs."
                      variant="secondary"
                    />
                  </div>
                </>
              }
            />
          </div>
        </div>
      </div>

      <ChatInput
        suggestedActions={SUGGESTED_ACTIONS}
        onSend={(msg) => console.warn('Send:', msg)}
        onActionClick={(action) => console.warn('Action:', action)}
      />
    </>
  )
}
