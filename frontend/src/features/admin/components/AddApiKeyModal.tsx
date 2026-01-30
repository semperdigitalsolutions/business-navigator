/**
 * Add API Key Modal Component
 * Modal for adding new platform API keys
 */
import { useState } from 'react'
import { Button } from '@/components/catalyst-ui-kit/typescript/button'
import {
  Dialog,
  DialogActions,
  DialogBody,
  DialogDescription,
  DialogTitle,
} from '@/components/catalyst-ui-kit/typescript/dialog'
import {
  ErrorMessage,
  Field,
  FieldGroup,
  Fieldset,
  Label,
} from '@/components/catalyst-ui-kit/typescript/fieldset'
import { Input } from '@/components/catalyst-ui-kit/typescript/input'
import { Select } from '@/components/catalyst-ui-kit/typescript/select'
import type { ApiKeyProvider, CreateApiKeyRequest } from '../types/admin-api-keys.types'

// Validation patterns for different providers
const API_KEY_PATTERNS: Record<ApiKeyProvider, RegExp> = {
  openai: /^sk-[a-zA-Z0-9]{32,}$/,
  anthropic: /^sk-ant-[a-zA-Z0-9-]{32,}$/,
  openrouter: /^sk-or-[a-zA-Z0-9-]{32,}$/,
  google: /^[a-zA-Z0-9_-]{39}$/,
  mistral: /^[a-zA-Z0-9]{32}$/,
  cohere: /^[a-zA-Z0-9]{40}$/,
}

const PROVIDER_OPTIONS: { value: ApiKeyProvider; label: string }[] = [
  { value: 'openai', label: 'OpenAI' },
  { value: 'anthropic', label: 'Anthropic' },
  { value: 'openrouter', label: 'OpenRouter' },
  { value: 'google', label: 'Google AI' },
  { value: 'mistral', label: 'Mistral' },
  { value: 'cohere', label: 'Cohere' },
]

interface AddApiKeyModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: CreateApiKeyRequest) => Promise<void>
  isSubmitting?: boolean
}

export function AddApiKeyModal({ open, onClose, onSubmit, isSubmitting }: AddApiKeyModalProps) {
  const [provider, setProvider] = useState<ApiKeyProvider>('openai')
  const [apiKey, setApiKey] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)

  const validateApiKey = (key: string, selectedProvider: ApiKeyProvider): boolean => {
    if (!key.trim()) {
      setValidationError('API key is required')
      return false
    }

    const pattern = API_KEY_PATTERNS[selectedProvider]
    if (!pattern.test(key)) {
      setValidationError(
        `Invalid ${PROVIDER_OPTIONS.find((p) => p.value === selectedProvider)?.label} API key format`
      )
      return false
    }

    setValidationError(null)
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateApiKey(apiKey, provider)) {
      return
    }

    try {
      await onSubmit({ provider, apiKey })
      handleClose()
    } catch {
      // Error handled by parent
    }
  }

  const handleClose = () => {
    setProvider('openai')
    setApiKey('')
    setShowKey(false)
    setValidationError(null)
    onClose()
  }

  const handleProviderChange = (newProvider: ApiKeyProvider) => {
    setProvider(newProvider)
    setValidationError(null)
  }

  const handleApiKeyChange = (value: string) => {
    setApiKey(value)
    if (validationError) {
      setValidationError(null)
    }
  }

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Add Platform API Key</DialogTitle>
      <DialogDescription>
        Add a new API key for AI model access. This key will be used for all platform operations.
      </DialogDescription>

      <form onSubmit={handleSubmit}>
        <DialogBody>
          <Fieldset>
            <FieldGroup>
              <Field>
                <Label>Provider</Label>
                <Select
                  value={provider}
                  onChange={(e) => handleProviderChange(e.target.value as ApiKeyProvider)}
                >
                  {PROVIDER_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field>
                <Label>API Key</Label>
                <div className="relative">
                  <Input
                    type={showKey ? 'text' : 'password'}
                    value={apiKey}
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
        </DialogBody>

        <DialogActions>
          <Button plain onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button color="indigo" type="submit" disabled={isSubmitting || !apiKey.trim()}>
            {isSubmitting ? 'Adding...' : 'Add API Key'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
