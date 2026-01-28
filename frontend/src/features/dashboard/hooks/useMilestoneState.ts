/**
 * useMilestoneState Hook
 * Manages milestone celebration state and persistence
 */
import { useCallback, useMemo, useState } from 'react'
import { useLocalStorage } from '@/hooks/use-local-storage'

const MILESTONES = [25, 50, 75, 100] as const
export type Milestone = (typeof MILESTONES)[number]

interface ShownMilestones {
  [businessId: string]: Milestone[]
}

function findNewMilestone(percentage: number, shownMilestones: Milestone[]): Milestone | null {
  for (const milestone of MILESTONES) {
    if (percentage >= milestone && !shownMilestones.includes(milestone)) {
      return milestone
    }
  }
  return null
}

export function useMilestoneState(completionPercentage: number, businessId: string = 'default') {
  const [shownMilestones, setShownMilestones] = useLocalStorage<ShownMilestones>(
    'milestone-celebrations-shown',
    {}
  )
  const [dismissedMilestone, setDismissedMilestone] = useState<Milestone | null>(null)

  const businessMilestones = useMemo(
    () => shownMilestones[businessId] || [],
    [shownMilestones, businessId]
  )

  const currentMilestone = useMemo(
    () => findNewMilestone(completionPercentage, businessMilestones),
    [completionPercentage, businessMilestones]
  )

  const isVisible = currentMilestone !== null && currentMilestone !== dismissedMilestone

  const handleDismiss = useCallback(() => {
    if (currentMilestone && !businessMilestones.includes(currentMilestone)) {
      setDismissedMilestone(currentMilestone)
      setShownMilestones({
        ...shownMilestones,
        [businessId]: [...businessMilestones, currentMilestone],
      })
    }
  }, [currentMilestone, businessId, businessMilestones, shownMilestones, setShownMilestones])

  return { currentMilestone, isVisible, handleDismiss }
}
