/**
 * Shared TypeScript types for Business Navigator
 */

// User types
export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  createdAt: Date
  updatedAt: Date
}

// Business formation types
export interface Business {
  id: string
  name: string
  type: BusinessType
  state: string
  status: BusinessStatus
  ownerId: string
  createdAt: Date
  updatedAt: Date
}

export enum BusinessType {
  LLC = 'LLC',
  CORPORATION = 'CORPORATION',
  SOLE_PROPRIETORSHIP = 'SOLE_PROPRIETORSHIP',
  PARTNERSHIP = 'PARTNERSHIP',
}

export enum BusinessStatus {
  DRAFT = 'DRAFT',
  IN_PROGRESS = 'IN_PROGRESS',
  SUBMITTED = 'SUBMITTED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}
