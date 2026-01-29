/**
 * ResultsPanel Component
 * Issue #81: Displays calculated results (net profit, runway, YoY growth)
 */
import { cn } from '@/utils/classnames'
import type { ProjectionsSummary, YearKey } from './types'

interface ResultsPanelProps {
  summary: ProjectionsSummary
  selectedYear: YearKey
  initialFunding: number
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

function formatPercent(value: number | null): string {
  if (value === null) return 'N/A'
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(1)}%`
}

function ResultRow({
  label,
  value,
  highlight,
}: {
  label: string
  value: string
  highlight?: 'positive' | 'negative'
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-zinc-600 dark:text-zinc-400">{label}</span>
      <span
        className={cn(
          'font-semibold',
          highlight === 'positive' && 'text-green-600 dark:text-green-400',
          highlight === 'negative' && 'text-red-600 dark:text-red-400',
          !highlight && 'text-zinc-900 dark:text-white'
        )}
      >
        {value}
      </span>
    </div>
  )
}

function getRunwayMessage(runway: number | null, initialFunding: number): string {
  if (!initialFunding || initialFunding <= 0) {
    return 'Enter initial funding to calculate runway'
  }
  if (runway === null) {
    return 'Unable to calculate runway'
  }
  if (runway === Infinity || runway > 120) {
    return 'Profitable - unlimited runway'
  }
  if (runway <= 0) {
    return 'Insufficient funding'
  }
  return `${Math.round(runway)} months of runway`
}

function getYoYLabel(year: YearKey): string {
  if (year === 'year2') return 'Growth vs Year 1'
  if (year === 'year3') return 'Growth vs Year 2'
  return 'Year-over-Year Growth'
}

function getYoYGrowth(selectedYear: YearKey, summary: ProjectionsSummary): number | null {
  if (selectedYear === 'year2') return summary.yearOverYearGrowth.year2
  if (selectedYear === 'year3') return summary.yearOverYearGrowth.year3
  return null
}

function getHighlight(value: number | null): 'positive' | 'negative' | undefined {
  if (value === null) return undefined
  return value >= 0 ? 'positive' : 'negative'
}

export function ResultsPanel({ summary, selectedYear, initialFunding }: ResultsPanelProps) {
  const yearData = summary[selectedYear]
  const netProfitHighlight = yearData.netProfit >= 0 ? 'positive' : 'negative'
  const runwayMessage = getRunwayMessage(summary.runway, initialFunding)
  const yoyGrowth = getYoYGrowth(selectedYear, summary)
  const yoyHighlight = getHighlight(yoyGrowth)

  return (
    <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800/50">
      <h3 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-white">Results</h3>
      <div className="divide-y divide-zinc-200 dark:divide-zinc-700">
        <ResultRow label="Total Revenue" value={formatCurrency(yearData.totalRevenue)} />
        <ResultRow label="Total Expenses" value={formatCurrency(yearData.totalExpenses)} />
        <ResultRow
          label="Net Profit"
          value={formatCurrency(yearData.netProfit)}
          highlight={netProfitHighlight}
        />
        {selectedYear !== 'year1' && (
          <ResultRow
            label={getYoYLabel(selectedYear)}
            value={formatPercent(yoyGrowth)}
            highlight={yoyHighlight}
          />
        )}
      </div>
      <div className="mt-4 rounded-md bg-zinc-100 p-3 dark:bg-zinc-700/50">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          <span className="font-medium">Runway:</span> {runwayMessage}
        </p>
      </div>
    </div>
  )
}
