/**
 * ConfidenceMessage Component
 * Issue #45: Dynamic encouragement messages based on score ranges
 *
 * Score ranges:
 * - 0%: "Let's get started!"
 * - 1-24%: "Great start! Keep going."
 * - 25-49%: "You're making progress!"
 * - 50-74%: "Halfway there!"
 * - 75-89%: "Almost ready to launch!"
 * - 90-99%: "Final stretch!"
 * - 100%: "You're ready to launch!"
 */
import { cn } from '@/utils/classnames'

interface ConfidenceMessageProps {
  score: number
  className?: string
  showIcon?: boolean
}

interface MessageConfig {
  text: string
  icon: string
  colorClass: string
}

function getMessageConfig(score: number): MessageConfig {
  if (score === 0) {
    return {
      text: "Let's get started!",
      icon: '🚀',
      colorClass: 'text-zinc-600 dark:text-zinc-400',
    }
  }
  if (score < 25) {
    return {
      text: 'Great start! Keep going.',
      icon: '💪',
      colorClass: 'text-blue-600 dark:text-blue-400',
    }
  }
  if (score < 50) {
    return {
      text: "You're making progress!",
      icon: '📈',
      colorClass: 'text-blue-600 dark:text-blue-400',
    }
  }
  if (score < 75) {
    return {
      text: 'Halfway there!',
      icon: '🎯',
      colorClass: 'text-amber-600 dark:text-amber-400',
    }
  }
  if (score < 90) {
    return {
      text: 'Almost ready to launch!',
      icon: '✨',
      colorClass: 'text-green-600 dark:text-green-400',
    }
  }
  if (score < 100) {
    return {
      text: 'Final stretch!',
      icon: '🏁',
      colorClass: 'text-green-600 dark:text-green-400',
    }
  }
  // score === 100
  return {
    text: "You're ready to launch!",
    icon: '🎉',
    colorClass: 'text-green-600 dark:text-green-400',
  }
}

export function ConfidenceMessage({ score, className, showIcon = true }: ConfidenceMessageProps) {
  const config = getMessageConfig(score)

  return (
    <p className={cn('text-sm font-medium', config.colorClass, className)}>
      {showIcon && <span className="mr-1">{config.icon}</span>}
      {config.text}
    </p>
  )
}
