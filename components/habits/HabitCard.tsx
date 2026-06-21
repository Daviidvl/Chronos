'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useHabitsStore } from '@/lib/store/useHabitsStore'
import { useUserStore } from '@/lib/store/useUserStore'
import { Habit } from '@/types'
import { XP_REWARDS, CATEGORY_COLORS } from '@/types'
import { getStreakEmoji, todayISO, getFrequencyLabel, getCategoryLabel, cn } from '@/lib/utils'
import { ConsistencyHeatmap } from './ConsistencyHeatmap'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Badge } from '@/components/ui/Badge'
import { Flame, ChevronDown, ChevronUp, Check, SkipForward, MoreHorizontal, Archive, Trash2 } from 'lucide-react'

interface HabitCardProps {
  habit: Habit
  expanded?: boolean
}

export function HabitCard({ habit, expanded: defaultExpanded = false }: HabitCardProps) {
  const { getLogForDate, toggleHabit, skipHabit, getStats, archiveHabit, deleteHabit } = useHabitsStore()
  const { addXP } = useUserStore()
  const [expanded, setExpanded] = useState(defaultExpanded)
  const [menuOpen, setMenuOpen] = useState(false)

  const today = todayISO()
  const log = getLogForDate(habit.id, today)
  const stats = getStats(habit.id)
  const completed = log?.completed ?? false
  const skipped = log?.skipped ?? false
  const color = CATEGORY_COLORS[habit.category] ?? 'var(--accent)'

  const handleToggle = () => {
    if (!completed) addXP(XP_REWARDS.completeHabit)
    toggleHabit(habit.id)
  }

  const weeklyRate = Math.round((stats.weeklyCompleted / habit.targetPerWeek) * 100)

  return (
    <motion.div
      layout
      className="rounded-xl overflow-hidden transition-all duration-200"
      style={{
        background: 'var(--bg-elevated)',
        border: `1px solid ${completed ? `${color}25` : 'var(--border)'}`,
      }}
    >
      {/* Main row */}
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Checkbox */}
        <button
          onClick={handleToggle}
          className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-200"
          style={{
            background: completed ? color : 'transparent',
            border: `2px solid ${completed ? color : skipped ? 'var(--text-tertiary)' : 'var(--border-strong)'}`,
          }}
        >
          <AnimatePresence>
            {completed && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                <Check size={13} strokeWidth={3} color="white" />
              </motion.div>
            )}
            {skipped && !completed && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                <SkipForward size={11} style={{ color: 'var(--text-tertiary)' }} />
              </motion.div>
            )}
          </AnimatePresence>
        </button>

        {/* Icon + Name */}
        <div className="text-xl">{habit.icon}</div>
        <div className="flex-1 min-w-0">
          <div className={cn(
            'text-sm font-medium',
            completed ? 'text-[var(--text-tertiary)] line-through' : 'text-[var(--text-primary)]'
          )}>
            {habit.name}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <Flame size={11} style={{ color: '#F59E0B' }} />
            <span className="text-[11px] text-[var(--text-tertiary)]">
              {stats.currentStreak} dias {getStreakEmoji(stats.currentStreak)}
            </span>
            <span className="text-[11px] text-[var(--text-tertiary)]">·</span>
            <span className="text-[11px]" style={{ color: `${color}99` }}>{getCategoryLabel(habit.category)}</span>
            <span className="text-[11px] text-[var(--text-tertiary)]">·</span>
            <span className="text-[11px] text-[var(--text-tertiary)]">{getFrequencyLabel(habit.frequency)}</span>
          </div>
        </div>

        {/* Meta semanal progress */}
        <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
          <div className="text-right">
            <div className="text-xs text-[var(--text-tertiary)]">Semana</div>
            <div className="text-xs font-semibold" style={{ color }}>
              {stats.weeklyCompleted}/{habit.targetPerWeek}x
            </div>
          </div>
          <div className="w-16">
            <ProgressBar value={weeklyRate} colorClass={color} height={3} />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {!completed && !skipped && (
            <button
              onClick={() => skipHabit(habit.id)}
              className="p-1.5 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] transition-all text-[11px]"
              title="Pular hoje"
            >
              <SkipForward size={13} />
            </button>
          )}
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1.5 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] transition-all"
          >
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {/* Menu */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1.5 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] transition-all"
            >
              <MoreHorizontal size={14} />
            </button>
            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -4 }}
                  className="absolute right-0 top-8 z-20 min-w-[140px] rounded-xl overflow-hidden"
                  style={{ background: 'var(--bg-overlay)', border: '1px solid var(--border-strong)', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}
                >
                  <button
                    onClick={() => { archiveHabit(habit.id); setMenuOpen(false) }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] transition-colors"
                  >
                    <Archive size={13} /> Arquivar
                  </button>
                  <button
                    onClick={() => { deleteHabit(habit.id); setMenuOpen(false) }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[var(--danger)] hover:bg-[rgba(239,68,68,0.1)] transition-colors"
                  >
                    <Trash2 size={13} /> Excluir
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Expanded: heatmap + stats */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-1" style={{ borderTop: '1px solid var(--border)' }}>
              {/* Stats row */}
              <div className="grid grid-cols-3 gap-3 mb-4 mt-3">
                {[
                  { label: 'Streak atual', value: `${stats.currentStreak}d`, emoji: getStreakEmoji(stats.currentStreak) },
                  { label: 'Melhor streak', value: `${stats.bestStreak}d`, emoji: '🏆' },
                  { label: 'Taxa', value: `${stats.completionRate}%`, emoji: '📊' },
                ].map(s => (
                  <div key={s.label} className="text-center px-2 py-2 rounded-lg" style={{ background: 'var(--surface)' }}>
                    <div className="text-base">{s.emoji}</div>
                    <div className="text-sm font-bold text-[var(--text-primary)]">{s.value}</div>
                    <div className="text-[10px] text-[var(--text-tertiary)]">{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Heatmap */}
              <ConsistencyHeatmap habitId={habit.id} color={color} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
