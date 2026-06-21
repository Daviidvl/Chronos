'use client'

import { motion } from 'framer-motion'
import { useHabitsStore } from '@/lib/store/useHabitsStore'
import { useTasksStore } from '@/lib/store/useTasksStore'
import { useGoalsStore } from '@/lib/store/useGoalsStore'
import { useJournalStore } from '@/lib/store/useJournalStore'
import { CATEGORY_COLORS } from '@/types'
import { getStreakEmoji, getCategoryLabel, last7Days, todayISO } from '@/lib/utils'
import { format, parseISO, differenceInDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Lightbulb, TrendingUp, Zap, Trophy, Target, BookOpen, Flame } from 'lucide-react'

interface Insight {
  id: string
  icon: string
  title: string
  description: string
  type: 'positive' | 'tip' | 'warning' | 'achievement'
  color: string
}

function generateInsights(
  habits: ReturnType<typeof useHabitsStore.getState>['habits'],
  getStats: (id: string) => any,
  logs: ReturnType<typeof useHabitsStore.getState>['logs'],
  tasks: ReturnType<typeof useTasksStore.getState>['tasks'],
  goals: ReturnType<typeof useGoalsStore.getState>['goals'],
  entries: ReturnType<typeof useJournalStore.getState>['entries'],
): Insight[] {
  const insights: Insight[] = []

  if (habits.length === 0) return []

  // Best habit
  const bestHabit = habits.reduce((best, h) => {
    const s = getStats(h.id)
    const bestS = getStats(best.id)
    return s.completionRate > bestS.completionRate ? h : best
  }, habits[0])
  const bestStats = getStats(bestHabit.id)

  if (bestStats.completionRate >= 70) {
    insights.push({
      id: 'best-habit',
      icon: '🏆',
      title: `${bestHabit.name} é seu hábito mais consistente`,
      description: `Taxa de conclusão de ${bestStats.completionRate}% — você está indo muito bem! Mantenha o ritmo e em breve chegará a 90%+.`,
      type: 'positive',
      color: '#10B981',
    })
  }

  // Best streak
  const topStreak = habits.reduce((max, h) => {
    const s = getStats(h.id)
    return s.currentStreak > getStats(max.id).currentStreak ? h : max
  }, habits[0])
  const topStreakStats = getStats(topStreak.id)
  if (topStreakStats.currentStreak >= 3) {
    insights.push({
      id: 'streak',
      icon: '🔥',
      title: `${topStreakStats.currentStreak} dias seguidos de ${topStreak.name}!`,
      description: `${getStreakEmoji(topStreakStats.currentStreak)} Você está construindo uma sequência poderosa. Não quebre o ritmo!`,
      type: 'achievement',
      color: '#F59E0B',
    })
  }

  // Day of week analysis
  const dayCompletions: Record<number, number> = {}
  const dayCounts: Record<number, number> = {}
  logs.filter(l => l.completed).forEach(l => {
    const day = parseISO(l.date).getDay()
    dayCompletions[day] = (dayCompletions[day] ?? 0) + 1
    dayCounts[day] = (dayCounts[day] ?? 0) + 1
  })
  const bestDay = Object.entries(dayCompletions).sort(([, a], [, b]) => b - a)[0]
  if (bestDay) {
    const dayNames = ['domingos', 'segundas', 'terças', 'quartas', 'quintas', 'sextas', 'sábados']
    insights.push({
      id: 'best-day',
      icon: '📅',
      title: `Você é mais consistente às ${dayNames[Number(bestDay[0])]}`,
      description: `Com ${bestDay[1]} check-ins, ${dayNames[Number(bestDay[0])]} é seu dia mais produtivo. Aproveite essa energia!`,
      type: 'positive',
      color: '#5E6AD2',
    })
  }

  // Tasks insights
  const completedTasks = tasks.filter(t => t.completed)
  if (completedTasks.length > 0) {
    const recentWeekTasks = completedTasks.filter(t => {
      const d = differenceInDays(new Date(), parseISO(t.completedAt ?? t.createdAt))
      return d <= 7
    }).length

    if (recentWeekTasks >= 5) {
      insights.push({
        id: 'tasks-week',
        icon: '⚡',
        title: `${recentWeekTasks} tarefas esta semana!`,
        description: 'Uma semana muito produtiva. Sua capacidade de execução está no ponto.',
        type: 'positive',
        color: '#8B5CF6',
      })
    }
  }

  // Goals insights
  const nearGoals = goals.filter(g => g.deadline && differenceInDays(parseISO(g.deadline), new Date()) <= 14 && g.progress < 100)
  if (nearGoals.length > 0) {
    insights.push({
      id: 'near-goals',
      icon: '🎯',
      title: `${nearGoals.length} meta${nearGoals.length > 1 ? 's' : ''} com prazo próximo`,
      description: `"${nearGoals[0].title}" vence em breve. Foque nos marcos restantes!`,
      type: 'warning',
      color: '#F59E0B',
    })
  }

  // Journal consistency
  const recentEntries = entries.filter(e => differenceInDays(new Date(), parseISO(e.date)) <= 7)
  if (recentEntries.length >= 5) {
    insights.push({
      id: 'journal',
      icon: '✍️',
      title: 'Escrevendo quase todo dia!',
      description: `${recentEntries.length} entradas nos últimos 7 dias. A reflexão diária acelera o crescimento.`,
      type: 'positive',
      color: '#10B981',
    })
  }

  // Low performing habit
  const worstHabit = habits.reduce((worst, h) => {
    const s = getStats(h.id)
    const worstS = getStats(worst.id)
    return s.completionRate < worstS.completionRate ? h : worst
  }, habits[0])
  const worstStats = getStats(worstHabit.id)
  if (worstStats.completionRate < 50 && habits.length > 1) {
    insights.push({
      id: 'improve-habit',
      icon: '💡',
      title: `Dica: ${worstHabit.name} precisa de atenção`,
      description: `Com apenas ${worstStats.completionRate}% de conclusão, este hábito pode ser reajustado. Tente reduzir a frequência ou vincular a outro hábito.`,
      type: 'tip',
      color: '#8A8F98',
    })
  }

  return insights
}

