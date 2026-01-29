/**
 * Main App Component with React Router
 */
import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/hooks/useAuthStore'
import { AppShellLayout } from '@/layouts/AppShellLayout'
import { LoginForm } from '@/features/auth/components/LoginForm'
import { RegisterForm } from '@/features/auth/components/RegisterForm'
import { ForgotPasswordForm } from '@/features/auth/components/ForgotPasswordForm'
import { AuthCallback } from '@/features/auth/components/AuthCallback'
import { TaskDetailPage } from '@/features/tasks/components/TaskDetailPage'
import { OnboardingWizard } from '@/features/onboarding/components/OnboardingWizard'
import { onboardingApi } from '@/features/onboarding/api/onboarding.api'
import { ErrorBoundary } from '@/components/error-boundaries/ErrorBoundary'
import { LandingPage } from '@/features/landing/components/LandingPage'
import { LandingLayout } from '@/layouts/LandingLayout'
// Design V2 Pages
import { HomePage } from '@/pages/HomePage'
import { TaskLibraryPage } from '@/pages/TaskLibraryPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { ChatHistoryPage } from '@/pages/ChatHistoryPage'
import { ProgressPage } from '@/pages/ProgressPage'
import { DocumentsPage } from '@/pages/DocumentsPage'

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
          <Route
            path="/forgot-password"
            element={
              <PublicRoute>
                <ForgotPasswordForm />
              </PublicRoute>
            }
          />

          {/* Auth Callback Route - handles Supabase redirects */}
          <Route path="/auth/callback" element={<AuthCallback />} />

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
                <AppShellLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<HomePage />} />
            <Route path="/tasks" element={<TaskLibraryPage />} />
            <Route path="/tasks/:taskId" element={<TaskDetailPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/chat-history" element={<ChatHistoryPage />} />
            <Route path="/progress" element={<ProgressPage />} />
            <Route path="/documents" element={<DocumentsPage />} />
            {/* Redirect old /chat route to dashboard (chat is now in HomePage) */}
            <Route path="/chat" element={<Navigate to="/dashboard" replace />} />
          </Route>

          {/* Landing Page - public */}
          <Route
            path="/"
            element={
              window.location.hash.includes('type=') ? (
                <AuthCallback />
              ) : (
                <LandingLayout>
                  <LandingPage />
                </LandingLayout>
              )
            }
          />

          {/* 404 */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App
