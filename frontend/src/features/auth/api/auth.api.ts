/**
 * Auth API - Authentication endpoints
 */
import { apiClient } from '@/lib/api/client'

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  firstName: string
  lastName: string
}

export interface AuthResponse {
  success: boolean
  data?: {
    user: {
      id: string
      email: string
      firstName: string
      lastName: string
    }
    token: string
  }
  error?: string
}

export const authApi = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> =>
    apiClient.post('/api/auth/login', credentials),

  register: async (data: RegisterRequest): Promise<AuthResponse> =>
    apiClient.post('/api/auth/register', data),

  logout: async (): Promise<void> => apiClient.post('/api/auth/logout'),

  me: async (): Promise<AuthResponse> => apiClient.get('/api/auth/me'),
}
