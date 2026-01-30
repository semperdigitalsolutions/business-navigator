/**
 * Tests for task link parser utility
 * Issue #103: Parse task links from AI messages
 */
import { describe, expect, it } from 'vitest'
import { hasTaskLinks, parseTaskLinks, splitContentWithTaskLinks } from './parse-task-links'

describe('parseTaskLinks', () => {
  it('should return empty array for text without task links', () => {
    const content = 'This is a regular message without any task links.'
    const result = parseTaskLinks(content)
    expect(result).toEqual([])
  })

  it('should parse a single task link', () => {
    const content =
      'I recommend you start with [Task: 11111111-1111-1111-1111-111111111108 | Choose Your Business Name]'
    const result = parseTaskLinks(content)

    expect(result).toHaveLength(1)
    expect(result[0].taskId).toBe('11111111-1111-1111-1111-111111111108')
    expect(result[0].taskTitle).toBe('Choose Your Business Name')
    expect(result[0].fullMatch).toBe(
      '[Task: 11111111-1111-1111-1111-111111111108 | Choose Your Business Name]'
    )
    expect(result[0].startIndex).toBe(27)
    // endIndex = startIndex + fullMatch.length
    expect(result[0].endIndex).toBe(27 + result[0].fullMatch.length)
  })

  it('should parse multiple task links', () => {
    const content =
      'Start with [Task: aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa | Task One] then do [Task: bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb | Task Two]'
    const result = parseTaskLinks(content)

    expect(result).toHaveLength(2)
    expect(result[0].taskId).toBe('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa')
    expect(result[0].taskTitle).toBe('Task One')
    expect(result[1].taskId).toBe('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb')
    expect(result[1].taskTitle).toBe('Task Two')
  })

  it('should handle task links with extra whitespace', () => {
    const content = '[Task:   12345678-1234-1234-1234-123456789012   |   Spaced Title   ]'
    const result = parseTaskLinks(content)

    expect(result).toHaveLength(1)
    expect(result[0].taskId).toBe('12345678-1234-1234-1234-123456789012')
    expect(result[0].taskTitle).toBe('Spaced Title')
  })

  it('should be case-insensitive for the Task prefix', () => {
    const content = '[TASK: 12345678-1234-1234-1234-123456789012 | Upper Case]'
    const result = parseTaskLinks(content)

    expect(result).toHaveLength(1)
    expect(result[0].taskTitle).toBe('Upper Case')
  })
})

describe('hasTaskLinks', () => {
  it('should return false for text without task links', () => {
    expect(hasTaskLinks('Regular text')).toBe(false)
    expect(hasTaskLinks('[Not a task link]')).toBe(false)
    expect(hasTaskLinks('[Task: invalid-uuid | Title]')).toBe(false)
  })

  it('should return true for text with task links', () => {
    expect(hasTaskLinks('[Task: 12345678-1234-1234-1234-123456789012 | Title]')).toBe(true)
  })
})

describe('splitContentWithTaskLinks', () => {
  it('should return single text segment for content without links', () => {
    const content = 'Just regular text'
    const result = splitContentWithTaskLinks(content)

    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({ type: 'text', content: 'Just regular text' })
  })

  it('should split content with task link in the middle', () => {
    const content = 'Before [Task: 12345678-1234-1234-1234-123456789012 | The Task] after'
    const result = splitContentWithTaskLinks(content)

    expect(result).toHaveLength(3)
    expect(result[0]).toEqual({ type: 'text', content: 'Before ' })
    expect(result[1].type).toBe('task-link')
    expect(result[1].taskLink?.taskId).toBe('12345678-1234-1234-1234-123456789012')
    expect(result[2]).toEqual({ type: 'text', content: ' after' })
  })

  it('should handle task link at the start', () => {
    const content = '[Task: 12345678-1234-1234-1234-123456789012 | First] then text'
    const result = splitContentWithTaskLinks(content)

    expect(result).toHaveLength(2)
    expect(result[0].type).toBe('task-link')
    expect(result[1]).toEqual({ type: 'text', content: ' then text' })
  })

  it('should handle task link at the end', () => {
    const content = 'Text then [Task: 12345678-1234-1234-1234-123456789012 | Last]'
    const result = splitContentWithTaskLinks(content)

    expect(result).toHaveLength(2)
    expect(result[0]).toEqual({ type: 'text', content: 'Text then ' })
    expect(result[1].type).toBe('task-link')
  })

  it('should handle consecutive task links', () => {
    const content =
      '[Task: aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa | One][Task: bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb | Two]'
    const result = splitContentWithTaskLinks(content)

    expect(result).toHaveLength(2)
    expect(result[0].type).toBe('task-link')
    expect(result[1].type).toBe('task-link')
  })
})
