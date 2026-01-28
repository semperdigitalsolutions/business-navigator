/**
 * Waitlist Form Modal
 * Collects user info for the beta waitlist via a Dialog
 */
import { type FormEvent, useState } from 'react'
import { Button } from '@/components/catalyst-ui-kit/typescript/button'
import { Checkbox, CheckboxField } from '@/components/catalyst-ui-kit/typescript/checkbox'
import {
  Dialog,
  DialogActions,
  DialogBody,
  DialogTitle,
} from '@/components/catalyst-ui-kit/typescript/dialog'
import {
  Field,
  FieldGroup,
  Fieldset,
  Label,
} from '@/components/catalyst-ui-kit/typescript/fieldset'
import { Input } from '@/components/catalyst-ui-kit/typescript/input'
import { Select } from '@/components/catalyst-ui-kit/typescript/select'
import { Text } from '@/components/catalyst-ui-kit/typescript/text'
import type { WaitlistRequest } from '../api/waitlist.api'
import { useWaitlistForm } from '../hooks/useWaitlistForm'

interface WaitlistFormProps {
  isOpen: boolean
  onClose: () => void
}

function SuccessDialog({ isOpen, onClose }: WaitlistFormProps) {
  return (
    <Dialog open={isOpen} onClose={onClose} size="sm">
      <DialogTitle>You&apos;re on the list!</DialogTitle>
      <DialogBody>
        <Text>
          Thanks for joining the Business Navigator beta waitlist. We&apos;ll be in touch soon with
          early access details.
        </Text>
      </DialogBody>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  )
}

function FormFields({
  error,
  emailOptIn,
  setEmailOptIn,
}: {
  error: string | null
  emailOptIn: boolean
  setEmailOptIn: (v: boolean) => void
}) {
  return (
    <>
      <Fieldset>
        <FieldGroup>
          <Field>
            <Label>Email</Label>
            <Input name="email" type="email" placeholder="your@email.com" required />
          </Field>
          <Field>
            <Label>First Name</Label>
            <Input name="firstName" type="text" placeholder="Alex" required />
          </Field>
          <Field>
            <Label>Where are you in your business journey?</Label>
            <Select name="stage">
              <option value="">Select a stage (optional)</option>
              <option value="idea">Just an idea</option>
              <option value="research">Doing research</option>
              <option value="ready">Ready to register</option>
              <option value="started">Already started</option>
            </Select>
          </Field>
          <CheckboxField>
            <Checkbox checked={emailOptIn} onChange={setEmailOptIn} />
            <Label>I agree to receive email updates about the beta launch</Label>
          </CheckboxField>
        </FieldGroup>
      </Fieldset>
      {error && <Text className="mt-4 text-red-600 dark:text-red-400">{error}</Text>}
    </>
  )
}

export function WaitlistForm({ isOpen, onClose }: WaitlistFormProps) {
  const { status, error, submit, reset } = useWaitlistForm()
  const [emailOptIn, setEmailOptIn] = useState(false)

  const handleClose = () => {
    reset()
    setEmailOptIn(false)
    onClose()
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const data: WaitlistRequest = {
      email: formData.get('email') as string,
      firstName: formData.get('firstName') as string,
      stage: (formData.get('stage') as WaitlistRequest['stage']) || undefined,
      emailOptIn,
    }
    submit(data)
  }

  if (status === 'success') {
    return <SuccessDialog isOpen={isOpen} onClose={handleClose} />
  }

  return (
    <Dialog open={isOpen} onClose={handleClose} size="md">
      <DialogTitle>Join the Beta Waitlist</DialogTitle>
      <DialogBody>
        <form id="waitlist-form" onSubmit={handleSubmit}>
          <FormFields error={error} emailOptIn={emailOptIn} setEmailOptIn={setEmailOptIn} />
        </form>
      </DialogBody>
      <DialogActions>
        <Button plain onClick={handleClose}>
          Cancel
        </Button>
        <Button
          type="submit"
          form="waitlist-form"
          color="indigo"
          disabled={status === 'submitting' || !emailOptIn}
        >
          {status === 'submitting' ? 'Joining...' : 'Join the Waitlist'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
