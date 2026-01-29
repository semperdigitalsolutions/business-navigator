/**
 * ProjectionsChart Component
 * Issue #81: Simple CSS-based bar chart for financial projections visualization
 */
import { cn } from '@/utils/classnames'
import type { ProjectionsSummary } from './types'

interface ProjectionsChartProps {
  summary: ProjectionsSummary
}

interface BarData {
  label: string
  revenue: number
  expenses: number
  profit: number
}

function formatCompact(value: number): string {
  const absValue = Math.abs(value)
  if (absValue >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`
  }
  if (absValue >= 1_000) {
    return `$${(value / 1_000).toFixed(0)}K`
  }
  return `$${value.toFixed(0)}`
}

function getBarHeight(value: number, maxValue: number): number {
  if (maxValue <= 0 || value <= 0) return 0
  return Math.max(4, (value / maxValue) * 100)
}

interface BarGroupProps {
  data: BarData
  maxValue: number
}

function BarGroup({ data, maxValue }: BarGroupProps) {
  const revenueHeight = getBarHeight(data.revenue, maxValue)
  const expensesHeight = getBarHeight(data.expenses, maxValue)
  const profitHeight = getBarHeight(Math.abs(data.profit), maxValue)
  const isProfitable = data.profit >= 0

  return (
    <div className="flex flex-col items-center">
      <div className="flex h-40 items-end gap-1">
        <div className="group relative flex flex-col items-center">
          <div
            className="w-6 rounded-t bg-blue-500 transition-all duration-300 dark:bg-blue-400"
            style={{ height: `${revenueHeight}%` }}
          />
          <div className="absolute -top-6 hidden whitespace-nowrap text-xs text-zinc-600 group-hover:block dark:text-zinc-400">
            {formatCompact(data.revenue)}
          </div>
        </div>
        <div className="group relative flex flex-col items-center">
          <div
            className="w-6 rounded-t bg-orange-500 transition-all duration-300 dark:bg-orange-400"
            style={{ height: `${expensesHeight}%` }}
          />
          <div className="absolute -top-6 hidden whitespace-nowrap text-xs text-zinc-600 group-hover:block dark:text-zinc-400">
            {formatCompact(data.expenses)}
          </div>
        </div>
        <div className="group relative flex flex-col items-center">
          <div
            className={cn(
              'w-6 rounded-t transition-all duration-300',
              isProfitable ? 'bg-green-500 dark:bg-green-400' : 'bg-red-500 dark:bg-red-400'
            )}
            style={{ height: `${profitHeight}%` }}
          />
          <div className="absolute -top-6 hidden whitespace-nowrap text-xs text-zinc-600 group-hover:block dark:text-zinc-400">
            {formatCompact(data.profit)}
          </div>
        </div>
      </div>
      <span className="mt-2 text-sm font-medium text-zinc-600 dark:text-zinc-400">
        {data.label}
      </span>
    </div>
  )
}

function ChartLegend() {
  return (
    <div className="flex flex-wrap justify-center gap-4 text-xs">
      <div className="flex items-center gap-1.5">
        <div className="h-3 w-3 rounded bg-blue-500 dark:bg-blue-400" />
        <span className="text-zinc-600 dark:text-zinc-400">Revenue</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="h-3 w-3 rounded bg-orange-500 dark:bg-orange-400" />
        <span className="text-zinc-600 dark:text-zinc-400">Expenses</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="h-3 w-3 rounded bg-green-500 dark:bg-green-400" />
        <span className="text-zinc-600 dark:text-zinc-400">Profit</span>
      </div>
    </div>
  )
}

export function ProjectionsChart({ summary }: ProjectionsChartProps) {
  const barData: BarData[] = [
    { label: 'Year 1', ...summary.year1 },
    { label: 'Year 2', ...summary.year2 },
    { label: 'Year 3', ...summary.year3 },
  ]

  const allValues = barData.flatMap((d) => [d.revenue, d.expenses, Math.abs(d.profit)])
  const maxValue = Math.max(...allValues, 1)
  const hasData = allValues.some((v) => v > 0)

  if (!hasData) {
    return (
      <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-700 dark:bg-zinc-800/50">
        <h3 className="mb-4 text-center text-lg font-semibold text-zinc-900 dark:text-white">
          3-Year Projection
        </h3>
        <div className="flex h-40 items-center justify-center text-sm text-zinc-500 dark:text-zinc-400">
          Enter financial data to see chart
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-700 dark:bg-zinc-800/50">
      <h3 className="mb-4 text-center text-lg font-semibold text-zinc-900 dark:text-white">
        3-Year Projection
      </h3>
      <div className="mb-4 flex justify-around">
        {barData.map((data) => (
          <BarGroup key={data.label} data={data} maxValue={maxValue} />
        ))}
      </div>
      <ChartLegend />
    </div>
  )
}
