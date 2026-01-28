/**
 * Waitlist API client
 * Handles communication with backend waitlist endpoints
 */
import { apiClient } from '@/lib/api/client'

export interface WaitlistRequest {
  email: string
  firstName: string
  stage?: 'idea' | 'research' | 'ready' | 'started'
  emailOptIn: boolean
}

interface WaitlistCountResponse {
  success: boolean
  data?: { count: number }
  error?: string
}

interface WaitlistResponse {
  success: boolean
  data?: { added: boolean }
  message?: string
  error?: string
}

export const waitlistApi = {
  join: async (data: WaitlistRequest): Promise<WaitlistResponse> =>
    apiClient.post('/api/waitlist', data),

  getCount: async (): Promise<WaitlistCountResponse> => apiClient.get('/api/waitlist/count'),
}
