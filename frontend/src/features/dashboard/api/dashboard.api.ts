/**
 * Dashboard API
 * Aggregated dashboard data endpoints
 */
import { apiClient } from '@/lib/api/client'
import type { DashboardData, ConfidenceScore, UserTask, ApiResponse } from '@shared/types'

export const dashboardApi = {
  /**
   * Get complete dashboard data (single aggregated request)
   */
  getDashboard: async (businessId?: string): Promise<ApiResponse<DashboardData>> => {
    const params = businessId ? `?businessId=${businessId}` : ''
    return apiClient.get(`/api/dashboard${params}`)
  },

  /**
   * Get real-time confidence score
   */
  getConfidenceScore: async (businessId?: string): Promise<ApiResponse<ConfidenceScore>> => {
    const params = businessId ? `?businessId=${businessId}` : ''
    return apiClient.get(`/api/dashboard/confidence${params}`)
  },

  /**
   * Get current hero task
   */
  getHeroTask: async (businessId?: string): Promise<ApiResponse<{ heroTask: UserTask | null }>> => {
    const params = businessId ? `?businessId=${businessId}` : ''
    return apiClient.get(`/api/dashboard/hero-task${params}`)
  },

  /**
   * Mark hero task as complete
   */
  completeHeroTask: async (
    taskId: string
  ): Promise<
    ApiResponse<{
      completedTask: UserTask
      nextHeroTask?: UserTask
    }>
  > => apiClient.post(`/api/dashboard/hero-task/${taskId}/complete`),

  /**
   * Skip hero task (prevent re-recommendation for 24 hours)
   */
  skipHeroTask: async (
    taskId: string
  ): Promise<
    ApiResponse<{
      skippedTask: UserTask
      nextHeroTask?: UserTask
    }>
  > => apiClient.post(`/api/dashboard/hero-task/${taskId}/skip`),
}
