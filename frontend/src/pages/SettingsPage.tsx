import { AppShell, LeftSidebar } from '@/components/layout'
import { RoadmapOverview } from '@/features/settings/components/RoadmapOverview'
import { ProfileForm } from '@/features/settings/components/ProfileForm'
import { AIPreferences } from '@/features/settings/components/AIPreferences'
import { IntegrationsSection } from '@/features/settings/components/IntegrationsSection'

const ROADMAP_STAGES = [
  { label: 'Legal Setup', status: 'completed' as const },
  { label: 'Cap Table Draft', status: 'in_progress' as const },
  { label: 'Banking Setup', status: 'upcoming' as const },
  { label: 'Domain Strategy', status: 'upcoming' as const },
]

const INTEGRATIONS = [
  { id: 'slack', name: 'Slack', icon: 'chat', connected: false },
  { id: 'google', name: 'Google Workspace', icon: 'cloud', connected: false },
  { id: 'stripe', name: 'Stripe Atlas', icon: 'payments', connected: false },
]

export function SettingsPage() {
  return (
    <AppShell leftSidebar={<LeftSidebar userName="Erica" userPlan="Pro Plan" />}>
      {/* Header */}
      <header className="flex-shrink-0 border-b border-slate-100 px-8 py-6 dark:border-zinc-800">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Settings</h1>
          <div className="flex items-center gap-3">
            <button className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition-all hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-zinc-800">
              Cancel
            </button>
            <button className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-primary-700">
              Save Changes
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="hide-scrollbar flex-1 overflow-y-auto p-8">
        <div className="mx-auto max-w-4xl space-y-6">
          <RoadmapOverview
            currentStage="Stage 2: Foundation"
            progress={60}
            stages={ROADMAP_STAGES}
            onViewRoadmap={() => console.warn('View roadmap')}
          />

          <div className="grid gap-6 lg:grid-cols-2">
            <ProfileForm
              initialData={{
                displayName: 'Erica Chen',
                email: 'erica@techstartx.io',
                startupName: 'Nova Analytics',
                missionStatement:
                  'AI-driven analytics for mid-market retail businesses looking to optimize supply chain efficiency.',
              }}
              onChange={(data) => console.warn('Profile changed:', data)}
            />

            <AIPreferences
              initialData={{
                communicationStyle: 'strategic',
                proactiveSuggestions: true,
              }}
              onChange={(data) => console.warn('AI preferences changed:', data)}
            />
          </div>

          <IntegrationsSection
            integrations={INTEGRATIONS}
            onConnect={(id) => console.warn('Connect:', id)}
            onDisconnect={(id) => console.warn('Disconnect:', id)}
          />
        </div>
      </div>
    </AppShell>
  )
}
