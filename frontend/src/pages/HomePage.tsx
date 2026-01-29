import { AppShell, LeftSidebar, RightSidebar } from '@/components/layout'
import {
  ChatHeader,
  ChatInput,
  ChatMessage,
  ChatOptionCard,
  ChatWelcome,
  type SuggestedAction,
} from '@/features/chat/components'

const SUGGESTED_ACTIONS: SuggestedAction[] = [
  { label: 'Draft Operating Agreement', icon: 'add', variant: 'primary' },
  { label: 'Research Competitors', icon: 'search' },
  { label: 'Brainstorm Names', icon: 'lightbulb' },
]

const DEMO_PHASES = [
  {
    id: 'foundation',
    title: 'Phase 1: Foundation',
    icon: 'foundation',
    tasks: [
      { id: '1', title: 'Business Concept', status: 'completed' as const },
      { id: '2', title: 'Market Research', status: 'completed' as const },
    ],
  },
  {
    id: 'legal',
    title: 'Phase 2: Legal & Compliance',
    icon: 'policy',
    tasks: [
      { id: '3', title: 'Name Availability', status: 'completed' as const },
      { id: '4', title: 'Operating Agreement', status: 'in_progress' as const },
      { id: '5', title: 'Tax ID (EIN)', status: 'pending' as const },
    ],
  },
  {
    id: 'financials',
    title: 'Phase 3: Financials',
    icon: 'attach_money',
    isExpanded: false,
    tasks: [
      { id: '6', title: 'Business Banking', status: 'pending' as const },
      { id: '7', title: 'Credit Card Setup', status: 'pending' as const },
    ],
  },
]

export function HomePage() {
  return (
    <AppShell
      leftSidebar={<LeftSidebar userName="Erica" userPlan="Pro Plan" />}
      rightSidebar={
        <RightSidebar
          stageLabel="Stage 2: Foundation"
          progressPercent={65}
          recommendedTask={{
            id: 'entity',
            title: 'Entity Formation',
            description: 'File Delaware C-Corp articles of incorporation.',
            icon: 'gavel',
          }}
          phases={DEMO_PHASES}
          onStartTask={(id) => console.warn('Start task:', id)}
          onViewRoadmap={() => console.warn('View roadmap')}
        />
      }
    >
      <ChatHeader title="Home" onShare={() => console.warn('Share clicked')} />

      <div className="hide-scrollbar flex-1 overflow-y-auto scroll-smooth">
        <div className="mx-auto max-w-3xl px-6 py-12">
          <ChatWelcome />

          <div className="space-y-4">
            <ChatMessage
              role="user"
              content="I need help deciding between an LLC and a C-Corp for my tech startup. We plan to raise venture capital later this year."
            />

            <ChatMessage
              role="assistant"
              content={
                <>
                  <p>
                    If you plan to raise venture capital, a{' '}
                    <strong className="text-slate-900 dark:text-white">
                      Delaware C-Corporation
                    </strong>{' '}
                    is almost universally required by institutional investors. While an LLC offers
                    tax flexibility, C-Corps are built for scale and equity distribution.
                  </p>
                  <div className="grid grid-cols-1 gap-4 py-4 md:grid-cols-2">
                    <ChatOptionCard
                      icon="account_balance"
                      title="Delaware C-Corp"
                      description="The standard for startups seeking VC. Optimized for complex equity and preferred stock."
                      variant="primary"
                    />
                    <ChatOptionCard
                      icon="payments"
                      title="LLC (Pass-through)"
                      description="Best for bootstrapped businesses. Avoids double taxation but complicates equity for VCs."
                      variant="secondary"
                    />
                  </div>
                </>
              }
            />
          </div>
        </div>
      </div>

      <ChatInput
        suggestedActions={SUGGESTED_ACTIONS}
        onSend={(msg) => console.warn('Send:', msg)}
        onActionClick={(action) => console.warn('Action:', action)}
      />
    </AppShell>
  )
}
