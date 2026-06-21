'use client'

import { motion } from 'framer-motion'
import { useHabitsStore } from '@/lib/store/useHabitsStore'
import { useTasksStore } from '@/lib/store/useTasksStore'
import { computeHabitStats, last7Days, todayISO } from '@/lib/utils'
import { format, parseISO, subDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'

function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div className="rounded-[18px] p-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
      <div className="text-[11px] text-[var(--text-3)] uppercase tracking-widest mb-2">{label}</div>
      <div className="text-[28px] font-semibold leading-none" style={{ color: color ?? 'var(--text-1)' }}>{value}</div>
      {sub && <div className="text-[12px] text-[var(--text-3)] mt-1">{sub}</div>}
    </div>
  )
}

function WeekBar({ days, logs, habitColor }: { days: string[]; logs: typeof useHabitsStore.getState.prototype; habitColor: string }) {
  return null
}

export default function AnalyticsPage() {
  const { getActiveHabits, logs, getLogForDate } = useHabitsStore()
  const { tasks } = useTasksStore()

  const habits = getActiveHabits()
  const today = todayISO()
  const days7 = last7Days()

  const totalStreak = habits.reduce((acc, h) => {
    const s = computeHabitStats(logs, h.id)
    return acc + s.currentStreak
  }, 0)
  const avgStreak = habits.length ? Math.round(totalStreak / habits.length) : 0

  const avgRate = habits.length
    ? Math.round(habits.reduce((acc, h) => acc + computeHabitStats(logs, h.id).completionRate, 0) / habits.length)
    : 0

  const completedTasks = tasks.filter(t => t.completed).length
  const bestHabit = habits.length
    ? habits.reduce((a, b) => computeHabitStats(logs, a.id).bestStreak >= computeHabitStats(logs, b.id).bestStreak ? a : b)
    : null
  const bestStreak = bestHabit ? computeHabitStats(logs, bestHabit.id).bestStreak : 0

  const dayLabels = days7.map(d => format(parseISO(d), 'EEE', { locale: ptBR }).toUpperCase())

  return (
    <div className="max-w-xl mx-auto px-5 pt-8 pb-6">
      <motion.header initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-[32px] font-semibold text-[var(--text-1)] tracking-tight leading-none">Analytics</h1>
        <p className="text-[14px] text-[var(--text-3)] mt-2">Visão geral da sua consistência</p>
      </motion.header>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}>
          <StatCard label="Taxa média" value={`${avgRate}%`} sub="últimos 30 dias" color="var(--accent)" />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <StatCard label="Sequência média" value={`${avgStreak}d`} sub="hábitos ativos" color="var(--warning)" />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}>
          <StatCard label="Melhor sequência" value={`${bestStreak}d`} sub={bestHabit?.name} color="var(--positive)" />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
          <StatCard label="Tarefas concluídas" value={completedTasks} sub="total" />
        </motion.div>
      </div>

      {/* Weekly breakdown */}
      {habits.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}>
          <h2 className="text-[11px] font-medium text-[var(--text-3)] uppercase tracking-widest mb-3">Últimos 7 dias</h2>
          <div className="rounded-[20px] p-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            {/* Day labels */}
            <div className="flex mb-4">
              <div className="w-24 flex-shrink-0" />
              {days7.map((d, i) => (
                <div key={d} className="flex-1 text-center text-[10px] text-[var(--text-4)]">{dayLabels[i]}</div>
              ))}
            </div>
            {habits.map(h => {
              const stats = computeHabitStats(logs, h.id)
              return (
                <div key={h.id} className="flex items-center mb-3 last:mb-0">
                  <div className="w-24 flex-shrink-0 flex items-center gap-2 pr-2">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: h.color }} />
                    <span className="text-[12px] text-[var(--text-2)] truncate">{h.name}</span>
                  </div>
                  {days7.map(d => {
                    const done = getLogForDate(h.id, d)?.completed ?? false
                    return (
                      <div key={d} className="flex-1 flex items-center justify-center">
                        <div
                          className="w-5 h-5 rounded-full transition-all"
                          style={{ background: done ? h.color : 'rgba(255,255,255,0.05)' }}
                        />
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* Completion by day of week */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }} className="mt-6">
        <h2 className="text-[11px] font-medium text-[var(--text-3)] uppercase tracking-widest mb-3">Dias mais produtivos</h2>
        <div className="rounded-[20px] p-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          {['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'].map((label, dow) => {
            const count = logs.filter(l => l.completed && new Date(l.date).getDay() === dow).length
            const maxCount = Math.max(...['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'].map((_, d) =>
              logs.filter(l => l.completed && new Date(l.date).getDay() === d).length
            ), 1)
            const pct = Math.round((count / maxCount) * 100)
            return (
              <div key={label} className="flex items-center gap-3 mb-2 last:mb-0">
                <div className="text-[12px] text-[var(--text-3)] w-8">{label}</div>
                <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: 'var(--accent)' }}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: dow * 0.05 }}
                  />
                </div>
                <div className="text-[11px] text-[var(--text-3)] w-6 text-right">{count}</div>
              </div>
            )
          })}
        </div>
      </motion.div>
    </div>
  )
}
