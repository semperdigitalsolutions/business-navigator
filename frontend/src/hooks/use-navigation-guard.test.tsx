import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { useNavigationGuard } from './use-navigation-guard'

// Mock useBlocker from react-router-dom
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

function wrapper({ children }: { children: React.ReactNode }) {
  return <MemoryRouter>{children}</MemoryRouter>
}

describe('useNavigationGuard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockBlocker.state = 'unblocked'
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns dialogProps with isOpen false when not blocked', () => {
    const { result } = renderHook(() => useNavigationGuard({ isDirty: false }), { wrapper })

    expect(result.current.dialogProps.isOpen).toBe(false)
    expect(result.current.dialogProps.isSaving).toBe(false)
  })

  it('returns dialogProps with isOpen true when blocked', () => {
    mockBlocker.state = 'blocked'

    const { result } = renderHook(() => useNavigationGuard({ isDirty: true }), { wrapper })

    expect(result.current.dialogProps.isOpen).toBe(true)
  })

  it('calls blocker.reset when onCancel is called', () => {
    mockBlocker.state = 'blocked'

    const { result } = renderHook(() => useNavigationGuard({ isDirty: true }), { wrapper })

    act(() => {
      result.current.dialogProps.onCancel()
    })

    expect(mockBlocker.reset).toHaveBeenCalled()
  })

  it('calls blocker.proceed when onConfirmLeave is called', () => {
    mockBlocker.state = 'blocked'

    const { result } = renderHook(() => useNavigationGuard({ isDirty: true }), { wrapper })

    act(() => {
      result.current.dialogProps.onConfirmLeave()
    })

    expect(mockBlocker.proceed).toHaveBeenCalled()
  })

  it('calls onSave and then proceeds when onSaveAndLeave is called', async () => {
    mockBlocker.state = 'blocked'
    const onSave = vi.fn().mockResolvedValue(undefined)

    const { result } = renderHook(() => useNavigationGuard({ isDirty: true, onSave }), { wrapper })

    await act(async () => {
      await result.current.dialogProps.onSaveAndLeave()
    })

    expect(onSave).toHaveBeenCalled()
    expect(mockBlocker.proceed).toHaveBeenCalled()
  })

  it('does not proceed if onSave throws', async () => {
    mockBlocker.state = 'blocked'
    const onSave = vi.fn().mockRejectedValue(new Error('Save failed'))

    const { result } = renderHook(() => useNavigationGuard({ isDirty: true, onSave }), { wrapper })

    await act(async () => {
      await result.current.dialogProps.onSaveAndLeave()
    })

    expect(onSave).toHaveBeenCalled()
    expect(mockBlocker.proceed).not.toHaveBeenCalled()
  })

  it('sets isSaving to true while saving', async () => {
    mockBlocker.state = 'blocked'
    let resolvePromise: () => void
    const savePromise = new Promise<void>((resolve) => {
      resolvePromise = resolve
    })
    const onSave = vi.fn().mockReturnValue(savePromise)

    const { result } = renderHook(() => useNavigationGuard({ isDirty: true, onSave }), { wrapper })

    expect(result.current.dialogProps.isSaving).toBe(false)

    let saveAndLeavePromise: Promise<void>
    act(() => {
      saveAndLeavePromise = result.current.dialogProps.onSaveAndLeave()
    })

    expect(result.current.dialogProps.isSaving).toBe(true)

    await act(async () => {
      resolvePromise!()
      await saveAndLeavePromise
    })
  })
})
