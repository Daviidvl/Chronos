'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTasksStore } from '@/lib/store/useTasksStore'
import { useUserStore } from '@/lib/store/useUserStore'
import { Task, TaskCategory, TaskPriority, XP_REWARDS } from '@/types'
import { getPriorityColor, getPriorityLabel, getCategoryLabel, todayISO, generateId, cn } from '@/lib/utils'
import { Check, Plus, Star, ChevronDown, Trash2, Calendar, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

const TABS = ['Hoje', 'Importantes', 'Todas', 'Concluídas']

function TaskItem({ task, onToggle, onDelete }: { task: Task; onToggle: () => void; onDelete: () => void }) {
  const color = getPriorityColor(task.priority)
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -8, height: 0 }}
      transition={{ duration: 0.2 }}
      className="flex items-center gap-3 px-3 py-2.5 rounded-xl group hover:bg-[var(--surface-hover)] transition-all"
      style={{ border: '1px solid var(--border)' }}
    >
      <button
        onClick={onToggle}
        className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-all"
        style={{
          background: task.completed ? color : 'transparent',
          border: `1.5px solid ${task.completed ? color : 'var(--border-strong)'}`,
        }}
      >
        <AnimatePresence>
          {task.completed && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
              <Check size={11} strokeWidth={3} color="white" />
            </motion.div>
          )}
        </AnimatePresence>
      </button>

      <div className="flex-1 min-w-0">
        <span className={cn(
          'text-sm',
          task.completed ? 'text-[var(--text-tertiary)] line-through' : 'text-[var(--text-primary)]'
        )}>
          {task.title}
        </span>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-[11px]" style={{ color }}>
            {getPriorityLabel(task.priority)}
          </span>
          {task.category && (
            <>
              <span className="text-[var(--text-tertiary)] text-[11px]">·</span>
              <span className="text-[11px] text-[var(--text-tertiary)]">{getCategoryLabel(task.category)}</span>
            </>
          )}
          {task.dueDate && task.dueDate !== todayISO() && (
            <>
              <span className="text-[var(--text-tertiary)] text-[11px]">·</span>
              <span className="text-[11px] text-[var(--text-tertiary)] flex items-center gap-0.5">
                <Calendar size={9} /> {task.dueDate}
              </span>
            </>
          )}
        </div>
      </div>

      <div
        className="w-2 h-2 rounded-full flex-shrink-0"
        style={{ background: color }}
      />

      <button
        onClick={onDelete}
        className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-[rgba(239,68,68,0.1)] transition-all text-[var(--text-tertiary)] hover:text-[var(--danger)]"
      >
        <Trash2 size={12} />
      </button>
    </motion.div>
  )
}

function AddTaskInline({ onAdd }: { onAdd: (title: string, priority: TaskPriority, dueDate?: string) => void }) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState<TaskPriority>('medium')
  const [dueDate, setDueDate] = useState(todayISO())

  const PRIORITIES: TaskPriority[] = ['low', 'medium', 'high', 'urgent']

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    onAdd(title.trim(), priority, dueDate || undefined)
    setTitle('')
    setPriority('medium')
    setOpen(false)
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl text-sm text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] transition-all border border-dashed border-[var(--border)] mt-2"
      >
        <Plus size={14} /> Adicionar tarefa
      </button>
    )
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="mt-2 p-3 rounded-xl"
      style={{ background: 'var(--bg-elevated)', border: '1px solid var(--accent)', boxShadow: '0 0 0 3px var(--accent-subtle)' }}
    >
      <input
        autoFocus
        type="text"
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="Nome da tarefa..."
        className="w-full text-sm bg-transparent outline-none text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] mb-2"
        onKeyDown={e => { if (e.key === 'Escape') setOpen(false) }}
      />
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex gap-1">
          {PRIORITIES.map(p => (
            <button
              key={p}
              type="button"
              onClick={() => setPriority(p)}
              className="px-2 py-1 rounded-md text-[11px] font-medium transition-all"
              style={{
                background: priority === p ? `${getPriorityColor(p)}20` : 'var(--surface)',
                border: `1px solid ${priority === p ? getPriorityColor(p) : 'var(--border)'}`,
                color: priority === p ? getPriorityColor(p) : 'var(--text-tertiary)',
              }}
            >
              {getPriorityLabel(p)}
            </button>
          ))}
        </div>
        <input
          type="date"
          value={dueDate}
          onChange={e => setDueDate(e.target.value)}
          className="text-xs bg-[var(--surface)] rounded-lg px-2 py-1 outline-none text-[var(--text-secondary)]"
          style={{ border: '1px solid var(--border)', colorScheme: 'dark' }}
        />
        <div className="ml-auto flex gap-1.5">
          <Button type="button" size="sm" variant="ghost" onClick={() => setOpen(false)}>
            <X size={13} />
          </Button>
          <Button type="submit" size="sm" variant="primary" disabled={!title.trim()}>
            Adicionar
          </Button>
        </div>
      </div>
    </motion.form>
  )
}

export default function TasksPage() {
  const { tasks, addTask, toggleTask, deleteTask, getTodayTasks, getImportantTasks, getCompletedTasks, getPendingTasks } = useTasksStore()
  const { addXP } = useUserStore()
  const [activeTab, setActiveTab] = useState(0)

  const handleToggle = (task: Task) => {
    if (!task.completed) addXP(XP_REWARDS.completeTask)
    toggleTask(task.id)
  }

  const handleAdd = (title: string, priority: TaskPriority, dueDate?: string) => {
    addTask({ title, priority, category: 'personal', important: activeTab === 1, dueDate })
  }

  const tabTasks = [
    getTodayTasks(),
    getImportantTasks(),
    getPendingTasks(),
    getCompletedTasks(),
  ][activeTab]

  const totalPending = getPendingTasks().length
  const completedCount = getCompletedTasks().length

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-6 md:py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">Tarefas</h1>
        <p className="text-sm text-[var(--text-tertiary)] mt-0.5">
          {totalPending} pendentes · {completedCount} concluídas
        </p>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.05 }}
        className="flex gap-1 p-1 rounded-xl mb-5"
        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
      >
        {TABS.map((tab, i) => (
          <button
            key={tab}
            onClick={() => setActiveTab(i)}
            className={cn(
              'flex-1 py-1.5 px-2 rounded-lg text-xs font-medium transition-all duration-150',
              activeTab === i
                ? 'bg-[var(--surface-active)] text-[var(--text-primary)]'
                : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
            )}
          >
            {tab}
          </button>
        ))}
      </motion.div>

      {/* Task list */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.08 }}
        className="space-y-2"
      >
        <AnimatePresence>
          {tabTasks.map(task => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={() => handleToggle(task)}
              onDelete={() => deleteTask(task.id)}
            />
          ))}
        </AnimatePresence>

        {tabTasks.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="text-3xl mb-3">
              {activeTab === 3 ? '🎉' : '✅'}
            </div>
            <p className="text-sm text-[var(--text-tertiary)]">
              {activeTab === 3 ? 'Nenhuma tarefa concluída ainda.' : 'Nenhuma tarefa aqui.'}
            </p>
          </motion.div>
        )}

        {activeTab !== 3 && <AddTaskInline onAdd={handleAdd} />}
      </motion.div>
    </div>
  )
}
