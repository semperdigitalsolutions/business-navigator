/**
 * Register Form Component - Uses Catalyst UI components
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
        setAuth(response.data.user, response.data.token)
        navigate('/dashboard')
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
                <Input
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Password"
                />
              </Field>

              <Field>
                <Label>Confirm password</Label>
                <Input
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm password"
                />
              </Field>
            </FieldGroup>

            <div className="mt-8">
              <Button type="submit" color="indigo" disabled={loading} className="w-full">
                {loading ? 'Creating account...' : 'Sign up'}
              </Button>
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
