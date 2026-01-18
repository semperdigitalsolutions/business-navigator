/**
 * Task Dashboard - Display business formation tasks
 */
import { useEffect, useState } from 'react'
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

export function TaskDashboard() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTasks()
  }, [])

  const loadTasks = async () => {
    try {
      // This endpoint would need to be created on the backend
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

  const categoryColors = {
    legal: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    financial: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    product: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    marketing: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading tasks...</div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Business Formation Tasks
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Track your progress through the business formation process
        </p>
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No tasks yet</h3>
          <p className="text-gray-500 dark:text-gray-400">
            Chat with the AI to get personalized tasks for your business formation journey
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {task.title}
                </h3>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    categoryColors[task.category as keyof typeof categoryColors] ||
                    'bg-gray-100 text-gray-800'
                  }`}
                >
                  {task.category}
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{task.description}</p>
              <div className="flex items-center gap-4">
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    task.status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : task.status === 'in_progress'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {task.status.replace('_', ' ')}
                </span>
                {task.priority && (
                  <span className="text-xs text-gray-500">Priority: {task.priority}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
