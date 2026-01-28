/**
 * Waitlist Form Hook
 * Manages form submission state for the waitlist modal
 */
import { useState } from 'react'
import { waitlistApi, type WaitlistRequest } from '../api/waitlist.api'

type FormStatus = 'idle' | 'submitting' | 'success' | 'error'

export function useWaitlistForm() {
  const [status, setStatus] = useState<FormStatus>('idle')
  const [error, setError] = useState<string | null>(null)

  const submit = async (data: WaitlistRequest) => {
    setStatus('submitting')
    setError(null)

    try {
      const response = await waitlistApi.join(data)
      if (response.success) {
        setStatus('success')
      } else {
        setError(response.error || 'Something went wrong')
        setStatus('error')
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      setError(message)
      setStatus('error')
    }
  }

  const reset = () => {
    setStatus('idle')
    setError(null)
  }

  return { status, error, submit, reset }
}
