/**
 * Footer Section - Landing page footer with links and copyright
 */
import { Link } from 'react-router-dom'

const currentYear = new Date().getFullYear()

export function FooterSection() {
  return (
    <footer className="border-t border-zinc-200 px-4 py-12 sm:px-6 lg:px-8 dark:border-zinc-800">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div>
            <Link to="/" className="text-lg font-bold text-zinc-950 dark:text-white">
              Business Navigator
            </Link>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              AI-powered business formation guidance.
            </p>
          </div>
          <div className="flex gap-6">
            <Link
              to="/login"
              className="text-sm text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="text-sm text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white"
            >
              Register
            </Link>
          </div>
        </div>
        <div className="mt-8 border-t border-zinc-200 pt-8 dark:border-zinc-800">
          <p className="text-center text-xs text-zinc-500 dark:text-zinc-400">
            &copy; {currentYear} Business Navigator. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
