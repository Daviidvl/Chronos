import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, AlarmClock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { todayISO } from '@/lib/utils'
import type { Habit, HabitLog } from '@/types'

/* ── Timeline Item ─────────────────────────────────────── */
function TimelineItem({ habit, done, onToggle }: {
  habit: Habit
  done: boolean
  onToggle: () => void
}) {
  return (
    <motion.div
      layout
      style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0', position: 'relative' }}
    >
      {/* Time label */}
      <div style={{
        width: 44, fontSize: 12, fontWeight: 600,
        color: done ? '#C2CAD8' : '#9BA5B4',
        textAlign: 'right', flexShrink: 0, letterSpacing: '-0.2px',
        fontVariantNumeric: 'tabular-nums',
      }}>
        {habit.time}
      </div>

      {/* Dot on timeline */}
      <div style={{
        width: 10, height: 10, borderRadius: '50%',
        background: done ? habit.color : '#fff',
        border: `2.5px solid ${done ? habit.color : habit.color + '70'}`,
        flexShrink: 0, zIndex: 1,
        transition: 'all 0.2s',
      }} />

      {/* Name */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <span style={{
          fontSize: 15,
          fontWeight: done ? 400 : 600,
          color: done ? '#9BA5B4' : '#121826',
          textDecoration: done ? 'line-through' : 'none',
          textDecorationColor: '#C2CAD8',
          transition: 'all 0.2s',
        }}>
          {habit.name}
        </span>
      </div>

      {/* Check button */}
      <button
        onClick={onToggle}
        style={{
          width: 36, height: 36,
          borderRadius: 'var(--r-xs)',
          border: `2px solid ${done ? habit.color : 'var(--bdr-2)'}`,
          background: done ? habit.color : 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, cursor: 'pointer', transition: 'all 0.18s ease',
        }}
      >
        <AnimatePresence>
          {done && (
            <motion.div
              initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
              transition={{ type: 'spring', stiffness: 600, damping: 30 }}
            >
              <Check size={14} strokeWidth={3} color="#fff" />
            </motion.div>
          )}
        </AnimatePresence>
      </button>
    </motion.div>
  )
}

/* ── Skeleton ───────────────────────────────────────────── */
function RoutineSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 0' }}>
          <div className="skel" style={{ width: 44, height: 13, borderRadius: 6, flexShrink: 0 }} />
          <div className="skel" style={{ width: 10, height: 10, borderRadius: '50%', flexShrink: 0 }} />
          <div className="skel" style={{ flex: 1, height: 13, borderRadius: 6, maxWidth: `${40 + i * 15}%` }} />
          <div className="skel" style={{ width: 36, height: 36, borderRadius: 'var(--r-xs)', flexShrink: 0 }} />
        </div>
      ))}
    </div>
  )
}

/* ── Page ─────────────────────────────────────────────────── */
export default function RotinaPage() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [logs, setLogs]     = useState<HabitLog[]>([])
  const [userId, setUserId] = useState('')
  const [loading, setLoading] = useState(true)

  const today = todayISO()

  const load = useCallback(async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }
      setUserId(user.id)

      const [{ data: habitsData }, { data: logsData }] = await Promise.all([
        supabase
          .from('habits')
          .select('*')
          .eq('user_id', user.id)
          .eq('active', true)
          .order('time', { ascending: true, nullsFirst: false }),
        supabase.from('habit_logs').select('*').eq('user_id', user.id).eq('date', today),
      ])

      setHabits((habitsData as Habit[]) ?? [])
      setLogs((logsData as HabitLog[]) ?? [])
    } catch (e) { console.error('rotina load error:', e) } finally { setLoading(false) }
  }, [today])

  useEffect(() => { load() }, [load])

  const toggleHabit = async (habit: Habit, done: boolean) => {
    const existing = logs.find(l => l.habit_id === habit.id)
    const supabase = createClient()

    if (existing) {
      setLogs(ls => ls.map(l => l.id === existing.id ? { ...l, completed: done } : l))
      await supabase.from('habit_logs').update({ completed: done }).eq('id', existing.id)
    } else {
      const { data } = await supabase
        .from('habit_logs')
        .insert({ user_id: userId, habit_id: habit.id, date: today, completed: done })
        .select()
        .single()
      if (data) setLogs(ls => [...ls, data as HabitLog])
    }
  }

  const isDone = (habit: Habit) => logs.find(l => l.habit_id === habit.id)?.completed ?? false

  const habitsWithTime    = habits.filter(h => h.time)
  const habitsWithoutTime = habits.filter(h => !h.time)

  const doneCount = habits.filter(h => isDone(h)).length
  const total     = habits.length

  return (
    <div className="page">
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: 32 }}
      >
        <h1 className="t-display">Rotina</h1>
        {total > 0 && (
          <p style={{ fontSize: 14, color: '#9BA5B4', marginTop: 6 }}>
            {doneCount} de {total} concluídos hoje
          </p>
        )}
      </motion.header>

      {loading ? (
        <RoutineSkeleton />
      ) : habits.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="empty">
          <div className="empty-icon">
            <AlarmClock size={24} />
          </div>
          <p className="empty-title">Sem rotina definida</p>
          <p className="empty-sub">
            Vai a Hábitos, cria os teus hábitos e adiciona um horário a cada um para construir o script do dia.
          </p>
        </motion.div>
      ) : (
        <div>
          {/* Timeline com horário */}
          {habitsWithTime.length > 0 && (
            <div style={{ position: 'relative', marginBottom: habitsWithoutTime.length > 0 ? 32 : 0 }}>
              {/* Vertical connector line */}
              {habitsWithTime.length > 1 && (
                <div style={{
                  position: 'absolute',
                  left: 60,
                  top: 28,
                  bottom: 28,
                  width: 1.5,
                  background: 'var(--bdr-2)',
                  zIndex: 0,
                }} />
              )}

              {habitsWithTime.map(h => (
                <TimelineItem
                  key={h.id}
                  habit={h}
                  done={isDone(h)}
                  onToggle={() => toggleHabit(h, !isDone(h))}
                />
              ))}
            </div>
          )}

          {/* Sem horário */}
          {habitsWithoutTime.length > 0 && (
            <div>
              <p style={{
                fontSize: 11, fontWeight: 700, color: '#C2CAD8',
                textTransform: 'uppercase', letterSpacing: '0.08em',
                marginBottom: 12,
              }}>
                Sem horário
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {habitsWithoutTime.map(h => {
                  const done = isDone(h)
                  return (
                    <div
                      key={h.id}
                      className="card"
                      style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}
                    >
                      <div style={{ width: 3, height: 36, borderRadius: 99, background: h.color, flexShrink: 0 }} />
                      <span style={{
                        flex: 1, fontSize: 15,
                        fontWeight: done ? 400 : 600,
                        color: done ? '#9BA5B4' : '#121826',
                        textDecoration: done ? 'line-through' : 'none',
                        textDecorationColor: '#C2CAD8',
                      }}>
                        {h.name}
                      </span>
                      <button
                        onClick={() => toggleHabit(h, !done)}
                        style={{
                          width: 36, height: 36,
                          borderRadius: 'var(--r-xs)',
                          border: `2px solid ${done ? h.color : 'var(--bdr-2)'}`,
                          background: done ? h.color : 'transparent',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0, cursor: 'pointer', transition: 'all 0.18s',
                        }}
                      >
                        <AnimatePresence>
                          {done && (
                            <motion.div
                              initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                              transition={{ type: 'spring', stiffness: 600, damping: 30 }}
                            >
                              <Check size={14} strokeWidth={3} color="#fff" />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
