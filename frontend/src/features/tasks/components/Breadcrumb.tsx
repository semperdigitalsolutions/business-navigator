/**
 * Breadcrumb Navigation Component
 * Issue #68: Reusable breadcrumb for the task system.
 * Renders a navigable path (e.g. Dashboard > Phase > Task > Step).
 * Supports mobile truncation, home icon, and optional unsaved-changes guard.
 */
import { useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline'
import { cn } from '@/utils/classnames'

/** A single breadcrumb segment with a label and optional link. */
export interface BreadcrumbSegment {
  /** Display text for the segment */
  label: string
  /** Navigation target. Omit for the current (last) segment. */
  href?: string
}

interface BreadcrumbProps {
  /** Ordered list of breadcrumb segments (first to last / current). */
  segments: BreadcrumbSegment[]
  /** Additional CSS class names for the outer `<nav>`. */
  className?: string
  /**
   * Optional callback invoked before programmatic navigation.
   * Return `false` to prevent navigation (e.g. when there are unsaved changes).
   */
  onNavigate?: (href: string) => boolean | void
}

type NavigateCallback = (href: string) => boolean | void

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

const HOME_LABELS = new Set(['dashboard', 'home'])

function isHomeSegment(label: string): boolean {
  return HOME_LABELS.has(label.toLowerCase())
}

/** Inline chevron separator between segments. */
function Separator() {
  return (
    <ChevronRightIcon
      className="h-4 w-4 flex-shrink-0 text-zinc-300 dark:text-zinc-600"
      aria-hidden="true"
    />
  )
}

/** Home icon + screen-reader text. */
function HomeLabel() {
  return (
    <>
      <HomeIcon className="h-4 w-4" aria-hidden="true" />
      <span className="sr-only">Home</span>
    </>
  )
}

const TRUNCATE_CLASSES = 'max-w-[8rem] truncate sm:max-w-none'

function truncateIf(isTruncated: boolean): string | false {
  return isTruncated && TRUNCATE_CLASSES
}

/** Builds a guarded click handler that calls onNavigate before routing. */
function useGuardedClick(href: string | undefined, onNavigate: NavigateCallback | undefined) {
  const navigate = useNavigate()

  return useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (!onNavigate || !href) return
      const result = onNavigate(href)
      if (result === false) {
        e.preventDefault()
        return
      }
      e.preventDefault()
      navigate(href)
    },
    [onNavigate, href, navigate]
  )
}

/** Renders a non-clickable (current / missing href) segment. */
function StaticSegment({
  label,
  showHomeIcon,
  isCurrent,
  isTruncated,
}: {
  label: string
  showHomeIcon: boolean
  isCurrent: boolean
  isTruncated: boolean
}) {
  return (
    <span
      className={cn('font-medium text-zinc-700 dark:text-zinc-300', truncateIf(isTruncated))}
      aria-current={isCurrent ? 'page' : undefined}
    >
      {showHomeIcon ? <HomeLabel /> : label}
    </span>
  )
}

const LINK_BASE = 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'

/** Renders a clickable segment link. */
function LinkedSegment({
  segment,
  showHomeIcon,
  isTruncated,
  onNavigate,
}: {
  segment: BreadcrumbSegment
  showHomeIcon: boolean
  isTruncated: boolean
  onNavigate?: NavigateCallback
}) {
  const handleClick = useGuardedClick(segment.href, onNavigate)
  const classes = cn(LINK_BASE, 'transition-colors', truncateIf(isTruncated))

  return (
    <Link
      to={segment.href ?? ''}
      className={cn(classes, !showHomeIcon && 'inline-block')}
      onClick={onNavigate ? handleClick : undefined}
    >
      {showHomeIcon ? <HomeLabel /> : segment.label}
    </Link>
  )
}

/** Renders a single segment as a link or static text. */
function SegmentContent({
  segment,
  isCurrent,
  isFirst,
  isTruncated,
  onNavigate,
}: {
  segment: BreadcrumbSegment
  isCurrent: boolean
  isFirst: boolean
  isTruncated: boolean
  onNavigate?: NavigateCallback
}) {
  const showHomeIcon = isFirst && isHomeSegment(segment.label)

  if (isCurrent || !segment.href) {
    return (
      <StaticSegment
        label={segment.label}
        showHomeIcon={showHomeIcon}
        isCurrent={isCurrent}
        isTruncated={isTruncated}
      />
    )
  }

  return (
    <LinkedSegment
      segment={segment}
      showHomeIcon={showHomeIcon}
      isTruncated={isTruncated}
      onNavigate={onNavigate}
    />
  )
}

// ---------------------------------------------------------------------------
// Mobile truncation helpers
// ---------------------------------------------------------------------------

/**
 * When there are more than 3 segments on mobile, we collapse the middle ones
 * into a single ellipsis indicator. Desktop always shows every segment.
 */
const MOBILE_MAX_VISIBLE = 3

type VisibleItem = { segment: BreadcrumbSegment; truncated: boolean } | 'ellipsis'

function buildVisibleSegments(segments: BreadcrumbSegment[]): VisibleItem[] {
  if (segments.length <= MOBILE_MAX_VISIBLE) {
    return segments.map((s) => ({ segment: s, truncated: false }))
  }

  const first = { segment: segments[0], truncated: false }
  const last = { segment: segments[segments.length - 1], truncated: false }
  const beforeLast = { segment: segments[segments.length - 2], truncated: true }
  const hasHiddenMiddle = segments.length > MOBILE_MAX_VISIBLE + 1

  return [first, ...(hasHiddenMiddle ? (['ellipsis'] as const) : []), beforeLast, last]
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

/**
 * Reusable breadcrumb navigation for the Business Navigator task system.
 *
 * @example
 * ```tsx
 * <Breadcrumb
 *   segments={[
 *     { label: 'Dashboard', href: '/' },
 *     { label: 'Legal', href: '/tasks?phase=legal' },
 *     { label: 'Choose Business Structure' },
 *   ]}
 * />
 * ```
 */
export function Breadcrumb({ segments, className, onNavigate }: BreadcrumbProps) {
  if (segments.length === 0) return null

  const items = buildVisibleSegments(segments)

  return (
    <nav aria-label="Breadcrumb" className={cn('mb-4', className)}>
      <ol className="flex items-center gap-1 text-sm">
        {items.map((entry, index) => {
          if (entry === 'ellipsis') {
            return <EllipsisItem key="ellipsis" />
          }

          const { segment, truncated } = entry
          const isFirst = index === 0
          const isCurrent = index === items.length - 1

          return (
            <li key={index} className="flex items-center gap-1">
              {!isFirst && <Separator />}
              <SegmentContent
                segment={segment}
                isCurrent={isCurrent}
                isFirst={isFirst}
                isTruncated={truncated}
                onNavigate={onNavigate}
              />
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

/** Collapsed middle-segment indicator shown only on mobile. */
function EllipsisItem() {
  return (
    <li className="flex items-center gap-1 sm:hidden" aria-hidden="true">
      <Separator />
      <span className="text-zinc-400 dark:text-zinc-500">...</span>
    </li>
  )
}
