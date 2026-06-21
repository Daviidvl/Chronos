'use client'

import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useUserStore } from '@/lib/store/useUserStore'
import { useJournalStore } from '@/lib/store/useJournalStore'
import { greeting } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { DayStats } from '@/components/dashboard/DayStats'
import { TodayHabits } from '@/components/dashboard/TodayHabits'
import { TodayAgenda } from '@/components/dashboard/TodayAgenda'
import { TodayTasks } from '@/components/dashboard/TodayTasks'
import { ActiveGoals } from '@/components/dashboard/ActiveGoals'
import { Sun, Flame, Edit3, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { useHabitsStore } from '@/lib/store/useHabitsStore'
import { todayISO } from '@/lib/utils'

function ReflectionCard() {
  const { getOrCreateToday, updateEntry } = useJournalStore()
  const [entry, setEntry] = useState(() => getOrCreateToday())
  const [saving, setSaving] = useState(false)

  const questions = [
    { key: 'content', label: 'Como foi meu dia?', placeholder: 'Escreva sobre seu dia...' },
  ]

  const handleChange = (value: string) => {
    setSaving(true)
    const updated = { ...entry, content: value }
    setEntry(updated)
    updateEntry(entry.id, { content: value })
    setTimeout(() => setSaving(false), 1000)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reflexão do dia</CardTitle>
        <div className="flex items-center gap-2">
          {saving && <span className="text-[11px] text-[var(--text-tertiary)]">Salvando...</span>}
          <Link href="/journal">
            <Edit3 size={14} className="text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors cursor-pointer" />
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <textarea
          value={entry.content}
          onChange={e => handleChange(e.target.value)}
          placeholder="Como foi seu dia? O que você aprendeu? O que pode melhorar?"
          className="w-full min-h-[100px] text-sm leading-relaxed resize-none outline-none placeholder:text-[var(--text-tertiary)]"
          style={{ background: 'transparent', color: 'var(--text-secondary)', fontFamily: 'inherit' }}
        />
      </CardContent>
    </Card>
  )
}

function StreakCard() {
  const { getActiveHabits, getStats } = useHabitsStore()
  const habits = getActiveHabits()
  const maxStreak = habits.reduce((max, h) => {
    const s = getStats(h.id)
    return Math.max(max, s.currentStreak)
  }, 0)

  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-xl"
      style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)' }}
    >
      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl">🔥</div>
      <div>
        <div className="text-sm font-semibold text-[var(--text-primary)]">{maxStreak} dias de sequência</div>
        <div className="text-xs text-[var(--text-tertiary)]">Não quebre o ritmo!</div>
      </div>
      <div className="ml-auto text-2xl font-bold" style={{ color: '#F59E0B' }}>{maxStreak}</div>
    </div>
  )
}

export default function TodayPage() {
  const { user } = useUserStore()
  const now = new Date()
  const dateLabel = format(now, "EEEE, dd 'de' MMMM", { locale: ptBR })

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 md:py-8 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sun size={16} className="text-[var(--warning)]" />
              <span className="text-sm text-[var(--text-tertiary)] capitalize">{dateLabel}</span>
            </div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
              {greeting()}, {user.name} 👋
            </h1>
          </div>
        </div>
      </motion.div>

      {/* Day overview */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, duration: 0.25 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Progresso do dia</CardTitle>
          </CardHeader>
          <CardContent>
            <DayStats />
          </CardContent>
        </Card>
      </motion.div>

      {/* Streak */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08, duration: 0.25 }}
      >
        <StreakCard />
      </motion.div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Habits */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.25 }}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Hábitos de hoje</CardTitle>
              <Link href="/habits" className="flex items-center gap-1 text-xs text-[var(--text-tertiary)] hover:text-[var(--accent)] transition-colors">
                Ver todos <ChevronRight size={12} />
              </Link>
            </CardHeader>
            <CardContent>
              <TodayHabits />
            </CardContent>
          </Card>
        </motion.div>

        {/* Agenda */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.13, duration: 0.25 }}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Agenda do dia</CardTitle>
              <Link href="/calendar" className="flex items-center gap-1 text-xs text-[var(--text-tertiary)] hover:text-[var(--accent)] transition-colors">
                Abrir <ChevronRight size={12} />
              </Link>
            </CardHeader>
            <CardContent>
              <TodayAgenda />
            </CardContent>
          </Card>
        </motion.div>

        {/* Tasks */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16, duration: 0.25 }}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Tarefas do dia</CardTitle>
              <Link href="/tasks" className="flex items-center gap-1 text-xs text-[var(--text-tertiary)] hover:text-[var(--accent)] transition-colors">
                Ver todas <ChevronRight size={12} />
              </Link>
            </CardHeader>
            <CardContent>
              <TodayTasks />
            </CardContent>
          </Card>
        </motion.div>

        {/* Goals */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.19, duration: 0.25 }}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Metas em andamento</CardTitle>
              <Link href="/goals" className="flex items-center gap-1 text-xs text-[var(--text-tertiary)] hover:text-[var(--accent)] transition-colors">
                Ver todas <ChevronRight size={12} />
              </Link>
            </CardHeader>
            <CardContent>
              <ActiveGoals />
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Reflection */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.22, duration: 0.25 }}
      >
        <ReflectionCard />
      </motion.div>
    </div>
  )
}
