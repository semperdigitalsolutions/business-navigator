/**
 * Task Dashboard - Display business formation tasks
 * Uses Catalyst UI components
 */
import { useEffect, useState } from 'react'
import { Badge } from '@/components/catalyst-ui-kit/typescript/badge'
import { apiClient } from '@/lib/api/client'

interface Task {
  id: string
  title: string
  description: string
  category: string
  priority: string
  status: string
  completed_at?: string
}

type BadgeColor = 'blue' | 'green' | 'purple' | 'pink' | 'zinc' | 'yellow' | 'emerald'

const categoryColors: Record<string, BadgeColor> = {
  legal: 'blue',
  financial: 'green',
  product: 'purple',
  marketing: 'pink',
}

const statusColors: Record<string, BadgeColor> = {
  completed: 'emerald',
  in_progress: 'yellow',
  pending: 'zinc',
}

export function TaskDashboard() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTasks()
  }, [])

  const loadTasks = async () => {
    try {
      const response = await apiClient.get('/api/tasks')
      if (response.success) {
        setTasks(response.data?.tasks || [])
      }
    } catch (err) {
      console.error('Failed to load tasks:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-zinc-500 dark:text-zinc-400">Loading tasks...</div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-zinc-950 dark:text-white mb-2">
          Business Formation Tasks
        </h2>
        <p className="text-zinc-500 dark:text-zinc-400">
          Track your progress through the business formation process
        </p>
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-12 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-lg font-medium text-zinc-950 dark:text-white mb-2">No tasks yet</h3>
          <p className="text-zinc-500 dark:text-zinc-400">
            Chat with the AI to get personalized tasks for your business formation journey
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="p-6 bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-zinc-950 dark:text-white">
                  {task.title}
                </h3>
                <Badge color={categoryColors[task.category] || 'zinc'}>{task.category}</Badge>
              </div>
              <p className="text-zinc-600 dark:text-zinc-400 mb-4">{task.description}</p>
              <div className="flex items-center gap-4">
                <Badge color={statusColors[task.status] || 'zinc'}>
                  {task.status.replace('_', ' ')}
                </Badge>
                {task.priority && (
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    Priority: {task.priority}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
