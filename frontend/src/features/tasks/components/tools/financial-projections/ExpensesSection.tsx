/**
 * ExpensesSection Component
 * Issue #81: Expense inputs for financial projections (hosting, marketing, contractors, other)
 */
import { CalculatorInput } from '@/features/tasks/components/CalculatorInput'
import type { ExpensesData } from './types'

interface ExpensesSectionProps {
  data: ExpensesData
  onChange: (field: keyof ExpensesData, value: number | null) => void
  disabled?: boolean
}

function calculateSubtotal(data: ExpensesData): number {
  return (data.hosting || 0) + (data.marketing || 0) + (data.contractors || 0) + (data.other || 0)
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

interface ExpenseInputProps {
  label: string
  field: keyof ExpensesData
  value: number
  onChange: (field: keyof ExpensesData, value: number | null) => void
  disabled: boolean
}

function ExpenseInput({ label, field, value, onChange, disabled }: ExpenseInputProps) {
  return (
    <CalculatorInput
      label={label}
      value={value}
      onChange={(val) => onChange(field, val)}
      format="currency"
      placeholder="0"
      min={0}
      disabled={disabled}
    />
  )
}

export function ExpensesSection({ data, onChange, disabled = false }: ExpensesSectionProps) {
  const subtotal = calculateSubtotal(data)

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Expenses</h3>
      <div className="space-y-3">
        <ExpenseInput
          label="Hosting / SaaS"
          field="hosting"
          value={data.hosting}
          onChange={onChange}
          disabled={disabled}
        />
        <ExpenseInput
          label="Marketing"
          field="marketing"
          value={data.marketing}
          onChange={onChange}
          disabled={disabled}
        />
        <ExpenseInput
          label="Contractors"
          field="contractors"
          value={data.contractors}
          onChange={onChange}
          disabled={disabled}
        />
        <ExpenseInput
          label="Other Expenses"
          field="other"
          value={data.other}
          onChange={onChange}
          disabled={disabled}
        />
      </div>
      <div className="flex items-center justify-between border-t border-zinc-200 pt-3 dark:border-zinc-700">
        <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Total Expenses</span>
        <span className="text-lg font-semibold text-zinc-900 dark:text-white">
          {formatCurrency(subtotal)}
        </span>
      </div>
    </div>
  )
}
