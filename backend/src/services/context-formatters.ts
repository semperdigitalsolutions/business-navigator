/**
 * Context Formatters
 * Formatting utilities for context service
 */
import type { ChatContext, TaskPhase } from '@shared/types'

export function formatCategory(category: string): string {
  const categories: Record<string, string> = {
    tech_saas: 'Tech / SaaS',
    service: 'Service Business',
    ecommerce: 'E-Commerce',
    local: 'Local Business',
  }
  return categories[category] || category
}

export function formatStage(stage: string): string {
  const stages: Record<string, string> = {
    idea: 'Idea Stage',
    planning: 'Planning Stage',
    started: 'Already Started',
  }
  return stages[stage] || stage
}

export function formatTimeline(timeline: string): string {
  const timelines: Record<string, string> = {
    asap: 'As Soon As Possible',
    soon: 'Within 3 Months',
    later: 'Within 6 Months',
    exploring: 'Still Exploring',
  }
  return timelines[timeline] || timeline
}

export function formatFunding(funding: string): string {
  const approaches: Record<string, string> = {
    personal_savings: 'Personal Savings',
    investment: 'Seeking Investment',
    loan: 'Business Loan',
    multiple: 'Multiple Sources',
    none: 'Not Yet Determined',
  }
  return approaches[funding] || funding
}

export function formatPhase(phase: TaskPhase): string {
  const phases: Record<TaskPhase, string> = {
    ideation: 'Ideation & Validation',
    legal: 'Legal Foundation',
    financial: 'Financial Infrastructure',
    launch_prep: 'Launch Preparation',
  }
  return phases[phase] || phase
}

/**
 * Format context as a human-readable summary for the AI
 */
export function formatContextSummary(context: ChatContext): string {
  const lines: string[] = ['=== USER CONTEXT ===']

  // User info
  lines.push(`User: ${context.user.name}`)
  lines.push(`Subscription: ${context.user.subscriptionTier}`)
  lines.push(`Account age: ${context.user.accountAgeDays} days`)
  if (context.user.isFirstTimeBusiness) {
    lines.push('Experience: First-time business owner')
  }

  // Business info
  if (context.business) {
    lines.push('')
    lines.push('=== BUSINESS ===')
    lines.push(`Name: ${context.business.name}`)
    if (context.business.category) {
      lines.push(`Category: ${formatCategory(context.business.category)}`)
    }
    if (context.business.state) {
      lines.push(`State: ${context.business.state}`)
    }
    if (context.business.currentStage) {
      lines.push(`Stage: ${formatStage(context.business.currentStage)}`)
    }
    if (context.business.entityType) {
      lines.push(`Entity Type: ${context.business.entityType}`)
    }
    if (context.business.timeline) {
      lines.push(`Timeline: ${formatTimeline(context.business.timeline)}`)
    }
    if (context.business.fundingApproach) {
      lines.push(`Funding: ${formatFunding(context.business.fundingApproach)}`)
    }
  }

  // Progress info
  lines.push('')
  lines.push('=== PROGRESS ===')
  lines.push(`Current Phase: ${formatPhase(context.progress.currentPhase)}`)
  lines.push(`Overall Completion: ${context.progress.completionPercentage}%`)
  lines.push(`Tasks Completed: ${context.progress.tasksCompleted}/${context.progress.totalTasks}`)
  lines.push('Phase Progress:')
  lines.push(`  - Ideation: ${context.progress.phaseProgress.ideation}%`)
  lines.push(`  - Legal: ${context.progress.phaseProgress.legal}%`)
  lines.push(`  - Financial: ${context.progress.phaseProgress.financial}%`)
  lines.push(`  - Launch Prep: ${context.progress.phaseProgress.launchPrep}%`)

  // Recent activity
  lines.push('')
  lines.push('=== RECENT ACTIVITY ===')
  if (context.recentActivity.heroTask) {
    const task = context.recentActivity.heroTask
    lines.push(`Current Hero Task: "${task.title}" (${formatPhase(task.phase)})`)
  } else {
    lines.push('Current Hero Task: None assigned')
  }

  if (context.recentActivity.lastCompletedTasks.length > 0) {
    lines.push('Recently Completed:')
    context.recentActivity.lastCompletedTasks.forEach((task) => {
      lines.push(`  - ${task.title}`)
    })
  }

  // Pending decisions
  if (context.pendingDecisions.length > 0) {
    lines.push('')
    lines.push('=== PENDING DECISIONS ===')
    context.pendingDecisions.forEach((decision) => {
      lines.push(`  - ${decision.label} (${decision.category})`)
    })
  }

  return lines.join('\n')
}
