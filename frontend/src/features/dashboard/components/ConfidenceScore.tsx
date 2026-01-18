/**
 * ConfidenceScore Component
 * Circular progress widget showing overall confidence score and phase breakdown
 */
import { useState } from 'react'
import { Text } from '@/components/catalyst-ui-kit/typescript/text'
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline'
import type { ConfidenceScore as ConfidenceScoreType } from '@shared/types'

interface ConfidenceScoreProps {
  score: ConfidenceScoreType | null | undefined
}

export function ConfidenceScore({ score }: ConfidenceScoreProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (!score) {
    return (
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-zinc-950 dark:text-white mb-4">
          Confidence Score
        </h3>
        <div className="flex items-center justify-center h-48">
          <Text className="text-gray-500 dark:text-gray-400">Loading...</Text>
        </div>
      </div>
    )
  }

  const totalScore = score.total
  const getScoreColor = (value: number) => {
    if (value < 30) return 'text-red-600 dark:text-red-400'
    if (value < 70) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-green-600 dark:text-green-400'
  }

  const getScoreLabel = (value: number) => {
    if (value < 30) return 'Getting Started'
    if (value < 50) return 'Making Progress'
    if (value < 70) return 'On Track'
    if (value < 90) return 'Almost There'
    return 'Ready to Launch!'
  }

  const phases = [
    { name: 'Ideation', score: score.ideation, color: 'bg-purple-500' },
    { name: 'Legal Formation', score: score.legal, color: 'bg-blue-500' },
    { name: 'Financial Setup', score: score.financial, color: 'bg-green-500' },
    { name: 'Launch Prep', score: score.launchPrep, color: 'bg-orange-500' },
  ]

  // SVG circle properties
  const size = 180
  const strokeWidth = 12
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (totalScore / 100) * circumference

  return (
    <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-zinc-950 dark:text-white">Confidence Score</h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1"
        >
          {isExpanded ? (
            <>
              Hide Details
              <ChevronUpIcon className="h-4 w-4" />
            </>
          ) : (
            <>
              Show Details
              <ChevronDownIcon className="h-4 w-4" />
            </>
          )}
        </button>
      </div>

      {/* Circular Progress */}
      <div className="flex flex-col items-center mb-6">
        <div className="relative" style={{ width: size, height: size }}>
          {/* Background circle */}
          <svg className="transform -rotate-90" width={size} height={size}>
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="currentColor"
              strokeWidth={strokeWidth}
              fill="none"
              className="text-gray-200 dark:text-gray-700"
            />
            {/* Progress circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="currentColor"
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              className={`${getScoreColor(totalScore)} transition-all duration-1000 ease-out`}
            />
          </svg>

          {/* Score text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-5xl font-bold ${getScoreColor(totalScore)}`}>
              {totalScore}
              <span className="text-2xl">%</span>
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {getScoreLabel(totalScore)}
            </span>
          </div>
        </div>
      </div>

      {/* Phase Breakdown */}
      {isExpanded && (
        <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Phase Breakdown
          </Text>
          {phases.map((phase) => (
            <div key={phase.name} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-700 dark:text-gray-300">{phase.name}</span>
                <span className="font-medium text-zinc-950 dark:text-white">{phase.score}%</span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full ${phase.color} transition-all duration-500 ease-out`}
                  style={{ width: `${phase.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
