/**
 * TaskDetailPage Component
 * Issue #86: Task detail view with unsaved changes warning
 * Integrates useTaskNavigationGuard for navigation blocking
 */
import { useCallback, useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { TaskDetailLayout } from './TaskDetailLayout'
import { TaskNavigation } from './TaskNavigation'
import { UnsavedChangesDialog } from '@/components/ui/unsaved-changes-dialog'
import { useTaskNavigationGuard } from '../hooks/use-task-navigation-guard'
import { apiClient } from '@/lib/api/client'
import type { TaskPhase } from '@shared/types'

interface TaskDetail {
  id: string
  title: string
  description: string
  icon?: string
  phase: TaskPhase
  phaseName: string
  estimatedTime: string
  status: string
  content?: string
  completionData?: Record<string, unknown>
}

export function TaskDetailPage() {
  const { taskId } = useParams<{ taskId: string }>()
  const navigate = useNavigate()
  const [task, setTask] = useState<TaskDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Navigation guard with auto-save
  const {
    dialogProps,
    updateDraft,
    isDirty,
    status: saveStatus,
    saveNow,
  } = useTaskNavigationGuard({
    taskId: taskId || '',
    enabled: !!taskId,
  })

  useEffect(() => {
    if (!taskId) return

    const loadTask = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await apiClient.get<TaskDetail>(`/api/tasks/${taskId}`)
        if (response.success && response.data) {
          setTask(response.data)
        } else {
          setError('Task not found')
        }
      } catch (err) {
        console.error('Failed to load task:', err)
        setError('Failed to load task')
      } finally {
        setLoading(false)
      }
    }

    loadTask()
  }, [taskId])

  const handleSave = useCallback(async () => {
    await saveNow()
  }, [saveNow])

  const handleComplete = useCallback(async () => {
    if (!taskId) return
    try {
      await saveNow()
      await apiClient.post(`/api/tasks/${taskId}/complete`)
      navigate('/tasks')
    } catch (err) {
      console.error('Failed to complete task:', err)
    }
  }, [taskId, saveNow, navigate])

  const handleBack = useCallback(() => {
    navigate('/tasks')
  }, [navigate])

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-zinc-500 dark:text-zinc-400">Loading task...</div>
      </div>
    )
  }

  if (error || !task) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-4">
        <p className="text-zinc-500 dark:text-zinc-400">{error || 'Task not found'}</p>
        <button
          onClick={() => navigate('/tasks')}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Back to Tasks
        </button>
      </div>
    )
  }

  return (
    <TaskDetailLayout
      title={task.title}
      description={task.description}
      icon={task.icon}
      phase={task.phase}
      phaseName={task.phaseName}
      estimatedTime={task.estimatedTime}
      navigation={
        <TaskNavigation
          onBack={handleBack}
          onSave={handleSave}
          onComplete={handleComplete}
          isSaving={saveStatus === 'saving'}
          showSave={isDirty}
        />
      }
      dialog={<UnsavedChangesDialog {...dialogProps} />}
    >
      {/* Task Content Area */}
      <div className="space-y-6">
        {task.content ? (
          <div className="prose dark:prose-invert max-w-none">{task.content}</div>
        ) : (
          <div className="rounded-lg bg-zinc-50 p-6 dark:bg-zinc-900">
            <p className="text-center text-zinc-500 dark:text-zinc-400">
              Task content will be displayed here. Use the form below to track your progress.
            </p>
          </div>
        )}

        {/* Simple Form for Demo */}
        <div className="space-y-4">
          <div>
            <label
              htmlFor="notes"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Notes
            </label>
            <textarea
              id="notes"
              rows={4}
              className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
              placeholder="Add any notes about this task..."
              defaultValue={(task.completionData?.notes as string) || ''}
              onChange={(e) => updateDraft({ notes: e.target.value })}
            />
          </div>
        </div>
      </div>
    </TaskDetailLayout>
  )
}
