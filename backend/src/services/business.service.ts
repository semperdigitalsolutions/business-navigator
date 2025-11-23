/**
 * Business formation service
 */
import { supabase } from '@/config/database.js'
import type { Business, BusinessType, BusinessStatus } from '@shared/types'
import type { AuthUser } from '@/middleware/auth.js'

export class BusinessService {
  /**
   * Get all businesses for a user
   */
  async getBusinesses(userId: string) {
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('owner_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return data
  }

  /**
   * Get a single business by ID
   */
  async getBusiness(id: string, userId: string) {
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('id', id)
      .eq('owner_id', userId)
      .single()

    if (error) throw new Error(error.message)
    return data
  }

  /**
   * Create a new business
   */
  async createBusiness(
    data: {
      name: string
      type: BusinessType
      state: string
    },
    user: AuthUser
  ) {
    const { data: business, error } = await supabase
      .from('businesses')
      .insert({
        name: data.name,
        type: data.type,
        state: data.state,
        owner_id: user.id,
        status: 'DRAFT' as BusinessStatus,
      } as any)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return business
  }

  /**
   * Update a business
   */
  async updateBusiness(
    id: string,
    data: Partial<{
      name: string
      type: BusinessType
      state: string
      status: BusinessStatus
    }>,
    userId: string
  ) {
    const { data: business, error } = await supabase
      .from('businesses')
      .update(data as any)
      .eq('id', id)
      .eq('owner_id', userId)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return business
  }

  /**
   * Delete a business
   */
  async deleteBusiness(id: string, userId: string) {
    const { error } = await supabase
      .from('businesses')
      .delete()
      .eq('id', id)
      .eq('owner_id', userId)

    if (error) throw new Error(error.message)
    return { success: true }
  }
}

export const businessService = new BusinessService()
