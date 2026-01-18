/**
 * Login Form Component - Uses Catalyst UI components
 */
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/catalyst-ui-kit/typescript/button'
import {
  Field,
  FieldGroup,
  Fieldset,
  Label,
} from '@/components/catalyst-ui-kit/typescript/fieldset'
import { Input } from '@/components/catalyst-ui-kit/typescript/input'
import { Text } from '@/components/catalyst-ui-kit/typescript/text'
import { authApi } from '../api/auth.api'
import { useAuthStore } from '../hooks/useAuthStore'

export function LoginForm() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((state) => state.setAuth)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await authApi.login({ email, password })

      if (response.success && response.data) {
        setAuth(response.data.user, response.data.token)
        navigate('/dashboard')
      } else {
        setError(response.error || 'Login failed')
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An error occurred. Please try again.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-900 px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-zinc-950 dark:text-white">
            Sign in to Business Navigator
          </h2>
        </div>

        <form onSubmit={handleSubmit}>
          <Fieldset>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            <FieldGroup>
              <Field>
                <Label>Email address</Label>
                <Input
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                />
              </Field>

              <Field>
                <Label>Password</Label>
                <Input
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                />
              </Field>
            </FieldGroup>

            <div className="mt-8">
              <Button type="submit" color="indigo" disabled={loading} className="w-full">
                {loading ? 'Signing in...' : 'Sign in'}
              </Button>
            </div>

            <div className="mt-6 text-center">
              <Text>
                Don't have an account?{' '}
                <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
                  Sign up
                </Link>
              </Text>
            </div>
          </Fieldset>
        </form>
      </div>
    </div>
  )
}
