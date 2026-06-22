import { motion } from 'framer-motion'
import { CheckCircle2, ListTodo, Flame } from 'lucide-react'

interface Props {
  habitsCompleted: number
  habitsTotal: number
  tasksCompleted: number
  tasksTotal: number
  streak: number
}

const card = {
  initial: { opacity: 0, y: 14, scale: 0.96 },
  animate: { opacity: 1, y: 0, scale: 1 },
}

export function StatsCards({
  habitsCompleted, habitsTotal,
  tasksCompleted, tasksTotal,
  streak,
}: Props) {
  const stats = [
    {
      icon: <CheckCircle2 size={16} strokeWidth={2} />,
      number: habitsTotal > 0 ? `${habitsCompleted}/${habitsTotal}` : '—',
      label: 'Hábitos',
      color: '#2CC08C',
      bg: 'rgba(44,192,140,0.1)',
    },
    {
      icon: <ListTodo size={16} strokeWidth={2} />,
      number: tasksTotal > 0 ? `${tasksCompleted}/${tasksTotal}` : '—',
      label: 'Tarefas',
      color: '#6E5CF6',
      bg: 'rgba(110,92,246,0.1)',
    },
    {
      icon: <Flame size={16} strokeWidth={2} />,
      number: streak > 0 ? `${streak}d` : '—',
      label: 'Sequência',
      color: '#F79009',
      bg: 'rgba(247,144,9,0.1)',
    },
  ]

  return (
    <div className="stat-grid">
      {stats.map((s, i) => (
        <motion.div
          key={s.label}
          className="stat-card"
          variants={card}
          initial="initial"
          animate="animate"
          transition={{ duration: 0.35, delay: 0.08 * i, ease: [0.16, 1, 0.3, 1] }}
        >
          <span
            className="stat-icon-wrap"
            style={{ color: s.color, background: s.bg }}
          >
            {s.icon}
          </span>
          <span className="stat-number" style={{ color: s.color }}>{s.number}</span>
          <span className="stat-label">{s.label}</span>
        </motion.div>
      ))}
    </div>
  )
}
