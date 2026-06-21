'use client'

import { Ring } from '@/components/ui/Ring'
import { useHabitsStore } from '@/lib/store/useHabitsStore'
import { useTasksStore } from '@/lib/store/useTasksStore'
import { useCalendarStore } from '@/lib/store/useCalendarStore'
import { todayISO } from '@/lib/utils'
import { CATEGORY_COLORS } from '@/types'
import { motion } from 'framer-motion'
import { Clock } from 'lucide-react'

export function HeroCard() {
  const { getActiveHabits, getLogForDate } = useHabitsStore()
  const { tasks } = useTasksStore()
  const { getEventsForDate } = useCalendarStore()

  const today = todayISO()
  const habits = getActiveHabits()
  const habitsDone = habits.filter(h => getLogForDate(h.id, today)?.completed).length

  const todayTasks = tasks.filter(t => t.dueDate === today)
  const tasksDone = todayTasks.filter(t => t.completed).length

  const total = habits.length + todayTasks.length
  const done = habitsDone + tasksDone
  const progress = total > 0 ? Math.round((done / total) * 100) : 0

  const events = getEventsForDate(today)
  const now = `${String(new Date().getHours()).padStart(2,'0')}:${String(new Date().getMinutes()).padStart(2,'0')}`
  const nextEvent = events.find(e => e.startTime > now)
  const nextColor = nextEvent ? CATEGORY_COLORS[nextEvent.category] : null

  return (
    <div
      className="rounded-[24px] overflow-hidden"
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow)',
      }}
    >
      <div className="px-6 pt-6 pb-5">
        <div className="flex items-center gap-6">
          {/* Ring */}
          <div className="flex-shrink-0">
            <Ring
              progress={progress}
              size={108}
              strokeWidth={7}
              color="var(--accent)"
              label={`${progress}%`}
              sublabel="concluído"
            />
          </div>

          {/* Stats */}
          <div className="flex-1 min-w-0 flex flex-col gap-3">
            <Stat
              label="Hábitos"
              value={`${habitsDone} de ${habits.length}`}
              fraction={habits.length > 0 ? habitsDone / habits.length : 0}
              color="var(--green)"
            />
            <Stat
              label="Tarefas"
              value={`${tasksDone} de ${todayTasks.length}`}
              fraction={todayTasks.length > 0 ? tasksDone / todayTasks.length : 0}
              color="var(--accent)"
            />
          </div>
        </div>
      </div>

      {/* Next event footer */}
      {nextEvent && nextColor && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="px-6 py-3 flex items-center gap-2.5"
          style={{ borderTop: '1px solid var(--border)', background: `${nextColor}08` }}
        >
          <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 animate-pulse" style={{ background: nextColor }} />
          <Clock size={11} style={{ color: nextColor }} className="flex-shrink-0" />
          <span className="text-[12px] font-medium tabular-nums" style={{ color: nextColor }}>{nextEvent.startTime}</span>
          <span className="text-[12px] text-[var(--t2)] truncate">{nextEvent.title}</span>
        </motion.div>
      )}
    </div>
  )
}

function Stat({ label, value, fraction, color }: {
  label: string; value: string; fraction: number; color: string
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[12px]" style={{ color: 'var(--t3)' }}>{label}</span>
        <span className="text-[12px] font-medium tabular-nums" style={{ color }}>{value}</span>
      </div>
      <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${fraction * 100}%` }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        />
      </div>
    </div>
  )
}
