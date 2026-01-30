/**
 * Task Link Parser Utility
 * Issue #103: Parse task links from AI messages for navigation
 *
 * Format: [Task: task-id | Task Title]
 * Example: [Task: abc-123 | Register Your Business Name]
 */

export interface TaskLink {
  /** Full matched string including brackets */
  fullMatch: string
  /** Task ID (UUID) */
  taskId: string
  /** Task title from the link */
  taskTitle: string
  /** Start index in the original string */
  startIndex: number
  /** End index in the original string */
  endIndex: number
}

/**
 * Regular expression to match task links
 * Format: [Task: <uuid> | <title>]
 * - uuid: Standard UUID format (8-4-4-4-12 hex chars)
 * - title: Any text until the closing bracket
 */
const TASK_LINK_REGEX = /\[Task:\s*([a-f0-9-]{36})\s*\|\s*([^\]]+)\]/gi

/**
 * Parse task links from a message string
 * @param content - The message content to parse
 * @returns Array of TaskLink objects found in the content
 */
export function parseTaskLinks(content: string): TaskLink[] {
  const links: TaskLink[] = []
  let match: RegExpExecArray | null

  // Reset regex lastIndex for fresh parsing
  TASK_LINK_REGEX.lastIndex = 0

  while ((match = TASK_LINK_REGEX.exec(content)) !== null) {
    links.push({
      fullMatch: match[0],
      taskId: match[1],
      taskTitle: match[2].trim(),
      startIndex: match.index,
      endIndex: match.index + match[0].length,
    })
  }

  return links
}

/**
 * Check if a string contains any task links
 * @param content - The message content to check
 * @returns True if content contains at least one task link
 */
export function hasTaskLinks(content: string): boolean {
  TASK_LINK_REGEX.lastIndex = 0
  return TASK_LINK_REGEX.test(content)
}

export interface ContentSegment {
  type: 'text' | 'task-link'
  content: string
  taskLink?: TaskLink
}

/**
 * Split content into segments of text and task links
 * This is useful for rendering the content with inline task link components
 * @param content - The message content to split
 * @returns Array of content segments
 */
export function splitContentWithTaskLinks(content: string): ContentSegment[] {
  const links = parseTaskLinks(content)

  if (links.length === 0) {
    return [{ type: 'text', content }]
  }

  const segments: ContentSegment[] = []
  let lastIndex = 0

  for (const link of links) {
    // Add text before this link
    if (link.startIndex > lastIndex) {
      segments.push({
        type: 'text',
        content: content.slice(lastIndex, link.startIndex),
      })
    }

    // Add the task link segment
    segments.push({
      type: 'task-link',
      content: link.fullMatch,
      taskLink: link,
    })

    lastIndex = link.endIndex
  }

  // Add remaining text after last link
  if (lastIndex < content.length) {
    segments.push({
      type: 'text',
      content: content.slice(lastIndex),
    })
  }

  return segments
}
