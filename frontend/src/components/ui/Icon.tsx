import { cn } from '@/utils/classnames'

export interface IconProps {
  /** Material Symbols icon name (e.g., 'home', 'settings', 'check_circle') */
  name: string
  /** Size in pixels (default: 24) */
  size?: 16 | 18 | 20 | 22 | 24 | 28 | 32 | 48
  /** Use filled variant */
  filled?: boolean
  /** Additional CSS classes */
  className?: string
}

/**
 * Material Symbols icon component
 * @see https://fonts.google.com/icons for icon names
 */
export function Icon({ name, size = 24, filled = false, className }: IconProps) {
  return (
    <span
      className={cn('material-symbols-outlined', filled && 'filled', className)}
      style={{ fontSize: size }}
      aria-hidden="true"
    >
      {name}
    </span>
  )
}
