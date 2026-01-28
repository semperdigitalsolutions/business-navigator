/**
 * Confirmation modal shown when a user is about to navigate to an external URL.
 * Displays the destination, an optional affiliate disclosure, and a reminder
 * to return and mark the task step as complete.
 */
import { Button } from '@/components/catalyst-ui-kit/typescript/button'
import { Dialog, DialogActions, DialogBody, DialogTitle } from '@/components/ui/dialog'

export interface LeavingAppModalProps {
  /** Whether the modal is currently visible */
  isOpen: boolean
  /** Called when the user chooses to stay (closes the modal) */
  onClose: () => void
  /** Called when the user confirms they want to leave */
  onConfirm: () => void
  /** The external URL the user is navigating to */
  destinationUrl: string
  /** Show the affiliate commission disclosure (default: true) */
  showAffiliateDisclosure?: boolean
}

/** Inline SVG external-link icon (16x16) */
function ExternalLinkIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M4.25 5.5a.75.75 0 0 0-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 0 0 .75-.75v-4a.75.75 0 0 1 1.5 0v4A2.25 2.25 0 0 1 12.75 17h-8.5A2.25 2.25 0 0 1 2 14.75v-8.5A2.25 2.25 0 0 1 4.25 4h5a.75.75 0 0 1 0 1.5h-5Z"
        clipRule="evenodd"
      />
      <path
        fillRule="evenodd"
        d="M6.194 12.753a.75.75 0 0 0 1.06.053L16.5 4.44v2.81a.75.75 0 0 0 1.5 0v-4.5a.75.75 0 0 0-.75-.75h-4.5a.75.75 0 0 0 0 1.5h2.553l-9.056 8.194a.75.75 0 0 0-.053 1.06Z"
        clipRule="evenodd"
      />
    </svg>
  )
}

/** Truncate a URL for display, keeping the domain and trimming the path. */
function truncateUrl(url: string, maxLength = 60): string {
  if (url.length <= maxLength) return url
  try {
    const parsed = new URL(url)
    const domain = parsed.hostname
    const remaining = maxLength - domain.length - 3 // 3 for "..."
    if (remaining <= 0) return `${domain}...`
    const pathStart = parsed.pathname + parsed.search
    return `${domain}${pathStart.slice(0, remaining)}...`
  } catch {
    return url.length > maxLength ? `${url.slice(0, maxLength)}...` : url
  }
}

export function LeavingAppModal({
  isOpen,
  onClose,
  onConfirm,
  destinationUrl,
  showAffiliateDisclosure = true,
}: LeavingAppModalProps) {
  return (
    <Dialog open={isOpen} onClose={onClose} size="sm">
      <DialogTitle className="flex items-center gap-2">
        <ExternalLinkIcon className="h-5 w-5 text-zinc-500 dark:text-zinc-400" />
        Leaving the app
      </DialogTitle>

      <DialogBody className="space-y-4">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          You are about to visit an external site:
        </p>

        <div
          className="overflow-hidden rounded-md border border-zinc-200 bg-zinc-50
            px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800"
        >
          <code
            className="block truncate text-xs text-zinc-700 dark:text-zinc-300"
            title={destinationUrl}
          >
            {truncateUrl(destinationUrl)}
          </code>
        </div>

        {showAffiliateDisclosure && (
          <p className="text-xs text-zinc-500 dark:text-zinc-500">
            We may earn a small commission if you sign up or make a purchase through this link. This
            helps support Business Navigator at no extra cost to you.
          </p>
        )}

        <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          When you&apos;re done, come back here to mark this step as complete.
        </p>
      </DialogBody>

      <DialogActions>
        <Button plain onClick={onClose}>
          Go back
        </Button>
        <Button color="blue" onClick={onConfirm}>
          Continue
        </Button>
      </DialogActions>
    </Dialog>
  )
}
