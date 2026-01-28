/**
 * Decision types that can trigger the confirmation modal
 */
export type DecisionType =
  | 'entity_type'
  | 'formation_state'
  | 'business_name'
  | 'business_category'
  | 'funding_approach'

/**
 * Configuration for decision-specific implications
 */
export interface DecisionImplication {
  title: string
  description: string
  implications: string[]
  severity: 'warning' | 'critical'
}

/**
 * Pre-configured implications for each decision type.
 * Critical decisions (entity_type, formation_state) have more significant impacts.
 */
export const DECISION_IMPLICATIONS: Record<DecisionType, DecisionImplication> = {
  entity_type: {
    title: 'Change Entity Type',
    description: 'You are about to change your business entity type.',
    implications: [
      'Previously completed legal tasks may need to be redone',
      'Formation documents will need to be updated',
      'Tax implications may change significantly',
      'Your business plan recommendations will be recalculated',
    ],
    severity: 'critical',
  },
  formation_state: {
    title: 'Change Formation State',
    description: 'You are about to change where your business will be formed.',
    implications: [
      'State-specific legal tasks will need to be updated',
      'Filing fees and requirements may differ',
      'Tax obligations will change based on the new state',
      'Registered agent requirements may change',
    ],
    severity: 'critical',
  },
  business_name: {
    title: 'Change Business Name',
    description: 'You are about to change your business name.',
    implications: [
      'Name availability will need to be re-checked',
      'Any completed branding tasks may need review',
      'Domain and trademark searches should be redone',
    ],
    severity: 'warning',
  },
  business_category: {
    title: 'Change Business Category',
    description: 'You are about to change your business category.',
    implications: [
      'Task recommendations will be updated',
      'Industry-specific guidance may change',
      'Licensing requirements may differ',
    ],
    severity: 'warning',
  },
  funding_approach: {
    title: 'Change Funding Approach',
    description: 'You are about to change your funding strategy.',
    implications: [
      'Financial planning tasks will be recalculated',
      'Investment-related guidance may change',
      'Business plan projections will be updated',
    ],
    severity: 'warning',
  },
}
