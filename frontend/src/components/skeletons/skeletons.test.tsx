import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { GreetingHeaderSkeleton } from './GreetingHeaderSkeleton'
import { ProgressOverviewSkeleton } from './ProgressOverviewSkeleton'
import { QuickStatsSkeleton } from './QuickStatsSkeleton'
import { RecentActivitySkeleton } from './RecentActivitySkeleton'
import { Skeleton } from './Skeleton'

describe('Skeleton - base component', () => {
  it('renders without crashing', () => {
    const { container } = render(<Skeleton />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('has animate-pulse class for loading animation', () => {
    const { container } = render(<Skeleton />)
    expect(container.firstChild).toHaveClass('animate-pulse')
  })

  it('applies rectangular variant by default', () => {
    const { container } = render(<Skeleton />)
    expect(container.firstChild).toHaveClass('rounded-lg')
  })

  it('applies circular variant correctly', () => {
    const { container } = render(<Skeleton variant="circular" />)
    expect(container.firstChild).toHaveClass('rounded-full')
  })

  it('applies text variant correctly', () => {
    const { container } = render(<Skeleton variant="text" />)
    expect(container.firstChild).toHaveClass('rounded')
  })

  it('applies width and height as pixels when numbers are provided', () => {
    const { container } = render(<Skeleton width={100} height={50} />)
    const element = container.firstChild as HTMLElement
    expect(element.style.width).toBe('100px')
    expect(element.style.height).toBe('50px')
  })

  it('applies width and height as-is when strings are provided', () => {
    const { container } = render(<Skeleton width="50%" height="2rem" />)
    const element = container.firstChild as HTMLElement
    expect(element.style.width).toBe('50%')
    expect(element.style.height).toBe('2rem')
  })

  it('applies custom className', () => {
    const { container } = render(<Skeleton className="custom-class" />)
    expect(container.firstChild).toHaveClass('custom-class')
  })
})

describe('GreetingHeaderSkeleton', () => {
  it('renders without crashing', () => {
    const { container } = render(<GreetingHeaderSkeleton />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('contains skeleton elements with animate-pulse class', () => {
    const { container } = render(<GreetingHeaderSkeleton />)
    const skeletons = container.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('renders two skeleton elements for greeting and subtitle', () => {
    const { container } = render(<GreetingHeaderSkeleton />)
    const skeletons = container.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBe(2)
  })
})

describe('RecentActivitySkeleton', () => {
  it('renders without crashing', () => {
    const { container } = render(<RecentActivitySkeleton />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('contains skeleton elements with animate-pulse class', () => {
    const { container } = render(<RecentActivitySkeleton />)
    const skeletons = container.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('renders default 3 activity items', () => {
    render(<RecentActivitySkeleton />)
    // Each activity item has a circular icon skeleton
    const circularSkeletons = screen.getAllByText('', { selector: '.rounded-full' })
    expect(circularSkeletons.length).toBe(3)
  })

  it('renders custom itemCount when provided', () => {
    render(<RecentActivitySkeleton itemCount={5} />)
    const circularSkeletons = screen.getAllByText('', { selector: '.rounded-full' })
    expect(circularSkeletons.length).toBe(5)
  })

  it('renders single item when itemCount is 1', () => {
    render(<RecentActivitySkeleton itemCount={1} />)
    const circularSkeletons = screen.getAllByText('', { selector: '.rounded-full' })
    expect(circularSkeletons.length).toBe(1)
  })
})

describe('QuickStatsSkeleton', () => {
  it('renders without crashing', () => {
    const { container } = render(<QuickStatsSkeleton />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('contains skeleton elements with animate-pulse class', () => {
    const { container } = render(<QuickStatsSkeleton />)
    const skeletons = container.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('renders default 3 stat items', () => {
    const { container } = render(<QuickStatsSkeleton />)
    // Each stat item has 2 skeletons (label + value), plus 1 for header = 7 total
    const skeletons = container.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBe(7) // 1 header + 3 stats * 2 elements each
  })

  it('renders custom statCount when provided', () => {
    const { container } = render(<QuickStatsSkeleton statCount={5} />)
    const skeletons = container.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBe(11) // 1 header + 5 stats * 2 elements each
  })

  it('renders single stat when statCount is 1', () => {
    const { container } = render(<QuickStatsSkeleton statCount={1} />)
    const skeletons = container.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBe(3) // 1 header + 1 stat * 2 elements
  })
})

describe('ProgressOverviewSkeleton', () => {
  it('renders without crashing', () => {
    const { container } = render(<ProgressOverviewSkeleton />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('contains skeleton elements with animate-pulse class', () => {
    const { container } = render(<ProgressOverviewSkeleton />)
    const skeletons = container.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('renders default 4 phase items', () => {
    const { container } = render(<ProgressOverviewSkeleton />)
    // Each phase has 3 skeletons (label, count, progress bar)
    // Plus 2 header items (title, badge) and 1 view all link = 15 total
    const skeletons = container.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBe(15) // 2 header + 4 phases * 3 elements + 1 link
  })

  it('renders custom phaseCount when provided', () => {
    const { container } = render(<ProgressOverviewSkeleton phaseCount={2} />)
    const skeletons = container.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBe(9) // 2 header + 2 phases * 3 elements + 1 link
  })

  it('renders single phase when phaseCount is 1', () => {
    const { container } = render(<ProgressOverviewSkeleton phaseCount={1} />)
    const skeletons = container.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBe(6) // 2 header + 1 phase * 3 elements + 1 link
  })
})
