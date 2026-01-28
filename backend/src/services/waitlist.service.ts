/**
 * Waitlist service
 * Handles waitlist signups for the beta launch landing page
 */
import { supabase } from '@/config/database.js'

class WaitlistService {
  /**
   * Add a user to the beta waitlist
   * Uses upsert to handle duplicate emails gracefully
   */
  async addToWaitlist(data: {
    email: string
    firstName: string
    stage?: string
    emailOptIn: boolean
  }) {
    const { data: result, error } = await supabase
      .from('waitlist_signups')
      .upsert(
        {
          email: data.email.toLowerCase().trim(),
          first_name: data.firstName.trim(),
          stage: data.stage || null,
          email_opt_in: data.emailOptIn,
          signed_up_at: new Date().toISOString(),
        },
        { onConflict: 'email' }
      )
      .select()
      .single()

    if (error) {
      console.error('Waitlist signup error:', error.message)
      throw new Error('Failed to add to waitlist')
    }

    return result
  }

  /**
   * Get the total number of waitlist signups
   */
  async getWaitlistCount(): Promise<number> {
    const { count, error } = await supabase
      .from('waitlist_signups')
      .select('*', { count: 'exact', head: true })

    if (error) {
      console.error('Waitlist count error:', error.message)
      return 0
    }

    return count ?? 0
  }
}

export const waitlistService = new WaitlistService()
