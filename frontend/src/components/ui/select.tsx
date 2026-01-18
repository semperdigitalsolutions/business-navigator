import { forwardRef } from 'react'
import { Select as CatalystSelect } from '@/components/catalyst-ui-kit/typescript/select'
import {
  Description,
  ErrorMessage,
  Field,
  Label,
} from '@/components/catalyst-ui-kit/typescript/fieldset'

export interface SelectProps extends React.ComponentPropsWithoutRef<typeof CatalystSelect> {
  error?: boolean
  errorMessage?: string
  label?: string
  description?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ error, errorMessage, label, description, children, ...props }, ref) => {
    // If we have label/description/error, wrap in Field
    if (label || description || errorMessage) {
      return (
        <Field>
          {label && <Label>{label}</Label>}
          {description && <Description>{description}</Description>}
          <CatalystSelect ref={ref} data-invalid={error || !!errorMessage || undefined} {...props}>
            {children}
          </CatalystSelect>
          {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
        </Field>
      )
    }

    // Simple select without field wrapper
    return (
      <CatalystSelect ref={ref} data-invalid={error || undefined} {...props}>
        {children}
      </CatalystSelect>
    )
  }
)

export { Field, Label, Description, ErrorMessage }
