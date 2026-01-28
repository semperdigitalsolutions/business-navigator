/**
 * MilestoneCelebration Component
 * Issue #51: Celebrates user progress at 25%, 50%, 75%, and 100% milestones
 * Uses motion library for delightful animations
 */
import { AnimatePresence } from 'motion/react'
import { type Milestone, useMilestoneState } from '../hooks/useMilestoneState'
import { CelebrationModal, type MilestoneConfig } from './celebration'

const MILESTONE_CONFIG: Record<Milestone, MilestoneConfig> = {
  25: {
    title: 'Great Start!',
    message: "You've completed 25% of your business formation journey.",
    emoji: '🌱',
    color: 'text-blue-600 dark:text-blue-400',
    bgGradient: 'from-blue-500/20 to-indigo-500/20',
  },
  50: {
    title: 'Halfway There!',
    message: "You're 50% of the way to launching your business!",
    emoji: '🚀',
    color: 'text-purple-600 dark:text-purple-400',
    bgGradient: 'from-purple-500/20 to-pink-500/20',
  },
  75: {
    title: 'Almost There!',
    message: "75% complete. You're in the home stretch!",
    emoji: '⭐',
    color: 'text-amber-600 dark:text-amber-400',
    bgGradient: 'from-amber-500/20 to-orange-500/20',
  },
  100: {
    title: 'Congratulations!',
    message: 'You did it! Your business formation is complete!',
    emoji: '🎉',
    color: 'text-green-600 dark:text-green-400',
    bgGradient: 'from-green-500/20 to-emerald-500/20',
  },
}

interface MilestoneCelebrationProps {
  completionPercentage: number
  businessId?: string
}

export function MilestoneCelebration({
  completionPercentage,
  businessId = 'default',
}: MilestoneCelebrationProps) {
  const { currentMilestone, isVisible, handleDismiss } = useMilestoneState(
    completionPercentage,
    businessId
  )

  if (!currentMilestone) return null

  const config = MILESTONE_CONFIG[currentMilestone]

  return (
    <AnimatePresence>
      {isVisible && (
        <CelebrationModal config={config} milestone={currentMilestone} onDismiss={handleDismiss} />
      )}
    </AnimatePresence>
  )
}
