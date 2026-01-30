/**
 * Audit Log Pagination Component
 * Server-side pagination controls for audit log table
 */
import { Button } from '@/components/catalyst-ui-kit/typescript/button'
import { Text } from '@/components/catalyst-ui-kit/typescript/text'
import { cn } from '@/utils/classnames'

interface AuditLogPaginationProps {
  currentPage: number
  totalItems: number
  pageSize: number
  hasMore: boolean
  onPageChange: (page: number) => void
}

export function AuditLogPagination({
  currentPage,
  totalItems,
  pageSize,
  hasMore,
  onPageChange,
}: AuditLogPaginationProps) {
  const totalPages = Math.ceil(totalItems / pageSize)
  const startItem = (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, totalItems)

  // Generate page numbers to display
  function getPageNumbers(): (number | 'gap')[] {
    const pages: (number | 'gap')[] = []
    const maxVisible = 7

    if (totalPages <= maxVisible) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }

    // Always show first page
    pages.push(1)

    // Calculate start and end of visible range
    let start = Math.max(2, currentPage - 2)
    let end = Math.min(totalPages - 1, currentPage + 2)

    // Adjust range if near edges
    if (currentPage <= 3) {
      end = Math.min(5, totalPages - 1)
    } else if (currentPage >= totalPages - 2) {
      start = Math.max(2, totalPages - 4)
    }

    // Add gap before if needed
    if (start > 2) {
      pages.push('gap')
    }

    // Add middle pages
    for (let i = start; i <= end; i++) {
      pages.push(i)
    }

    // Add gap after if needed
    if (end < totalPages - 1) {
      pages.push('gap')
    }

    // Always show last page
    if (totalPages > 1) {
      pages.push(totalPages)
    }

    return pages
  }

  if (totalItems === 0) {
    return null
  }

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-700 rounded-b-lg">
      {/* Results count */}
      <Text className="text-sm">
        Showing <span className="font-medium">{startItem}</span> to{' '}
        <span className="font-medium">{endItem}</span> of{' '}
        <span className="font-medium">{totalItems}</span> results
      </Text>

      {/* Page navigation */}
      <nav className="flex items-center gap-1" aria-label="Pagination">
        {/* Previous button */}
        <Button
          plain
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          aria-label="Previous page"
        >
          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
          <span className="sr-only sm:not-sr-only">Previous</span>
        </Button>

        {/* Page numbers */}
        <div className="hidden sm:flex items-center gap-1">
          {getPageNumbers().map((page, index) => {
            if (page === 'gap') {
              return (
                <span key={`gap-${index}`} className="px-3 py-1 text-zinc-500 dark:text-zinc-400">
                  ...
                </span>
              )
            }

            const isCurrent = page === currentPage
            return (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                disabled={isCurrent}
                aria-current={isCurrent ? 'page' : undefined}
                className={cn(
                  'min-w-[2.25rem] px-3 py-1 text-sm font-medium rounded-md transition-colors',
                  isCurrent
                    ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400'
                    : 'text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800'
                )}
              >
                {page}
              </button>
            )
          })}
        </div>

        {/* Mobile page indicator */}
        <span className="sm:hidden text-sm text-zinc-700 dark:text-zinc-300">
          Page {currentPage} of {totalPages}
        </span>

        {/* Next button */}
        <Button
          plain
          disabled={!hasMore}
          onClick={() => onPageChange(currentPage + 1)}
          aria-label="Next page"
        >
          <span className="sr-only sm:not-sr-only">Next</span>
          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </Button>
      </nav>
    </div>
  )
}
