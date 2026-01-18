/**
 * API Key Settings - Manage user's LLM API keys
 * Uses Catalyst UI components
 */
import { useState } from 'react'
import { Button } from '@/components/catalyst-ui-kit/typescript/button'
import {
  Description,
  Field,
  FieldGroup,
  Fieldset,
  Label,
} from '@/components/catalyst-ui-kit/typescript/fieldset'
import { Input } from '@/components/catalyst-ui-kit/typescript/input'
import { Select } from '@/components/catalyst-ui-kit/typescript/select'
import { apiClient } from '@/lib/api/client'

type Provider = 'openrouter' | 'openai' | 'anthropic'

export function ApiKeySettings() {
  const [provider, setProvider] = useState<Provider>('openrouter')
  const [apiKey, setApiKey] = useState('')
  const [model, setModel] = useState('openai/gpt-4-turbo')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    try {
      await apiClient.post('/api/settings/api-keys', {
        provider,
        apiKey,
        preferredModel: model,
      })
      setMessage('API key saved successfully!')
      setApiKey('')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save API key'
      setMessage(message)
    } finally {
      setSaving(false)
    }
  }

  const isSuccess = message.includes('success')

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold text-zinc-950 dark:text-white mb-2">API Key Settings</h2>
      <p className="text-zinc-500 dark:text-zinc-400 mb-8">
        Configure your LLM provider API keys. Your keys are encrypted and stored securely.
      </p>

      <form onSubmit={handleSubmit}>
        <Fieldset>
          <FieldGroup>
            <Field>
              <Label>Provider</Label>
              <Select value={provider} onChange={(e) => setProvider(e.target.value as Provider)}>
                <option value="openrouter">OpenRouter (100+ models)</option>
                <option value="openai">OpenAI</option>
                <option value="anthropic">Anthropic</option>
              </Select>
            </Field>

            <Field>
              <Label>API Key</Label>
              <Input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                required
              />
            </Field>

            <Field>
              <Label>Preferred Model</Label>
              <Input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="openai/gpt-4-turbo"
                required
              />
              <Description>
                For OpenRouter, use format: provider/model (e.g., anthropic/claude-3-5-sonnet)
              </Description>
            </Field>
          </FieldGroup>

          {message && (
            <div
              className={`mt-6 px-4 py-3 rounded-lg ${
                isSuccess
                  ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                  : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
              }`}
            >
              {message}
            </div>
          )}

          <div className="mt-8">
            <Button type="submit" color="indigo" disabled={saving}>
              {saving ? 'Saving...' : 'Save API Key'}
            </Button>
          </div>
        </Fieldset>
      </form>
    </div>
  )
}
