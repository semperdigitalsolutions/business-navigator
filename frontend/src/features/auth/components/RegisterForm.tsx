/**
 * Register Form Component - Uses Catalyst UI components
 * Week 2: Enhanced with password strength meter and Google OAuth
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
import { PasswordInput } from './PasswordInput'
import { PasswordStrengthMeter } from './PasswordStrengthMeter'
import { GoogleOAuthButton } from './GoogleOAuthButton'

export function RegisterForm() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((state) => state.setAuth)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      const response = await authApi.register({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
      })

      if (response.success && response.data) {
        // Extract token from session object
        const token = response.data.session?.access_token
        if (token) {
          setAuth(response.data.user, token)
          navigate('/dashboard')
        } else {
          setError('Failed to get authentication token')
        }
      } else {
        setError(response.error || 'Registration failed')
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
            Create your account
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
              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <Label>First name</Label>
                  <Input
                    name="firstName"
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="First name"
                  />
                </Field>
                <Field>
                  <Label>Last name</Label>
                  <Input
                    name="lastName"
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Last name"
                  />
                </Field>
              </div>

              <Field>
                <Label>Email address</Label>
                <Input
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email address"
                />
              </Field>

              <Field>
                <Label>Password</Label>
                <PasswordInput
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Password"
                  required
                  autoComplete="new-password"
                />
                <PasswordStrengthMeter password={formData.password} showRequirements={true} />
              </Field>

              <Field>
                <Label>Confirm password</Label>
                <PasswordInput
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm password"
                  required
                  autoComplete="new-password"
                />
              </Field>
            </FieldGroup>

            <div className="mt-8 space-y-3">
              <Button type="submit" color="indigo" disabled={loading} className="w-full">
                {loading ? 'Creating account...' : 'Sign up'}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-gray-600" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white dark:bg-zinc-900 px-2 text-gray-500 dark:text-gray-400">
                    Or continue with
                  </span>
                </div>
              </div>

              <GoogleOAuthButton mode="signup" onError={setError} disabled={loading} />
            </div>

            <div className="mt-6 text-center">
              <Text>
                Already have an account?{' '}
                <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                  Sign in
                </Link>
              </Text>
            </div>
          </Fieldset>
        </form>
      </div>
    </div>
  )
}
