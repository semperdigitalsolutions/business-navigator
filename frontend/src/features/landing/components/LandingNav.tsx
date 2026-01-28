/**
 * Landing Page Navigation
 * Sticky nav with transparent-to-blur background on scroll
 */
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/catalyst-ui-kit/typescript/button'

interface LandingNavProps {
  onJoinBeta: () => void
}

export function LandingNav({ onJoinBeta }: LandingNavProps) {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/80 shadow-sm backdrop-blur-lg dark:bg-zinc-950/80' : 'bg-transparent'
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="text-xl font-bold text-zinc-950 dark:text-white">
          Business Navigator
        </Link>
        <div className="flex items-center gap-4">
          <Link
            to="/login"
            className="text-sm font-medium text-zinc-700 transition-colors hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white"
          >
            Sign In
          </Link>
          <Button color="indigo" onClick={onJoinBeta}>
            Join Beta
          </Button>
        </div>
      </div>
    </header>
  )
}
