'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useHabitsStore } from '@/lib/store/useHabitsStore'
import { useUserStore } from '@/lib/store/useUserStore'
import { todayISO, getStreakEmoji, cn } from '@/lib/utils'
import { XP_REWARDS, CATEGORY_COLORS } from '@/types'
import { Flame, Check } from 'lucide-react'

export function TodayHabits() {
  const { getActiveHabits, getLogForDate, toggleHabit, getStats } = useHabitsStore()
  const { addXP } = useUserStore()
  const habits = getActiveHabits()
  const today = todayISO()

  const handleToggle = (habitId: string) => {
    const log = getLogForDate(habitId, today)
    if (!log?.completed) addXP(XP_REWARDS.completeHabit)
    toggleHabit(habitId)
  }

  return (
    <div className="space-y-2">
      {habits.map((habit, i) => {
        const log = getLogForDate(habit.id, today)
        const stats = getStats(habit.id)
        const completed = log?.completed ?? false
        const color = CATEGORY_COLORS[habit.category] ?? 'var(--accent)'

        return (
          <motion.div
            key={habit.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04, duration: 0.2 }}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-150 group',
              'hover:bg-[var(--surface-hover)]'
            )}
            style={{ border: '1px solid', borderColor: completed ? `${color}25` : 'var(--border)' }}
            onClick={() => handleToggle(habit.id)}
          >
            {/* Checkbox */}
            <div
              className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-all duration-150"
              style={{
                background: completed ? color : 'transparent',
                border: `1.5px solid ${completed ? color : 'var(--border-strong)'}`,
              }}
            >
              <AnimatePresence>
                {completed && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <Check size={11} strokeWidth={3} color="white" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Emoji */}
            <span className="text-base">{habit.icon}</span>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className={cn(
                'text-sm font-medium transition-all',
                completed ? 'text-[var(--text-tertiary)] line-through' : 'text-[var(--text-primary)]'
              )}>
                {habit.name}
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <Flame size={10} style={{ color: '#F59E0B' }} />
                <span className="text-[11px] text-[var(--text-tertiary)]">
                  {stats.currentStreak} dias {getStreakEmoji(stats.currentStreak)}
                </span>
                <span className="text-[11px] text-[var(--text-tertiary)]">·</span>
                <span className="text-[11px] text-[var(--text-tertiary)]">{stats.completionRate}%</span>
              </div>
            </div>

            {/* Weekly progress dots */}
            <div className="flex gap-0.5 flex-shrink-0">
              {Array.from({ length: 7 }).map((_, d) => {
                const date = new Date()
                date.setDate(date.getDate() - (6 - d))
                const dateStr = date.toISOString().slice(0, 10)
                const { logs } = useHabitsStore.getState()
                const dayLog = logs.find(l => l.habitId === habit.id && l.date === dateStr)
                return (
                  <div
                    key={d}
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: dayLog?.completed ? color : 'var(--surface-active)' }}
                  />
                )
              })}
            </div>
          </motion.div>
        )
      })}

      {habits.length === 0 && (
        <div className="text-center py-6 text-[var(--text-tertiary)] text-sm">
          Nenhum hábito ativo. Crie seu primeiro hábito!
        </div>
      )}
    </div>
  )
}
