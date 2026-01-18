import { Badge as CatalystBadge, BadgeButton } from '@/components/catalyst-ui-kit/typescript/badge' // eslint-disable-line sort-imports

/**
 * Status variant mappings from project conventions to Catalyst colors
 * - success → green
 * - warning → amber
 * - error → red
 * - info → blue
 * - neutral → zinc (default)
 */
export type BadgeStatus = 'success' | 'warning' | 'error' | 'info' | 'neutral'

// Catalyst color type
type CatalystBadgeColor =
  | 'red'
  | 'orange'
  | 'amber'
  | 'yellow'
  | 'lime'
  | 'green'
  | 'emerald'
  | 'teal'
  | 'cyan'
  | 'sky'
  | 'blue'
  | 'indigo'
  | 'violet'
  | 'purple'
  | 'fuchsia'
  | 'pink'
  | 'rose'
  | 'zinc'

const statusColorMap: Record<BadgeStatus, CatalystBadgeColor> = {
  success: 'green',
  warning: 'amber',
  error: 'red',
  info: 'blue',
  neutral: 'zinc',
}

export interface BadgeProps
  extends Omit<React.ComponentPropsWithoutRef<typeof CatalystBadge>, 'color'> {
  status?: BadgeStatus
  color?: CatalystBadgeColor
}

export function Badge({ status, color, ...props }: BadgeProps) {
  // If status is provided, use the mapped color; otherwise use the color prop
  const resolvedColor = status ? statusColorMap[status] : color

  return <CatalystBadge color={resolvedColor} {...props} />
}

export { BadgeButton }
export type { CatalystBadgeColor as BadgeColor }
