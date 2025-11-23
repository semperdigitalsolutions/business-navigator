/**
 * Agent Indicator - Shows which specialist agent is active
 */
interface AgentIndicatorProps {
  agent: string
}

const agentInfo = {
  triage: {
    icon: '🤖',
    name: 'Triage',
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
  },
  legal: {
    icon: '⚖️',
    name: 'Legal Navigator',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  },
  financial: {
    icon: '💰',
    name: 'Financial Planner',
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  },
  tasks: {
    icon: '✅',
    name: 'Task Assistant',
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  },
}

export function AgentIndicator({ agent }: AgentIndicatorProps) {
  const info = agentInfo[agent as keyof typeof agentInfo] || agentInfo.triage

  return (
    <div
      className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${info.color}`}
    >
      <span>{info.icon}</span>
      <span>{info.name}</span>
    </div>
  )
}
