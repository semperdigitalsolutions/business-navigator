/**
 * useConfidenceMessage Hook
 * Returns encouragement message text based on confidence score
 */

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

/**
 * Hook to get message text only (for use in other components)
 */
export function useConfidenceMessage(score: number): string {
  return getMessageConfig(score).text
}

/**
 * Get full message config including icon and color
 */
export function useConfidenceMessageConfig(score: number): MessageConfig {
  return getMessageConfig(score)
}
