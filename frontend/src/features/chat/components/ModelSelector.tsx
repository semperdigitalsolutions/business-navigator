/**
 * ModelSelector - Dropdown component for AI model selection
 * Displays available models grouped by provider with tier restrictions
 */
import { useEffect } from 'react'
import { cn } from '@/utils/classnames'
import { Icon } from '@/components/ui/Icon'
import { Skeleton } from '@/components/ui/skeleton'
import { Tooltip } from '@/components/ui/tooltip'
import {
  Dropdown,
  DropdownButton,
  DropdownDivider,
  DropdownHeading,
  DropdownItem,
  DropdownMenu,
  DropdownSection,
} from '@/components/catalyst-ui-kit/typescript/dropdown'
import type { SubscriptionTier } from '@shared/types'
import { useAvailableModels } from '../hooks/useAvailableModels'
import {
  type AIModel,
  type AIProvider,
  canAccessModel,
  getTierDisplayName,
  useModelsStore,
} from '../hooks/useModelsStore'

export interface ModelSelectorProps {
  /** User's subscription tier */
  userTier?: SubscriptionTier
  /** Disabled state */
  disabled?: boolean
  /** Compact mode for smaller spaces */
  compact?: boolean
  /** Additional CSS classes */
  className?: string
}

/** Provider display configuration */
const PROVIDER_CONFIG: Record<AIProvider, { name: string; color: string; bgColor: string }> = {
  openai: {
    name: 'OpenAI',
    color: 'text-emerald-700 dark:text-emerald-400',
    bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
  },
  anthropic: {
    name: 'Anthropic',
    color: 'text-orange-700 dark:text-orange-400',
    bgColor: 'bg-orange-100 dark:bg-orange-900/30',
  },
  google: {
    name: 'Google',
    color: 'text-blue-700 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
  },
  openrouter: {
    name: 'OpenRouter',
    color: 'text-purple-700 dark:text-purple-400',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30',
  },
}

/** Provider order for display */
const PROVIDER_ORDER: AIProvider[] = ['openai', 'anthropic', 'google', 'openrouter']

/** Provider badge component */
function ProviderBadge({ provider }: { provider: AIProvider }) {
  const config = PROVIDER_CONFIG[provider]
  return (
    <span
      className={cn(
        'inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium',
        config.bgColor,
        config.color
      )}
    >
      {config.name}
    </span>
  )
}

/** Credit cost display */
function CreditCost({ cost }: { cost: number }) {
  return (
    <span className="inline-flex items-center gap-0.5 text-xs text-slate-500 dark:text-slate-400">
      <Icon name="toll" size={14} />
      {cost} credit{cost !== 1 ? 's' : ''}
    </span>
  )
}

/** Locked model indicator */
function LockedIndicator({ requiredTier }: { requiredTier: SubscriptionTier }) {
  return (
    <Tooltip content={`Upgrade to ${getTierDisplayName(requiredTier)} tier`} placement="left">
      <span className="inline-flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
        <Icon name="lock" size={14} />
      </span>
    </Tooltip>
  )
}

/** Model option in dropdown */
function ModelOption({
  model,
  isSelected,
  isLocked,
  onSelect,
}: {
  model: AIModel
  isSelected: boolean
  isLocked: boolean
  onSelect: () => void
}) {
  return (
    <DropdownItem
      onClick={isLocked ? undefined : onSelect}
      disabled={isLocked}
      className={cn(
        'flex items-center justify-between gap-3',
        isLocked && 'cursor-not-allowed opacity-50'
      )}
    >
      <div className="flex flex-1 flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'text-sm font-medium',
              isSelected ? 'text-primary-600 dark:text-primary-400' : ''
            )}
          >
            {model.name}
          </span>
          <ProviderBadge provider={model.provider} />
        </div>
        {model.description && (
          <span className="text-xs text-slate-500 dark:text-slate-400">{model.description}</span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <CreditCost cost={model.creditCost} />
        {isLocked && <LockedIndicator requiredTier={model.minTier} />}
        {isSelected && !isLocked && (
          <Icon name="check" size={16} className="text-primary-600 dark:text-primary-400" />
        )}
      </div>
    </DropdownItem>
  )
}

/** Loading skeleton for the selector */
function ModelSelectorSkeleton({ compact }: { compact?: boolean }) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5',
        'dark:border-zinc-700',
        compact ? 'h-8' : 'h-9'
      )}
    >
      <Skeleton variant="text" width={compact ? 60 : 100} height={14} />
      <Skeleton variant="text" width={40} height={12} />
    </div>
  )
}

