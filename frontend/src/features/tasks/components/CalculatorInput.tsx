/**
 * CalculatorInput Component
 * Issue #80: Currency/number input with real-time formatting, validation, and clear support.
 * Wraps a native input with formatting logic for currency, number, and percent values.
 */
import { cn } from '@/utils/classnames'
import { useCallback, useId, useMemo, useRef, useState } from 'react'

export interface CalculatorInputProps {
  value: number | null
  onChange: (value: number | null) => void
  format?: 'currency' | 'number' | 'percent'
  label?: string
  placeholder?: string
  min?: number
  max?: number
  step?: number
  precision?: number
  showClear?: boolean
  disabled?: boolean
  error?: string
  className?: string
}

type FormatType = 'currency' | 'number' | 'percent'

function getDefaultStep(format: FormatType): number {
  return format === 'currency' ? 100 : 1
}

function getDefaultPrecision(format: FormatType): number {
  return format === 'currency' ? 2 : 0
}

/** Strip non-numeric characters, parse to number with given precision */
function parseNumericValue(raw: string, precision: number): number | null {
  const cleaned = raw.replace(/[^0-9.\u002D]/g, '')
  if (cleaned === '' || cleaned === '-' || cleaned === '.') return null
  const parsed = parseFloat(cleaned)
  if (Number.isNaN(parsed)) return null
  const factor = Math.pow(10, precision)
  return Math.round(parsed * factor) / factor
}

/** Add thousand-separator commas to an integer string (may include leading minus) */
function addCommas(intPart: string): string {
  const sign = intPart.startsWith('-') ? '-' : ''
  const absInt = intPart.replace('-', '')
  return sign + absInt.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

/** Format a numeric value for display with prefix/suffix based on format type */
function formatDisplayValue(value: number | null, format: FormatType, precision: number): string {
  if (value === null) return ''
  const fixed = value.toFixed(precision)
  const [intPart, decPart] = fixed.split('.')
  const withCommas = addCommas(intPart)
  const base = decPart !== undefined ? `${withCommas}.${decPart}` : withCommas
  if (format === 'currency') return `$${base}`
  if (format === 'percent') return `${base}%`
  return base
}

/** Format raw number for editing (no prefix/suffix, no commas) */
function formatRawForEdit(value: number | null, precision: number): string {
  if (value === null) return ''
  return value.toFixed(precision)
}

function clampValue(value: number, min?: number, max?: number): number {
  let clamped = value
  if (min !== undefined) clamped = Math.max(clamped, min)
  if (max !== undefined) clamped = Math.min(clamped, max)
  return clamped
}

interface CalcConfig {
  value: number | null
  onChange: (value: number | null) => void
  format: FormatType
  precision: number
  step: number
  min?: number
  max?: number
}

function useCalcDisplay(config: CalcConfig) {
  const { value, onChange, format, precision, min, max } = config
  const [isFocused, setIsFocused] = useState(false)
  const [displayText, setDisplayText] = useState(() => formatDisplayValue(value, format, precision))

  const displayValue = useMemo(
    () => (isFocused ? displayText : formatDisplayValue(value, format, precision)),
    [isFocused, displayText, value, format, precision]
  )

  const handleFocus = useCallback(() => {
    setIsFocused(true)
    setDisplayText(formatRawForEdit(value, precision))
  }, [value, precision])

  const handleBlur = useCallback(() => {
    setIsFocused(false)
    const parsed = parseNumericValue(displayText, precision)
    onChange(parsed !== null ? clampValue(parsed, min, max) : null)
  }, [displayText, precision, min, max, onChange])

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setDisplayText(e.target.value)
      onChange(parseNumericValue(e.target.value, precision))
    },
    [precision, onChange]
  )

  const clearDisplay = useCallback(() => {
    onChange(null)
    setDisplayText('')
  }, [onChange])

  return { displayValue, handleFocus, handleBlur, handleChange, clearDisplay, setDisplayText }
}

function useCalcKeyDown(config: CalcConfig, setDisplayText: (v: string) => void) {
  const { value, onChange, step, precision, min, max } = config
  return useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return
      e.preventDefault()
      const current = value ?? 0
      const delta = e.key === 'ArrowUp' ? step : -step
      const factor = Math.pow(10, precision)
      const next = clampValue(Math.round((current + delta) * factor) / factor, min, max)
      onChange(next)
      setDisplayText(formatRawForEdit(next, precision))
    },
    [value, step, precision, min, max, onChange, setDisplayText]
  )
}

