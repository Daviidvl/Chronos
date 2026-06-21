'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, Check, Flame, Repeat2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { todayISO, last7Days } from '@/lib/utils'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { Habit, HabitLog } from '@/types'

const PALETTE = [
  '#6E5CF6', '#2CC08C', '#F79009', '#F04438',
  '#8B5CF6', '#EC4899', '#0EA5E9', '#14B8A6',
]

/* ── Habit Card ───────────────────────────────────────── */
function HabitCard({
  habit, logs, onToggle, onDelete,
}: {
  habit: Habit
  logs: HabitLog[]
  onToggle: (habitId: string, date: string, done: boolean) => void
  onDelete: (id: string) => void
}) {
  const today    = todayISO()
  const days     = last7Days()
  const todayLog = logs.find(l => l.habit_id === habit.id && l.date === today)
  const done     = todayLog?.completed ?? false

  const streak = (() => {
    let s = 0
    for (let i = days.length - 1; i >= 0; i--) {
      if (logs.find(l => l.habit_id === habit.id && l.date === days[i])?.completed) s++
      else break
    }
    return s
  })()

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="card"
      style={{ padding: '16px 18px' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>

        {/* Left color bar */}
        <div style={{ width: 3, height: 44, borderRadius: 99, background: habit.color, flexShrink: 0 }} />

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Name row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <span style={{ fontSize: 15, fontWeight: 600, color: '#121826' }}>
              {habit.name}
            </span>
            {streak >= 2 && (
              <span
                className="badge-pill"
                style={{ background: '#FEF3C7', color: '#D97706' }}
              >
                <Flame size={9} />
                {streak}
              </span>
            )}
          </div>

          {/* 7-day dots */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6 }}>
            {days.map(d => {
              const filled  = logs.find(l => l.habit_id === habit.id && l.date === d)?.completed ?? false
              const isToday = d === today
              return (
                <div key={d} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                  <div
                    className="habit-dot"
                    style={{
                      width:      isToday ? 14 : 10,
                      height:     isToday ? 14 : 10,
                      background: filled ? habit.color : isToday ? habit.color + '28' : 'var(--bdr-2)',
                    }}
                  />
                  {isToday && (
                    <div style={{ width: 4, height: 4, borderRadius: '50%', background: habit.color + '70' }} />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Check button */}
        <button
          onClick={() => onToggle(habit.id, today, !done)}
          style={{
            width: 40,
            height: 40,
            borderRadius: 'var(--r-xs)',
            border: `2px solid ${done ? habit.color : 'var(--bdr-2)'}`,
            background: done ? habit.color : 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            cursor: 'pointer',
            transition: 'all 0.18s ease',
          }}
        >
          <AnimatePresence>
            {done && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={{ type: 'spring', stiffness: 600, damping: 30 }}
              >
                <Check size={15} strokeWidth={3} color="#fff" />
              </motion.div>
            )}
          </AnimatePresence>
        </button>

        {/* Delete */}
        <button onClick={() => onDelete(habit.id)} className="btn-icon danger">
          <X size={14} />
        </button>
      </div>
    </motion.div>
  )
}

/* ── Add Sheet ────────────────────────────────────────── */
function AddSheet({ onClose, onAdd, userId }: {
  onClose: () => void
  onAdd: (h: Habit) => void
  userId: string
}) {
  const [name, setName]   = useState('')
  const [color, setColor] = useState(PALETTE[0])
  const [saving, setSaving] = useState(false)

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from('habits')
      .insert({ user_id: userId, name: name.trim(), color, active: true })
      .select()
      .single()
    if (!error && data) { onAdd(data as Habit); onClose() }
    setSaving(false)
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        style={{ position: 'fixed', inset: 0, zIndex: 40, background: 'rgba(18,24,38,0.32)', backdropFilter: 'blur(8px)' }}
        onClick={onClose}
      />
      <motion.div
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 380, damping: 42 }}
        style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
          background: '#FFFFFF',
          borderRadius: 'var(--r-lg) var(--r-lg) 0 0',
          boxShadow: 'var(--sh-lg)',
        }}
        className="sheet-body"
      >
        <div className="sheet-handle" />
        <div className="sheet-header">
          <span style={{ fontSize: 17, fontWeight: 700, color: '#121826', letterSpacing: '-0.3px' }}>
            Novo hábito
          </span>
          <button onClick={onClose} className="btn-icon"><X size={16} /></button>
        </div>

        <form onSubmit={handleAdd}>
          <div style={{ marginBottom: 20 }}>
            <input
              autoFocus
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ex: Leitura, Treino, Meditação..."
              className="field"
            />
          </div>

          <div style={{ marginBottom: 28 }}>
            <label className="form-label">Cor</label>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 10 }}>
              {PALETTE.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`color-swatch${color === c ? ' color-swatch--active' : ''}`}
                  style={{ background: c, outlineColor: c }}
                />
              ))}
            </div>
          </div>

          <button type="submit" disabled={!name.trim() || saving} className="btn btn-brand">
            {saving ? 'A guardar...' : 'Criar hábito'}
          </button>
        </form>
      </motion.div>
    </>
  )
}

