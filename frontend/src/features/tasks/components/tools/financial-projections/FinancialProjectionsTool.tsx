/**
 * FinancialProjectionsTool Component
 * Issue #81: Main financial projections calculator with 3-year tabs and auto-save
 */
import { useCallback, useMemo, useState } from 'react'
import { cn } from '@/utils/classnames'
import { CalculatorInput } from '@/features/tasks/components/CalculatorInput'
import { SaveIndicator } from '@/features/tasks/components/SaveIndicator'
import { useAutoSave } from '@/features/tasks/hooks/useAutoSave'
import { ToolTaskLayout } from '@/features/tasks/components/ToolTaskLayout'
import { RevenueSection } from './RevenueSection'
import { ExpensesSection } from './ExpensesSection'
import { ResultsPanel } from './ResultsPanel'
import { ProjectionsChart } from './ProjectionsChart'
import {
  DEFAULT_PROJECTIONS_STATE,
  type ExpensesData,
  type ProjectionsState,
  type ProjectionsSummary,
  type RevenueData,
  type YearKey,
} from './types'

interface FinancialProjectionsToolProps {
  taskId: string
  businessId?: string
  initialData?: Partial<ProjectionsState>
}

const YEAR_TABS: { key: YearKey; label: string }[] = [
  { key: 'year1', label: 'Year 1' },
  { key: 'year2', label: 'Year 2' },
  { key: 'year3', label: 'Year 3' },
]

function calculateYearSummary(year: ProjectionsState[YearKey]) {
  const totalRevenue =
    (year.revenue.recurring || 0) + (year.revenue.oneTime || 0) + (year.revenue.other || 0)
  const totalExpenses =
    (year.expenses.hosting || 0) +
    (year.expenses.marketing || 0) +
    (year.expenses.contractors || 0) +
    (year.expenses.other || 0)
  return { totalRevenue, totalExpenses, netProfit: totalRevenue - totalExpenses }
}

function calculateRunway(monthlyBurn: number, funding: number, netProfit: number): number | null {
  if (monthlyBurn > 0 && funding > 0) return funding / monthlyBurn
  return netProfit >= 0 ? Infinity : null
}

function calculateGrowth(current: number, previous: number): number | null {
  if (previous === 0) return null
  return ((current - previous) / Math.abs(previous)) * 100
}

function calculateSummary(state: ProjectionsState): ProjectionsSummary {
  const year1 = calculateYearSummary(state.year1)
  const year2 = calculateYearSummary(state.year2)
  const year3 = calculateYearSummary(state.year3)
  const monthlyBurn = year1.totalExpenses / 12
  const runway = calculateRunway(monthlyBurn, state.initialFunding, year1.netProfit)

  return {
    year1,
    year2,
    year3,
    runway,
    yearOverYearGrowth: {
      year2: calculateGrowth(year2.netProfit, year1.netProfit),
      year3: calculateGrowth(year3.netProfit, year2.netProfit),
    },
  }
}

function YearTabs({
  selected,
  onChange,
}: {
  selected: YearKey
  onChange: (year: YearKey) => void
}) {
  return (
    <div className="flex gap-1 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800">
      {YEAR_TABS.map(({ key, label }) => (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          className={cn(
            'flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors',
            selected === key
              ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-white'
              : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
          )}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

function ExportButton() {
  return (
    <button
      type="button"
      disabled
      className={cn(
        'rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium',
        'text-zinc-400 dark:border-zinc-600 dark:text-zinc-500',
        'cursor-not-allowed opacity-50'
      )}
    >
      Export PDF (Coming Soon)
    </button>
  )
}

function FundingSection({
  value,
  onChange,
}: {
  value: number
  onChange: (v: number | null) => void
}) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Funding</h3>
      <CalculatorInput
        label="Initial Funding / Investment"
        value={value}
        onChange={onChange}
        format="currency"
        placeholder="0"
        min={0}
      />
    </div>
  )
}

function useProjectionsState(initialData?: Partial<ProjectionsState>) {
  const [projections, setProjections] = useState<ProjectionsState>(() => ({
    ...DEFAULT_PROJECTIONS_STATE,
    ...initialData,
  }))
  const [selectedYear, setSelectedYear] = useState<YearKey>('year1')

  return { projections, setProjections, selectedYear, setSelectedYear }
}

interface ProjectionsHandlers {
  handleRevenueChange: (field: keyof RevenueData, value: number | null) => void
  handleExpensesChange: (field: keyof ExpensesData, value: number | null) => void
  handleFundingChange: (value: number | null) => void
}

function useProjectionsHandlers(
  selectedYear: YearKey,
  setProjections: React.Dispatch<React.SetStateAction<ProjectionsState>>,
  updateDraft: (data: Record<string, unknown>) => void
): ProjectionsHandlers {
  const handleRevenueChange = useCallback(
    (field: keyof RevenueData, value: number | null) => {
      setProjections((prev) => {
        const updated = {
          ...prev,
          [selectedYear]: {
            ...prev[selectedYear],
            revenue: { ...prev[selectedYear].revenue, [field]: value ?? 0 },
          },
        }
        updateDraft({ projections: updated })
        return updated
      })
    },
    [selectedYear, setProjections, updateDraft]
  )

  const handleExpensesChange = useCallback(
    (field: keyof ExpensesData, value: number | null) => {
      setProjections((prev) => {
        const updated = {
          ...prev,
          [selectedYear]: {
            ...prev[selectedYear],
            expenses: { ...prev[selectedYear].expenses, [field]: value ?? 0 },
          },
        }
        updateDraft({ projections: updated })
        return updated
      })
    },
    [selectedYear, setProjections, updateDraft]
  )

  const handleFundingChange = useCallback(
    (value: number | null) => {
      setProjections((prev) => {
        const updated = { ...prev, initialFunding: value ?? 0 }
        updateDraft({ projections: updated })
        return updated
      })
    },
    [setProjections, updateDraft]
  )

  return { handleRevenueChange, handleExpensesChange, handleFundingChange }
}

export function FinancialProjectionsTool({
  taskId,
  businessId,
  initialData,
}: FinancialProjectionsToolProps) {
  const { projections, setProjections, selectedYear, setSelectedYear } =
    useProjectionsState(initialData)

  const { status, lastSavedAt, updateDraft } = useAutoSave({ taskId, businessId, debounceMs: 5000 })
  const summary = useMemo(() => calculateSummary(projections), [projections])
  const handlers = useProjectionsHandlers(selectedYear, setProjections, updateDraft)
  const currentYear = projections[selectedYear]

  return (
    <ToolTaskLayout
      title="Financial Projections"
      description="Create 3-year financial projections for your business"
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <YearTabs selected={selectedYear} onChange={setSelectedYear} />
          <div className="flex items-center gap-4">
            <SaveIndicator status={status} lastSavedAt={lastSavedAt} />
            <ExportButton />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            <RevenueSection data={currentYear.revenue} onChange={handlers.handleRevenueChange} />
            <ExpensesSection data={currentYear.expenses} onChange={handlers.handleExpensesChange} />
            <FundingSection
              value={projections.initialFunding}
              onChange={handlers.handleFundingChange}
            />
          </div>

          <div className="space-y-6">
            <ResultsPanel
              summary={summary}
              selectedYear={selectedYear}
              initialFunding={projections.initialFunding}
            />
            <ProjectionsChart summary={summary} />
          </div>
        </div>
      </div>
    </ToolTaskLayout>
  )
}
