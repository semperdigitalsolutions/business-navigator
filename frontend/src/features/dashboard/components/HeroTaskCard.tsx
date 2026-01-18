/**
 * HeroTaskCard Component
 * Displays the next recommended action with prominent styling
 */
import { useState } from 'react'
import { Button } from '@/components/catalyst-ui-kit/typescript/button'
import { Text } from '@/components/catalyst-ui-kit/typescript/text'
import {
  CheckCircleIcon,
  ClockIcon,
  ArrowRightIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline'
import type { UserTask } from '@shared/types'
import { dashboardApi } from '../api/dashboard.api'

interface HeroTaskCardProps {
  task: UserTask | null | undefined
  onTaskComplete?: (completedTask: UserTask, nextTask?: UserTask) => void
  onTaskSkip?: (skippedTask: UserTask, nextTask?: UserTask) => void
}

export function HeroTaskCard({ task, onTaskComplete, onTaskSkip }: HeroTaskCardProps) {
  const [isCompleting, setIsCompleting] = useState(false)
  const [isSkipping, setIsSkipping] = useState(false)

  if (!task) {
    return (
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-8 text-center">
        <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-800/30 rounded-full flex items-center justify-center mb-4">
          <CheckCircleIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
        </div>
        <h3 className="text-xl font-bold text-zinc-950 dark:text-white mb-2">All caught up!</h3>
        <Text className="text-gray-600 dark:text-gray-300">
          Great job staying on top of your business formation. Check back later for new tasks.
        </Text>
      </div>
    )
  }

  const handleComplete = async () => {
    setIsCompleting(true)
    try {
      const response = await dashboardApi.completeHeroTask(task.id)
      if (response.success && response.data) {
        onTaskComplete?.(response.data.completedTask, response.data.nextHeroTask)
      }
    } catch (error) {
      console.error('Failed to complete task:', error)
    } finally {
      setIsCompleting(false)
    }
  }

  const handleSkip = async () => {
    setIsSkipping(true)
    try {
      const response = await dashboardApi.skipHeroTask(task.id)
      if (response.success && response.data) {
        onTaskSkip?.(response.data.skippedTask, response.data.nextHeroTask)
      }
    } catch (error) {
      console.error('Failed to skip task:', error)
    } finally {
      setIsSkipping(false)
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'legal':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
      case 'financial':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
      case 'ideation':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
      case 'launch_prep':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
    }
  }

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-lg p-6 border-2 border-indigo-200 dark:border-indigo-800">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <SparklesIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">
            Next Action
          </span>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(task.category)}`}
        >
          {task.category}
        </span>
      </div>

      {/* Task Details */}
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-zinc-950 dark:text-white mb-2">{task.title}</h3>
        <Text className="text-gray-700 dark:text-gray-300 leading-relaxed">{task.description}</Text>
      </div>

      {/* Metadata */}
      <div className="flex items-center gap-4 mb-6 text-sm text-gray-600 dark:text-gray-400">
        <div className="flex items-center gap-1.5">
          <ClockIcon className="h-4 w-4" />
          <span>Priority: {task.priority}</span>
        </div>
        {task.metadata?.estimatedTime && (
          <div className="flex items-center gap-1.5">
            <ClockIcon className="h-4 w-4" />
            <span>{task.metadata.estimatedTime}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Button
          onClick={handleComplete}
          disabled={isCompleting || isSkipping}
          color="indigo"
          className="flex-1"
        >
          {isCompleting ? (
            'Marking Complete...'
          ) : (
            <>
              <CheckCircleIcon className="h-5 w-5 mr-2" />
              Mark Complete
            </>
          )}
        </Button>
        <Button
          onClick={handleSkip}
          disabled={isCompleting || isSkipping}
          color="white"
          className="flex items-center gap-2"
        >
          {isSkipping ? 'Skipping...' : 'Skip for Now'}
        </Button>
        <Button color="white" className="flex items-center gap-2">
          <span>Learn More</span>
          <ArrowRightIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
