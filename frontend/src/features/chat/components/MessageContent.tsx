/**
 * MessageContent Component
 * Issue #103: Render message content with inline task link chips
 *
 * Parses message text for task links and renders them as clickable TaskLinkChip components.
 */
import { useMemo } from 'react'
import { splitContentWithTaskLinks } from '../utils/parse-task-links'
import { TaskLinkChip } from './TaskLinkChip'

export interface MessageContentProps {
  /** The message content string */
  content: string
  /** Additional CSS classes for the container */
  className?: string
}

/**
 * MessageContent - Renders message text with inline task link chips
 *
 * Automatically detects task links in the format [Task: uuid | Title]
 * and renders them as clickable TaskLinkChip components.
 *
 * Text segments preserve whitespace for proper formatting.
 */
export function MessageContent({ content, className }: MessageContentProps) {
  const segments = useMemo(() => splitContentWithTaskLinks(content), [content])

  return (
    <span className={className}>
      {segments.map((segment, index) => {
        if (segment.type === 'task-link' && segment.taskLink) {
          return (
            <TaskLinkChip
              key={`task-${segment.taskLink.taskId}-${index}`}
              taskId={segment.taskLink.taskId}
              taskTitle={segment.taskLink.taskTitle}
              className="mx-0.5 align-middle"
            />
          )
        }

        // Text segment - preserve whitespace formatting
        return (
          <span key={`text-${index}`} className="whitespace-pre-wrap">
            {segment.content}
          </span>
        )
      })}
    </span>
  )
}
