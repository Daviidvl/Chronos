'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useHabitsStore } from '@/lib/store/useHabitsStore'
import { useTasksStore } from '@/lib/store/useTasksStore'
import { useCalendarStore } from '@/lib/store/useCalendarStore'
import { CATEGORY_COLORS } from '@/types'
import { todayISO } from '@/lib/utils'
import { Check, Plus, Clock } from 'lucide-react'

function EventRow({ title, startTime, endTime, color, isPast }: {
  title: string; startTime: string; endTime?: string; color: string; isPast: boolean
}) {
  const duration = endTime ? (() => {
    const d = (parseInt(endTime.split(':')[0]) * 60 + parseInt(endTime.split(':')[1]))
      - (parseInt(startTime.split(':')[0]) * 60 + parseInt(startTime.split(':')[1]))
    return d < 60 ? `${d}min` : `${Math.floor(d / 60)}h${d % 60 ? d % 60 + 'min' : ''}`
  })() : null

  return (
    <div className={`flex items-center gap-4 py-3 ${isPast ? 'opacity-35' : ''}`}>
      <span className="text-[12px] w-11 flex-shrink-0 tabular-nums" style={{ color: 'var(--t3)' }}>{startTime}</span>
      <div className="w-px self-stretch" style={{ background: `${color}40` }} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: color }} />
          <span className="text-[14px]" style={{ color: 'var(--t1)' }}>{title}</span>
        </div>
        {duration && (
          <div className="flex items-center gap-1 mt-0.5 ml-3.5">
            <Clock size={10} style={{ color: 'var(--t4)' }} />
            <span className="text-[11px]" style={{ color: 'var(--t3)' }}>{duration}</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default function HojePage() {
  const { getActiveHabits, getLogForDate, toggleHabit } = useHabitsStore()
  const { tasks, addTask, toggleTask } = useTasksStore()
  const { getEventsForDate } = useCalendarStore()
  const [newTask, setNewTask] = useState('')

  const today = todayISO()
  const now = new Date()
  const nowMin = now.getHours() * 60 + now.getMinutes()

  const events = getEventsForDate(today)
  const habits = getActiveHabits()
  const todayTasks = tasks.filter(t => t.dueDate === today && !t.completed)
  const completedTasks = tasks.filter(t => t.dueDate === today && t.completed)

  const habitsComplete = habits.filter(h => getLogForDate(h.id, today)?.completed).length
  const total = habits.length + todayTasks.length + completedTasks.length
  const done = habitsComplete + completedTasks.length
  const pct = total > 0 ? Math.round((done / total) * 100) : 0

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTask.trim()) return
    addTask({ title: newTask.trim(), priority: 'medium', category: 'pessoal', important: false, dueDate: today })
    setNewTask('')
  }

  return (
    <div className="max-w-xl mx-auto px-5 pt-10 pb-8">
      {/* Header */}
      <motion.header initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <p className="text-[12px] capitalize mb-2" style={{ color: 'var(--t3)' }}>
          {format(now, "EEEE, dd 'de' MMMM", { locale: ptBR })}
        </p>
        <div className="flex items-end justify-between mb-4">
          <h1 className="text-[32px] font-semibold leading-none tracking-tight" style={{ color: 'var(--t1)', letterSpacing: '-0.4px' }}>
            Hoje
          </h1>
          <span className="text-[13px] tabular-nums" style={{ color: 'var(--t3)' }}>{pct}%</span>
        </div>
        <div className="h-[3px] rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'var(--accent)' }}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          />
        </div>
      </motion.header>

      <div className="space-y-10">
        {/* Agenda */}
        {events.length > 0 && (
          <motion.section initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
            <h2 className="section-label mb-3">Agenda</h2>
            <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
              {events.map(e => {
                const [eh, em] = e.endTime ? e.endTime.split(':').map(Number) : [0, 0]
                const isPast = e.endTime
                  ? eh * 60 + em < nowMin
                  : parseInt(e.startTime.split(':')[0]) * 60 + parseInt(e.startTime.split(':')[1]) < nowMin
                return (
                  <EventRow
                    key={e.id}
                    title={e.title}
                    startTime={e.startTime}
                    endTime={e.endTime}
                    color={CATEGORY_COLORS[e.category]}
                    isPast={isPast}
                  />
                )
              })}
            </div>
          </motion.section>
        )}

        {/* Hábitos */}
        {habits.length > 0 && (
          <motion.section initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
            <h2 className="section-label mb-3">
              Hábitos
              <span className="ml-1.5 font-normal normal-case" style={{ color: 'var(--t4)', letterSpacing: 0 }}>
                {habitsComplete}/{habits.length}
              </span>
            </h2>
            <div className="space-y-1.5">
              {habits.map(h => {
                const isDone = getLogForDate(h.id, today)?.completed ?? false
                return (
                  <motion.button
                    key={h.id}
                    onClick={() => toggleHabit(h.id)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-[14px] text-left transition-all"
                    style={{
                      background: isDone ? `${h.color}0C` : 'var(--surface)',
                      border: `1px solid ${isDone ? h.color + '28' : 'var(--border)'}`,
                    }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
                      style={{
                        background: isDone ? h.color : 'transparent',
                        border: `1.5px solid ${isDone ? h.color : 'rgba(255,255,255,0.12)'}`,
                      }}
                    >
                      <AnimatePresence>
                        {isDone && (
                          <motion.div
                            initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                          >
                            <Check size={12} strokeWidth={3} className="text-white" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    <span
                      className="flex-1 text-[14px]"
                      style={{
                        color: isDone ? 'var(--t3)' : 'var(--t2)',
                        textDecoration: isDone ? 'line-through' : 'none',
                      }}
                    >
                      {h.name}
                    </span>
                    <div
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ background: h.color, opacity: isDone ? 0.4 : 0.7 }}
                    />
                  </motion.button>
                )
              })}
            </div>
          </motion.section>
        )}

        {/* Tarefas */}
        <motion.section initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}>
          <h2 className="section-label mb-3">
            Tarefas
            <span className="ml-1.5 font-normal normal-case" style={{ color: 'var(--t4)', letterSpacing: 0 }}>
              {completedTasks.length}/{todayTasks.length + completedTasks.length}
            </span>
          </h2>

          <form
            onSubmit={handleAddTask}
            className="flex items-center gap-3 mb-2 px-4 py-3 rounded-[14px]"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            <div
              className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center"
              style={{ border: '1.5px dashed rgba(255,255,255,0.15)' }}
            >
              <Plus size={9} style={{ color: 'var(--t4)' }} />
            </div>
            <input
              value={newTask}
              onChange={e => setNewTask(e.target.value)}
              placeholder="Adicionar para hoje..."
              className="flex-1 text-[14px] bg-transparent outline-none"
              style={{ color: 'var(--t2)' }}
            />
          </form>

          <div className="space-y-0 divide-y" style={{ borderColor: 'var(--border)' }}>
            <AnimatePresence>
              {todayTasks.map((t, i) => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center gap-3 py-3"
                >
                  <button
                    onClick={() => toggleTask(t.id)}
                    className="w-5 h-5 rounded-full flex-shrink-0 transition-all"
                    style={{ border: '1.5px solid rgba(255,255,255,0.18)', background: 'transparent' }}
                  />
                  <span className="text-[14px]" style={{ color: 'var(--t2)' }}>{t.title}</span>
                </motion.div>
              ))}
              {completedTasks.map(t => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.35 }}
                  className="flex items-center gap-3 py-3"
                >
                  <div
                    className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center"
                    style={{ background: 'var(--green)', border: '1.5px solid var(--green)' }}
                  >
                    <Check size={10} strokeWidth={3} className="text-white" />
                  </div>
                  <span className="text-[14px] line-through" style={{ color: 'var(--t3)' }}>{t.title}</span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.section>
      </div>
    </div>
  )
}
