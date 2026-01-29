/**
 * MarkdownContent Component
 *
 * Renders markdown content as styled HTML for educational content in the task system.
 * Supports headings, lists, bold, links, code blocks, and images with responsive styling.
 *
 * Features:
 * - Markdown to HTML rendering with consistent typography
 * - Optional "Continue reading" expander for long content
 * - Reading time estimation
 * - Reading progress indicator
 *
 * @requires react-markdown and remark-gfm packages
 * Install with: bun add react-markdown remark-gfm
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { cn } from '@/utils/classnames'

export interface MarkdownContentProps {
  /** The markdown string to render */
  content: string
  /** Additional classes for the container */
  className?: string
  /** If provided, truncate with "Continue reading" expander when content exceeds this height */
  maxHeight?: number
  /** Show estimated reading time (default: false) */
  showReadingTime?: boolean
  /** Show reading progress bar (default: false) */
  showProgress?: boolean
}

/** Calculate estimated reading time based on word count */
function calculateReadingTime(text: string): number {
  const wordsPerMinute = 200
  const words = text.trim().split(/\s+/).length
  return Math.ceil(words / wordsPerMinute)
}

/** Custom components for ReactMarkdown to apply Tailwind styling */
const markdownComponents = {
  h1: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1
      {...props}
      className="mb-4 mt-6 text-2xl font-semibold text-zinc-900 first:mt-0 dark:text-white"
    >
      {children}
    </h1>
  ),
  h2: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2
      {...props}
      className="mb-3 mt-5 text-xl font-semibold text-zinc-900 first:mt-0 dark:text-white"
    >
      {children}
    </h2>
  ),
  h3: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3
      {...props}
      className="mb-2 mt-4 text-lg font-semibold text-zinc-900 first:mt-0 dark:text-white"
    >
      {children}
    </h3>
  ),
  h4: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h4
      {...props}
      className="mb-2 mt-3 text-base font-semibold text-zinc-900 first:mt-0 dark:text-white"
    >
      {children}
    </h4>
  ),
  p: ({ children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p {...props} className="mb-4 text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
      {children}
    </p>
  ),
  a: ({ children, href, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a
      {...props}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary-600 underline-offset-2 hover:underline dark:text-primary-400"
    >
      {children}
    </a>
  ),
  ul: ({ children, ...props }: React.HTMLAttributes<HTMLUListElement>) => (
    <ul {...props} className="mb-4 ml-6 list-disc space-y-1 text-zinc-600 dark:text-zinc-400">
      {children}
    </ul>
  ),
  ol: ({ children, ...props }: React.HTMLAttributes<HTMLOListElement>) => (
    <ol {...props} className="mb-4 ml-6 list-decimal space-y-1 text-zinc-600 dark:text-zinc-400">
      {children}
    </ol>
  ),
  li: ({ children, ...props }: React.HTMLAttributes<HTMLLIElement>) => (
    <li {...props} className="text-base leading-relaxed">
      {children}
    </li>
  ),
  strong: ({ children, ...props }: React.HTMLAttributes<HTMLElement>) => (
    <strong {...props} className="font-semibold text-zinc-900 dark:text-white">
      {children}
    </strong>
  ),
  em: ({ children, ...props }: React.HTMLAttributes<HTMLElement>) => (
    <em {...props} className="italic">
      {children}
    </em>
  ),
  code: ({ children, className, ...props }: React.HTMLAttributes<HTMLElement>) => {
    const isInline = !className?.includes('language-')
    const codeClass = isInline
      ? 'rounded border border-zinc-200 bg-zinc-100 px-1 py-0.5 text-sm font-medium text-zinc-800 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200'
      : className
    return (
      <code {...props} className={codeClass}>
        {children}
      </code>
    )
  },
  pre: ({ children, ...props }: React.HTMLAttributes<HTMLPreElement>) => (
    <pre
      {...props}
      className="mb-4 overflow-x-auto rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm dark:border-zinc-700 dark:bg-zinc-900"
    >
      {children}
    </pre>
  ),
  blockquote: ({ children, ...props }: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote
      {...props}
      className="mb-4 border-l-4 border-zinc-300 pl-4 italic text-zinc-600 dark:border-zinc-600 dark:text-zinc-400"
    >
      {children}
    </blockquote>
  ),
  img: ({ src, alt, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => (
    <img {...props} src={src} alt={alt} className="my-4 max-w-full rounded-lg" loading="lazy" />
  ),
  hr: () => <hr className="my-6 border-zinc-200 dark:border-zinc-700" />,
  table: ({ children, ...props }: React.HTMLAttributes<HTMLTableElement>) => (
    <div className="mb-4 overflow-x-auto">
      <table {...props} className="min-w-full border-collapse text-sm">
        {children}
      </table>
    </div>
  ),
  th: ({ children, ...props }: React.HTMLAttributes<HTMLTableCellElement>) => (
    <th
      {...props}
      className="border border-zinc-200 bg-zinc-100 px-3 py-2 text-left font-semibold text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
    >
      {children}
    </th>
  ),
  td: ({ children, ...props }: React.HTMLAttributes<HTMLTableCellElement>) => (
    <td
      {...props}
      className="border border-zinc-200 px-3 py-2 text-zinc-600 dark:border-zinc-700 dark:text-zinc-400"
    >
      {children}
    </td>
  ),
}

/** Reading time badge component */
function ReadingTimeBadge({ minutes }: { minutes: number }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      {minutes} min read
    </span>
  )
}

/** Progress bar component for reading progress */
function ProgressBar({ progress }: { progress: number }) {
  return (
    <div className="sticky top-0 z-10 h-1 w-full bg-zinc-200 dark:bg-zinc-700">
      <div
        className="h-full bg-primary-500 transition-all duration-150"
        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
      />
    </div>
  )
}

/** Expand/collapse button for truncated content */
function ExpandButton({ isExpanded, onClick }: { isExpanded: boolean; onClick: () => void }) {
  const label = isExpanded ? 'Show less' : 'Continue reading'
  const iconPath = isExpanded ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-center gap-1 rounded-lg bg-zinc-100 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
    >
      {label}
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={iconPath} />
      </svg>
    </button>
  )
}

/** Gradient overlay for truncated content */
function TruncationGradient() {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white to-transparent dark:from-zinc-900" />
  )
}

