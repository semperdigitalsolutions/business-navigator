/**
 * Business Name Wizard Types
 * Issue #88: Types for the business name selection wizard
 */

export interface BusinessNameData {
  /** List of brainstormed name ideas */
  nameIdeas: string[]
  /** The selected/chosen business name */
  selectedName: string
  /** Domain availability checked */
  domainChecked: boolean
  /** Trademark search acknowledged */
  trademarkAcknowledged: boolean
  /** Notes about the chosen name */
  notes: string
}

export const INITIAL_BUSINESS_NAME_DATA: BusinessNameData = {
  nameIdeas: [],
  selectedName: '',
  domainChecked: false,
  trademarkAcknowledged: false,
  notes: '',
}

export type BusinessNameStep = 'brainstorm' | 'validate' | 'confirm'

export const BUSINESS_NAME_STEPS: BusinessNameStep[] = ['brainstorm', 'validate', 'confirm']

export const STEP_TITLES: Record<BusinessNameStep, string> = {
  brainstorm: 'Brainstorm Names',
  validate: 'Check Availability',
  confirm: 'Confirm Your Choice',
}

export const STEP_DESCRIPTIONS: Record<BusinessNameStep, string> = {
  brainstorm: 'Generate ideas for your business name',
  validate: 'Verify your name is available to use',
  confirm: 'Finalize your business name selection',
}
