/**
 * Onboarding API
 * Handles 6-step onboarding wizard API calls
 */
import { apiClient } from '@/lib/api/client'
import type { OnboardingData, OnboardingSession, ApiResponse } from '@shared/types'

interface OnboardingStatus {
  hasStarted: boolean
  isCompleted: boolean
  currentStep: number
  progress: number
}

interface SaveProgressRequest {
  data: Partial<OnboardingData>
  currentStep: number
  completedSteps: number[]
}

interface CompleteOnboardingRequest {
  data: OnboardingData
}

export const onboardingApi = {
  /**
   * Check onboarding status
   */
  getStatus: async (): Promise<ApiResponse<OnboardingStatus>> =>
    apiClient.get('/api/onboarding/status'),

  /**
   * Resume incomplete onboarding session
   */
  resume: async (): Promise<ApiResponse<OnboardingSession>> =>
    apiClient.get('/api/onboarding/resume'),

  /**
   * Save progress during wizard (auto-save)
   */
  saveProgress: async (request: SaveProgressRequest): Promise<ApiResponse<OnboardingSession>> =>
    apiClient.post('/api/onboarding/save', request),

  /**
   * Complete onboarding and generate business plan
   */
  complete: async (
    request: CompleteOnboardingRequest
  ): Promise<
    ApiResponse<{
      session: OnboardingSession
      businessPlan: any
    }>
  > => apiClient.post('/api/onboarding/complete', request),
}
