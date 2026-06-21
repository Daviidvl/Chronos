'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { format, isToday, parseISO, addWeeks, subWeeks } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Check, Clock, CalendarDays } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { getWeekDays, timeRange } from '@/lib/utils'
import type { Task, Category } from '@/types'

function CategoryBadge({ color, name }: { color: string; name: string }) {
  return (
    <span className="badge" style={{ background: color + '18', color }}>
      {name}
    </span>
  )
}

function TaskRow({
  task, onToggle,
}: {
  task: Task & { category?: Category }
  onToggle: (id: string, done: boolean) => void
}) {
  return (
    <div
      className="list-row"
      style={{ opacity: task.completed ? 0.45 : 1 }}
    >
      <button
        onClick={() => onToggle(task.id, !task.completed)}
        className={`check${task.completed ? ' check--done' : ''}`}
        style={{ flexShrink: 0 }}
      >
        {task.completed && <Check size={11} strokeWidth={3} color="#fff" />}
      </button>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p className={`task-title${task.completed ? ' task-title--done' : ''}`}>
          {task.title}
        </p>
        {task.start_time && (
          <span className="task-meta" style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 3 }}>
            <Clock size={11} />
            {timeRange(task.start_time, task.end_time)}
          </span>
        )}
      </div>

      {task.category && (
        <CategoryBadge
          color={(task.category as Category).color}
          name={(task.category as Category).name}
        />
      )}
    </div>
  )
}

export default function SemanaPage() {
  const [weekBase, setWeekBase]       = useState(new Date())
  const [tasks, setTasks]             = useState<Task[]>([])
  const [selectedDay, setSelectedDay] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [loading, setLoading]         = useState(true)

  const weekDays  = getWeekDays(weekBase)
  const weekStart = format(weekDays[0], 'yyyy-MM-dd')
  const weekEnd   = format(weekDays[6], 'yyyy-MM-dd')

  const load = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('tasks')
      .select('*, category:categories(*)')
      .eq('user_id', user.id)
      .gte('date', weekStart)
      .lte('date', weekEnd)
      .order('start_time', { ascending: true, nullsFirst: false })

    setTasks((data as Task[]) ?? [])
    setLoading(false)
  }, [weekStart, weekEnd])

  useEffect(() => { load() }, [load])

  const toggleTask = async (id: string, done: boolean) => {
    setTasks(ts => ts.map(t => t.id === id ? { ...t, completed: done } : t))
    const supabase = createClient()
    await supabase.from('tasks').update({ completed: done }).eq('id', id)
  }

  const dayTasks = tasks.filter(t => t.date === selectedDay)
  const pending  = dayTasks.filter(t => !t.completed)
  const done     = dayTasks.filter(t => t.completed)

  return (
    <div className="page">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
          <h1 className="t-display">Semana</h1>
          <div style={{ display: 'flex', gap: 8 }}>
            {[
              { action: () => setWeekBase(d => subWeeks(d, 1)), Icon: ChevronLeft },
              { action: () => setWeekBase(d => addWeeks(d, 1)), Icon: ChevronRight },
            ].map(({ action, Icon }, i) => (
              <button
                key={i}
                onClick={action}
                className="btn-icon"
                style={{ width: 40, height: 40, border: '1.5px solid var(--bdr-2)', borderRadius: 'var(--r-xs)' }}
              >
                <Icon size={16} />
              </button>
            ))}
          </div>
        </div>

        {/* Week strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 6, marginBottom: 32 }}>
          {weekDays.map(day => {
            const dateStr   = format(day, 'yyyy-MM-dd')
            const count     = tasks.filter(t => t.date === dateStr).length
            const doneCount = tasks.filter(t => t.date === dateStr && t.completed).length
            const active    = dateStr === selectedDay
            const todayDay  = isToday(day)

            return (
              <button
                key={dateStr}
                onClick={() => setSelectedDay(dateStr)}
                className={`day-btn${active ? ' day-btn--active' : todayDay ? ' day-btn--today' : ''}`}
              >
                <span style={{
                  fontSize: 9,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: active ? 'rgba(255,255,255,0.6)' : '#C2CAD8',
                  marginBottom: 4,
                  display: 'block',
                }}>
                  {format(day, 'EEE', { locale: ptBR }).slice(0, 3)}
                </span>
                <span style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: active ? '#FFFFFF' : todayDay ? '#6E5CF6' : '#121826',
                  display: 'block',
                }}>
                  {format(day, 'd')}
                </span>
                {count > 0 && (
                  <div style={{
                    width: 4,
                    height: 4,
                    borderRadius: '50%',
                    background: active
                      ? 'rgba(255,255,255,0.55)'
                      : doneCount === count ? '#2CC08C' : '#6E5CF6',
                    marginTop: 5,
                  }} />
                )}
              </button>
            )
          })}
        </div>

        {/* Selected day title */}
        <p style={{ fontSize: 15, fontWeight: 600, color: '#6E7787', marginBottom: 20, textTransform: 'capitalize' }}>
          {isToday(parseISO(selectedDay))
            ? 'Hoje'
            : format(parseISO(selectedDay), "EEEE, d 'de' MMMM", { locale: ptBR })}
        </p>
      </motion.div>

      {/* Task list */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[1, 2].map(i => (
            <div key={i} className="card skel" style={{ height: 72 }} />
          ))}
        </div>
      ) : dayTasks.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">
            <CalendarDays size={22} />
          </div>
          <p className="empty-title">Nenhuma tarefa neste dia</p>
        </div>
      ) : (
        <div>
          {pending.length > 0 && (
            <div className="card-flat" style={{ marginBottom: 10, overflow: 'hidden' }}>
              {pending.map(task => (
                <TaskRow key={task.id} task={task} onToggle={toggleTask} />
              ))}
            </div>
          )}

          {done.length > 0 && (
            <>
              <p className="t-label" style={{ marginBottom: 10, paddingLeft: 2 }}>
                Concluídas · {done.length}
              </p>
              <div className="card-flat" style={{ overflow: 'hidden' }}>
                {done.map(task => (
                  <TaskRow key={task.id} task={task} onToggle={toggleTask} />
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
