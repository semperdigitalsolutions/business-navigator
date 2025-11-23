/**
 * Error handling middleware
 */
import type { ApiResponse } from '@shared/types'

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message)
    Object.setPrototypeOf(this, AppError.prototype)
  }
}

export function errorResponse(message: string, statusCode: number = 500): ApiResponse {
  return {
    success: false,
    error: message,
  }
}

export function successResponse<T>(data: T, message?: string): ApiResponse<T> {
  return {
    success: true,
    data,
    message,
  }
}

// Common error responses
export const errors = {
  unauthorized: () => errorResponse('Unauthorized', 401),
  forbidden: () => errorResponse('Forbidden', 403),
  notFound: (resource: string = 'Resource') =>
    errorResponse(`${resource} not found`, 404),
  badRequest: (message: string) => errorResponse(message, 400),
  internal: (message: string = 'Internal server error') => errorResponse(message, 500),
}
