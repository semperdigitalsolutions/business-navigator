import { forwardRef } from 'react'
import {
  Button as CatalystButton,
  TouchTarget,
} from '@/components/catalyst-ui-kit/typescript/button'

/**
 * Button variant mappings from project conventions to Catalyst
 * - primary → solid/blue (default action color)
 * - secondary → outline
 * - ghost → plain
 * - destructive → solid/red
 */
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive'

export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof CatalystButton>,
    'color' | 'outline' | 'plain'
  > {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-2.5 py-1 text-xs',
  md: '', // default Catalyst sizing
  lg: 'px-5 py-2.5 text-base',
}

export const Button = forwardRef<HTMLElement, ButtonProps>(
  (
    { variant = 'primary', size = 'md', loading = false, disabled, className, children, ...props },
    ref
  ) => {
    const isDisabled = disabled || loading

    // Map variants to Catalyst props
    const catalystProps = (() => {
      switch (variant) {
        case 'primary':
          return { color: 'blue' as const }
        case 'secondary':
          return { outline: true as const }
        case 'ghost':
          return { plain: true as const }
        case 'destructive':
          return { color: 'red' as const }
        default:
          return { color: 'blue' as const }
      }
    })()

    const sizeClass = sizeClasses[size]
    const combinedClassName = [sizeClass, className].filter(Boolean).join(' ')

    return (
      <CatalystButton
        ref={ref}
        disabled={isDisabled}
        className={combinedClassName || undefined}
        {...catalystProps}
        {...props}
      >
        {loading ? (
          <>
            <LoadingSpinner />
            <span className="ml-2">{children}</span>
          </>
        ) : (
          children
        )}
      </CatalystButton>
    )
  }
)

function LoadingSpinner() {
  return (
    <svg
      className="size-4 animate-spin"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  )
}

export { TouchTarget }
