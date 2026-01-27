import { forwardRef } from 'react'
import { cn } from '@/utils/classnames'

export type CircularProgressSize = 'sm' | 'md' | 'lg' | 'xl'
export type CircularProgressColor = 'primary' | 'success' | 'warning' | 'error' | 'accent'

export interface CircularProgressProps extends Omit<React.SVGAttributes<SVGSVGElement>, 'color'> {
  value: number
  max?: number
  size?: CircularProgressSize
  color?: CircularProgressColor
  strokeWidth?: number
  showValue?: boolean
}

const sizes = { sm: 32, md: 48, lg: 64, xl: 96 }
const strokes = { sm: 3, md: 4, lg: 5, xl: 6 }
const textSizes = { sm: 'text-xs', md: 'text-sm', lg: 'text-base', xl: 'text-lg' }
const colors: Record<CircularProgressColor, string> = {
  primary: 'stroke-blue-600 dark:stroke-blue-500',
  success: 'stroke-green-600 dark:stroke-green-500',
  warning: 'stroke-amber-500 dark:stroke-amber-400',
  error: 'stroke-red-600 dark:stroke-red-500',
  accent: 'stroke-purple-600 dark:stroke-purple-500',
}

export const CircularProgress = forwardRef<SVGSVGElement, CircularProgressProps>((props, ref) => {
  const {
    value,
    max = 100,
    size = 'md',
    color = 'primary',
    strokeWidth,
    showValue,
    className,
    ...rest
  } = props
  const dim = sizes[size],
    sw = strokeWidth ?? strokes[size],
    r = (dim - sw) / 2
  const circ = 2 * Math.PI * r,
    pct = Math.min(100, Math.max(0, (value / max) * 100)),
    c = dim / 2

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg
        ref={ref}
        width={dim}
        height={dim}
        viewBox={`0 0 ${dim} ${dim}`}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        {...rest}
      >
        <circle
          cx={c}
          cy={c}
          r={r}
          fill="none"
          strokeWidth={sw}
          className="stroke-zinc-200 dark:stroke-zinc-700"
        />
        <circle
          cx={c}
          cy={c}
          r={r}
          fill="none"
          strokeWidth={sw}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ - (pct / 100) * circ}
          className={cn('origin-center -rotate-90 transition-all duration-300', colors[color])}
          style={{ transformOrigin: '50% 50%' }}
        />
      </svg>
      {showValue && (
        <span
          className={cn('absolute font-medium text-zinc-700 dark:text-zinc-300', textSizes[size])}
        >
          {Math.round(pct)}%
        </span>
      )}
    </div>
  )
})

CircularProgress.displayName = 'CircularProgress'
