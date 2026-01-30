/**
 * Admin API Keys Page
 * Platform-level API key management for administrators
 */
import { useState } from 'react'
import { Button } from '@/components/catalyst-ui-kit/typescript/button'
import { useAdminApiKeys } from '../hooks/useAdminApiKeys'
import { ApiKeyTable } from '../components/ApiKeyTable'
import { AddApiKeyModal } from '../components/AddApiKeyModal'
import { RotateKeyModal } from '../components/RotateKeyModal'
import { DeleteKeyModal } from '../components/DeleteKeyModal'
import type {
  AdminApiKey,
  CreateApiKeyRequest,
  RotateApiKeyRequest,
} from '../types/admin-api-keys.types'

function SecurityWarningBanner() {
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
      <div className="flex items-start gap-3">
        <svg
          className="h-5 w-5 flex-shrink-0 text-amber-600 dark:text-amber-400"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
            clipRule="evenodd"
          />
        </svg>
        <div>
          <h3 className="text-sm font-medium text-amber-800 dark:text-amber-200">
            Security Notice
          </h3>
          <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">
            API keys provide access to external AI services. Never share these keys or expose them
            in client-side code. All keys are encrypted at rest and masked in the interface.
          </p>
        </div>
      </div>
    </div>
  )
}

function PageHeader({ onAddKey }: { onAddKey: () => void }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-zinc-950 dark:text-white">Platform API Keys</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Manage API keys used for platform-wide AI model access
        </p>
      </div>
      <Button color="indigo" onClick={onAddKey}>
        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
        </svg>
        Add API Key
      </Button>
    </div>
  )
}

export function AdminApiKeysPage() {
  const [showAddModal, setShowAddModal] = useState(false)
  const [rotateKey, setRotateKey] = useState<AdminApiKey | null>(null)
  const [deleteKey, setDeleteKey] = useState<AdminApiKey | null>(null)

  const {
    apiKeys,
    isLoading,
    error,
    createApiKey,
    isCreating,
    rotateApiKey,
    isRotating,
    deleteApiKey,
    isDeleting,
  } = useAdminApiKeys()

  const handleCreateApiKey = async (data: CreateApiKeyRequest) => {
    const response = await createApiKey(data)
    if (!response.success) {
      throw new Error(response.error || 'Failed to create API key')
    }
  }

  const handleRotateApiKey = async (keyId: string, data: RotateApiKeyRequest) => {
    const response = await rotateApiKey({ keyId, data })
    if (!response.success) {
      throw new Error(response.error || 'Failed to rotate API key')
    }
  }

  const handleDeleteApiKey = async (keyId: string) => {
    const response = await deleteApiKey(keyId)
    if (!response.success) {
      throw new Error(response.error || 'Failed to delete API key')
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <PageHeader onAddKey={() => setShowAddModal(true)} />

      <SecurityWarningBanner />

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
          {error.message}
        </div>
      )}

      <div className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <ApiKeyTable
          keys={apiKeys}
          onRotate={setRotateKey}
          onDelete={setDeleteKey}
          isLoading={isLoading}
        />
      </div>

      <AddApiKeyModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleCreateApiKey}
        isSubmitting={isCreating}
      />

      <RotateKeyModal
        open={!!rotateKey}
        apiKey={rotateKey}
        onClose={() => setRotateKey(null)}
        onSubmit={handleRotateApiKey}
        isSubmitting={isRotating}
      />

      <DeleteKeyModal
        open={!!deleteKey}
        apiKey={deleteKey}
        onClose={() => setDeleteKey(null)}
        onConfirm={handleDeleteApiKey}
        isDeleting={isDeleting}
      />
    </div>
  )
}