export default function InsightsPage() {
  const { getActiveHabits, logs, getStats } = useHabitsStore()
  const { tasks } = useTasksStore()
  const { getActiveGoals } = useGoalsStore()
  const { entries } = useJournalStore()

  const habits = getActiveHabits()
  const goals = getActiveGoals()
  const insights = generateInsights(habits, getStats, logs, tasks, goals, entries)

  const typeStyles: Record<string, { bg: string; border: string }> = {
    positive: { bg: 'rgba(16,185,129,0.06)', border: 'rgba(16,185,129,0.15)' },
    achievement: { bg: 'rgba(245,158,11,0.06)', border: 'rgba(245,158,11,0.15)' },
    warning: { bg: 'rgba(245,158,11,0.06)', border: 'rgba(245,158,11,0.2)' },
    tip: { bg: 'var(--surface)', border: 'var(--border)' },
  }

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-6 md:py-8">
      <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">Insights</h1>
        <p className="text-sm text-[var(--text-tertiary)] mt-0.5">
          Padrões e recomendações baseados no seu histórico
        </p>
      </motion.div>

      {/* Insights grid */}
      <div className="space-y-3">
        {insights.map((insight, i) => {
          const style = typeStyles[insight.type]
          return (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, y: 8, x: -4 }}
              animate={{ opacity: 1, y: 0, x: 0 }}
              transition={{ delay: i * 0.07, duration: 0.25 }}
              className="flex items-start gap-4 px-4 py-4 rounded-2xl"
              style={{ background: style.bg, border: `1px solid ${style.border}` }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                style={{ background: `${insight.color}20` }}
              >
                {insight.icon}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">{insight.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{insight.description}</p>
              </div>
            </motion.div>
          )
        })}

        {insights.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-base font-medium text-[var(--text-primary)] mb-2">Coletando dados...</h3>
            <p className="text-sm text-[var(--text-tertiary)] max-w-xs mx-auto">
              Use o Chronos por alguns dias e os insights aparecerão automaticamente baseados nos seus padrões.
            </p>
          </motion.div>
        )}
      </div>

      {/* Summary stats */}
      {habits.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 p-4 rounded-2xl"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
        >
          <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Resumo da semana</h2>
          <div className="grid grid-cols-2 gap-4">
            {habits.slice(0, 4).map(habit => {
              const stats = getStats(habit.id)
              const color = CATEGORY_COLORS[habit.category] ?? '#5E6AD2'
              const history = last7Days().map(d => {
                const log = logs.find(l => l.habitId === habit.id && l.date === d)
                return log?.completed ?? false
              })

              return (
                <div key={habit.id} className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{habit.icon}</span>
                    <span className="text-xs font-medium text-[var(--text-secondary)] truncate">{habit.name}</span>
                    <span className="ml-auto text-xs font-semibold flex-shrink-0" style={{ color }}>{stats.currentStreak}d</span>
                  </div>
                  <div className="flex gap-1">
                    {history.map((done, di) => (
                      <div
                        key={di}
                        className="flex-1 h-1.5 rounded-full"
                        style={{ background: done ? color : 'var(--surface-active)' }}
                      />
                    ))}
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