/** Hook to track scroll progress within a container */
function useScrollProgress(containerRef: React.RefObject<HTMLDivElement | null>, enabled: boolean) {
  const [progress, setProgress] = useState(0)

  const handleScroll = useCallback(() => {
    if (!containerRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current
    const newProgress =
      scrollHeight <= clientHeight ? 100 : (scrollTop / (scrollHeight - clientHeight)) * 100
    setProgress(newProgress)
  }, [containerRef])

  useEffect(() => {
    const container = containerRef.current
    if (!enabled || !container) return
    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [enabled, handleScroll, containerRef])

  return progress
}

/** Hook to detect if content needs truncation based on maxHeight */
function useTruncationDetection(
  contentRef: React.RefObject<HTMLDivElement | null>,
  content: string,
  maxHeight?: number
) {
  const [needsTruncation, setNeedsTruncation] = useState(false)

  useEffect(() => {
    if (maxHeight && contentRef.current) {
      setNeedsTruncation(contentRef.current.scrollHeight > maxHeight)
    }
  }, [content, maxHeight, contentRef])

  return needsTruncation
}

/** Container for the markdown content with optional truncation */
function ContentContainer({
  content,
  contentRef,
  containerRef,
  shouldTruncate,
  maxHeight,
  showProgress,
}: {
  content: string
  contentRef: React.RefObject<HTMLDivElement | null>
  containerRef: React.RefObject<HTMLDivElement | null>
  shouldTruncate: boolean
  maxHeight?: number
  showProgress: boolean
}) {
  const style = shouldTruncate ? { maxHeight, overflow: 'hidden' as const } : undefined
  return (
    <div
      ref={containerRef}
      className={cn('relative overflow-y-auto', showProgress && 'scroll-smooth')}
      style={style}
    >
      <div ref={contentRef}>
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
          {content}
        </ReactMarkdown>
      </div>
      {shouldTruncate && <TruncationGradient />}
    </div>
  )
}

export function MarkdownContent({
  content,
  className,
  maxHeight,
  showReadingTime = false,
  showProgress = false,
}: MarkdownContentProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const readingTime = calculateReadingTime(content)
  const scrollProgress = useScrollProgress(containerRef, showProgress)
  const needsTruncation = useTruncationDetection(contentRef, content, maxHeight)
  const shouldTruncate = Boolean(maxHeight && needsTruncation && !isExpanded)
  const showExpandButton = Boolean(maxHeight && needsTruncation)

  return (
    <div className={cn('relative', className)}>
      {showReadingTime && (
        <div className="mb-3">
          <ReadingTimeBadge minutes={readingTime} />
        </div>
      )}
      {showProgress && <ProgressBar progress={scrollProgress} />}
      <ContentContainer
        content={content}
        contentRef={contentRef}
        containerRef={containerRef}
        shouldTruncate={shouldTruncate}
        maxHeight={maxHeight}
        showProgress={showProgress}
      />
      {showExpandButton && (
        <div className={cn('mt-2', shouldTruncate && '-mt-8 relative z-10')}>
          <ExpandButton isExpanded={isExpanded} onClick={() => setIsExpanded(!isExpanded)} />
        </div>
      )}
    </div>
  )
}
