/**
 * ErrorBoundary Component
 * Catches React errors and displays fallback UI
 */
import { Component, ReactNode } from 'react'
import { Button } from '@/components/catalyst-ui-kit/typescript/button'
import { Text } from '@/components/catalyst-ui-kit/typescript/text'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to console (could send to error tracking service)
    console.error('ErrorBoundary caught an error:', error, errorInfo)

    // Call optional error handler
    this.props.onError?.(error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default fallback UI
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-900 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-8 text-center">
            <div className="mx-auto w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>

            <h2 className="text-2xl font-bold text-zinc-950 dark:text-white mb-2">
              Something went wrong
            </h2>

            <Text className="text-gray-600 dark:text-gray-400 mb-6">
              We encountered an unexpected error. Don't worry, your data is safe.
            </Text>

            {this.state.error && (
              <details className="mb-6 text-left">
                <summary className="cursor-pointer text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                  Error details
                </summary>
                <pre className="mt-2 text-xs bg-gray-100 dark:bg-gray-900 p-3 rounded overflow-auto max-h-40">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}

            <div className="flex gap-3">
              <Button onClick={this.handleReset} color="indigo" className="flex-1">
                Try Again
              </Button>
              <Button
                onClick={() => (window.location.href = '/dashboard')}
                color="white"
                className="flex-1"
              >
                Go to Dashboard
              </Button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
