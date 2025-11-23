/**
 * Dashboard Page - Main landing page after login
 */
import { Link } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/hooks/useAuthStore'

export function DashboardPage() {
  const user = useAuthStore((state) => state.user)

  const quickActions = [
    {
      title: 'Chat with AI',
      description: 'Get guidance from our multi-agent AI system',
      icon: '💬',
      link: '/chat',
      color: 'bg-indigo-500',
    },
    {
      title: 'View Tasks',
      description: 'Track your business formation progress',
      icon: '✅',
      link: '/tasks',
      color: 'bg-purple-500',
    },
    {
      title: 'Settings',
      description: 'Configure your API keys and preferences',
      icon: '⚙️',
      link: '/settings',
      color: 'bg-gray-500',
    },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Welcome back, {user?.firstName}!
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Let's continue your business formation journey
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {quickActions.map((action) => (
          <Link
            key={action.link}
            to={action.link}
            className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
          >
            <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center text-2xl mb-4`}>
              {action.icon}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {action.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">{action.description}</p>
          </Link>
        ))}
      </div>

      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-8 text-white">
        <h2 className="text-2xl font-bold mb-4">AI-Powered Business Formation</h2>
        <p className="mb-6 max-w-2xl">
          Business Navigator uses advanced LangGraph multi-agent technology to provide intelligent
          guidance across legal, financial, and operational aspects of starting your business.
        </p>
        <Link
          to="/chat"
          className="inline-block px-6 py-3 bg-white text-indigo-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
        >
          Start Chatting →
        </Link>
      </div>
    </div>
  )
}
