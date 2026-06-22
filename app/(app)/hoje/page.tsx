import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, Layers } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { todayISO, calcStreak } from '@/lib/utils'
import { useModal } from '@/lib/modal-context'
import { MotivationCard }   from '@/components/dashboard/MotivationCard'
import { StatsCards }       from '@/components/dashboard/StatsCards'
import { HabitsToday }      from '@/components/dashboard/HabitsToday'
import { TasksToday }       from '@/components/dashboard/TasksToday'
import { ProgressCard }     from '@/components/dashboard/ProgressCard'
import { TodayStudyCard }   from '@/components/dashboard/TodayStudyCard'
import type { Task, Category, Habit, HabitLog } from '@/types'

function AddSheet({
  onClose, onAdd, categories, userId,
}: {
  onClose: () => void
  onAdd: (task: Task) => void
  categories: Category[]
  userId: string
}) {
  const [title, setTitle]           = useState('')
  const [startTime, setStartTime]   = useState('')
  const [endTime, setEndTime]       = useState('')
  const [categoryId, setCategoryId] = useState<string | null>(null)
  const [priority, setPriority]     = useState<'high' | 'medium' | 'low'>('medium')
  const [saving, setSaving]         = useState(false)

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    setSaving(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        user_id:     userId,
        title:       title.trim(),
        date:        todayISO(),
        start_time:  startTime || null,
        end_time:    endTime   || null,
        category_id: categoryId,
        priority,
        completed:   false,
      })
      .select('*, category:categories(*)')
      .single()

    if (!error && data) { onAdd(data as Task); onClose() }
    setSaving(false)
  }

  const PRIORITIES: { value: 'high' | 'medium' | 'low'; label: string; color: string }[] = [
    { value: 'high',   label: 'Alta',  color: '#F04438' },
    { value: 'medium', label: 'Média', color: '#F79009' },
    { value: 'low',    label: 'Baixa', color: '#2CC08C' },
  ]

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="sheet-overlay"
        onClick={onClose}
      />
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 380, damping: 42 }}
        className="sheet-container sheet-body"
      >
        <div className="sheet-handle" />

        <div className="sheet-header">
          <span style={{ fontSize: 17, fontWeight: 700, color: '#121826', letterSpacing: '-0.3px' }}>
            Nova tarefa
          </span>
          <button onClick={onClose} className="btn-icon"><X size={16} /></button>
        </div>

        <form onSubmit={handleAdd}>
          <div style={{ marginBottom: 14 }}>
            <input
              autoFocus
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="O que vais fazer?"
              className="field"
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label className="form-label">Prioridade</label>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              {PRIORITIES.map(p => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setPriority(p.value)}
                  style={{
                    flex: 1,
                    height: 40,
                    borderRadius: 'var(--r-xs)',
                    border: `1.5px solid ${priority === p.value ? p.color : 'var(--bdr-2)'}`,
                    background: priority === p.value ? p.color + '15' : '#FFFFFF',
                    color: priority === p.value ? p.color : '#9BA5B4',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    fontFamily: 'inherit',
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
            {[
              { label: 'Início', value: startTime, set: setStartTime },
              { label: 'Fim',    value: endTime,   set: setEndTime },
            ].map(f => (
              <div key={f.label}>
                <label className="form-label">{f.label}</label>
                <input
                  type="time"
                  value={f.value}
                  onChange={e => f.set(e.target.value)}
                  className="field field-sm"
                />
              </div>
            ))}
          </div>

          {categories.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <label className="form-label">Categoria</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                {categories.map(cat => {
                  const sel = categoryId === cat.id
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategoryId(sel ? null : cat.id)}
                      className="badge"
                      style={{
                        background: sel ? cat.color + '20' : '#F2F4FA',
                        color:      sel ? cat.color         : '#6E7787',
                        border:     `1.5px solid ${sel ? cat.color + '60' : 'var(--bdr-2)'}`,
                        cursor:     'pointer',
                        padding:    '6px 14px',
                        transition: 'all 0.15s',
                      }}
                    >
                      {cat.name}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={!title.trim() || saving}
            className="btn btn-brand"
          >
            {saving ? 'A guardar...' : 'Adicionar tarefa'}
          </button>
        </form>
      </motion.div>
    </>
  )
}

function DashSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="skel" style={{ height: 190, borderRadius: 'var(--r-lg)' }} />
      <div className="stat-grid">
        {[1,2,3].map(i => (
          <div key={i} className="skel" style={{ height: 96, borderRadius: 'var(--r)' }} />
        ))}
      </div>
      {[1,2].map(i => (
        <div key={i}>
          <div className="skel" style={{ height: 18, width: '40%', marginBottom: 12, borderRadius: 6 }} />
          <div className="skel" style={{ height: 72, borderRadius: 'var(--r)' }} />
        </div>
      ))}
    </div>
  )
}

function EmptyState({ onAddTask }: { onAddTask: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="empty"
      style={{ paddingTop: 40 }}
    >
      <div className="empty-icon">
        <Layers size={26} />
      </div>
      <p className="empty-title">Dia vazio por enquanto</p>
      <p className="empty-sub" style={{ marginBottom: 24 }}>
        Ainda não há hábitos ou tarefas para hoje.
      </p>
      <button onClick={onAddTask} className="btn btn-brand" style={{ width: 'auto', padding: '0 28px' }}>
        <Plus size={15} strokeWidth={2.5} />
        Criar primeira tarefa
      </button>
    </motion.div>
  )
}

export default function HojePage() {
  const [tasks,      setTasks]      = useState<Task[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [habits,     setHabits]     = useState<Habit[]>([])
  const [habitLogs,  setHabitLogs]  = useState<HabitLog[]>([])
  const [streak,     setStreak]     = useState(0)
  const [userId,     setUserId]     = useState('')
  const [userName,   setUserName]   = useState('')
  const [showAdd,    setShowAdd]    = useState(false)
  const [loading,    setLoading]    = useState(true)

  const { open: openModal, close: closeModal } = useModal()
  const today = todayISO()

  const load = useCallback(async () => {
    try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }
    setUserId(user.id)

    const emailPrefix = user.email?.split('@')[0] ?? ''
    setUserName(emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1))

    const sixtyDaysAgo = new Date()
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60)
    const sinceISO = sixtyDaysAgo.toISOString().split('T')[0]

    const [
      { data: tasksData },
      { data: catsData },
      { data: habitsData },
      { data: logsData },
      { data: streakData },
    ] = await Promise.all([
      supabase
        .from('tasks')
        .select('*, category:categories(*)')
        .eq('user_id', user.id)
        .eq('date', today)
        .order('start_time', { ascending: true, nullsFirst: false }),
      supabase.from('categories').select('*').eq('user_id', user.id).order('name'),
      supabase.from('habits').select('*').eq('user_id', user.id).eq('active', true).order('created_at'),
      supabase.from('habit_logs').select('*').eq('user_id', user.id).eq('date', today),
      supabase
        .from('habit_logs')
        .select('date')
        .eq('user_id', user.id)
        .eq('completed', true)
        .gte('date', sinceISO),
    ])

    setTasks((tasksData as Task[]) ?? [])
    setCategories((catsData as Category[]) ?? [])
    setHabits((habitsData as Habit[]) ?? [])
    setHabitLogs((logsData as HabitLog[]) ?? [])
    setStreak(calcStreak((streakData ?? []).map((r: { date: string }) => r.date)))
    } catch (e) { console.error('load error:', e) } finally { setLoading(false) }
  }, [today])

  useEffect(() => { load() }, [load])

  const toggleTask = async (id: string, done: boolean) => {
    setTasks(ts => ts.map(t => t.id === id ? { ...t, completed: done } : t))
    const supabase = createClient()
    await supabase.from('tasks').update({ completed: done }).eq('id', id)
  }

  const toggleHabit = async (habit: Habit, done: boolean) => {
    const supabase = createClient()
    const existing = habitLogs.find(l => l.habit_id === habit.id)

    if (existing) {
      await supabase.from('habit_logs').update({ completed: done }).eq('id', existing.id)
      setHabitLogs(ls => ls.map(l => l.id === existing.id ? { ...l, completed: done } : l))
    } else {
      const { data } = await supabase
        .from('habit_logs')
        .insert({ user_id: userId, habit_id: habit.id, date: today, completed: done })
        .select()
        .single()
      if (data) setHabitLogs(ls => [...ls, data as HabitLog])
    }

    if (done) setStreak(s => s === 0 ? 1 : s)
  }

  const tasksCompleted  = tasks.filter(t => t.completed).length
  const habitsCompleted = habits.filter(h => habitLogs.some(l => l.habit_id === h.id && l.completed)).length

  const totalItems     = tasks.length + habits.length
  const completedItems = tasksCompleted + habitsCompleted
  const percentage     = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0

  const hasAnything = tasks.length > 0 || habits.length > 0

  return (
    <div className="page">

      {loading ? (
        <DashSkeleton />
      ) : !hasAnything ? (
        <>
          <MotivationCard percentage={0} completed={0} total={0} name={userName} />
          <EmptyState onAddTask={() => { setShowAdd(true); openModal() }} />
        </>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          <MotivationCard
            percentage={percentage}
            completed={completedItems}
            total={totalItems}
            name={userName}
          />

          <StatsCards
            habitsCompleted={habitsCompleted}
            habitsTotal={habits.length}
            tasksCompleted={tasksCompleted}
            tasksTotal={tasks.length}
            streak={streak}
          />

          <HabitsToday habits={habits} logs={habitLogs} onToggle={toggleHabit} />

          <TasksToday tasks={tasks} onToggle={toggleTask} />

          <ProgressCard
            completed={completedItems}
            total={totalItems}
            percentage={percentage}
          />

          <TodayStudyCard />
        </div>
      )}

      <motion.button
        onClick={() => { setShowAdd(true); openModal() }}
        className="fab"
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.03 }}
      >
        <Plus size={18} strokeWidth={2.5} />
        Tarefa
      </motion.button>

      <AnimatePresence>
        {showAdd && (
          <AddSheet
            onClose={() => { setShowAdd(false); closeModal() }}
            onAdd={task => setTasks(ts => [...ts, task])}
            categories={categories}
            userId={userId}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
