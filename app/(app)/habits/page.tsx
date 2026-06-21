'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useHabitsStore } from '@/lib/store/useHabitsStore'
import { HabitCard } from '@/components/habits/HabitCard'
import { AddHabitModal } from '@/components/habits/AddHabitModal'
import { Button } from '@/components/ui/Button'
import { Plus, Repeat, Trophy, Flame } from 'lucide-react'
import { todayISO } from '@/lib/utils'

export default function HabitsPage() {
  const { getActiveHabits, logs, getStats } = useHabitsStore()
  const [modalOpen, setModalOpen] = useState(false)
  const habits = getActiveHabits()
  const today = todayISO()

  const todayLogs = logs.filter(l => l.date === today)
  const completedToday = todayLogs.filter(l => l.completed).length
  const totalToday = habits.length

  const bestStreak = habits.reduce((max, h) => {
    const s = getStats(h.id)
    return Math.max(max, s.currentStreak)
  }, 0)

  const avgRate = habits.length > 0
    ? Math.round(habits.reduce((sum, h) => sum + getStats(h.id).completionRate, 0) / habits.length)
    : 0

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-6 md:py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between mb-6"
      >
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">Hábitos</h1>
          <p className="text-sm text-[var(--text-tertiary)] mt-0.5">
            {completedToday}/{totalToday} concluídos hoje
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setModalOpen(true)}>
          <Plus size={14} /> Novo hábito
        </Button>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="grid grid-cols-3 gap-3 mb-6"
      >
        {[
          { icon: Repeat, label: 'Hoje', value: `${completedToday}/${totalToday}`, color: 'var(--accent)' },
          { icon: Flame, label: 'Melhor streak', value: `${bestStreak}d`, color: '#F59E0B' },
          { icon: Trophy, label: 'Taxa média', value: `${avgRate}%`, color: '#10B981' },
        ].map(s => (
          <div
            key={s.label}
            className="flex flex-col items-center px-3 py-3 rounded-xl"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
          >
            <s.icon size={16} style={{ color: s.color }} />
            <div className="text-sm font-bold text-[var(--text-primary)] mt-1.5">{s.value}</div>
            <div className="text-[11px] text-[var(--text-tertiary)]">{s.label}</div>
          </div>
        ))}
      </motion.div>

      {/* Habits list */}
      <div className="space-y-3">
        {habits.map((habit, i) => (
          <motion.div
            key={habit.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 + i * 0.05 }}
          >
            <HabitCard habit={habit} />
          </motion.div>
        ))}

        {habits.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="text-4xl mb-4">🌱</div>
            <h3 className="text-base font-medium text-[var(--text-primary)] mb-2">Comece sua jornada</h3>
            <p className="text-sm text-[var(--text-tertiary)] mb-6 max-w-xs mx-auto">
              Crie seu primeiro hábito e comece a construir consistência todos os dias.
            </p>
            <Button variant="primary" onClick={() => setModalOpen(true)}>
              <Plus size={14} /> Criar primeiro hábito
            </Button>
          </motion.div>
        )}
      </div>

      <AddHabitModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  )
}
