import { Icon } from '@/components/ui/Icon'

export interface Integration {
  id: string
  name: string
  icon: string
  connected: boolean
}

export interface IntegrationsSectionProps {
  integrations: Integration[]
  onConnect?: (id: string) => void
  onDisconnect?: (id: string) => void
}

export function IntegrationsSection({
  integrations,
  onConnect,
  onDisconnect,
}: IntegrationsSectionProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-800">
      <h3 className="mb-4 font-semibold text-slate-900 dark:text-white">Integrations</h3>
      <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
        Connect external tools to power your roadmap.
      </p>

      <div className="grid gap-4 sm:grid-cols-3">
        {integrations.map((integration) => (
          <div
            key={integration.id}
            className="flex items-center justify-between rounded-lg border border-slate-200 p-4 dark:border-zinc-600"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 dark:bg-zinc-700">
                <Icon
                  name={integration.icon}
                  size={20}
                  className="text-slate-600 dark:text-slate-400"
                />
              </div>
              <span className="font-medium text-slate-900 dark:text-white">{integration.name}</span>
            </div>
            <button
              onClick={() =>
                integration.connected ? onDisconnect?.(integration.id) : onConnect?.(integration.id)
              }
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                integration.connected
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-zinc-700 dark:text-slate-400 dark:hover:bg-zinc-600'
              }`}
            >
              {integration.connected ? 'Connected' : 'Connect'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
