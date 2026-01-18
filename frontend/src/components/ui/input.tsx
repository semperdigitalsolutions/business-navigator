import { forwardRef } from 'react'
import * as Headless from '@headlessui/react'
import { Input as CatalystInput, InputGroup } from '@/components/catalyst-ui-kit/typescript/input'
import {
  ErrorMessage as CatalystErrorMessage,
  Description,
  Field,
  Label,
} from '@/components/catalyst-ui-kit/typescript/fieldset'

export interface InputProps
  extends Omit<React.ComponentPropsWithoutRef<typeof CatalystInput>, 'data-invalid'> {
  error?: boolean
  errorMessage?: string
  label?: string
  description?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error, errorMessage, label, description, className, ...props }, ref) => {
    // If we have label/description/error, wrap in Field
    if (label || description || errorMessage) {
      return (
        <Field>
          {label && <Label>{label}</Label>}
          {description && <Description>{description}</Description>}
          <Headless.Input
            as={CatalystInput}
            ref={ref}
            data-invalid={error || !!errorMessage || undefined}
            className={className}
            {...props}
          />
          {errorMessage && <InputErrorMessage>{errorMessage}</InputErrorMessage>}
        </Field>
      )
    }

    // Simple input without field wrapper
    return (
      <Headless.Input
        as={CatalystInput}
        ref={ref}
        data-invalid={error || undefined}
        className={className}
        {...props}
      />
    )
  }
)

export function InputErrorMessage({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof CatalystErrorMessage>) {
  return (
    <CatalystErrorMessage className={className} {...props}>
      {children}
    </CatalystErrorMessage>
  )
}

export { InputGroup, Field, Label, Description }
