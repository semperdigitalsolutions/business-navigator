/**
 * Delete Key Modal Component
 * Confirmation modal for deleting an API key
 */
import { Button } from '@/components/catalyst-ui-kit/typescript/button'
import {
  Alert,
  AlertActions,
  AlertDescription,
  AlertTitle,
} from '@/components/catalyst-ui-kit/typescript/alert'
import type { AdminApiKey, ApiKeyProvider } from '../types/admin-api-keys.types'

const PROVIDER_LABELS: Record<ApiKeyProvider, string> = {
  openai: 'OpenAI',
  anthropic: 'Anthropic',
  openrouter: 'OpenRouter',
  google: 'Google AI',
  mistral: 'Mistral',
  cohere: 'Cohere',
}

interface DeleteKeyModalProps {
  open: boolean
  apiKey: AdminApiKey | null
  onClose: () => void
  onConfirm: (keyId: string) => Promise<void>
  isDeleting?: boolean
}

export function DeleteKeyModal({
  open,
  apiKey,
  onClose,
  onConfirm,
  isDeleting,
}: DeleteKeyModalProps) {
  const handleConfirm = async () => {
    if (!apiKey) return

    try {
      await onConfirm(apiKey.id)
      onClose()
    } catch {
      // Error handled by parent
    }
  }

  if (!apiKey) return null

  return (
    <Alert open={open} onClose={onClose}>
      <AlertTitle>Delete API Key</AlertTitle>
      <AlertDescription>
        Are you sure you want to delete the {PROVIDER_LABELS[apiKey.provider]} API key? This action
        cannot be undone and will immediately disable all AI features using this provider.
      </AlertDescription>

      <AlertActions>
        <Button plain onClick={onClose} disabled={isDeleting}>
          Cancel
        </Button>
        <Button color="red" onClick={handleConfirm} disabled={isDeleting}>
          {isDeleting ? 'Deleting...' : 'Delete Key'}
        </Button>
      </AlertActions>
    </Alert>
  )
}
