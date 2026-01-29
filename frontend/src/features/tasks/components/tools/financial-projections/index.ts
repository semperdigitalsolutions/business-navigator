/**
 * Financial Projections Tool
 * Issue #81: Barrel export for financial projections calculator
 */
export { FinancialProjectionsTool } from './FinancialProjectionsTool'
export { RevenueSection } from './RevenueSection'
export { ExpensesSection } from './ExpensesSection'
export { ResultsPanel } from './ResultsPanel'
export { ProjectionsChart } from './ProjectionsChart'
export type {
  ProjectionsState,
  ProjectionsSummary,
  YearProjection,
  YearKey,
  RevenueData,
  ExpensesData,
} from './types'
export { DEFAULT_PROJECTIONS_STATE } from './types'