/** Error state with retry button */
function ModelSelectorError({ onRetry }: { onRetry: () => void }) {
  return (
    <button
      onClick={onRetry}
      className={cn(
        'flex items-center gap-2 rounded-lg border border-red-200 px-3 py-1.5',
        'bg-red-50 text-sm text-red-600',
        'hover:bg-red-100 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400'
      )}
    >
      <Icon name="error" size={16} />
      <span>Retry</span>
    </button>
  )
}

/** Model dropdown trigger button */
function ModelSelectorButton({
  selectedModel,
  compact,
  disabled,
  className,
}: {
  selectedModel: AIModel | undefined
  compact: boolean
  disabled: boolean
  className?: string
}) {
  return (
    <DropdownButton
      disabled={disabled}
      className={cn(
        'flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3',
        'text-sm font-medium text-slate-700 transition-all',
        'hover:border-slate-300 hover:bg-slate-50',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'dark:border-zinc-700 dark:bg-zinc-800 dark:text-slate-200',
        'dark:hover:border-zinc-600 dark:hover:bg-zinc-700',
        compact ? 'h-8 py-1' : 'h-9 py-1.5',
        className
      )}
    >
      {selectedModel ? (
        <>
          <span className={compact ? 'max-w-[80px] truncate' : ''}>{selectedModel.name}</span>
          {!compact && <CreditCost cost={selectedModel.creditCost} />}
        </>
      ) : (
        <span className="text-slate-500">Select model</span>
      )}
      <Icon name="expand_more" size={18} className="text-slate-400" />
    </DropdownButton>
  )
}

/** Model dropdown menu content */
function ModelDropdownContent({
  modelsByProvider,
  selectedModelId,
  userTier,
  onSelectModel,
}: {
  modelsByProvider: Map<AIProvider, AIModel[]>
  selectedModelId: string | null
  userTier: SubscriptionTier
  onSelectModel: (modelId: string) => void
}) {
  return (
    <DropdownMenu anchor="bottom end" className="min-w-[280px] max-w-[320px]">
      {PROVIDER_ORDER.map((provider, index) => {
        const providerModels = modelsByProvider.get(provider)
        if (!providerModels || providerModels.length === 0) return null

        return (
          <DropdownSection key={provider}>
            {index > 0 && <DropdownDivider />}
            <DropdownHeading>{PROVIDER_CONFIG[provider].name}</DropdownHeading>
            {providerModels.map((model) => (
              <ModelOption
                key={model.id}
                model={model}
                isSelected={model.id === selectedModelId}
                isLocked={!canAccessModel(userTier, model.minTier)}
                onSelect={() => onSelectModel(model.id)}
              />
            ))}
          </DropdownSection>
        )
      })}
    </DropdownMenu>
  )
}

export function ModelSelector({
  userTier = 'free',
  disabled = false,
  compact = false,
  className,
}: ModelSelectorProps) {
  const { models, modelsByProvider, isLoading, error, refetch } = useAvailableModels({
    userTier,
    autoFetch: true,
  })
  const { selectedModelId, setSelectedModel, getDefaultModel } = useModelsStore()

  // Set default model if none selected
  useEffect(() => {
    if (!selectedModelId && models.length > 0) {
      const defaultModel = getDefaultModel(userTier)
      if (defaultModel) {
        setSelectedModel(defaultModel.id)
      }
    }
  }, [selectedModelId, models, userTier, getDefaultModel, setSelectedModel])

  const selectedModel = models.find((m) => m.id === selectedModelId)

  const handleSelectModel = (modelId: string) => {
    const model = models.find((m) => m.id === modelId)
    if (model && canAccessModel(userTier, model.minTier)) {
      setSelectedModel(modelId)
    }
  }

  if (isLoading && models.length === 0) {
    return <ModelSelectorSkeleton compact={compact} />
  }

  if (error && models.length === 0) {
    return <ModelSelectorError onRetry={refetch} />
  }

  return (
    <Dropdown>
      <ModelSelectorButton
        selectedModel={selectedModel}
        compact={compact}
        disabled={disabled}
        className={className}
      />
      <ModelDropdownContent
        modelsByProvider={modelsByProvider}
        selectedModelId={selectedModelId}
        userTier={userTier}
        onSelectModel={handleSelectModel}
      />
    </Dropdown>
  )
}

export default ModelSelector
