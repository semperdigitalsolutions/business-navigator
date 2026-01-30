/**
 * Admin Tiers Page
 * Subscription tier management for administrators
 */
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/catalyst-ui-kit/typescript/button'
import { apiFetch } from '@/lib/api-client'

interface SubscriptionTier {
  id: string
  slug: string
  name: string
  description: string
  monthlyCredits: number
  priceMonthly: number
  priceYearly: number
  features: Record<string, unknown>
  isDefault: boolean
  sortOrder: number
  isActive: boolean
}

interface CreateTierRequest {
  slug: string
  name: string
  description?: string
  monthlyCredits: number
  priceMonthly: number
  priceYearly: number
  isDefault?: boolean
}

function PageHeader({ onAddTier }: { onAddTier: () => void }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-zinc-950 dark:text-white">Subscription Tiers</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Manage subscription plans and credit allocations
        </p>
      </div>
      <Button color="indigo" onClick={onAddTier}>
        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
        </svg>
        Add Tier
      </Button>
    </div>
  )
}

function TierCard({
  tier,
  onEdit,
  onToggle,
  isToggling,
}: {
  tier: SubscriptionTier
  onEdit: (tier: SubscriptionTier) => void
  onToggle: (id: string, active: boolean) => void
  isToggling: boolean
}) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-zinc-950 dark:text-white">{tier.name}</h3>
            {tier.isDefault && (
              <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300">
                Default
              </span>
            )}
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                tier.isActive
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                  : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
              }`}
            >
              {tier.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{tier.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button plain onClick={() => onEdit(tier)}>
            Edit
          </Button>
          <Button
            plain
            onClick={() => onToggle(tier.id, !tier.isActive)}
            disabled={isToggling || tier.isDefault}
          >
            {tier.isActive ? 'Deactivate' : 'Activate'}
          </Button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="rounded-lg bg-zinc-50 p-4 dark:bg-zinc-800">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Monthly Credits</p>
          <p className="mt-1 text-2xl font-bold text-zinc-950 dark:text-white">
            {tier.monthlyCredits.toLocaleString()}
          </p>
        </div>
        <div className="rounded-lg bg-zinc-50 p-4 dark:bg-zinc-800">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Monthly Price</p>
          <p className="mt-1 text-2xl font-bold text-zinc-950 dark:text-white">
            ${tier.priceMonthly}
          </p>
        </div>
        <div className="rounded-lg bg-zinc-50 p-4 dark:bg-zinc-800">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Yearly Price</p>
          <p className="mt-1 text-2xl font-bold text-zinc-950 dark:text-white">
            ${tier.priceYearly}
          </p>
        </div>
      </div>

      {Object.keys(tier.features).length > 0 && (
        <div className="mt-4">
          <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Features</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {Object.entries(tier.features).map(([key, value]) => (
              <span
                key={key}
                className="rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
              >
                {key}: {String(value)}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function AddTierModal({
  open,
  onClose,
  onSubmit,
  isSubmitting,
}: {
  open: boolean
  onClose: () => void
  onSubmit: (data: CreateTierRequest) => Promise<void>
  isSubmitting: boolean
}) {
  const [formData, setFormData] = useState<CreateTierRequest>({
    slug: '',
    name: '',
    description: '',
    monthlyCredits: 100,
    priceMonthly: 0,
    priceYearly: 0,
  })
  const [error, setError] = useState<string | null>(null)

  if (!open) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      await onSubmit(formData)
      setFormData({
        slug: '',
        name: '',
        description: '',
        monthlyCredits: 100,
        priceMonthly: 0,
        priceYearly: 0,
      })
      onClose()
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 dark:bg-zinc-900">
        <h2 className="text-lg font-semibold text-zinc-950 dark:text-white">Add New Tier</h2>

        {error && (
          <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Slug
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="mt-1 block w-full rounded-md border-zinc-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800"
                placeholder="pro"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full rounded-md border-zinc-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800"
                placeholder="Pro Plan"
                required
              />
            </div>
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
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Monthly Credits
            </label>
            <input
              type="number"
              value={formData.monthlyCredits}
              onChange={(e) =>
                setFormData({ ...formData, monthlyCredits: parseInt(e.target.value) })
              }
              className="mt-1 block w-full rounded-md border-zinc-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800"
              min={0}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Monthly Price ($)
              </label>
              <input
                type="number"
                value={formData.priceMonthly}
                onChange={(e) =>
                  setFormData({ ...formData, priceMonthly: parseFloat(e.target.value) })
                }
                className="mt-1 block w-full rounded-md border-zinc-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800"
                min={0}
                step={0.01}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Yearly Price ($)
              </label>
              <input
                type="number"
                value={formData.priceYearly}
                onChange={(e) =>
                  setFormData({ ...formData, priceYearly: parseFloat(e.target.value) })
                }
                className="mt-1 block w-full rounded-md border-zinc-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800"
                min={0}
                step={0.01}
                required
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button plain onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button color="indigo" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Tier'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export function AdminTiersPage() {
  const [showAddModal, setShowAddModal] = useState(false)
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'tiers'],
    queryFn: async () => {
      const response = await apiFetch<{ tiers: SubscriptionTier[] }>(
        '/api/admin/tiers?includeInactive=true'
      )
      if (!response.success) throw new Error(response.error)
      return response.data!.tiers
    },
  })

  const createMutation = useMutation({
    mutationFn: async (data: CreateTierRequest) => {
      const response = await apiFetch('/api/admin/tiers', {
        method: 'POST',
        body: JSON.stringify(data),
      })
      if (!response.success) throw new Error(response.error)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'tiers'] }),
  })

  const toggleMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const response = await apiFetch(`/api/admin/tiers/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive }),
      })
      if (!response.success) throw new Error(response.error)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'tiers'] }),
  })

  const handleToggle = (id: string, isActive: boolean) => {
    toggleMutation.mutate({ id, isActive })
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <PageHeader onAddTier={() => setShowAddModal(true)} />

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
        <div className="space-y-4">
          {data?.map((tier) => (
            <TierCard
              key={tier.id}
              tier={tier}
              onEdit={() => console.warn('Edit not implemented')}
              onToggle={handleToggle}
              isToggling={toggleMutation.isPending}
            />
          ))}
        </div>
      )}

      {data?.length === 0 && !isLoading && (
        <div className="rounded-lg border border-zinc-200 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-zinc-500 dark:text-zinc-400">No subscription tiers configured yet.</p>
          <Button color="indigo" className="mt-4" onClick={() => setShowAddModal(true)}>
            Add Your First Tier
          </Button>
        </div>
      )}

      <AddTierModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={createMutation.mutateAsync}
        isSubmitting={createMutation.isPending}
      />
    </div>
  )
}
