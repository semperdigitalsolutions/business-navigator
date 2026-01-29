/**
 * RevenueSection Component
 * Issue #81: Revenue inputs for financial projections (recurring, one-time, other)
 */
import { CalculatorInput } from '@/features/tasks/components/CalculatorInput'
import type { RevenueData } from './types'

interface RevenueSectionProps {
  data: RevenueData
  onChange: (field: keyof RevenueData, value: number | null) => void
  disabled?: boolean
}

function calculateSubtotal(data: RevenueData): number {
  return (data.recurring || 0) + (data.oneTime || 0) + (data.other || 0)
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export function RevenueSection({ data, onChange, disabled = false }: RevenueSectionProps) {
  const subtotal = calculateSubtotal(data)

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Revenue</h3>
      <div className="space-y-3">
        <CalculatorInput
          label="Monthly Recurring Revenue"
          value={data.recurring}
          onChange={(value) => onChange('recurring', value)}
          format="currency"
          placeholder="0"
          min={0}
          disabled={disabled}
        />
        <CalculatorInput
          label="One-time Sales"
          value={data.oneTime}
          onChange={(value) => onChange('oneTime', value)}
          format="currency"
          placeholder="0"
          min={0}
          disabled={disabled}
        />
        <CalculatorInput
          label="Other Income"
          value={data.other}
          onChange={(value) => onChange('other', value)}
          format="currency"
          placeholder="0"
          min={0}
          disabled={disabled}
        />
      </div>
      <div className="flex items-center justify-between border-t border-zinc-200 pt-3 dark:border-zinc-700">
        <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Total Revenue</span>
        <span className="text-lg font-semibold text-zinc-900 dark:text-white">
          {formatCurrency(subtotal)}
        </span>
      </div>
    </div>
  )
}
