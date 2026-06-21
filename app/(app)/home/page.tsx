'use client'

import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useUserStore } from '@/lib/store/useUserStore'
import { useHabitsStore } from '@/lib/store/useHabitsStore'
import { useGoalsStore } from '@/lib/store/useGoalsStore'
import { useCalendarStore } from '@/lib/store/useCalendarStore'
import { HeroCard } from '@/components/home/HeroCard'
import { CATEGORY_COLORS } from '@/types'
import { todayISO, last365Days, daysLabel, greeting } from '@/lib/utils'
import { CheckCircle2, ChevronRight } from 'lucide-react'
import Link from 'next/link'

function SectionLabel({ title, href }: { title: string; href: string }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <span className="section-label">{title}</span>
      <Link
        href={href}
        className="flex items-center gap-0.5 text-[11px] font-medium transition-colors"
        style={{ color: 'var(--t4)' }}
      >
        Ver tudo <ChevronRight size={11} />
      </Link>
    </div>
  )
}

function DayTimeline() {
  const { getEventsForDate } = useCalendarStore()
  const today = todayISO()
  const events = getEventsForDate(today)
  if (events.length === 0) return null

  const now = new Date()
  const nowMin = now.getHours() * 60 + now.getMinutes()

  return (
    <section>
      <SectionLabel title="Agenda de hoje" href="/agenda" />
      <div className="flex gap-2 overflow-x-auto pb-0.5" style={{ scrollbarWidth: 'none' }}>
        {events.map((e, i) => {
          const color = CATEGORY_COLORS[e.category]
          const [h, m] = e.startTime.split(':').map(Number)
          const eMin = h * 60 + m
          const isPast = e.endTime
            ? (() => { const [eh, em] = e.endTime.split(':').map(Number); return eh * 60 + em < nowMin })()
            : eMin < nowMin
          const isNow = e.endTime
            ? (() => { const [eh, em] = e.endTime.split(':').map(Number); return eMin <= nowMin && eh * 60 + em >= nowMin })()
            : false

          return (
            <motion.div
              key={e.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: isPast && !isNow ? 0.35 : 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="flex-shrink-0 px-4 py-3 rounded-[16px] relative overflow-hidden min-w-[120px]"
              style={{
                background: isNow ? `${color}14` : 'var(--surface)',
                border: `1px solid ${isNow ? color + '40' : 'var(--border)'}`,
              }}
            >
              {isNow && (
                <div className="absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: color }} />
              )}
              <div className="text-[11px] font-medium mb-1 tabular-nums" style={{ color }}>{e.startTime}</div>
              <div className="text-[13px] font-medium leading-snug" style={{ color: 'var(--t1)' }}>{e.title}</div>
              {e.endTime && (
                <div className="text-[11px] mt-1" style={{ color: 'var(--t4)' }}>
                  {(() => {
                    const diff = (parseInt(e.endTime.split(':')[0]) * 60 + parseInt(e.endTime.split(':')[1]))
                      - (parseInt(e.startTime.split(':')[0]) * 60 + parseInt(e.startTime.split(':')[1]))
                    return diff < 60 ? `${diff}min` : `${Math.floor(diff / 60)}h${diff % 60 ? diff % 60 + 'min' : ''}`
                  })()}
                </div>
              )}
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}

function HabitStrip() {
  const { getActiveHabits, getLogForDate, toggleHabit } = useHabitsStore()
  const today = todayISO()
  const habits = getActiveHabits().slice(0, 5)
  if (habits.length === 0) return null

  return (
    <section>
      <SectionLabel title="Hábitos" href="/habitos" />
      <div className="space-y-1.5">
        {habits.map((h, i) => {
          const done = getLogForDate(h.id, today)?.completed ?? false
          return (
            <motion.div
              key={h.id}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-3 px-4 py-3 rounded-[14px]"
              style={{
                background: done ? `${h.color}0A` : 'var(--surface)',
                border: `1px solid ${done ? h.color + '25' : 'var(--border)'}`,
              }}
            >
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: h.color, opacity: done ? 1 : 0.5 }} />
              <span
                className="flex-1 text-[13px]"
                style={{ color: done ? 'var(--t3)' : 'var(--t2)', textDecoration: done ? 'line-through' : 'none' }}
              >
                {h.name}
              </span>
              <button
                onClick={() => toggleHabit(h.id)}
                className="w-6 h-6 rounded-full flex items-center justify-center transition-all flex-shrink-0"
                style={{
                  background: done ? h.color : 'transparent',
                  border: `1.5px solid ${done ? h.color : 'rgba(255,255,255,0.12)'}`,
                }}
              >
                {done && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 28 }}>
                    <CheckCircle2 size={12} strokeWidth={2.5} className="text-white" />
                  </motion.div>
                )}
              </button>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}

function GoalCards() {
  const { getActiveGoals } = useGoalsStore()
  const goals = getActiveGoals().slice(0, 3)
  if (goals.length === 0) return null

  return (
    <section>
      <SectionLabel title="Metas" href="/metas" />
      <div className="space-y-2">
        {goals.map((g, i) => {
          const color = CATEGORY_COLORS[g.category]
          const days = g.deadline ? Math.ceil((new Date(g.deadline).getTime() - Date.now()) / 86400000) : null
          return (
            <motion.div
              key={g.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="px-4 py-3.5 rounded-[14px]"
              style={{ background: 'var(--surface)', border: `1px solid var(--border)`, borderLeftColor: color, borderLeftWidth: 2 }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[13px] font-medium" style={{ color: 'var(--t1)' }}>{g.title}</span>
                <div className="flex items-center gap-2">
                  {days !== null && (
                    <span className="text-[11px]" style={{ color: days <= 14 ? 'var(--red)' : 'var(--t4)' }}>
                      {daysLabel(days)}
                    </span>
                  )}
                  <span className="text-[12px] font-semibold tabular-nums" style={{ color }}>{g.progress}%</span>
                </div>
              </div>
              <div className="h-[3px] rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${g.progress}%` }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}

function HeatmapCard() {
  const { habits, logs } = useHabitsStore()
  const days = last365Days()
  const maxPerDay = habits.length || 1

  const weeks: string[][] = []
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7))
  }

  return (
    <section>
      <span className="section-label block mb-3">Consistência anual</span>
      <div
        className="p-4 rounded-[16px] overflow-x-auto"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        <div className="flex gap-[3px]" style={{ width: 'max-content' }}>
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[3px]">
              {week.map(d => {
                const count = logs.filter(l => l.date === d && l.completed).length
                const intensity = Math.min(count / maxPerDay, 1)
                return (
                  <div
                    key={d}
                    className="hm-cell"
                    title={d}
                    style={{
                      background: count === 0
                        ? 'rgba(255,255,255,0.05)'
                        : `rgba(99,102,241,${0.15 + intensity * 0.85})`,
                    }}
                  />
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default function HomePage() {
  const { user } = useUserStore()
  const now = new Date()

  return (
    <div className="max-w-2xl mx-auto px-5 pt-10 pb-8 space-y-10">
      <motion.header initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22 }}>
        <p className="text-[12px] capitalize mb-2" style={{ color: 'var(--t3)' }}>
          {format(now, "EEEE, dd 'de' MMMM", { locale: ptBR })}
        </p>
        <h1
          className="text-[34px] font-semibold leading-tight"
          style={{ color: 'var(--t1)', letterSpacing: '-0.5px' }}
        >
          {greeting()}, {user.name}.
        </h1>
      </motion.header>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.07 }}>
        <HeroCard />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
        <DayTimeline />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}>
        <HabitStrip />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <GoalCards />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }}>
        <HeatmapCard />
      </motion.div>
    </div>
  )
}
