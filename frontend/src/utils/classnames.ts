import clsx, { type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Centralized class name utility that combines clsx and tailwind-merge
 * - clsx: Conditionally join classNames together
 * - twMerge: Intelligently merge Tailwind CSS classes without conflicts
 *
 * @example
 * cn('px-2 py-1', condition && 'bg-blue-500', { 'text-white': isActive })
 * // Returns: 'px-2 py-1 bg-blue-500 text-white'
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
