/**
 * CelebrationModal Component
 * Modal dialog for milestone celebrations with animations
 */
import { useEffect, useRef } from 'react'
import { motion } from 'motion/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { CelebrationConfetti } from './CelebrationConfetti'
import { CelebrationProgressRing } from './CelebrationProgressRing'
import type { Milestone } from '../../hooks/useMilestoneState'

export interface MilestoneConfig {
  title: string
  message: string
  emoji: string
  color: string
  bgGradient: string
}

interface CelebrationModalProps {
  config: MilestoneConfig
  milestone: Milestone
  onDismiss: () => void
}

function ModalContent({ config, milestone, onDismiss }: CelebrationModalProps) {
  return (
    <div className="relative z-10 p-8 text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', damping: 10, stiffness: 200 }}
        className="text-6xl mb-4"
      >
        {config.emoji}
      </motion.div>
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className={`text-2xl font-bold mb-2 ${config.color}`}
      >
        {config.title}
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-zinc-700 dark:text-zinc-300 mb-6"
      >
        {config.message}
      </motion.p>
      <CelebrationProgressRing percentage={milestone} />
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        onClick={onDismiss}
        className="mt-6 px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium rounded-full hover:from-indigo-600 hover:to-purple-600 transition-all shadow-lg hover:shadow-xl"
      >
        Keep Going!
      </motion.button>
    </div>
  )
}

export function CelebrationModal({ config, milestone, onDismiss }: CelebrationModalProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    timerRef.current = setTimeout(onDismiss, 8000)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [onDismiss])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
      onClick={onDismiss}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: 20 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-md overflow-hidden rounded-2xl bg-gradient-to-br ${config.bgGradient} bg-white dark:bg-zinc-800 shadow-2xl`}
      >
        <CelebrationConfetti />
        <button
          onClick={onDismiss}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors z-20"
          aria-label="Dismiss celebration"
        >
          <XMarkIcon className="h-5 w-5 text-zinc-600 dark:text-zinc-300" />
        </button>
        <ModalContent config={config} milestone={milestone} onDismiss={onDismiss} />
      </motion.div>
    </motion.div>
  )
}
