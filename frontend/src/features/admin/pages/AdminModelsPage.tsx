/**
 * Admin Models Page
 * AI model catalog management for administrators
 */
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/catalyst-ui-kit/typescript/button'
import { apiFetch } from '@/lib/api-client'

interface AIModel {
  id: string
  provider: string
  modelId: string
  displayName: string
  creditCost: number
  minTierSlug: string | null
  isEnabled: boolean
  capabilities?: Record<string, unknown>
  maxTokens?: number
  contextWindow?: number
  description?: string
}

interface CreateModelRequest {
  provider: string
  modelId: string
  displayName: string
  creditCost: number
  minTierSlug?: string
  isEnabled?: boolean
  description?: string
}

function PageHeader({ onAddModel }: { onAddModel: () => void }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-zinc-950 dark:text-white">AI Models</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Configure AI models and their credit costs
        </p>
      </div>
      <Button color="indigo" onClick={onAddModel}>
        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
        </svg>
        Add Model
      </Button>
    </div>
  )
}

function ModelCard({
  model,
  onEdit,
  onToggle,
  isToggling,
}: {
  model: AIModel
  onEdit: (model: AIModel) => void
  onToggle: (id: string, enabled: boolean) => void
  isToggling: boolean
}) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-zinc-950 dark:text-white">{model.displayName}</h3>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                model.isEnabled
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                  : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
              }`}
            >
              {model.isEnabled ? 'Active' : 'Disabled'}
            </span>
          </div>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {model.provider} / {model.modelId}
          </p>
          {model.description && (
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">{model.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button plain onClick={() => onEdit(model)}>
            Edit
          </Button>
          <Button plain onClick={() => onToggle(model.id, !model.isEnabled)} disabled={isToggling}>
            {model.isEnabled ? 'Disable' : 'Enable'}
          </Button>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-4 text-sm">
        <div>
          <span className="text-zinc-500 dark:text-zinc-400">Cost:</span>{' '}
          <span className="font-medium text-zinc-950 dark:text-white">
            {model.creditCost} credits
          </span>
        </div>
        {model.minTierSlug && (
          <div>
            <span className="text-zinc-500 dark:text-zinc-400">Min Tier:</span>{' '}
            <span className="font-medium text-zinc-950 dark:text-white capitalize">
              {model.minTierSlug}
            </span>
          </div>
        )}
        {model.contextWindow && (
          <div>
            <span className="text-zinc-500 dark:text-zinc-400">Context:</span>{' '}
            <span className="font-medium text-zinc-950 dark:text-white">
              {(model.contextWindow / 1000).toFixed(0)}k tokens
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

function AddModelModal({
  open,
  onClose,
  onSubmit,
  isSubmitting,
}: {
  open: boolean
  onClose: () => void
  onSubmit: (data: CreateModelRequest) => Promise<void>
  isSubmitting: boolean
}) {
  const [formData, setFormData] = useState<CreateModelRequest>({
    provider: '',
    modelId: '',
    displayName: '',
    creditCost: 1,
    description: '',
  })
  const [error, setError] = useState<string | null>(null)

  if (!open) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      await onSubmit(formData)
      setFormData({ provider: '', modelId: '', displayName: '', creditCost: 1, description: '' })
      onClose()
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 dark:bg-zinc-900">
        <h2 className="text-lg font-semibold text-zinc-950 dark:text-white">Add New Model</h2>

        {error && (
          <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Provider
            </label>
            <input
              type="text"
              value={formData.provider}
              onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
              className="mt-1 block w-full rounded-md border-zinc-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800"
              placeholder="openai, anthropic, google"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Model ID
            </label>
            <input
              type="text"
              value={formData.modelId}
              onChange={(e) => setFormData({ ...formData, modelId: e.target.value })}
              className="mt-1 block w-full rounded-md border-zinc-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800"
              placeholder="gpt-4o, claude-3-5-sonnet"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Display Name
            </label>
            <input
              type="text"
              value={formData.displayName}
              onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
              className="mt-1 block w-full rounded-md border-zinc-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800"
              placeholder="GPT-4o"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Credit Cost
            </label>
            <input
              type="number"
              value={formData.creditCost}
              onChange={(e) => setFormData({ ...formData, creditCost: parseInt(e.target.value) })}
              className="mt-1 block w-full rounded-md border-zinc-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800"
              min={1}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="mt-1 block w-full rounded-md border-zinc-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800"
              rows={2}
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button plain onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button color="indigo" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Model'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export function AdminModelsPage() {
  const [showAddModal, setShowAddModal] = useState(false)
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'models'],
    queryFn: async () => {
      const response = await apiFetch<{ models: AIModel[] }>('/api/admin/models')
      if (!response.success) throw new Error(response.error)
      return response.data!.models
    },
  })

  const createMutation = useMutation({
    mutationFn: async (data: CreateModelRequest) => {
      const response = await apiFetch('/api/admin/models', {
        method: 'POST',
        body: JSON.stringify(data),
      })
      if (!response.success) throw new Error(response.error)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'models'] }),
  })

  const toggleMutation = useMutation({
    mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => {
      const response = await apiFetch(`/api/admin/models/${id}/toggle`, {
        method: 'PATCH',
        body: JSON.stringify({ enabled }),
      })
      if (!response.success) throw new Error(response.error)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'models'] }),
  })

  const handleToggle = (id: string, enabled: boolean) => {
    toggleMutation.mutate({ id, enabled })
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <PageHeader onAddModel={() => setShowAddModal(true)} />

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
          {(error as Error).message}
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {data?.map((model) => (
            <ModelCard
              key={model.id}
              model={model}
              onEdit={() => console.warn('Edit not implemented')}
              onToggle={handleToggle}
              isToggling={toggleMutation.isPending}
            />
          ))}
        </div>
      )}

      {data?.length === 0 && !isLoading && (
        <div className="rounded-lg border border-zinc-200 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-zinc-500 dark:text-zinc-400">No AI models configured yet.</p>
          <Button color="indigo" className="mt-4" onClick={() => setShowAddModal(true)}>
            Add Your First Model
          </Button>
        </div>
      )}

      <AddModelModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={createMutation.mutateAsync}
        isSubmitting={createMutation.isPending}
      />
    </div>
  )
}
