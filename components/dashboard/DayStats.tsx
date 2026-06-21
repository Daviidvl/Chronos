'use client'

import { motion } from 'framer-motion'
import { useHabitsStore } from '@/lib/store/useHabitsStore'
import { useTasksStore } from '@/lib/store/useTasksStore'
import { useJournalStore } from '@/lib/store/useJournalStore'
import { useUserStore } from '@/lib/store/useUserStore'
import { CircularProgress } from '@/components/ui/CircularProgress'
import { todayISO } from '@/lib/utils'
import { Flame, CheckCircle2, Repeat, BookOpen, Zap } from 'lucide-react'

export function DayStats() {
  const { habits, logs, getActiveHabits } = useHabitsStore()
  const { tasks } = useTasksStore()
  const { hasEntryForDate } = useJournalStore()
  const { user } = useUserStore()

  const today = todayISO()
  const activeHabits = getActiveHabits()
  const todayLogs = logs.filter(l => l.date === today)
  const completedHabits = todayLogs.filter(l => l.completed).length
  const totalHabits = activeHabits.length
  const habitsProgress = totalHabits > 0 ? Math.round((completedHabits / totalHabits) * 100) : 0

  const todayTasks = tasks.filter(t => t.dueDate === today)
  const completedTasks = todayTasks.filter(t => t.completed).length
  const totalTasks = todayTasks.length
  const tasksProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  const hasJournal = hasEntryForDate(today)

  const overallProgress = Math.round(
    (habitsProgress * 0.4 + tasksProgress * 0.4 + (hasJournal ? 100 : 0) * 0.2)
  )

  const stats = [
    { icon: CheckCircle2, label: 'Tarefas', value: `${completedTasks}/${totalTasks}`, color: 'var(--accent)' },
    { icon: Repeat, label: 'Hábitos', value: `${completedHabits}/${totalHabits}`, color: '#10B981' },
    { icon: Zap, label: 'XP hoje', value: `+${user.xp % 100}`, color: '#F59E0B' },
    { icon: BookOpen, label: 'Diário', value: hasJournal ? 'Escrito ✓' : 'Pendente', color: hasJournal ? '#10B981' : 'var(--text-tertiary)' },
  ]

  return (
    <div className="flex items-center gap-6">
      {/* Circular progress */}
      <CircularProgress value={overallProgress} size={72} strokeWidth={5}>
        <div className="text-center">
          <div className="text-sm font-bold text-[var(--text-primary)] leading-none">{overallProgress}%</div>
          <div className="text-[10px] text-[var(--text-tertiary)] mt-0.5">do dia</div>
        </div>
      </CircularProgress>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-2 flex-1">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            className="flex items-center gap-2"
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05, duration: 0.2 }}
          >
            <stat.icon size={13} style={{ color: stat.color, flexShrink: 0 }} />
            <div>
              <div className="text-xs text-[var(--text-tertiary)] leading-none mb-0.5">{stat.label}</div>
              <div className="text-sm font-medium text-[var(--text-primary)] leading-none" style={{ color: stat.color }}>{stat.value}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
