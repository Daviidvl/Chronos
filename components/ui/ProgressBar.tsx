'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ProgressBarProps {
  value: number
  className?: string
  colorClass?: string
  height?: number
  gradient?: boolean
}

export function ProgressBar({ value, className, colorClass, height = 4, gradient = false }: ProgressBarProps) {
  return (
    <div
      className={cn('rounded-full overflow-hidden', className)}
      style={{ height, background: 'var(--surface-active)' }}
    >
      <motion.div
        className="h-full rounded-full"
        style={
          gradient
            ? { background: 'linear-gradient(90deg, var(--accent), #8B5CF6)' }
            : { background: colorClass ?? 'var(--accent)' }
        }
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(value, 100)}%` }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      />
    </div>
  )
}
