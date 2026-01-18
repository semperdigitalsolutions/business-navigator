/**
 * DashboardPage Component
 * Main dashboard view with hero task, confidence score, and greeting
 * Week 2: Complete redesign with hero task card, confidence score, and progress tracking
 */
import { useEffect } from 'react'
import { Text } from '@/components/catalyst-ui-kit/typescript/text'
import { useDashboardStore } from '../hooks/useDashboardStore'
import { dashboardApi } from '../api/dashboard.api'
import { DashboardLayout } from './DashboardLayout'
import { HeroTaskCard } from './HeroTaskCard'
import { ConfidenceScore } from './ConfidenceScore'
import { HeroTaskSkeleton } from '@/components/skeletons/HeroTaskSkeleton'
import { ConfidenceScoreSkeleton } from '@/components/skeletons/ConfidenceScoreSkeleton'
import { Skeleton } from '@/components/skeletons/Skeleton'
import { WidgetErrorBoundary } from '@/components/error-boundaries/WidgetErrorBoundary'
import type { UserTask } from '@shared/types'

export function DashboardPage() {
  const {
    dashboardData,
    heroTask,
    confidenceScore,
    isLoading,
    error,
    setDashboardData,
    setHeroTask,
    setLoading,
    setError,
  } = useDashboardStore()

  // Fetch dashboard data on mount
  useEffect(() => {
    const fetchDashboardData = async () => {
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
    }

    fetchDashboardData()
  }, [setDashboardData, setLoading, setError])

  const handleTaskComplete = (completedTask: UserTask, nextTask?: UserTask) => {
    // Update hero task with the next one
    setHeroTask(nextTask || null)

    // Refresh confidence score
    dashboardApi.getConfidenceScore().then((response) => {
      if (response.success && response.data) {
        // Update store with new confidence score
      }
    })
  }

  const handleTaskSkip = (_skippedTask: UserTask, nextTask?: UserTask) => {
    // Update hero task with the next one
    setHeroTask(nextTask || null)
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Greeting Header Skeleton */}
          <div className="mb-8">
            <Skeleton width="40%" height={36} className="mb-2" />
            <Skeleton width="30%" height={20} />
          </div>

          {/* Main Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Hero Task */}
            <div className="lg:col-span-2 space-y-6">
              <HeroTaskSkeleton />

              {/* Recent Activity Skeleton */}
              <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm p-6">
                <Skeleton width={150} height={24} className="mb-4" />
                <div className="space-y-3">
                  <Skeleton width="100%" height={60} />
                  <Skeleton width="100%" height={60} />
                  <Skeleton width="100%" height={60} />
                </div>
              </div>
            </div>

            {/* Right Column - Confidence Score & Stats */}
            <div className="space-y-6">
              <ConfidenceScoreSkeleton />

              {/* Quick Stats Skeleton */}
              <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm p-6">
                <Skeleton width={120} height={24} className="mb-4" />
                <div className="space-y-4">
                  <div>
                    <Skeleton width={80} height={16} className="mb-2" />
                    <Skeleton width={60} height={32} />
                  </div>
                  <div>
                    <Skeleton width={80} height={16} className="mb-2" />
                    <Skeleton width={60} height={32} />
                  </div>
                  <div>
                    <Skeleton width={80} height={16} className="mb-2" />
                    <Skeleton width={60} height={32} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center max-w-md">
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-6 mb-4">
              <Text className="text-red-700 dark:text-red-400">{error}</Text>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Greeting Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-950 dark:text-white">
            {dashboardData?.greeting || 'Welcome back!'}
          </h1>
          <Text className="text-gray-600 dark:text-gray-300 mt-2">
            Here's what you need to focus on today
          </Text>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Hero Task (takes 2 columns on large screens) */}
          <div className="lg:col-span-2 space-y-6">
            <WidgetErrorBoundary widgetName="Hero Task">
              <HeroTaskCard
                task={heroTask}
                onTaskComplete={handleTaskComplete}
                onTaskSkip={handleTaskSkip}
              />
            </WidgetErrorBoundary>

            {/* Recent Activity Placeholder */}
            <WidgetErrorBoundary widgetName="Recent Activity">
              <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-zinc-950 dark:text-white mb-4">
                  Recent Activity
                </h3>
                <Text className="text-gray-500 dark:text-gray-400">
                  Your recent task completions will appear here
                </Text>
              </div>
            </WidgetErrorBoundary>
          </div>

          {/* Right Column - Confidence Score & Stats */}
          <div className="space-y-6">
            <WidgetErrorBoundary widgetName="Confidence Score">
              <ConfidenceScore score={confidenceScore} />
            </WidgetErrorBoundary>

            {/* Quick Stats Placeholder */}
            <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-zinc-950 dark:text-white mb-4">
                Quick Stats
              </h3>
              {dashboardData?.businessProgress && (
                <div className="space-y-3">
                  <div>
                    <Text className="text-sm text-gray-600 dark:text-gray-400">Total Tasks</Text>
                    <Text className="text-2xl font-bold text-zinc-950 dark:text-white">
                      {dashboardData.businessProgress.totalTasks}
                    </Text>
                  </div>
                  <div>
                    <Text className="text-sm text-gray-600 dark:text-gray-400">Completed</Text>
                    <Text className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {dashboardData.businessProgress.completedTasks}
                    </Text>
                  </div>
                  <div>
                    <Text className="text-sm text-gray-600 dark:text-gray-400">In Progress</Text>
                    <Text className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                      {dashboardData.businessProgress.inProgressTasks}
                    </Text>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
