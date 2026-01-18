/**
 * Shared constants for Business Navigator
 */

export const APP_NAME = 'Business Navigator'
export const APP_VERSION = '0.0.0'

// API endpoints
export const API_ROUTES = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh',
  },
  BUSINESS: {
    LIST: '/api/businesses',
    CREATE: '/api/businesses',
    GET: (id: string) => `/api/businesses/${id}`,
    UPDATE: (id: string) => `/api/businesses/${id}`,
    DELETE: (id: string) => `/api/businesses/${id}`,
  },
  USER: {
    PROFILE: '/api/user/profile',
    UPDATE_PROFILE: '/api/user/profile',
  },
} as const

// Pagination defaults
export const DEFAULT_PAGE_SIZE = 20
export const MAX_PAGE_SIZE = 100

// US States for business formation
export const US_STATES = [
  { code: 'AL', name: 'Alabama' },
  { code: 'AK', name: 'Alaska' },
  { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' },
  { code: 'CA', name: 'California' },
  { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' },
  { code: 'DE', name: 'Delaware' },
  { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' },
  // Add more states as needed
] as const
