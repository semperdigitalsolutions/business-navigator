/**
 * RecommendationStep Component
 * Issue #76: AI recommendation step for entity selection wizard
 */
import {
  WizardRecommendationScreen,
  type RecommendationOption,
} from '../../../WizardRecommendationScreen'
import {
  ENTITY_TYPE_LABELS,
  ENTITY_TYPE_FULL_NAMES,
  type EntityRecommendation,
  type EntityType,
} from '../types'

interface RecommendationStepProps {
  recommendation: EntityRecommendation | null
  onSelect: (entityType: EntityType) => void
  onViewComparison: () => void
}

/** Entity-specific pros and cons for comparison */
const ENTITY_PROS_CONS: Record<EntityType, { pros: string[]; cons: string[] }> = {
  llc: {
    pros: [
      'Flexible tax treatment options',
      'Pass-through taxation (no double tax)',
      'Simple formation and maintenance',
      'Full liability protection',
    ],
    cons: [
      'Self-employment taxes on profits',
      'Less attractive to VC investors',
      'May require conversion later',
    ],
  },
  c_corp: {
    pros: [
      'Standard for VC investment',
      'Unlimited shareholders allowed',
      'Stock options for employees',
      'Full liability protection',
    ],
    cons: ['Double taxation on profits', 'More complex compliance', 'Higher formation costs'],
  },
  s_corp: {
    pros: [
      'Pass-through taxation',
      'Reduce self-employment taxes',
      'Full liability protection',
      'Credibility with partners',
    ],
    cons: ['Limited to 100 shareholders', 'Strict ownership rules', 'Required payroll for owners'],
  },
  sole_prop: {
    pros: ['Simplest to set up', 'No formation costs', 'Full control', 'Simple taxes'],
    cons: ['No liability protection', 'Harder to raise funding', 'Personal assets at risk'],
  },
}

/** Convert entity type to display format for WizardRecommendationScreen */
function formatRecommendationOption(type: EntityType, description: string): RecommendationOption {
  const proscons = ENTITY_PROS_CONS[type]
  return {
    id: type,
    name: ENTITY_TYPE_LABELS[type],
    description: `${ENTITY_TYPE_FULL_NAMES[type]}. ${description}`,
    pros: proscons.pros,
    cons: proscons.cons,
  }
}

/** Generate mock recommendation based on questions (temporary until AI integration) */
export function generateMockRecommendation(): EntityRecommendation {
  // This is mock data - will be replaced with actual AI recommendation
  return {
    recommended: 'llc',
    confidence: 85,
    reasoning:
      'Based on your responses, an LLC provides the best balance of liability protection, ' +
      'tax flexibility, and simplicity for your business needs. It allows pass-through taxation ' +
      'while protecting your personal assets.',
    alternatives: [
      {
        type: 'c_corp',
        reason:
          'Consider if you plan to raise venture capital in the future. ' +
          'C-Corps are the standard structure for VC-backed startups.',
      },
      {
        type: 's_corp',
        reason:
          'May offer tax advantages if your business becomes highly profitable, ' +
          'allowing you to reduce self-employment taxes.',
      },
    ],
  }
}

export function RecommendationStep({
  recommendation,
  onSelect,
  onViewComparison: _onViewComparison,
}: RecommendationStepProps) {
  // Use mock recommendation if none provided
  const rec = recommendation ?? generateMockRecommendation()

  // Build recommendation object for WizardRecommendationScreen
  const recommendationData = {
    option: rec.recommended,
    confidence: rec.confidence,
    reasoning: [
      rec.reasoning,
      ...rec.alternatives.map((alt) => `${ENTITY_TYPE_LABELS[alt.type]}: ${alt.reason}`),
    ],
  }

  // Build options array for WizardRecommendationScreen
  const options: RecommendationOption[] = [
    formatRecommendationOption(rec.recommended, rec.reasoning),
    ...rec.alternatives.map((alt) => formatRecommendationOption(alt.type, alt.reason)),
  ]

  return (
    <WizardRecommendationScreen
      recommendation={recommendationData}
      options={options}
      onSelect={(id) => onSelect(id as EntityType)}
      onRequestDifferent={_onViewComparison}
    />
  )
}
