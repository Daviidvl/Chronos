'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { useTasksStore } from '@/lib/store/useTasksStore'
import { Task, Priority, PRIORITY_COLORS, PRIORITY_LABELS } from '@/types'
import { todayISO } from '@/lib/utils'
import { Check, Plus, Trash2, ChevronDown, ChevronUp, Flag } from 'lucide-react'
import { parseISO, startOfWeek, endOfWeek } from 'date-fns'

function TaskItem({ task, onToggle, onDelete }: { task: Task; onToggle: () => void; onDelete: () => void }) {
  const [hovered, setHovered] = useState(false)
  const pColor = PRIORITY_COLORS[task.priority]

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.18 }}
      className="flex items-center gap-3 py-3"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <button
        onClick={onToggle}
        className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
        style={{
          background: task.completed ? 'var(--green)' : 'transparent',
          border: `1.5px solid ${task.completed ? 'var(--green)' : 'rgba(255,255,255,0.16)'}`,
        }}
      >
        {task.completed && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 25 }}>
            <Check size={10} strokeWidth={3} className="text-white" />
          </motion.div>
        )}
      </button>

      <span
        className="flex-1 text-[14px]"
        style={{ color: task.completed ? 'var(--t3)' : 'var(--t2)', textDecoration: task.completed ? 'line-through' : 'none' }}
      >
        {task.title}
      </span>

      {task.priority !== 'low' && !task.completed && (
        <Flag size={11} style={{ color: pColor, opacity: 0.6 }} className="flex-shrink-0" />
      )}

      <AnimatePresence>
        {hovered && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={onDelete}
            className="p-1.5 rounded-[8px] flex-shrink-0 transition-colors"
            style={{ color: 'var(--t4)' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--red)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--t4)'}
          >
            <Trash2 size={12} />
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function TaskGroup({ label, tasks, onToggle, onDelete, collapsible }: {
  label: string; tasks: Task[]; onToggle: (id: string) => void; onDelete: (id: string) => void; collapsible?: boolean
}) {
  const [open, setOpen] = useState(true)
  if (tasks.length === 0) return null

  return (
    <div className="mb-6">
      <button
        onClick={() => collapsible && setOpen(o => !o)}
        className="flex items-center gap-2 mb-1 w-full text-left"
        disabled={!collapsible}
      >
        <span className="section-label">{label}</span>
        <span className="text-[10px]" style={{ color: 'var(--t4)' }}>{tasks.length}</span>
        {collapsible && (
          <span className="ml-auto" style={{ color: 'var(--t4)' }}>
            {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={collapsible ? { height: 0, opacity: 0 } : false}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden divide-y"
            style={{ borderColor: 'var(--border)' }}
          >
            <AnimatePresence>
              {tasks.map(t => (
                <TaskItem key={t.id} task={t} onToggle={() => onToggle(t.id)} onDelete={() => onDelete(t.id)} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function AddTask({ onAdd }: { onAdd: (title: string, priority: Priority, dueDate?: string) => void }) {
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState<Priority>('medium')
  const [dueDate, setDueDate] = useState(todayISO())
  const [expanded, setExpanded] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    onAdd(title.trim(), priority, dueDate || undefined)
    setTitle('')
    setPriority('medium')
    setDueDate(todayISO())
    setExpanded(false)
  }

  return (
    <form onSubmit={handleSubmit} className="mb-8">
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-[14px]"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        <div
          className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center"
          style={{ border: '1.5px dashed rgba(255,255,255,0.15)' }}
        >
          <Plus size={9} style={{ color: 'var(--t4)' }} />
        </div>
        <input
          value={title}
          onChange={e => { setTitle(e.target.value); setExpanded(!!e.target.value) }}
          placeholder="Nova tarefa..."
          className="flex-1 text-[14px] bg-transparent outline-none"
          style={{ color: 'var(--t2)' }}
        />
        {title.trim() && (
          <button
            type="submit"
            className="text-[12px] font-medium flex-shrink-0 transition-opacity hover:opacity-70"
            style={{ color: 'var(--accent)' }}
          >
            Adicionar
          </button>
        )}
      </div>

      <AnimatePresence>
        {expanded && title.trim() && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            <div className="px-1 pt-3 flex items-center gap-2 flex-wrap">
              {(['low', 'medium', 'high', 'urgent'] as Priority[]).map(p => (
                <button
                  key={p} type="button"
                  onClick={() => setPriority(p)}
                  className="px-3 py-1.5 rounded-full text-[11px] transition-all"
                  style={{
                    background: priority === p ? `${PRIORITY_COLORS[p]}18` : 'transparent',
                    border: `1px solid ${priority === p ? PRIORITY_COLORS[p] + '50' : 'var(--border)'}`,
                    color: priority === p ? PRIORITY_COLORS[p] : 'var(--t3)',
                  }}
                >
                  {PRIORITY_LABELS[p]}
                </button>
              ))}
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="ml-auto text-[12px] bg-transparent outline-none rounded-[8px] px-2 py-1"
                style={{ border: '1px solid var(--border)', colorScheme: 'dark', color: 'var(--t3)' }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  )
}

export default function TarefasPage() {
  const { tasks, addTask, toggleTask, deleteTask } = useTasksStore()
  const today = todayISO()
  const now = new Date()
  const weekStart = startOfWeek(now, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 })

  const pending = tasks.filter(t => !t.completed)
  const completed = tasks.filter(t => t.completed)

  const todayGroup = pending.filter(t => t.dueDate === today)
  const weekGroup = pending.filter(t => {
    if (!t.dueDate || t.dueDate === today) return false
    const d = parseISO(t.dueDate)
    return d >= weekStart && d <= weekEnd
  })
  const laterGroup = pending.filter(t => {
    if (!t.dueDate) return true
    if (t.dueDate === today) return false
    return parseISO(t.dueDate) > weekEnd
  })

  const handleAdd = (title: string, priority: Priority, dueDate?: string) => {
    addTask({ title, priority, category: 'pessoal', important: false, dueDate })
  }

  return (
    <div className="max-w-xl mx-auto px-5 pt-10 pb-8">
      <motion.header initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1
          className="text-[32px] font-semibold leading-none tracking-tight"
          style={{ color: 'var(--t1)', letterSpacing: '-0.4px' }}
        >
          Tarefas
        </h1>
        <p className="text-[13px] mt-2" style={{ color: 'var(--t3)' }}>{pending.length} pendentes</p>
      </motion.header>

      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}>
        <AddTask onAdd={handleAdd} />
        <TaskGroup label="Hoje" tasks={todayGroup} onToggle={toggleTask} onDelete={deleteTask} />
        <TaskGroup label="Esta semana" tasks={weekGroup} onToggle={toggleTask} onDelete={deleteTask} />
        <TaskGroup label="Mais tarde" tasks={laterGroup} onToggle={toggleTask} onDelete={deleteTask} />
        <TaskGroup label="Concluídas" tasks={completed} onToggle={toggleTask} onDelete={deleteTask} collapsible />

        {tasks.length === 0 && (
          <div className="text-center py-24">
            <p className="text-[14px]" style={{ color: 'var(--t3)' }}>Nenhuma tarefa.</p>
          </div>
        )}
      </motion.div>
    </div>
  )
}
