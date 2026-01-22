import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { TaskDetailPage } from './TaskDetailPage'

// Mock the API client
vi.mock('@/lib/api/client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

// Mock useBlocker
const mockBlocker = {
  state: 'unblocked' as 'unblocked' | 'blocked' | 'proceeding',
  reset: vi.fn(),
  proceed: vi.fn(),
}

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useBlocker: vi.fn(() => mockBlocker),
  }
})

import { apiClient } from '@/lib/api/client'

const mockTask = {
  id: 'task-1',
  title: 'Test Task',
  description: 'Test Description',
  icon: '📋',
  phase: 'ideation' as const,
  phaseName: 'Ideation',
  estimatedTime: '30 min',
  status: 'in_progress',
  content: 'Task content here',
  completionData: {},
}

function renderWithRouter() {
  return render(
    <MemoryRouter initialEntries={['/tasks/task-1']}>
      <Routes>
        <Route path="/tasks/:taskId" element={<TaskDetailPage />} />
        <Route path="/tasks" element={<div>Tasks List</div>} />
      </Routes>
    </MemoryRouter>
  )
}

describe('TaskDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockBlocker.state = 'unblocked'
    vi.mocked(apiClient.get).mockResolvedValue({
      success: true,
      data: mockTask,
    })
  })

  it('renders task details when loaded', async () => {
    renderWithRouter()

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Test Task' })).toBeInTheDocument()
    })

    expect(screen.getByText('Test Description')).toBeInTheDocument()
    expect(screen.getAllByText('Ideation').length).toBeGreaterThanOrEqual(1)
  })

  it('shows loading state initially', () => {
    vi.mocked(apiClient.get).mockImplementation(() => new Promise(() => {}))
    renderWithRouter()

    expect(screen.getByText('Loading task...')).toBeInTheDocument()
  })

  it('shows error state when task not found', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      success: false,
      data: null,
    })

    renderWithRouter()

    await waitFor(() => {
      expect(screen.getByText('Task not found')).toBeInTheDocument()
    })
  })

  it('shows UnsavedChangesDialog when navigation is blocked', async () => {
    mockBlocker.state = 'blocked'

    renderWithRouter()

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Test Task' })).toBeInTheDocument()
    })

    // The dialog should be visible because blocker.state is 'blocked'
    expect(screen.getByText('You have unsaved changes')).toBeInTheDocument()
    expect(screen.getByText('Discard Changes')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
    expect(screen.getByText('Save & Leave')).toBeInTheDocument()
  })

  it('updates draft when notes are changed', async () => {
    renderWithRouter()

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Test Task' })).toBeInTheDocument()
    })

    const textarea = screen.getByPlaceholderText('Add any notes about this task...')
    fireEvent.change(textarea, { target: { value: 'New notes' } })

    // The component should have called updateDraft internally
    // We verify the textarea value changed
    expect(textarea).toHaveValue('New notes')
  })
})
