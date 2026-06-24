import { motion } from 'framer-motion'
import { Flame, Clock, Timer } from 'lucide-react'
import { formatMinutes } from '@/lib/utils'

interface Props {
  streak: number
  todayMinutes: number
  weekMinutes: number
  weekGoalMinutes: number
}

export function StudyStats({ streak, todayMinutes, weekMinutes, weekGoalMinutes }: Props) {
  const stats = [
    {
      icon: <Flame size={16} strokeWidth={2} />,
      number: streak > 0 ? `${streak}d` : '—',
      label: 'Sequência',
      color: '#F79009',
      bg: 'rgba(247,144,9,0.1)',
    },
    {
      icon: <Clock size={16} strokeWidth={2} />,
      number: todayMinutes > 0 ? formatMinutes(todayMinutes) : '—',
      label: 'Hoje',
      color: '#2563EB',
      bg: 'rgba(37,99,235,0.1)',
    },
    {
      icon: <Timer size={16} strokeWidth={2} />,
      number: weekMinutes > 0 ? formatMinutes(weekMinutes) : '—',
      label: 'Pomodoro',
      color: '#6E5CF6',
      bg: 'rgba(110,92,246,0.1)',
    },
  ]

  return (
    <div className="stat-grid">
      {stats.map((s, i) => (
        <motion.div
          key={s.label}
          className="stat-card"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.32, delay: 0.06 * i, ease: [0.16, 1, 0.3, 1] }}
        >
          <span
            className="stat-icon-wrap"
            style={{ color: s.color, background: s.bg }}
          >
            {s.icon}
          </span>
          <span className="stat-number" style={{ color: s.color, fontSize: 15 }}>
            {s.number}
          </span>
          <span className="stat-label">{s.label}</span>
        </motion.div>
      ))}
    </div>
  )
}
