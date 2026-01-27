/**
 * Password Strength Validation
 * Enforces password complexity requirements
 *
 * SECURITY: HIGH - Prevents weak passwords and brute force attacks
 */

export interface PasswordStrength {
  isValid: boolean
  score: number // 0-4: Very Weak, Weak, Fair, Good, Strong
  errors: string[]
  suggestions: string[]
}

// Common weak passwords (subset - in production, use a larger list or zxcvbn library)
const COMMON_PASSWORDS = new Set([
  'password',
  'password123',
  '123456',
  '12345678',
  'qwerty',
  'abc123',
  'letmein',
  'welcome',
  'admin',
  'admin123',
  'password1',
  '123456789',
  '1234567890',
])

/**
 * Validate password strength
 * Requirements:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 * - Not a common password
 */
export function validatePassword(password: string): PasswordStrength {
  const errors: string[] = []
  const suggestions: string[] = []
  let score = 0

  // Check minimum length
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  } else if (password.length >= 8) {
    score++
  }

  // Check for uppercase letters
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  } else {
    score++
  }

  // Check for lowercase letters
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  } else {
    score++
  }

  // Check for numbers
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number')
  } else {
    score++
  }

  // Check for special characters
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    errors.push('Password must contain at least one special character')
  } else {
    score++
  }

  // Check against common passwords
  if (COMMON_PASSWORDS.has(password.toLowerCase())) {
    errors.push('This password is too common. Please choose a more unique password.')
    score = Math.max(0, score - 2) // Heavily penalize common passwords
  }

  // Bonus points for length
  if (password.length >= 12) {
    score = Math.min(5, score + 1)
  }

  // Check for repeated characters (e.g., "aaaa")
  if (/(.)\1{3,}/.test(password)) {
    suggestions.push('Avoid using repeated characters')
    score = Math.max(0, score - 1)
  }

  // Check for sequential characters (e.g., "1234", "abcd")
  if (
    /(?:abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|012|123|234|345|456|567|678|789)/i.test(
      password
    )
  ) {
    suggestions.push('Avoid using sequential characters')
    score = Math.max(0, score - 1)
  }

  // Add suggestions for improvement
  if (errors.length > 0) {
    suggestions.push('Try using a passphrase with multiple words')
    suggestions.push('Consider using a password manager to generate strong passwords')
  }

  // Normalize score to 0-4 range
  const normalizedScore = Math.min(4, Math.max(0, score))

  return {
    isValid: errors.length === 0 && normalizedScore >= 3,
    score: normalizedScore,
    errors,
    suggestions,
  }
}

/**
 * Get password strength label
 */
export function getPasswordStrengthLabel(score: number): string {
  switch (score) {
    case 0:
      return 'Very Weak'
    case 1:
      return 'Weak'
    case 2:
      return 'Fair'
    case 3:
      return 'Good'
    case 4:
      return 'Strong'
    default:
      return 'Unknown'
  }
}

/**
 * Get password strength color
 */
export function getPasswordStrengthColor(score: number): string {
  switch (score) {
    case 0:
    case 1:
      return 'red'
    case 2:
      return 'orange'
    case 3:
      return 'yellow'
    case 4:
      return 'green'
    default:
      return 'gray'
  }
}

/**
 * Validate password and throw error if invalid
 * Useful for TypeBox custom validators
 */
export function assertPasswordStrength(password: string): void {
  const validation = validatePassword(password)
  if (!validation.isValid) {
    throw new Error(validation.errors.join('. '))
  }
}