function ClearButton({ onClick, disabled }: { onClick: () => void; disabled: boolean }) {
  return (
    <button
      type="button"
      tabIndex={-1}
      onClick={onClick}
      disabled={disabled}
      aria-label="Clear value"
      className={cn(
        'absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-0.5',
        'text-zinc-400 transition-colors hover:text-zinc-600',
        'dark:text-zinc-500 dark:hover:text-zinc-300',
        'disabled:pointer-events-none disabled:opacity-50'
      )}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 16 16"
        fill="currentColor"
        className="size-4"
      >
        <path
          fillRule="evenodd"
          d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14Zm2.78-4.22a.75.75 0 0
            1-1.06 0L8 9.06l-1.72 1.72a.75.75 0 1 1-1.06-1.06L6.94 8
            5.22 6.28a.75.75 0 0 1 1.06-1.06L8 6.94l1.72-1.72a.75.75
            0 1 1 1.06 1.06L9.06 8l1.72 1.72a.75.75 0 0 1 0 1.06Z"
          clipRule="evenodd"
        />
      </svg>
    </button>
  )
}

function InputPrefix({ format }: { format: FormatType }) {
  if (format !== 'currency') return null
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-500 dark:text-zinc-400"
    >
      $
    </span>
  )
}

function InputSuffix({ format }: { format: FormatType }) {
  if (format !== 'percent') return null
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute right-8 top-1/2 -translate-y-1/2 text-sm text-zinc-500 dark:text-zinc-400"
    >
      %
    </span>
  )
}

function buildInputClassName(format: FormatType, hasError: boolean, showClearBtn: boolean): string {
  return cn(
    'block w-full appearance-none rounded-lg',
    'px-3 py-2.5 sm:px-3 sm:py-1.5',
    'text-base/6 sm:text-sm/6',
    'text-zinc-950 placeholder:text-zinc-500 dark:text-white',
    'border border-zinc-950/10 hover:border-zinc-950/20',
    'dark:border-white/10 dark:hover:border-white/20',
    'bg-white dark:bg-white/5',
    'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset',
    'disabled:cursor-not-allowed disabled:opacity-50',
    hasError && 'border-red-500 hover:border-red-500 dark:border-red-600',
    format === 'currency' && 'pl-7',
    format === 'percent' && (showClearBtn ? 'pr-16' : 'pr-8'),
    format !== 'percent' && showClearBtn && 'pr-8'
  )
}

function resolveDefaults(props: CalculatorInputProps) {
  const format = props.format ?? 'currency'
  const step = props.step ?? getDefaultStep(format)
  const precision = props.precision ?? getDefaultPrecision(format)
  const showClear = props.showClear ?? true
  const disabled = props.disabled ?? false
  return { format, step, precision, showClear, disabled }
}

export function CalculatorInput(props: CalculatorInputProps) {
  const { value, onChange, label, placeholder, min, max, error, className } = props
  const { format, step, precision, showClear, disabled } = resolveDefaults(props)

  const uniqueId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const inputId = `calc-input-${uniqueId}`
  const errorId = `calc-error-${uniqueId}`

  const config: CalcConfig = { value, onChange, format, precision, step, min, max }
  const display = useCalcDisplay(config)
  const handleKeyDown = useCalcKeyDown(config, display.setDisplayText)
  const showClearBtn = showClear && value !== null && !disabled
  const inputClasses = buildInputClassName(format, !!error, showClearBtn)

  const onClear = useCallback(() => {
    display.clearDisplay()
    inputRef.current?.focus()
  }, [display])

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label
          htmlFor={inputId}
          className="mb-2 block text-sm font-medium text-zinc-900 dark:text-white"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <InputPrefix format={format} />
        <input
          ref={inputRef}
          id={inputId}
          type="text"
          inputMode="decimal"
          value={display.displayValue}
          placeholder={placeholder}
          disabled={disabled}
          onChange={display.handleChange}
          onFocus={display.handleFocus}
          onBlur={display.handleBlur}
          onKeyDown={handleKeyDown}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={inputClasses}
        />
        <InputSuffix format={format} />
        {showClearBtn && <ClearButton onClick={onClear} disabled={disabled} />}
      </div>
      {error && (
        <p id={errorId} className="mt-1.5 text-sm text-red-600 dark:text-red-500">
          {error}
        </p>
      )}
    </div>
  )
}
