/**
 * Rotate Key Modal Component
 * Modal for rotating an existing API key
 */
import { useState } from 'react'
import { Button } from '@/components/catalyst-ui-kit/typescript/button'
import {
  Alert,
  AlertActions,
  AlertBody,
  AlertDescription,
  AlertTitle,
} from '@/components/catalyst-ui-kit/typescript/alert'
import {
  ErrorMessage,
  Field,
  FieldGroup,
  Fieldset,
  Label,
} from '@/components/catalyst-ui-kit/typescript/fieldset'
import { Input } from '@/components/catalyst-ui-kit/typescript/input'
import type {
  AdminApiKey,
  ApiKeyProvider,
  RotateApiKeyRequest,
} from '../types/admin-api-keys.types'

// Validation patterns for different providers
const API_KEY_PATTERNS: Record<ApiKeyProvider, RegExp> = {
  openai: /^sk-[a-zA-Z0-9]{32,}$/,
  anthropic: /^sk-ant-[a-zA-Z0-9-]{32,}$/,
  openrouter: /^sk-or-[a-zA-Z0-9-]{32,}$/,
  google: /^[a-zA-Z0-9_-]{39}$/,
  mistral: /^[a-zA-Z0-9]{32}$/,
  cohere: /^[a-zA-Z0-9]{40}$/,
}

const PROVIDER_LABELS: Record<ApiKeyProvider, string> = {
  openai: 'OpenAI',
  anthropic: 'Anthropic',
  openrouter: 'OpenRouter',
  google: 'Google AI',
  mistral: 'Mistral',
  cohere: 'Cohere',
}

interface RotateKeyModalProps {
  open: boolean
  apiKey: AdminApiKey | null
  onClose: () => void
  onSubmit: (keyId: string, data: RotateApiKeyRequest) => Promise<void>
  isSubmitting?: boolean
}

export function RotateKeyModal({
  open,
  apiKey,
  onClose,
  onSubmit,
  isSubmitting,
}: RotateKeyModalProps) {
  const [newApiKey, setNewApiKey] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)

  const validateApiKey = (key: string): boolean => {
    if (!apiKey) return false

    if (!key.trim()) {
      setValidationError('New API key is required')
      return false
    }

    const pattern = API_KEY_PATTERNS[apiKey.provider]
    if (!pattern.test(key)) {
      setValidationError(`Invalid ${PROVIDER_LABELS[apiKey.provider]} API key format`)
      return false
    }

    setValidationError(null)
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!apiKey || !validateApiKey(newApiKey)) {
      return
    }

    try {
      await onSubmit(apiKey.id, { newApiKey })
      handleClose()
    } catch {
      // Error handled by parent
    }
  }

  const handleClose = () => {
    setNewApiKey('')
    setShowKey(false)
    setValidationError(null)
    onClose()
  }

  const handleApiKeyChange = (value: string) => {
    setNewApiKey(value)
    if (validationError) {
      setValidationError(null)
    }
  }

  if (!apiKey) return null

  return (
    <Alert open={open} onClose={handleClose}>
      <AlertTitle>Rotate API Key</AlertTitle>
      <AlertDescription>
        You are about to rotate the {PROVIDER_LABELS[apiKey.provider]} API key. The old key will be
        immediately invalidated and all requests will use the new key.
      </AlertDescription>

      <form onSubmit={handleSubmit}>
        <AlertBody>
          <div className="mb-4 rounded-lg bg-amber-50 p-4 text-sm text-amber-800 dark:bg-amber-900/20 dark:text-amber-200">
            <strong>Warning:</strong> Rotating this key will immediately invalidate the current key.
            Make sure you have the new key ready before proceeding.
          </div>

          <Fieldset>
            <FieldGroup>
              <Field>
                <Label>New API Key</Label>
                <div className="relative">
                  <Input
                    type={showKey ? 'text' : 'password'}
                    value={newApiKey}
                    onChange={(e) => handleApiKeyChange(e.target.value)}
                    placeholder="sk-..."
                    autoComplete="off"
                    data-1p-ignore
                    data-lpignore="true"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                  >
                    {showKey ? 'Hide' : 'Show'}
                  </button>
                </div>
                {validationError && <ErrorMessage>{validationError}</ErrorMessage>}
              </Field>
            </FieldGroup>
          </Fieldset>
        </AlertBody>

        <AlertActions>
          <Button plain onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button color="amber" type="submit" disabled={isSubmitting || !newApiKey.trim()}>
            {isSubmitting ? 'Rotating...' : 'Rotate Key'}
          </Button>
        </AlertActions>
      </form>
    </Alert>
  )
}
