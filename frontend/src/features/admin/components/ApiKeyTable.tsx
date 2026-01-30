/**
 * API Key Table Component
 * Displays platform API keys in a table format
 */
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/catalyst-ui-kit/typescript/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/catalyst-ui-kit/typescript/table'
import type { AdminApiKey, ApiKeyProvider } from '../types/admin-api-keys.types'

const PROVIDER_LABELS: Record<ApiKeyProvider, string> = {
  openai: 'OpenAI',
  anthropic: 'Anthropic',
  openrouter: 'OpenRouter',
  google: 'Google AI',
  mistral: 'Mistral',
  cohere: 'Cohere',
}

function formatRelativeTime(dateString?: string): string {
  if (!dateString) return 'Never'

  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffSecs < 60) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`

  return date.toLocaleDateString()
}

interface ApiKeyTableProps {
  keys: AdminApiKey[]
  onRotate: (key: AdminApiKey) => void
  onDelete: (key: AdminApiKey) => void
  isLoading?: boolean
}

export function ApiKeyTable({ keys, onRotate, onDelete, isLoading }: ApiKeyTableProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-zinc-500 dark:text-zinc-400">Loading API keys...</div>
      </div>
    )
  }

  if (keys.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="text-zinc-500 dark:text-zinc-400">No API keys configured</div>
        <p className="mt-2 text-sm text-zinc-400 dark:text-zinc-500">
          Add your first platform API key to enable AI features
        </p>
      </div>
    )
  }

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableHeader>Provider</TableHeader>
          <TableHeader>Key</TableHeader>
          <TableHeader>Status</TableHeader>
          <TableHeader>Last Used</TableHeader>
          <TableHeader>Created</TableHeader>
          <TableHeader className="text-right">Actions</TableHeader>
        </TableRow>
      </TableHead>
      <TableBody>
        {keys.map((key) => (
          <TableRow key={key.id}>
            <TableCell className="font-medium">{PROVIDER_LABELS[key.provider]}</TableCell>
            <TableCell>
              <code className="rounded bg-zinc-100 px-2 py-1 text-sm dark:bg-zinc-800">
                {key.maskedKey}
              </code>
            </TableCell>
            <TableCell>
              <Badge status={key.status === 'active' ? 'success' : 'neutral'}>
                {key.status === 'active' ? 'Active' : 'Inactive'}
              </Badge>
            </TableCell>
            <TableCell className="text-zinc-500 dark:text-zinc-400">
              {formatRelativeTime(key.lastUsedAt)}
            </TableCell>
            <TableCell className="text-zinc-500 dark:text-zinc-400">
              {new Date(key.createdAt).toLocaleDateString()}
            </TableCell>
            <TableCell className="text-right">
              <div className="flex items-center justify-end gap-2">
                <Button outline onClick={() => onRotate(key)}>
                  Rotate
                </Button>
                <Button color="red" onClick={() => onDelete(key)}>
                  Delete
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
