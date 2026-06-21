'use client'

import { motion } from 'framer-motion'

interface RingProps {
  progress: number
  size?: number
  strokeWidth?: number
  color?: string
  trackColor?: string
  label?: string
  sublabel?: string
}

export function Ring({
  progress,
  size = 80,
  strokeWidth = 6,
  color = 'var(--accent)',
  trackColor = 'rgba(255,255,255,0.06)',
  label,
  sublabel,
}: RingProps) {
  const r = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * r
  const offset = circumference - (Math.min(progress, 100) / 100) * circumference

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={trackColor} strokeWidth={strokeWidth} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>
      {(label || sublabel) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {label && <span className="text-[var(--text-1)] font-semibold leading-none" style={{ fontSize: size * 0.18 }}>{label}</span>}
          {sublabel && <span className="text-[var(--text-3)] mt-0.5" style={{ fontSize: size * 0.12 }}>{sublabel}</span>}
        </div>
      )}
    </div>
  )
}
