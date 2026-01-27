/**
 * Main App Component with React Router
 */
import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/hooks/useAuthStore'
import { AppLayout } from '@/layouts/AppLayout'
import { LoginForm } from '@/features/auth/components/LoginForm'
import { RegisterForm } from '@/features/auth/components/RegisterForm'
import { DashboardPage } from '@/features/dashboard/components/DashboardPage'
import { ChatInterface } from '@/features/chat/components/ChatInterface'
import { TaskDashboard } from '@/features/tasks/components/TaskDashboard'
import { TaskDetailPage } from '@/features/tasks/components/TaskDetailPage'
import { ApiKeySettings } from '@/features/settings/components/ApiKeySettings'
import { OnboardingWizard } from '@/features/onboarding/components/OnboardingWizard'
import { onboardingApi } from '@/features/onboarding/api/onboarding.api'
import { ErrorBoundary } from '@/components/error-boundaries/ErrorBoundary'

// Protected Route wrapper with onboarding check
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const user = useAuthStore((state) => state.user)
  const navigate = useNavigate()

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (isAuthenticated && user && !user.onboardingCompleted) {
        // Check if onboarding is incomplete
        const response = await onboardingApi.getStatus()
        if (response.success && response.data) {
          const { isCompleted } = response.data
          if (!isCompleted) {
            navigate('/onboarding', { replace: true })
          }
        }
      }
    }

    checkOnboardingStatus()
  }, [isAuthenticated, user, navigate])

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

// Onboarding Route wrapper (only accessible if authenticated but onboarding incomplete)
function OnboardingRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const user = useAuthStore((state) => state.user)

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // If already completed onboarding, redirect to dashboard
  if (user?.onboardingCompleted) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}

// Public Route wrapper (redirect to appropriate location if already authenticated)
function PublicRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const user = useAuthStore((state) => state.user)

  if (!isAuthenticated) {
    return <>{children}</>
  }

  // If authenticated but onboarding not completed, go to onboarding
  if (!user?.onboardingCompleted) {
    return <Navigate to="/onboarding" replace />
  }

  // Otherwise go to dashboard
  return <Navigate to="/dashboard" replace />
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginForm />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <RegisterForm />
              </PublicRoute>
            }
          />

          {/* Onboarding Route */}
          <Route
            path="/onboarding"
            element={
              <OnboardingRoute>
                <OnboardingWizard />
              </OnboardingRoute>
            }
          />

          {/* Protected Routes */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/chat" element={<ChatInterface />} />
            <Route path="/tasks" element={<TaskDashboard />} />
            <Route path="/tasks/:taskId" element={<TaskDetailPage />} />
            <Route path="/settings" element={<ApiKeySettings />} />
          </Route>

          {/* Redirect root to dashboard or login */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* 404 */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App
