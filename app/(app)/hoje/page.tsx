'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Plus, X, Clock, Check, ListTodo } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { todayISO, greeting, timeRange } from '@/lib/utils'
import type { Task, Category } from '@/types'

/* ── Badge ────────────────────────────────────────────── */
function CategoryBadge({ color, name }: { color: string; name: string }) {
  return (
    <span
      className="badge"
      style={{ background: color + '18', color }}
    >
      {name}
    </span>
  )
}

/* ── Task Card ────────────────────────────────────────── */
function TaskCard({
  task, onToggle, onDelete,
}: {
  task: Task & { category?: Category }
  onToggle: (id: string, done: boolean) => void
  onDelete: (id: string) => void
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.15 } }}
      className="card"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="task-row">
        {/* Checkbox */}
        <button
          onClick={() => onToggle(task.id, !task.completed)}
          className={`check${task.completed ? ' check--done' : ''}`}
        >
          <AnimatePresence>
            {task.completed && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={{ type: 'spring', stiffness: 600, damping: 30 }}
              >
                <Check size={11} strokeWidth={3} color="#fff" />
              </motion.div>
            )}
          </AnimatePresence>
        </button>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p className={`task-title${task.completed ? ' task-title--done' : ''}`}>
            {task.title}
          </p>

          {(task.start_time || task.category) && (
            <div className="task-meta">
              {task.start_time && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Clock size={11} />
                  {timeRange(task.start_time, task.end_time)}
                </span>
              )}
              {task.category && (
                <CategoryBadge
                  color={task.category.color}
                  name={task.category.name}
                />
              )}
            </div>
          )}
        </div>

        {/* Delete */}
        <AnimatePresence>
          {hovered && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.12 }}
              onClick={() => onDelete(task.id)}
              className="btn-icon danger"
            >
              <X size={14} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

/* ── Add Sheet ────────────────────────────────────────── */
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
        completed:   false,
      })
      .select('*, category:categories(*)')
      .single()

    if (!error && data) { onAdd(data as Task); onClose() }
    setSaving(false)
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{ position: 'fixed', inset: 0, zIndex: 40, background: 'rgba(18,24,38,0.32)', backdropFilter: 'blur(8px)' }}
        onClick={onClose}
      />
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
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
            Nova tarefa
          </span>
          <button onClick={onClose} className="btn-icon">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleAdd}>
          <div style={{ marginBottom: 16 }}>
            <input
              autoFocus
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="O que vais fazer?"
              className="field"
              onKeyDown={e => e.key === 'Enter' && handleAdd(e as unknown as React.FormEvent)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
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

/* ── Skeleton ─────────────────────────────────────────── */
function TaskSkeleton() {
  return (
    <div className="card">
      <div className="task-row" style={{ alignItems: 'center' }}>
        <div className="skel" style={{ width: 22, height: 22, borderRadius: '50%', flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div className="skel" style={{ height: 14, width: '62%', marginBottom: 8 }} />
          <div className="skel" style={{ height: 11, width: '38%' }} />
        </div>
      </div>
    </div>
  )
}

/* ── Page ─────────────────────────────────────────────── */
export default function HojePage() {
  const [tasks, setTasks]         = useState<Task[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [userId, setUserId]       = useState('')
  const [showAdd, setShowAdd]     = useState(false)
  const [loading, setLoading]     = useState(true)

  const today = todayISO()
  const now   = new Date()

  const load = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setUserId(user.id)

    const [{ data: tasksData }, { data: catsData }] = await Promise.all([
      supabase
        .from('tasks')
        .select('*, category:categories(*)')
        .eq('user_id', user.id)
        .eq('date', today)
        .order('start_time', { ascending: true, nullsFirst: false }),
      supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id)
        .order('name'),
    ])

    setTasks((tasksData as Task[]) ?? [])
    setCategories((catsData as Category[]) ?? [])
    setLoading(false)
  }, [today])

  useEffect(() => { load() }, [load])

  const toggleTask = async (id: string, done: boolean) => {
    setTasks(ts => ts.map(t => t.id === id ? { ...t, completed: done } : t))
    const supabase = createClient()
    await supabase.from('tasks').update({ completed: done }).eq('id', id)
  }

  const deleteTask = async (id: string) => {
    setTasks(ts => ts.filter(t => t.id !== id))
    const supabase = createClient()
    await supabase.from('tasks').delete().eq('id', id)
  }

  const pending   = tasks.filter(t => !t.completed)
  const completed = tasks.filter(t => t.completed)
  const pct       = tasks.length > 0 ? Math.round((completed.length / tasks.length) * 100) : 0
  const allDone   = tasks.length > 0 && pct === 100

  return (
    <div className="page">

      {/* ── Header ── */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.16,1,0.3,1] }}
        style={{ marginBottom: 40 }}
      >
        <p style={{ fontSize: 13, color: '#9BA5B4', fontWeight: 500, marginBottom: 8, textTransform: 'capitalize' }}>
          {format(now, "EEEE, d 'de' MMMM", { locale: ptBR })}
        </p>
        <h1 className="t-display" style={{ marginBottom: 28 }}>
          {greeting()}, David.
        </h1>

        {/* Progress */}
        <div className="card" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 14, fontWeight: 500, color: '#6E7787' }}>
              {tasks.length === 0
                ? 'Sem tarefas hoje'
                : `${completed.length} de ${tasks.length} ${tasks.length === 1 ? 'tarefa' : 'tarefas'}`}
            </span>
            {tasks.length > 0 && (
              <span
                className="badge-pill"
                style={{
                  background: allDone ? '#D3F9EE' : 'rgba(110,92,246,0.10)',
                  color:      allDone ? '#2CC08C' : '#6E5CF6',
                }}
              >
                {pct}%
              </span>
            )}
          </div>
          <div className="progress-track">
            <motion.div
              className={`progress-fill${allDone ? ' progress-fill--success' : ''}`}
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
        </div>
      </motion.header>

      {/* ── Tasks ── */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[1, 2, 3].map(i => <TaskSkeleton key={i} />)}
        </div>
      ) : tasks.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="empty">
          <div className="empty-icon">
            <ListTodo size={24} />
          </div>
          <p className="empty-title">Nenhuma tarefa para hoje</p>
          <p className="empty-sub">Toca em + para adicionar a primeira</p>
        </motion.div>
      ) : (
        <div>
          {/* Pending */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <AnimatePresence mode="popLayout">
              {pending.map(task => (
                <TaskCard key={task.id} task={task} onToggle={toggleTask} onDelete={deleteTask} />
              ))}
            </AnimatePresence>
          </div>

          {/* Completed */}
          {completed.length > 0 && (
            <div style={{ marginTop: 36 }}>
              <p className="t-label" style={{ marginBottom: 12, paddingLeft: 2 }}>
                Concluídas · {completed.length}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <AnimatePresence mode="popLayout">
                  {completed.map(task => (
                    <TaskCard key={task.id} task={task} onToggle={toggleTask} onDelete={deleteTask} />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── FAB ── */}
      <motion.button
        onClick={() => setShowAdd(true)}
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
            onClose={() => setShowAdd(false)}
            onAdd={task => setTasks(ts => [...ts, task])}
            categories={categories}
            userId={userId}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
