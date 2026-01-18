/**
 * Error Sanitization Middleware
 * Prevents sensitive information leakage in error messages
 *
 * SECURITY: HIGH - Protects against information disclosure attacks
 */

/**
 * Sanitize error messages to prevent information leakage
 */
export function sanitizeErrorMessage(error: Error | string): string {
  const message = typeof error === 'string' ? error : error.message

  // List of sensitive patterns to redact
  const sensitivePatterns = [
    // Database errors that might leak schema information
    /table "([^"]+)" does not exist/gi,
    /column "([^"]+)" does not exist/gi,
    /relation "([^"]+)" does not exist/gi,
    /database "([^"]+)" does not exist/gi,

    // Connection strings and credentials
    /postgres:\/\/[^@]+@[^\s]+/gi,
    /postgresql:\/\/[^@]+@[^\s]+/gi,
    /mongodb:\/\/[^@]+@[^\s]+/gi,
    /mysql:\/\/[^@]+@[^\s]+/gi,

    // API keys and secrets
    /[a-zA-Z0-9_-]{32,}/g, // Long random strings that might be keys

    // Email addresses (in some contexts)
    /[\w.-]+@[\w.-]+\.\w+/g,

    // File paths that might leak system information
    /\/Users\/[^\s]+/gi,
    /\/home\/[^\s]+/gi,
    /C:\\Users\\[^\s]+/gi,

    // IP addresses
    /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,

    // Stack traces
    /at\s+[\w.]+\s+\([^)]+\)/gi,
  ]

  let sanitized = message

  // Replace sensitive patterns
  sensitivePatterns.forEach((pattern) => {
    sanitized = sanitized.replace(pattern, '[REDACTED]')
  })

  // Map common error messages to user-friendly versions
  const errorMappings: Record<string, string> = {
    'duplicate key value violates unique constraint': 'This record already exists',
    'violates foreign key constraint': 'Invalid reference to related data',
    'violates check constraint': 'Invalid data provided',
    'violates not-null constraint': 'Required field is missing',
    'permission denied': 'You do not have permission to perform this action',
    'relation does not exist': 'Resource not found',
    'column does not exist': 'Invalid field specified',
    'invalid input syntax': 'Invalid data format',
    'value too long': 'Input exceeds maximum length',
    'numeric field overflow': 'Number value is too large',
    'division by zero': 'Invalid calculation',
    'out of range': 'Value is out of acceptable range',
  }

  // Check if message contains any of the mapped errors
  for (const [key, value] of Object.entries(errorMappings)) {
    if (sanitized.toLowerCase().includes(key.toLowerCase())) {
      return value
    }
  }

  // If the error is too technical, return a generic message
  if (
    sanitized.includes('Error:') ||
    sanitized.includes('Exception:') ||
    sanitized.includes('SQLException') ||
    sanitized.includes('RuntimeError')
  ) {
    return 'An error occurred while processing your request'
  }

  return sanitized
}

/**
 * Check if error should be logged (contains sensitive info)
 */
export function shouldLogError(error: Error | string): boolean {
  const message = typeof error === 'string' ? error : error.message

  // Always log errors in development
  if (process.env.NODE_ENV === 'development') {
    return true
  }

  // In production, log errors that don't contain user input
  const userInputPatterns = [
    /invalid email/i,
    /password/i,
    /user not found/i,
    /unauthorized/i,
    /forbidden/i,
  ]

  return !userInputPatterns.some((pattern) => pattern.test(message))
}

/**
 * Create sanitized error response
 */
export interface SanitizedErrorResponse {
  success: false
  error: string
  code?: string
  details?: string
}

export function createSanitizedError(
  error: Error | string,
  statusCode: number = 500
): SanitizedErrorResponse {
  const sanitizedMessage = sanitizeErrorMessage(error)

  // Log full error server-side if appropriate
  if (shouldLogError(error)) {
    const fullMessage = typeof error === 'string' ? error : error.message
    const stack = typeof error === 'object' && 'stack' in error ? error.stack : undefined
    console.error('[Sanitized Error]:', fullMessage)
    if (stack) {
      console.error('[Stack Trace]:', stack)
    }
  }

  // Return sanitized error to client
  return {
    success: false,
    error: sanitizedMessage,
    code: `ERR_${statusCode}`,
  }
}

/**
 * Safe error logger for production
 */
export function logErrorSafely(error: Error | string, context?: Record<string, any>): void {
  if (process.env.NODE_ENV === 'production') {
    // In production, use a proper logging service (e.g., Sentry, Datadog)
    // For now, just log sanitized version
    console.error('[Error]:', sanitizeErrorMessage(error))
    if (context) {
      console.error('[Context]:', JSON.stringify(context, null, 2))
    }
  } else {
    // In development, log full error
    console.error('[Error]:', error)
    if (context) {
      console.error('[Context]:', context)
    }
    if (typeof error === 'object' && 'stack' in error) {
      console.error('[Stack]:', error.stack)
    }
  }
}
