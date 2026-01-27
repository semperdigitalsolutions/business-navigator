/**
 * PasswordInput Component
 * Password input with visibility toggle (show/hide)
 */
import { useState } from 'react'
import { Input } from '@/components/catalyst-ui-kit/typescript/input'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'

interface PasswordInputProps {
  name: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  required?: boolean
  autoComplete?: string
  disabled?: boolean
  'aria-label'?: string
}

export function PasswordInput({
  name,
  value,
  onChange,
  placeholder = 'Password',
  required = false,
  autoComplete,
  disabled = false,
  'aria-label': ariaLabel,
}: PasswordInputProps) {
  const [isVisible, setIsVisible] = useState(false)

  const toggleVisibility = () => {
    setIsVisible((prev) => !prev)
  }

  return (
    <div className="relative">
      <Input
        name={name}
        type={isVisible ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
        disabled={disabled}
        aria-label={ariaLabel || placeholder}
        className="pr-10"
      />
      <button
        type="button"
        onClick={toggleVisibility}
        disabled={disabled}
        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label={isVisible ? 'Hide password' : 'Show password'}
        tabIndex={-1}
      >
        {isVisible ? (
          <EyeSlashIcon className="h-5 w-5" aria-hidden="true" />
        ) : (
          <EyeIcon className="h-5 w-5" aria-hidden="true" />
        )}
      </button>
    </div>
  )
}