/* ── Skeleton ─────────────────────────────────────────── */
function HabitSkeleton() {
  return (
    <div className="card" style={{ padding: '16px 18px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div className="skel" style={{ width: 3, height: 44, borderRadius: 99, flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div className="skel" style={{ height: 14, width: '45%', marginBottom: 12 }} />
          <div style={{ display: 'flex', gap: 6 }}>
            {[1,2,3,4,5,6,7].map(i => (
              <div key={i} className="skel" style={{ width: 10, height: 10, borderRadius: 4 }} />
            ))}
          </div>
        </div>
        <div className="skel" style={{ width: 40, height: 40, borderRadius: 'var(--r-xs)', flexShrink: 0 }} />
      </div>
    </div>
  )
}

/* ── Page ─────────────────────────────────────────────── */
export default function HabitosPage() {
  const [habits, setHabits]   = useState<Habit[]>([])
  const [logs, setLogs]       = useState<HabitLog[]>([])
  const [userId, setUserId]   = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setUserId(user.id)

    const days = last7Days()
    const [{ data: habitsData }, { data: logsData }] = await Promise.all([
      supabase.from('habits').select('*').eq('user_id', user.id).eq('active', true).order('created_at'),
      supabase.from('habit_logs').select('*').eq('user_id', user.id).in('date', days),
    ])
    setHabits((habitsData as Habit[]) ?? [])
    setLogs((logsData as HabitLog[]) ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const toggleHabit = async (habitId: string, date: string, done: boolean) => {
    setLogs(ls => {
      const ex = ls.find(l => l.habit_id === habitId && l.date === date)
      if (ex) return ls.map(l => l.habit_id === habitId && l.date === date ? { ...l, completed: done } : l)
      return [...ls, { id: crypto.randomUUID(), habit_id: habitId, user_id: userId, date, completed: done }]
    })
    const supabase = createClient()
    await supabase.from('habit_logs').upsert(
      { habit_id: habitId, user_id: userId, date, completed: done },
      { onConflict: 'habit_id,date' }
    )
  }

  const deleteHabit = async (id: string) => {
    setHabits(hs => hs.filter(h => h.id !== id))
    const supabase = createClient()
    await supabase.from('habits').update({ active: false }).eq('id', id)
  }

  const today     = todayISO()
  const doneToday = habits.filter(h => logs.find(l => l.habit_id === h.id && l.date === today)?.completed).length

  return (
    <div className="page">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 40 }}
      >
        <div>
          <h1 className="t-display">Hábitos</h1>
          {habits.length > 0 && (
            <p style={{ fontSize: 14, color: '#9BA5B4', marginTop: 6, fontWeight: 400 }}>
              {doneToday} de {habits.length} hoje
            </p>
          )}
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="btn btn-brand"
          style={{ width: 'auto', minHeight: 44, padding: '0 18px', fontSize: 14 }}
        >
          <Plus size={15} strokeWidth={2.5} />
          Novo
        </button>
      </motion.header>

      {/* Day labels */}
      {!loading && habits.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8, paddingRight: 72 }}>
          {last7Days().map(d => (
            <div
              key={d}
              style={{
                width: d === today ? 14 : 10,
                marginRight: d === today ? 12 : 6,
                textAlign: 'center',
                fontSize: 9,
                fontWeight: 700,
                color: '#C2CAD8',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              {format(parseISO(d), 'EEE', { locale: ptBR }).slice(0, 1)}
            </div>
          ))}
        </div>
      )}

      {/* List */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[1, 2, 3].map(i => <HabitSkeleton key={i} />)}
        </div>
      ) : habits.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="empty">
          <div className="empty-icon" style={{ background: '#D3F9EE', color: '#2CC08C' }}>
            <Repeat2 size={24} />
          </div>
          <p className="empty-title">Nenhum hábito ainda</p>
          <p className="empty-sub">Cria o teu primeiro hábito</p>
        </motion.div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <AnimatePresence mode="popLayout">
            {habits.map(h => (
              <HabitCard key={h.id} habit={h} logs={logs} onToggle={toggleHabit} onDelete={deleteHabit} />
            ))}
          </AnimatePresence>
        </div>
      )}

      <AnimatePresence>
        {showAdd && (
          <AddSheet
            onClose={() => setShowAdd(false)}
            onAdd={h => setHabits(hs => [...hs, h])}
            userId={userId}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
