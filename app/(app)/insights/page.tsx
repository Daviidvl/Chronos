'use client'

import { motion } from 'framer-motion'
import { useHabitsStore } from '@/lib/store/useHabitsStore'
import { useTasksStore } from '@/lib/store/useTasksStore'
import { useGoalsStore } from '@/lib/store/useGoalsStore'
import { Habit, HabitLog, Task, Goal, CATEGORY_COLORS } from '@/types'
import { computeHabitStats, last7Days, todayISO } from '@/lib/utils'
import { differenceInDays, parseISO } from 'date-fns'
import { TrendingUp, Flame, AlertCircle, Lightbulb, Star } from 'lucide-react'

type InsightType = 'positive' | 'warning' | 'tip' | 'streak' | 'neutral'

interface Insight {
  id: string; type: InsightType; title: string; description: string
}

const TYPE_CONFIG: Record<InsightType, { icon: typeof TrendingUp; color: string; bg: string; label: string }> = {
  positive: { icon: TrendingUp,    color: 'var(--positive)',  bg: 'var(--positive-dim)', label: 'Positivo' },
  streak:   { icon: Flame,         color: 'var(--warning)',   bg: 'var(--warning-dim)',  label: 'Sequência' },
  warning:  { icon: AlertCircle,   color: 'var(--danger)',    bg: 'var(--danger-dim)',   label: 'Atenção' },
  tip:      { icon: Lightbulb,     color: 'var(--accent)',    bg: 'var(--accent-dim)',   label: 'Dica' },
  neutral:  { icon: Star,          color: 'var(--text-3)',    bg: 'rgba(255,255,255,0.04)', label: 'Padrão' },
}

function generateInsights(habits: Habit[], logs: HabitLog[], tasks: Task[], goals: Goal[]): Insight[] {
  const ins: Insight[] = []
  if (!habits.length) return ins

  const best = habits.reduce((a, b) =>
    computeHabitStats(logs, a.id).completionRate >= computeHabitStats(logs, b.id).completionRate ? a : b
  )
  const bestStats = computeHabitStats(logs, best.id)
  if (bestStats.completionRate >= 70) {
    ins.push({ id: 'best', type: 'positive', title: `${best.name} é seu hábito mais consistente`, description: `Taxa de ${bestStats.completionRate}% nos últimos 30 dias. Padrão sólido estabelecido.` })
  }

  const topStreak = habits.reduce((a, b) =>
    computeHabitStats(logs, a.id).currentStreak >= computeHabitStats(logs, b.id).currentStreak ? a : b
  )
  const topStats = computeHabitStats(logs, topStreak.id)
  if (topStats.currentStreak >= 3) {
    ins.push({ id: 'streak', type: 'streak', title: `${topStats.currentStreak} dias seguidos de ${topStreak.name}`, description: 'Cada dia reforça o caminho neural do hábito. Continue.' })
  }

  const dayCount: Record<number, number> = {}
  logs.filter(l => l.completed).forEach(l => {
    const d = parseISO(l.date).getDay()
    dayCount[d] = (dayCount[d] ?? 0) + 1
  })
  const bestDayEntry = Object.entries(dayCount).sort(([, a], [, b]) => b - a)[0]
  if (bestDayEntry) {
    const names = ['domingos', 'segundas', 'terças', 'quartas', 'quintas', 'sextas', 'sábados']
    ins.push({ id: 'day', type: 'neutral', title: `Mais produtivo às ${names[+bestDayEntry[0]]}`, description: 'Considere agendar tarefas mais difíceis nesse dia.' })
  }

  const weekTasks = tasks.filter(t => t.completed && t.completedAt && differenceInDays(new Date(), parseISO(t.completedAt)) <= 7).length
  if (weekTasks >= 5) {
    ins.push({ id: 'tasks', type: 'positive', title: `${weekTasks} tarefas concluídas nesta semana`, description: 'Semana produtiva. Ótimo ritmo de execução.' })
  }

  const nearGoals = goals.filter(g => g.deadline && differenceInDays(parseISO(g.deadline), new Date()) <= 14 && g.progress < 100)
  if (nearGoals.length) {
    ins.push({ id: 'goals', type: 'warning', title: `${nearGoals.length} meta(s) com prazo próximo`, description: `"${nearGoals[0].title}" vence em breve. Revise os marcos restantes.` })
  }

  if (habits.length > 1) {
    const worst = habits.reduce((a, b) =>
      computeHabitStats(logs, a.id).completionRate <= computeHabitStats(logs, b.id).completionRate ? a : b
    )
    const ws = computeHabitStats(logs, worst.id)
    if (ws.completionRate < 50) {
      ins.push({ id: 'improve', type: 'tip', title: `${worst.name} com ${ws.completionRate}% de conclusão`, description: 'Tente reduzir a frequência ou vincular a um hábito já consolidado.' })
    }
  }

  return ins
}

export default function InsightsPage() {
  const { getActiveHabits, logs, getLogForDate } = useHabitsStore()
  const { tasks } = useTasksStore()
  const { getActiveGoals } = useGoalsStore()

  const habits = getActiveHabits()
  const goals = getActiveGoals()
  const insights = generateInsights(habits, logs, tasks, goals)
  const days = last7Days()
  const today = todayISO()

  return (
    <div className="max-w-xl mx-auto px-5 pt-8 pb-6">
      <motion.header initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-[32px] font-semibold text-[var(--text-1)] tracking-tight leading-none">Insights</h1>
        <p className="text-[14px] text-[var(--text-3)] mt-2">Padrões dos últimos 30 dias</p>
      </motion.header>

      {insights.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-[14px] text-[var(--text-3)]">Use o Chronos por alguns dias para gerar insights.</p>
        </div>
      ) : (
        <div className="space-y-3 mb-8">
          {insights.map((ins, i) => {
            const cfg = TYPE_CONFIG[ins.type]
            const Icon = cfg.icon
            return (
              <motion.div
                key={ins.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="flex gap-4 p-4 rounded-[20px]"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderLeft: `3px solid ${cfg.color}` }}
              >
                <div className="w-8 h-8 rounded-[10px] flex items-center justify-center flex-shrink-0" style={{ background: cfg.bg }}>
                  <Icon size={15} style={{ color: cfg.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] font-medium uppercase tracking-widest mb-1" style={{ color: cfg.color }}>{cfg.label}</div>
                  <h3 className="text-[14px] font-medium text-[var(--text-1)] mb-1">{ins.title}</h3>
                  <p className="text-[13px] text-[var(--text-3)] leading-relaxed">{ins.description}</p>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {habits.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <h2 className="text-[11px] font-medium text-[var(--text-3)] uppercase tracking-widest mb-3">Esta Semana</h2>
          <div className="rounded-[20px] p-4 space-y-3" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            {habits.map(h => {
              const stats = computeHabitStats(logs, h.id)
              return (
                <div key={h.id}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[13px] text-[var(--text-2)]">{h.name}</span>
                    <span className="text-[12px] font-medium" style={{ color: h.color }}>{stats.currentStreak}d</span>
                  </div>
                  <div className="flex gap-1">
                    {days.map(d => {
                      const done = getLogForDate(h.id, d)?.completed ?? false
                      return (
                        <div key={d} className="flex-1 h-1.5 rounded-full transition-all"
                          style={{ background: done ? h.color : 'rgba(255,255,255,0.06)', opacity: d === today ? 1 : 0.7 }} />
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>
      )}
    </div>
  )
}
