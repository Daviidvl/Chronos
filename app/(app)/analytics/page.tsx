'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useHabitsStore } from '@/lib/store/useHabitsStore'
import { useTasksStore } from '@/lib/store/useTasksStore'
import { useGoalsStore } from '@/lib/store/useGoalsStore'
import { useJournalStore } from '@/lib/store/useJournalStore'
import { CATEGORY_COLORS } from '@/types'
import { last7Days, getLast365Days, getHeatmapColor, formatDate, todayISO } from '@/lib/utils'
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { TrendingUp, Activity, Target, Flame } from 'lucide-react'

const CUSTOM_TOOLTIP_STYLE = {
  background: 'var(--bg-overlay)',
  border: '1px solid var(--border-strong)',
  borderRadius: 10,
  padding: '8px 12px',
  fontSize: 12,
  color: 'var(--text-primary)',
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div style={CUSTOM_TOOLTIP_STYLE}>
      <div className="text-[var(--text-tertiary)] text-[11px] mb-1">{label}</div>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span>{p.name}: <strong>{p.value}</strong></span>
        </div>
      ))}
    </div>
  )
}

function HabitHeatmap() {
  const { habits, logs, getActiveHabits } = useHabitsStore()
  const activeHabits = getActiveHabits()
  const allDays = getLast365Days()
  const entryDates = new Set(logs.filter(l => l.completed).map(l => l.date))

  // Count completions per day
  const completionsByDay = allDays.reduce((acc, day) => {
    acc[day] = logs.filter(l => l.date === day && l.completed).length
    return acc
  }, {} as Record<string, number>)

  const maxPerDay = activeHabits.length || 1

  // Build weeks
  const weeks: string[][] = []
  let currentWeek: string[] = []
  const firstDay = new Date(allDays[0])
  const startPad = (firstDay.getDay() + 6) % 7
  for (let i = 0; i < startPad; i++) currentWeek.push('')
  allDays.forEach(day => {
    currentWeek.push(day)
    if (currentWeek.length === 7) { weeks.push(currentWeek); currentWeek = [] }
  })
  if (currentWeek.length > 0) { while (currentWeek.length < 7) currentWeek.push(''); weeks.push(currentWeek) }

  const MONTHS = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">Mapa de consistência anual</h3>
        <span className="text-xs text-[var(--text-tertiary)]">{logs.filter(l => l.completed).length} check-ins</span>
      </div>
      <div className="overflow-x-auto">
        <div style={{ minWidth: weeks.length * 14 + 30 }}>
          <div className="flex mb-1 pl-8">
            {weeks.map((week, wi) => {
              const firstDate = week.find(d => d)
              if (!firstDate) return <div key={wi} style={{ width: 13, marginRight: 1 }} />
              const d = new Date(firstDate)
              if (d.getDate() <= 7) return <div key={wi} className="text-[10px] text-[var(--text-tertiary)]" style={{ width: 13, marginRight: 1 }}>{MONTHS[d.getMonth()]}</div>
              return <div key={wi} style={{ width: 13, marginRight: 1 }} />
            })}
          </div>
          <div className="flex gap-px">
            <div className="flex flex-col gap-px mr-1">
              {['','Seg','','Qua','','Sex',''].map((d, i) => (
                <div key={i} className="text-[10px] text-[var(--text-tertiary)] h-[13px] flex items-center" style={{ width: 24 }}>{d}</div>
              ))}
            </div>
            <div className="flex gap-px">
              {weeks.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-px">
                  {week.map((day, di) => {
                    if (!day) return <div key={di} className="w-[12px] h-[12px]" />
                    const count = completionsByDay[day] ?? 0
                    const intensity = count / maxPerDay
                    const isPerfect = count === maxPerDay && maxPerDay > 0
                    return (
                      <div
                        key={di}
                        className="w-[12px] h-[12px] rounded-sm cursor-pointer hover:scale-125 transition-transform"
                        title={`${formatDate(day)}: ${count}/${maxPerDay} hábitos`}
                        style={{
                          background: count === 0 ? 'rgba(255,255,255,0.05)' : `rgba(94,106,210,${0.15 + intensity * 0.85})`,
                          outline: isPerfect ? '1px solid #5E6AD2' : 'none',
                        }}
                      />
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function WeeklyHabitsChart() {
  const { habits, logs, getActiveHabits } = useHabitsStore()
  const activeHabits = getActiveHabits()
  const days = last7Days()

  const data = days.map(day => {
    const completed = logs.filter(l => l.date === day && l.completed).length
    return {
      day: format(parseISO(day), 'EEE', { locale: ptBR }),
      concluídos: completed,
      total: activeHabits.length,
      taxa: activeHabits.length > 0 ? Math.round((completed / activeHabits.length) * 100) : 0,
    }
  })

  return (
    <div>
      <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Hábitos esta semana</h3>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={data} barSize={20}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="day" tick={{ fill: 'var(--text-tertiary)', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: 'var(--text-tertiary)', fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="concluídos" fill="#5E6AD2" radius={[4, 4, 0, 0]} />
          <Bar dataKey="total" fill="rgba(255,255,255,0.06)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

function TasksCompletionChart() {
  const { tasks } = useTasksStore()
  const days = last7Days()

  const data = days.map(day => {
    const dayTasks = tasks.filter(t => t.dueDate === day)
    const completed = dayTasks.filter(t => t.completed).length
    return {
      day: format(parseISO(day), 'EEE', { locale: ptBR }),
      tarefas: completed,
    }
  })

  return (
    <div>
      <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Tarefas concluídas</h3>
      <ResponsiveContainer width="100%" height={160}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="taskGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="day" tick={{ fill: 'var(--text-tertiary)', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: 'var(--text-tertiary)', fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="tarefas" stroke="#10B981" fill="url(#taskGrad)" strokeWidth={2} dot={{ fill: '#10B981', r: 3 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export default function AnalyticsPage() {
  const { getActiveHabits, getStats, logs } = useHabitsStore()
  const { tasks } = useTasksStore()
  const { getActiveGoals } = useGoalsStore()
  const { entries } = useJournalStore()

  const habits = getActiveHabits()
  const goals = getActiveGoals()
  const completedTasks = tasks.filter(t => t.completed).length
  const avgHabitRate = habits.length > 0
    ? Math.round(habits.reduce((s, h) => s + getStats(h.id).completionRate, 0) / habits.length)
    : 0
  const bestStreak = habits.reduce((max, h) => Math.max(max, getStats(h.id).currentStreak), 0)
  const avgGoalProgress = goals.length > 0
    ? Math.round(goals.reduce((s, g) => s + g.progress, 0) / goals.length)
    : 0

  const overviewStats = [
    { icon: Activity, label: 'Taxa de hábitos', value: `${avgHabitRate}%`, color: '#5E6AD2' },
    { icon: Flame, label: 'Melhor streak', value: `${bestStreak}d`, color: '#F59E0B' },
    { icon: Target, label: 'Progresso metas', value: `${avgGoalProgress}%`, color: '#10B981' },
    { icon: TrendingUp, label: 'Tarefas feitas', value: completedTasks.toString(), color: '#8B5CF6' },
  ]

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-8">
      <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">Analytics</h1>
        <p className="text-sm text-[var(--text-tertiary)] mt-0.5">Sua evolução em números</p>
      </motion.div>

      {/* Overview stats */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6"
      >
        {overviewStats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 + i * 0.04 }}
            className="flex flex-col items-center gap-1.5 py-4 rounded-xl"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
          >
            <s.icon size={18} style={{ color: s.color }} />
            <div className="text-lg font-bold" style={{ color: s.color }}>{s.value}</div>
            <div className="text-[11px] text-[var(--text-tertiary)]">{s.label}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-4 rounded-xl"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
        >
          <WeeklyHabitsChart />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.13 }}
          className="p-4 rounded-xl"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
        >
          <TasksCompletionChart />
        </motion.div>
      </div>

      {/* Heatmap */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.16 }}
        className="p-4 rounded-xl"
        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
      >
        <HabitHeatmap />
      </motion.div>

      {/* Habit breakdown */}
      {habits.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-4 p-4 rounded-xl"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
        >
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Performance por hábito</h3>
          <div className="space-y-3">
            {habits.map(habit => {
              const stats = getStats(habit.id)
              const color = CATEGORY_COLORS[habit.category] ?? '#5E6AD2'
              return (
                <div key={habit.id} className="flex items-center gap-3">
                  <span className="text-base w-6 flex-shrink-0">{habit.icon}</span>
                  <span className="text-sm text-[var(--text-secondary)] flex-1 min-w-0 truncate">{habit.name}</span>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="w-24 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--surface-active)' }}>
                      <div className="h-full rounded-full" style={{ width: `${stats.completionRate}%`, background: color }} />
                    </div>
                    <span className="text-xs font-medium w-8 text-right" style={{ color }}>{stats.completionRate}%</span>
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
