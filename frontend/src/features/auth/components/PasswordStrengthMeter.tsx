/**
 * PasswordStrengthMeter Component
 * Visual indicator of password strength with requirements checklist
 */
import { useMemo } from 'react'
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid'

interface PasswordStrength {
  score: number // 0-4
  label: string
  color: string
  bgColor: string
}

interface PasswordRequirement {
  met: boolean
  text: string
}

interface PasswordStrengthMeterProps {
  password: string
  showRequirements?: boolean
}

function calculatePasswordStrength(password: string): {
  strength: PasswordStrength
  requirements: PasswordRequirement[]
} {
  if (!password) {
    return {
      strength: {
        score: 0,
        label: '',
        color: 'text-gray-500',
        bgColor: 'bg-gray-200',
      },
      requirements: [],
    }
  }

  const requirements = [
    { met: password.length >= 8, text: 'At least 8 characters' },
    { met: /[A-Z]/.test(password), text: 'One uppercase letter' },
    { met: /[a-z]/.test(password), text: 'One lowercase letter' },
    { met: /[0-9]/.test(password), text: 'One number' },
    {
      met: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
      text: 'One special character',
    },
  ]

  const metCount = requirements.filter((r) => r.met).length
  const strengthLevels: PasswordStrength[] = [
    { score: 0, label: 'Very Weak', color: 'text-red-600', bgColor: 'bg-red-500' },
    { score: 1, label: 'Weak', color: 'text-orange-600', bgColor: 'bg-orange-500' },
    { score: 2, label: 'Fair', color: 'text-yellow-600', bgColor: 'bg-yellow-500' },
    { score: 3, label: 'Good', color: 'text-lime-600', bgColor: 'bg-lime-500' },
    { score: 4, label: 'Strong', color: 'text-green-600', bgColor: 'bg-green-500' },
  ]

  const strengthIndex = Math.min(Math.max(metCount - 1, 0), 4)
  return { strength: strengthLevels[strengthIndex], requirements }
}

export function PasswordStrengthMeter({
  password,
  showRequirements = true,
}: PasswordStrengthMeterProps) {
  const { strength, requirements } = useMemo(() => calculatePasswordStrength(password), [password])

  if (!password) {
    return null
  }

  const barWidth = ((strength.score + 1) / 5) * 100

  return (
    <div className="mt-2 space-y-2">
      {/* Strength bar */}
      <div className="space-y-1">
        <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full ${strength.bgColor} transition-all duration-300 ease-in-out`}
            style={{ width: `${barWidth}%` }}
          />
        </div>
        {strength.label && (
          <p className={`text-xs font-medium ${strength.color}`}>{strength.label}</p>
        )}
      </div>

      {/* Requirements checklist */}
      {showRequirements && requirements.length > 0 && (
        <div className="space-y-1 pt-1">
          {requirements.map((req, index) => (
            <div key={index} className="flex items-center gap-1.5 text-xs">
              {req.met ? (
                <CheckCircleIcon className="h-4 w-4 text-green-500 flex-shrink-0" />
              ) : (
                <XCircleIcon className="h-4 w-4 text-gray-300 dark:text-gray-600 flex-shrink-0" />
              )}
              <span
                className={
                  req.met
                    ? 'text-green-700 dark:text-green-400'
                    : 'text-gray-500 dark:text-gray-400'
                }
              >
                {req.text}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
