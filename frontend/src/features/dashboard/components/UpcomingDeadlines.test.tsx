import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { UpcomingDeadlines } from './UpcomingDeadlines'
import type { UserTask } from '@shared/types'

// Helper to create mock tasks with due dates
function createMockTask(overrides: Partial<UserTask> = {}): UserTask {
  return {
    id: 'task-1',
    userId: 'user-1',
    title: 'Test Task',
    description: 'Test Description',
    category: 'legal',
    priority: 'medium',
    status: 'pending',
    priorityOrder: 1,
    isHeroTask: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

// Helper to create a date with local timezone noon (avoids day boundary issues)
function createLocalDate(year: number, month: number, day: number): Date {
  const date = new Date(year, month - 1, day, 12, 0, 0)
  return date
}

// Wrapper component with router for Link components
function renderWithRouter(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>)
}

describe('UpcomingDeadlines', () => {
  // Use fixed date for consistent testing (local time noon)
  const fixedDate = createLocalDate(2025, 1, 15)

  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(fixedDate)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('rendering deadlines', () => {
    it('renders deadlines correctly with title and due date', () => {
      const tasks: UserTask[] = [
        createMockTask({
          id: 'task-1',
          title: 'File Business Registration',
          dueDate: createLocalDate(2025, 1, 20),
        }),
      ]

      renderWithRouter(<UpcomingDeadlines tasks={tasks} />)

      expect(screen.getByText('Upcoming Deadlines')).toBeInTheDocument()
      expect(screen.getByText('File Business Registration')).toBeInTheDocument()
      expect(screen.getByText('Jan 20')).toBeInTheDocument()
    })

    it('renders multiple deadlines', () => {
      const tasks: UserTask[] = [
        createMockTask({
          id: 'task-1',
          title: 'File Business Registration',
          dueDate: createLocalDate(2025, 1, 20),
        }),
        createMockTask({
          id: 'task-2',
          title: 'Submit Tax Forms',
          dueDate: createLocalDate(2025, 1, 25),
        }),
        createMockTask({
          id: 'task-3',
          title: 'Apply for EIN',
          dueDate: createLocalDate(2025, 1, 30),
        }),
      ]

      renderWithRouter(<UpcomingDeadlines tasks={tasks} />)

      expect(screen.getByText('File Business Registration')).toBeInTheDocument()
      expect(screen.getByText('Submit Tax Forms')).toBeInTheDocument()
      expect(screen.getByText('Apply for EIN')).toBeInTheDocument()
    })

    it('filters out tasks without due dates', () => {
      const tasks: UserTask[] = [
        createMockTask({
          id: 'task-1',
          title: 'Task With Due Date',
          dueDate: createLocalDate(2025, 1, 20),
        }),
        createMockTask({
          id: 'task-2',
          title: 'Task Without Due Date',
          dueDate: undefined,
        }),
      ]

      renderWithRouter(<UpcomingDeadlines tasks={tasks} />)

      expect(screen.getByText('Task With Due Date')).toBeInTheDocument()
      expect(screen.queryByText('Task Without Due Date')).not.toBeInTheDocument()
    })

    it('renders deadline links that navigate to task detail', () => {
      const tasks: UserTask[] = [
        createMockTask({
          id: 'task-123',
          title: 'File Business Registration',
          dueDate: createLocalDate(2025, 1, 20),
        }),
      ]

      renderWithRouter(<UpcomingDeadlines tasks={tasks} />)

      const link = screen.getByRole('link', { name: /File Business Registration/i })
      expect(link).toHaveAttribute('href', '/tasks/task-123')
    })
  })

  describe('empty state', () => {
    it('displays empty state when no tasks provided', () => {
      renderWithRouter(<UpcomingDeadlines tasks={[]} />)

      expect(screen.getByText('Upcoming Deadlines')).toBeInTheDocument()
      expect(screen.getByText("You're all caught up!")).toBeInTheDocument()
    })

    it('displays empty state when all tasks lack due dates', () => {
      const tasks: UserTask[] = [
        createMockTask({ id: 'task-1', title: 'Task 1', dueDate: undefined }),
        createMockTask({ id: 'task-2', title: 'Task 2', dueDate: undefined }),
      ]

      renderWithRouter(<UpcomingDeadlines tasks={tasks} />)

      expect(screen.getByText("You're all caught up!")).toBeInTheDocument()
    })
  })

  describe('sorting by due date (most urgent first)', () => {
    it('sorts deadlines by due date ascending', () => {
      const tasks: UserTask[] = [
        createMockTask({
          id: 'task-3',
          title: 'Distant Deadline',
          dueDate: createLocalDate(2025, 2, 15),
        }),
        createMockTask({
          id: 'task-1',
          title: 'Urgent Deadline',
          dueDate: createLocalDate(2025, 1, 16),
        }),
        createMockTask({
          id: 'task-2',
          title: 'Soon Deadline',
          dueDate: createLocalDate(2025, 1, 22),
        }),
      ]

      renderWithRouter(<UpcomingDeadlines tasks={tasks} />)

      // Get all task title elements
      const taskTitles = screen.getAllByText(/Deadline$/)

      // Verify order: most urgent first
      expect(taskTitles[0]).toHaveTextContent('Urgent Deadline')
      expect(taskTitles[1]).toHaveTextContent('Soon Deadline')
      expect(taskTitles[2]).toHaveTextContent('Distant Deadline')
    })

    it('places overdue tasks before upcoming tasks', () => {
      const tasks: UserTask[] = [
        createMockTask({
          id: 'task-1',
          title: 'Future Task',
          dueDate: createLocalDate(2025, 1, 20),
        }),
        createMockTask({
          id: 'task-2',
          title: 'Overdue Task',
          dueDate: createLocalDate(2025, 1, 10), // Before fixedDate (Jan 15)
        }),
      ]

      renderWithRouter(<UpcomingDeadlines tasks={tasks} />)

      const taskTitles = screen.getAllByText(/Task$/)

      // Overdue should appear first
      expect(taskTitles[0]).toHaveTextContent('Overdue Task')
      expect(taskTitles[1]).toHaveTextContent('Future Task')
    })
  })

  describe('maxVisible prop', () => {
    it('limits displayed deadlines to default of 3', () => {
      const tasks: UserTask[] = [
        createMockTask({ id: '1', title: 'Deadline 1', dueDate: createLocalDate(2025, 1, 16) }),
        createMockTask({ id: '2', title: 'Deadline 2', dueDate: createLocalDate(2025, 1, 17) }),
        createMockTask({ id: '3', title: 'Deadline 3', dueDate: createLocalDate(2025, 1, 18) }),
        createMockTask({ id: '4', title: 'Deadline 4', dueDate: createLocalDate(2025, 1, 19) }),
        createMockTask({ id: '5', title: 'Deadline 5', dueDate: createLocalDate(2025, 1, 20) }),
      ]

      renderWithRouter(<UpcomingDeadlines tasks={tasks} />)

      expect(screen.getByText('Deadline 1')).toBeInTheDocument()
      expect(screen.getByText('Deadline 2')).toBeInTheDocument()
      expect(screen.getByText('Deadline 3')).toBeInTheDocument()
      expect(screen.queryByText('Deadline 4')).not.toBeInTheDocument()
      expect(screen.queryByText('Deadline 5')).not.toBeInTheDocument()
    })

    it('respects custom maxVisible prop', () => {
      const tasks: UserTask[] = [
        createMockTask({ id: '1', title: 'Deadline 1', dueDate: createLocalDate(2025, 1, 16) }),
        createMockTask({ id: '2', title: 'Deadline 2', dueDate: createLocalDate(2025, 1, 17) }),
        createMockTask({ id: '3', title: 'Deadline 3', dueDate: createLocalDate(2025, 1, 18) }),
        createMockTask({ id: '4', title: 'Deadline 4', dueDate: createLocalDate(2025, 1, 19) }),
        createMockTask({ id: '5', title: 'Deadline 5', dueDate: createLocalDate(2025, 1, 20) }),
      ]

      renderWithRouter(<UpcomingDeadlines tasks={tasks} maxVisible={2} />)

      expect(screen.getByText('Deadline 1')).toBeInTheDocument()
      expect(screen.getByText('Deadline 2')).toBeInTheDocument()
      expect(screen.queryByText('Deadline 3')).not.toBeInTheDocument()
    })

    it('shows "View all" link when there are more deadlines than maxVisible', () => {
      const tasks: UserTask[] = [
        createMockTask({ id: '1', title: 'Deadline 1', dueDate: createLocalDate(2025, 1, 16) }),
        createMockTask({ id: '2', title: 'Deadline 2', dueDate: createLocalDate(2025, 1, 17) }),
        createMockTask({ id: '3', title: 'Deadline 3', dueDate: createLocalDate(2025, 1, 18) }),
        createMockTask({ id: '4', title: 'Deadline 4', dueDate: createLocalDate(2025, 1, 19) }),
      ]

      renderWithRouter(<UpcomingDeadlines tasks={tasks} maxVisible={3} />)

      const viewAllLink = screen.getByRole('link', { name: /View all deadlines/i })
      expect(viewAllLink).toBeInTheDocument()
      expect(viewAllLink).toHaveAttribute('href', '/deadlines')
    })

    it('does not show "View all" link when deadlines fit within maxVisible', () => {
      const tasks: UserTask[] = [
        createMockTask({ id: '1', title: 'Deadline 1', dueDate: createLocalDate(2025, 1, 16) }),
        createMockTask({ id: '2', title: 'Deadline 2', dueDate: createLocalDate(2025, 1, 17) }),
      ]

      renderWithRouter(<UpcomingDeadlines tasks={tasks} maxVisible={3} />)

      expect(screen.queryByRole('link', { name: /View all deadlines/i })).not.toBeInTheDocument()
    })

    it('shows most urgent deadlines when limited by maxVisible', () => {
      const tasks: UserTask[] = [
        createMockTask({
          id: 'distant',
          title: 'Distant Task',
          dueDate: createLocalDate(2025, 2, 1),
        }),
        createMockTask({
          id: 'urgent',
          title: 'Urgent Task',
          dueDate: createLocalDate(2025, 1, 16),
        }),
        createMockTask({
          id: 'medium',
          title: 'Medium Task',
          dueDate: createLocalDate(2025, 1, 20),
        }),
      ]

      renderWithRouter(<UpcomingDeadlines tasks={tasks} maxVisible={2} />)

      // Should show only the 2 most urgent (Urgent, Medium)
      expect(screen.getByText('Urgent Task')).toBeInTheDocument()
      expect(screen.getByText('Medium Task')).toBeInTheDocument()
      expect(screen.queryByText('Distant Task')).not.toBeInTheDocument()
    })
  })

  describe('urgency indicators', () => {
    it('shows urgent indicator for tasks due within 7 days', () => {
      const tasks: UserTask[] = [
        createMockTask({
          id: 'task-1',
          title: 'Urgent Task',
          dueDate: createLocalDate(2025, 1, 17), // 2 days from fixedDate
        }),
      ]

      renderWithRouter(<UpcomingDeadlines tasks={tasks} />)

      expect(screen.getByText('2 days left')).toBeInTheDocument()
    })

    it('shows overdue indicator for past due tasks', () => {
      const tasks: UserTask[] = [
        createMockTask({
          id: 'task-1',
          title: 'Overdue Task',
          dueDate: createLocalDate(2025, 1, 12), // 3 days before fixedDate
        }),
      ]

      renderWithRouter(<UpcomingDeadlines tasks={tasks} />)

      expect(screen.getByText('3 days overdue')).toBeInTheDocument()
    })

    it('shows "Due today" for tasks due today', () => {
      const tasks: UserTask[] = [
        createMockTask({
          id: 'task-1',
          title: 'Today Task',
          dueDate: createLocalDate(2025, 1, 15), // Same as fixedDate
        }),
      ]

      renderWithRouter(<UpcomingDeadlines tasks={tasks} />)

      expect(screen.getByText('Due today')).toBeInTheDocument()
    })

    it('shows "Due tomorrow" for tasks due tomorrow', () => {
      const tasks: UserTask[] = [
        createMockTask({
          id: 'task-1',
          title: 'Tomorrow Task',
          dueDate: createLocalDate(2025, 1, 16), // 1 day from fixedDate
        }),
      ]

      renderWithRouter(<UpcomingDeadlines tasks={tasks} />)

      expect(screen.getByText('Due tomorrow')).toBeInTheDocument()
    })
  })

  describe('className prop', () => {
    it('applies additional className to the component', () => {
      const tasks: UserTask[] = [
        createMockTask({
          id: 'task-1',
          title: 'Test Task',
          dueDate: createLocalDate(2025, 1, 20),
        }),
      ]

      const { container } = renderWithRouter(
        <UpcomingDeadlines tasks={tasks} className="custom-class" />
      )

      // The Card component should have the custom class
      const card = container.querySelector('.custom-class')
      expect(card).toBeInTheDocument()
    })
  })
})
