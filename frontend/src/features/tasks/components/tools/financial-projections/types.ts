/**
 * Financial Projections Types
 * Issue #81: Type definitions for the financial projections calculator tool
 */

export interface RevenueData {
  recurring: number
  oneTime: number
  other: number
}

export interface ExpensesData {
  hosting: number
  marketing: number
  contractors: number
  other: number
}

export interface YearProjection {
  revenue: RevenueData
  expenses: ExpensesData
}

export interface ProjectionsState {
  year1: YearProjection
  year2: YearProjection
  year3: YearProjection
  initialFunding: number
}

export type YearKey = 'year1' | 'year2' | 'year3'

export interface YearSummary {
  totalRevenue: number
  totalExpenses: number
  netProfit: number
}

export interface ProjectionsSummary {
  year1: YearSummary
  year2: YearSummary
  year3: YearSummary
  runway: number | null
  yearOverYearGrowth: {
    year2: number | null
    year3: number | null
  }
}

export const DEFAULT_REVENUE: RevenueData = {
  recurring: 0,
  oneTime: 0,
  other: 0,
}

export const DEFAULT_EXPENSES: ExpensesData = {
  hosting: 0,
  marketing: 0,
  contractors: 0,
  other: 0,
}

export const DEFAULT_YEAR_PROJECTION: YearProjection = {
  revenue: { ...DEFAULT_REVENUE },
  expenses: { ...DEFAULT_EXPENSES },
}

export const DEFAULT_PROJECTIONS_STATE: ProjectionsState = {
  year1: {
    ...DEFAULT_YEAR_PROJECTION,
    revenue: { ...DEFAULT_REVENUE },
    expenses: { ...DEFAULT_EXPENSES },
  },
  year2: {
    ...DEFAULT_YEAR_PROJECTION,
    revenue: { ...DEFAULT_REVENUE },
    expenses: { ...DEFAULT_EXPENSES },
  },
  year3: {
    ...DEFAULT_YEAR_PROJECTION,
    revenue: { ...DEFAULT_REVENUE },
    expenses: { ...DEFAULT_EXPENSES },
  },
  initialFunding: 0,
}
