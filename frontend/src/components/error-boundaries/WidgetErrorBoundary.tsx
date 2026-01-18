/**
 * WidgetErrorBoundary Component
 * Smaller error boundary for individual dashboard widgets
 */
import { Component, ReactNode } from 'react'
import { Text } from '@/components/catalyst-ui-kit/typescript/text'
import { ExclamationCircleIcon } from '@heroicons/react/24/outline'

interface WidgetErrorBoundaryProps {
  children: ReactNode
  widgetName?: string
}

interface WidgetErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class WidgetErrorBoundary extends Component<
  WidgetErrorBoundaryProps,
  WidgetErrorBoundaryState
> {
  constructor(props: WidgetErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): WidgetErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const widgetName = this.props.widgetName || 'unknown'
    console.error(`Widget error (${widgetName}):`, error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm p-6 text-center">
          <div className="mx-auto w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-3">
            <ExclamationCircleIcon className="h-5 w-5 text-red-600 dark:text-red-400" />
          </div>

          <Text className="text-sm font-medium text-zinc-950 dark:text-white mb-1">
            {this.props.widgetName || 'Widget'} unavailable
          </Text>

          <Text className="text-xs text-gray-500 dark:text-gray-400 mb-4">
            Something went wrong loading this section
          </Text>

          <button
            onClick={this.handleRetry}
            className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium"
          >
            Try again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
