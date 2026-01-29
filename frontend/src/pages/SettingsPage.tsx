import { useMemo, useState } from 'react'
import { AppShell, LeftSidebar } from '@/components/layout'
import { useAuthStore } from '@/features/auth/hooks/useAuthStore'
import { useDashboardStore } from '@/features/dashboard/hooks/useDashboardStore'
import { AIPreferences } from '@/features/settings/components/AIPreferences'
import { IntegrationsSection } from '@/features/settings/components/IntegrationsSection'
import { type ProfileData, ProfileForm } from '@/features/settings/components/ProfileForm'
import { RoadmapOverview, type RoadmapStage } from '@/features/settings/components/RoadmapOverview'
import type { BusinessProgress } from '@shared/types'

const INTEGRATIONS = [
  { id: 'slack', name: 'Slack', icon: 'chat', connected: false },
  { id: 'google', name: 'Google Workspace', icon: 'cloud', connected: false },
  { id: 'stripe', name: 'Stripe Atlas', icon: 'payments', connected: false },
]

const DEFAULT_ROADMAP = {
  currentStage: 'Getting Started',
  progress: 0,
  roadmapStages: [
    { label: 'Ideation', status: 'upcoming' as const },
    { label: 'Legal Setup', status: 'upcoming' as const },
    { label: 'Financial', status: 'upcoming' as const },
    { label: 'Launch Prep', status: 'upcoming' as const },
  ],
}

function mapPhaseStatus(status: string): RoadmapStage['status'] {
  if (status === 'completed') return 'completed'
  if (status === 'in_progress') return 'in_progress'
  return 'upcoming'
}

function buildRoadmapData(businessProgress: BusinessProgress) {
  const { phases, completionPercentage } = businessProgress
  const stages: RoadmapStage[] = [
    { label: 'Ideation', status: mapPhaseStatus(phases.ideation.status) },
    { label: 'Legal Setup', status: mapPhaseStatus(phases.legal.status) },
    { label: 'Financial', status: mapPhaseStatus(phases.financial.status) },
    { label: 'Launch Prep', status: mapPhaseStatus(phases.launchPrep.status) },
  ]

  const inProgressStage = stages.find((s) => s.status === 'in_progress')
  let stageName = 'Getting Started'

  if (inProgressStage) {
    stageName = `Stage ${stages.indexOf(inProgressStage) + 1}: ${inProgressStage.label}`
  } else {
    const completedCount = stages.filter((s) => s.status === 'completed').length
    if (completedCount === stages.length) stageName = 'Complete!'
    else if (completedCount > 0)
      stageName = `Stage ${completedCount + 1}: ${stages[completedCount].label}`
  }

  return {
    currentStage: stageName,
    progress: Math.round(completionPercentage),
    roadmapStages: stages,
  }
}

function SettingsHeader() {
  return (
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
  )
}

export function SettingsPage() {
  const { user } = useAuthStore()
  const { dashboardData } = useDashboardStore()

  const [profileData, setProfileData] = useState<ProfileData>(() => ({
    displayName: user ? `${user.firstName} ${user.lastName}`.trim() : '',
    email: user?.email ?? '',
    startupName: '',
    missionStatement: '',
  }))

  const userName = user?.firstName || 'User'
  const { currentStage, progress, roadmapStages } = useMemo(
    () =>
      dashboardData?.businessProgress
        ? buildRoadmapData(dashboardData.businessProgress)
        : DEFAULT_ROADMAP,
    [dashboardData]
  )

  return (
    <AppShell leftSidebar={<LeftSidebar userName={userName} userPlan="Pro Plan" />}>
      <SettingsHeader />
      <div className="hide-scrollbar flex-1 overflow-y-auto p-8">
        <div className="mx-auto max-w-4xl space-y-6">
          <RoadmapOverview
            currentStage={currentStage}
            progress={progress}
            stages={roadmapStages}
            onViewRoadmap={() => console.warn('View roadmap')}
          />
          <div className="grid gap-6 lg:grid-cols-2">
            <ProfileForm initialData={profileData} onChange={setProfileData} />
            <AIPreferences
              initialData={{ communicationStyle: 'strategic', proactiveSuggestions: true }}
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
