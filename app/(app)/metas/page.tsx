'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { useGoalsStore } from '@/lib/store/useGoalsStore'
import { Goal, Category, Priority, CATEGORY_COLORS, CATEGORY_LABELS, PRIORITY_LABELS } from '@/types'
import { daysLabel, daysUntil } from '@/lib/utils'
import { Plus, Check, ChevronDown, ChevronUp, X } from 'lucide-react'

function GoalCard({ goal }: { goal: Goal }) {
  const { toggleMilestone, addMilestone, deleteGoal } = useGoalsStore()
  const [expanded, setExpanded] = useState(false)
  const [newMilestone, setNewMilestone] = useState('')
  const color = CATEGORY_COLORS[goal.category]
  const days = goal.deadline ? daysUntil(goal.deadline) : null
  const urgent = days !== null && days <= 14

  return (
    <motion.div
      layout
      className="rounded-[20px] overflow-hidden"
      style={{ background: 'var(--surface)', border: `1px solid var(--border)`, borderLeft: `3px solid ${color}`, boxShadow: 'var(--shadow-card)' }}
    >
      <div className="px-5 py-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[14px] font-medium text-[var(--text-1)]">{goal.title}</span>
            </div>
            <div className="flex items-center gap-3 text-[12px] text-[var(--text-3)]">
              <span style={{ color }}>{CATEGORY_LABELS[goal.category]}</span>
              {days !== null && (
                <span style={{ color: urgent ? 'var(--danger)' : 'var(--text-3)' }}>{daysLabel(days)}</span>
              )}
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-[20px] font-semibold leading-none" style={{ color }}>{goal.progress}%</div>
            <div className="text-[11px] text-[var(--text-3)] mt-0.5">progresso</div>
          </div>
        </div>

        <div className="mb-3">
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: color }}
              initial={{ width: 0 }}
              animate={{ width: `${goal.progress}%` }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
        </div>

        <button
          onClick={() => setExpanded(e => !e)}
          className="flex items-center gap-1.5 text-[12px] text-[var(--text-3)] hover:text-[var(--text-2)] transition-colors"
        >
          {goal.milestones.length} marcos
          {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-4">
              <div className="h-px mb-3" style={{ background: 'var(--border)' }} />
              <div className="space-y-2 mb-3">
                {goal.milestones.map(m => (
                  <button
                    key={m.id}
                    onClick={() => toggleMilestone(goal.id, m.id)}
                    className="w-full flex items-center gap-3 text-left"
                  >
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
                      style={{
                        background: m.completed ? color : 'transparent',
                        border: `1.5px solid ${m.completed ? color : 'rgba(255,255,255,0.18)'}`,
                      }}
                    >
                      {m.completed && <Check size={10} strokeWidth={3} className="text-white" />}
                    </div>
                    <span className={`text-[13px] ${m.completed ? 'text-[var(--text-3)] line-through' : 'text-[var(--text-2)]'}`}>
                      {m.title}
                    </span>
                  </button>
                ))}
              </div>

              <form
                onSubmit={e => {
                  e.preventDefault()
                  if (!newMilestone.trim()) return
                  addMilestone(goal.id, newMilestone.trim())
                  setNewMilestone('')
                }}
                className="flex items-center gap-2 mt-2"
              >
                <input
                  value={newMilestone}
                  onChange={e => setNewMilestone(e.target.value)}
                  placeholder="Novo marco..."
                  className="flex-1 text-[13px] bg-transparent outline-none text-[var(--text-2)] placeholder:text-[var(--text-4)]"
                  style={{ borderBottom: '1px solid var(--border)', paddingBottom: '4px' }}
                />
                {newMilestone.trim() && (
                  <button type="submit" className="text-[12px] text-[var(--accent)]">Adicionar</button>
                )}
              </form>

              <button
                onClick={() => deleteGoal(goal.id)}
                className="mt-3 text-[12px] text-[var(--text-4)] hover:text-[var(--danger)] transition-colors"
              >
                Remover meta
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function AddGoalSheet({ onClose }: { onClose: () => void }) {
  const { addGoal } = useGoalsStore()
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<Category>('pessoal')
  const [priority, setPriority] = useState<Priority>('medium')
  const [deadline, setDeadline] = useState('')
  const cats = Object.entries(CATEGORY_LABELS) as [Category, string][]

  const handleAdd = () => {
    if (!title.trim()) return
    addGoal({ title: title.trim(), category, priority, deadline: deadline || undefined, progress: 0 })
    onClose()
  }

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-40" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
        onClick={onClose} />
      <motion.div
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 380, damping: 38 }}
        className="fixed bottom-0 left-0 right-0 z-50 rounded-t-[28px] p-6 pb-10"
        style={{ background: 'var(--surface-high)', border: '1px solid var(--border)' }}
      >
        <div className="w-10 h-1 rounded-full mx-auto mb-5" style={{ background: 'var(--border-focus)' }} />
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[17px] font-semibold text-[var(--text-1)]">Nova Meta</h3>
          <button onClick={onClose}><X size={18} className="text-[var(--text-3)]" /></button>
        </div>

        <input autoFocus value={title} onChange={e => setTitle(e.target.value)} placeholder="Título da meta..."
          className="w-full px-4 py-3 rounded-[14px] text-[15px] mb-4 outline-none text-[var(--text-1)] placeholder:text-[var(--text-4)]"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
          onKeyDown={e => e.key === 'Enter' && handleAdd()} />

        <div className="grid grid-cols-4 gap-2 mb-4">
          {cats.map(([key, label]) => {
            const color = CATEGORY_COLORS[key]
            const sel = category === key
            return (
              <button key={key} onClick={() => setCategory(key)}
                className="py-2 rounded-[12px] text-[11px] transition-all"
                style={{ background: sel ? `${color}18` : 'var(--surface)', border: `1px solid ${sel ? color+'50' : 'var(--border)'}`, color: sel ? color : 'var(--text-3)' }}>
                {label}
              </button>
            )
          })}
        </div>

        <div className="flex gap-2 mb-4">
          {(['low','medium','high'] as Priority[]).map(p => (
            <button key={p} onClick={() => setPriority(p)}
              className="flex-1 py-2 rounded-[12px] text-[12px] transition-all"
              style={{ background: priority === p ? 'var(--accent-dim)' : 'var(--surface)', border: `1px solid ${priority === p ? 'rgba(99,102,241,0.3)' : 'var(--border)'}`, color: priority === p ? 'var(--accent)' : 'var(--text-3)' }}>
              {PRIORITY_LABELS[p]}
            </button>
          ))}
        </div>

        <div className="mb-5">
          <label className="block text-[11px] text-[var(--text-3)] mb-2">Prazo (opcional)</label>
          <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)}
            className="w-full px-4 py-3 rounded-[14px] text-[14px] outline-none text-[var(--text-2)]"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', colorScheme: 'dark' }} />
        </div>

        <button onClick={handleAdd} disabled={!title.trim()}
          className="w-full py-3.5 rounded-[14px] text-[15px] font-semibold text-white transition-opacity disabled:opacity-40"
          style={{ background: 'var(--accent)' }}>
          Criar Meta
        </button>
      </motion.div>
    </>
  )
}

export default function MetasPage() {
  const { getActiveGoals } = useGoalsStore()
  const [showAdd, setShowAdd] = useState(false)
  const goals = getActiveGoals()

  return (
    <div className="max-w-xl mx-auto px-5 pt-8 pb-6">
      <motion.header initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-[32px] font-semibold text-[var(--text-1)] tracking-tight leading-none">Metas</h1>
          <p className="text-[14px] text-[var(--text-3)] mt-2">{goals.length} ativas</p>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-[12px] text-[13px] font-medium text-white mt-1"
          style={{ background: 'var(--accent)' }}>
          <Plus size={15} /> Nova
        </button>
      </motion.header>

      {goals.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-[14px] text-[var(--text-3)]">Nenhuma meta ainda.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {goals.map((g, i) => (
            <motion.div key={g.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
              <GoalCard goal={g} />
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>{showAdd && <AddGoalSheet onClose={() => setShowAdd(false)} />}</AnimatePresence>
    </div>
  )
}
