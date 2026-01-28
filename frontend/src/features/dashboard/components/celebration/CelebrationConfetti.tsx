/**
 * CelebrationConfetti Component
 * Animated confetti particles for milestone celebrations
 */
import { useMemo } from 'react'
import { motion } from 'motion/react'

interface ConfettiParticle {
  x: number
  y: number
  rotate: number
  duration: number
  delay: number
  color: string
}

const CONFETTI_COLORS = ['#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#6366F1']

function generateConfettiParticles(count: number): ConfettiParticle[] {
  return Array.from({ length: count }, (_, i) => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    rotate: Math.random() * 360,
    duration: 1.5 + Math.random(),
    delay: Math.random() * 0.3,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  }))
}

function ConfettiParticleElement({ particle }: { particle: ConfettiParticle }) {
  const animateProps = {
    x: `${particle.x}%`,
    y: `${particle.y}%`,
    scale: [0, 1, 0.5],
    rotate: particle.rotate,
  }

  return (
    <motion.div
      initial={{ x: '50%', y: '50%', scale: 0 }}
      animate={animateProps}
      transition={{ duration: particle.duration, delay: particle.delay, ease: 'easeOut' }}
      className="absolute w-2 h-2 rounded-full"
      style={{ backgroundColor: particle.color }}
    />
  )
}

export function CelebrationConfetti() {
  const particles = useMemo(() => generateConfettiParticles(30), [])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle, i) => (
        <ConfettiParticleElement key={i} particle={particle} />
      ))}
    </div>
  )
}
