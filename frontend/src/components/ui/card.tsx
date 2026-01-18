import { forwardRef } from 'react'
import { cn } from '@/utils/classnames'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  interactive?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const paddingClasses = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, interactive = false, padding = 'md', children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'rounded-lg bg-white shadow-sm ring-1 ring-zinc-950/5',
        'dark:bg-zinc-900 dark:ring-white/10',
        paddingClasses[padding],
        interactive && [
          'cursor-pointer transition-shadow duration-150',
          'hover:shadow-md hover:ring-zinc-950/10',
          'dark:hover:ring-white/20',
        ],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
)

Card.displayName = 'Card'

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Use when Card has padding="none" to add internal padding to header */
  padded?: boolean
}

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, padded = false, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex flex-col space-y-1.5', padded && 'px-6 pt-6', className)}
      {...props}
    >
      {children}
    </div>
  )
)

CardHeader.displayName = 'CardHeader'

export type CardTitleProps = React.HTMLAttributes<HTMLHeadingElement>

export const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, children, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn(
        'text-lg font-semibold leading-none tracking-tight text-zinc-950',
        'dark:text-white',
        className
      )}
      {...props}
    >
      {children}
    </h3>
  )
)

CardTitle.displayName = 'CardTitle'

export type CardDescriptionProps = React.HTMLAttributes<HTMLParagraphElement>

export const CardDescription = forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className, children, ...props }, ref) => (
    <p ref={ref} className={cn('text-sm text-zinc-500 dark:text-zinc-400', className)} {...props}>
      {children}
    </p>
  )
)

CardDescription.displayName = 'CardDescription'

export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Use when Card has padding="none" to add internal padding to content */
  padded?: boolean
}

export const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, padded = false, children, ...props }, ref) => (
    <div ref={ref} className={cn(padded && 'px-6 pb-6', className)} {...props}>
      {children}
    </div>
  )
)

CardContent.displayName = 'CardContent'

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Use when Card has padding="none" to add internal padding to footer */
  padded?: boolean
}

export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, padded = false, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex items-center pt-4', padded && 'px-6 pb-6', className)}
      {...props}
    >
      {children}
    </div>
  )
)

CardFooter.displayName = 'CardFooter'
