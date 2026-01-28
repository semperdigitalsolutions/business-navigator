/**
 * AuthCallback Component
 * Handles Supabase auth callbacks (email confirmation, password recovery, etc.)
 * Parses the URL hash fragment and routes to appropriate flow
 */
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ResetPasswordForm } from './ResetPasswordForm'

type AuthCallbackType = 'recovery' | 'signup' | 'magiclink' | 'invite' | null

interface HashParams {
  accessToken: string | null
  refreshToken: string | null
  type: AuthCallbackType
  expiresAt: number | null
  isExpired: boolean
}

function parseHashParams(): HashParams {
  const hash = window.location.hash.substring(1)
  const params = new URLSearchParams(hash)
  const expiresAtStr = params.get('expires_at')
  const expiresAt = expiresAtStr ? parseInt(expiresAtStr, 10) : null

  return {
    accessToken: params.get('access_token'),
    refreshToken: params.get('refresh_token'),
    type: params.get('type') as AuthCallbackType,
    expiresAt,
    isExpired: expiresAt ? Date.now() / 1000 > expiresAt : false,
  }
}

export function AuthCallback() {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  // Store hash params in ref to avoid re-parsing
  const hashParamsRef = useRef<HashParams | null>(null)
  if (hashParamsRef.current === null) {
    hashParamsRef.current = parseHashParams()
  }
  const hashParams = hashParamsRef.current

  // Track if we've handled the redirect
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // Clear hash from URL for security
    if (window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname)
    }

    // Handle different callback types
    if (!hashParams.accessToken) {
      navigate('/login', { replace: true })
      return
    }

    if (hashParams.isExpired) {
      setError('This link has expired. Please request a new one.')
      setReady(true)
      return
    }

    // Route based on type (recovery is handled in render)
    switch (hashParams.type) {
      case 'recovery':
        setReady(true)
        break
      case 'signup':
        navigate('/login?confirmed=true', { replace: true })
        break
      case 'magiclink':
        navigate('/dashboard', { replace: true })
        break
      case 'invite':
        navigate('/login', { replace: true })
        break
      default:
        navigate('/login', { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (error) {
    return <ErrorView error={error} onRetry={() => navigate('/forgot-password')} />
  }

  if (ready && hashParams.type === 'recovery' && hashParams.accessToken) {
    return <ResetPasswordForm accessToken={hashParams.accessToken} />
  }

  return <LoadingView />
}

function ErrorView({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-900">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg dark:bg-zinc-800">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
            <svg
              className="h-6 w-6 text-red-600 dark:text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">Link Expired</h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{error}</p>
          <button
            onClick={onRetry}
            className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Request New Link
          </button>
        </div>
      </div>
    </div>
  )
}

function LoadingView() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-900">
      <div className="text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">Processing...</p>
      </div>
    </div>
  )
}
