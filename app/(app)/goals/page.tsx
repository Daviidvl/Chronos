'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGoalsStore } from '@/lib/store/useGoalsStore'
import { useUserStore } from '@/lib/store/useUserStore'
import { Goal, GoalCategory, GoalPriority, XP_REWARDS, CATEGORY_COLORS, CATEGORY_ICONS } from '@/types'
import { getCategoryLabel, getProgressColor, cn, formatDate, generateId } from '@/lib/utils'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Plus, Target, Check, ChevronDown, ChevronUp, Trash2, X } from 'lucide-react'
import { differenceInDays, parseISO } from 'date-fns'

const GOAL_CATEGORIES: GoalCategory[] = ['health', 'work', 'study', 'finance', 'relationships', 'spirituality']

function GoalCard({ goal }: { goal: Goal }) {
  const { toggleMilestone, addMilestone, updateGoal, archiveGoal } = useGoalsStore()
  const { addXP } = useUserStore()
  const [expanded, setExpanded] = useState(false)
  const [newMilestone, setNewMilestone] = useState('')
  const color = CATEGORY_COLORS[goal.category] ?? 'var(--accent)'
  const icon = CATEGORY_ICONS[goal.category] ?? '🎯'
  const daysLeft = goal.deadline ? differenceInDays(parseISO(goal.deadline), new Date()) : null

  const handleToggleMilestone = (milestoneId: string, alreadyDone: boolean) => {
    if (!alreadyDone) addXP(XP_REWARDS.completeMilestone)
    toggleMilestone(goal.id, milestoneId)
  }

  const handleAddMilestone = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMilestone.trim()) return
    addMilestone(goal.id, newMilestone.trim())
    setNewMilestone('')
  }

  return (
    <motion.div
      layout
      className="rounded-2xl overflow-hidden"
      style={{ background: 'var(--bg-elevated)', border: `1px solid ${expanded ? 'var(--border-strong)' : 'var(--border)'}` }}
    >
      {/* Header */}
      <div className="px-4 py-4">
        <div className="flex items-start gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
            style={{ background: `${color}15` }}
          >
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">{goal.title}</h3>
                {goal.description && (
                  <p className="text-xs text-[var(--text-tertiary)] mt-0.5 line-clamp-1">{goal.description}</p>
                )}
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <Badge variant={goal.priority === 'high' ? 'warning' : goal.priority === 'medium' ? 'accent' : 'muted'}>
                  {goal.priority === 'high' ? 'Alta' : goal.priority === 'medium' ? 'Média' : 'Baixa'}
                </Badge>
              </div>
            </div>

            {/* Progress */}
            <div className="mt-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-[var(--text-tertiary)]">
                  {goal.milestones.filter(m => m.completed).length}/{goal.milestones.length} marcos
                </span>
                <span className="text-xs font-semibold" style={{ color }}>{goal.progress}%</span>
              </div>
              <ProgressBar value={goal.progress} colorClass={color} height={4} />
              <div className="flex items-center justify-between mt-1.5">
                <span className="text-[11px]" style={{ color: `${color}99` }}>{getCategoryLabel(goal.category)}</span>
                {daysLeft !== null && (
                  <span className={cn(
                    'text-[11px]',
                    daysLeft <= 0 ? 'text-[var(--danger)]' :
                    daysLeft <= 7 ? 'text-[var(--warning)]' :
                    'text-[var(--text-tertiary)]'
                  )}>
                    {daysLeft <= 0 ? 'Vencido' : `${daysLeft} dias restantes`}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 mt-2 text-xs text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
        >
          {expanded ? <><ChevronUp size={12} /> Ocultar marcos</> : <><ChevronDown size={12} /> Ver marcos ({goal.milestones.length})</>}
        </button>
      </div>

      {/* Milestones */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4" style={{ borderTop: '1px solid var(--border)' }}>
              <div className="pt-3 space-y-1.5">
                {goal.milestones.map(m => (
                  <div
                    key={m.id}
                    className="flex items-center gap-2.5 group"
                    onClick={() => handleToggleMilestone(m.id, m.completed)}
                  >
                    <button
                      className="w-4.5 h-4.5 rounded-md flex items-center justify-center flex-shrink-0 transition-all"
                      style={{
                        width: 18, height: 18,
                        background: m.completed ? color : 'transparent',
                        border: `1.5px solid ${m.completed ? color : 'var(--border-strong)'}`,
                      }}
                    >
                      {m.completed && <Check size={10} strokeWidth={3} color="white" />}
                    </button>
                    <span className={cn(
                      'text-sm flex-1',
                      m.completed ? 'line-through text-[var(--text-tertiary)]' : 'text-[var(--text-secondary)]'
                    )}>
                      {m.title}
                    </span>
                  </div>
                ))}

                <form onSubmit={handleAddMilestone} className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={newMilestone}
                    onChange={e => setNewMilestone(e.target.value)}
                    placeholder="Adicionar marco..."
                    className="flex-1 text-sm bg-transparent outline-none text-[var(--text-secondary)] placeholder:text-[var(--text-tertiary)]"
                  />
                  <Button type="submit" size="sm" variant="ghost" disabled={!newMilestone.trim()}>
                    <Plus size={12} />
                  </Button>
                </form>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function AddGoalModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { addGoal } = useGoalsStore()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<GoalCategory>('health')
  const [priority, setPriority] = useState<GoalPriority>('medium')
  const [deadline, setDeadline] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    addGoal({ title: title.trim(), description, category, priority, deadline: deadline || undefined, progress: 0, habitIds: [] })
    onClose()
    setTitle('')
    setDescription('')
    setCategory('health')
    setPriority('medium')
    setDeadline('')
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-40" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div
              className="w-full max-w-md rounded-2xl overflow-hidden"
              style={{ background: 'var(--bg-overlay)', border: '1px solid var(--border-strong)', boxShadow: '0 24px 60px rgba(0,0,0,0.6)' }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
                <h2 className="text-sm font-semibold text-[var(--text-primary)]">Nova meta</h2>
                <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[var(--surface-hover)] transition-colors text-[var(--text-tertiary)]">
                  <X size={16} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-5 space-y-4">
                <div>
                  <label className="block text-xs text-[var(--text-tertiary)] mb-1.5">Título</label>
                  <input
                    autoFocus type="text" value={title} onChange={e => setTitle(e.target.value)}
                    placeholder="Qual é sua meta?"
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                    style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                  />
                </div>
                <div>
                  <label className="block text-xs text-[var(--text-tertiary)] mb-1.5">Descrição (opcional)</label>
                  <textarea
                    value={description} onChange={e => setDescription(e.target.value)}
                    placeholder="Descreva sua meta..."
                    rows={2}
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none resize-none"
                    style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-[var(--text-tertiary)] mb-1.5">Área</label>
                    <select
                      value={category} onChange={e => setCategory(e.target.value as GoalCategory)}
                      className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                      style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                    >
                      {GOAL_CATEGORIES.map(c => (
                        <option key={c} value={c}>{getCategoryLabel(c)}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-[var(--text-tertiary)] mb-1.5">Prazo</label>
                    <input
                      type="date" value={deadline} onChange={e => setDeadline(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                      style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)', colorScheme: 'dark' }}
                    />
                  </div>
                </div>
                <div className="flex gap-2 pt-1">
                  {(['low', 'medium', 'high'] as GoalPriority[]).map(p => (
                    <button
                      key={p} type="button" onClick={() => setPriority(p)}
                      className="flex-1 py-1.5 rounded-lg text-xs font-medium transition-all"
                      style={{
                        background: priority === p ? `${CATEGORY_COLORS[p === 'low' ? 'other' : p === 'medium' ? 'productivity' : 'fitness']}20` : 'var(--surface)',
                        border: `1px solid ${priority === p ? 'var(--accent)' : 'var(--border)'}`,
                        color: priority === p ? 'var(--accent)' : 'var(--text-tertiary)',
                      }}
                    >
                      {p === 'low' ? 'Baixa' : p === 'medium' ? 'Média' : 'Alta'}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2 pt-1">
                  <Button type="button" variant="ghost" onClick={onClose} className="flex-1">Cancelar</Button>
                  <Button type="submit" variant="primary" className="flex-1" disabled={!title.trim()}>
                    <Plus size={14} /> Criar meta
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default function GoalsPage() {
  const { getActiveGoals } = useGoalsStore()
  const [modalOpen, setModalOpen] = useState(false)
  const goals = getActiveGoals()

  const byCategory = GOAL_CATEGORIES.reduce((acc, cat) => {
    const catGoals = goals.filter(g => g.category === cat)
    if (catGoals.length > 0) acc[cat] = catGoals
    return acc
  }, {} as Record<string, Goal[]>)

  const avgProgress = goals.length > 0
    ? Math.round(goals.reduce((s, g) => s + g.progress, 0) / goals.length)
    : 0

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-6 md:py-8">
      <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">Metas</h1>
          <p className="text-sm text-[var(--text-tertiary)] mt-0.5">
            {goals.length} metas · {avgProgress}% progresso médio
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setModalOpen(true)}>
          <Plus size={14} /> Nova meta
        </Button>
      </motion.div>

      <div className="space-y-6">
        {Object.entries(byCategory).map(([cat, catGoals], ci) => (
          <motion.div
            key={cat}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: ci * 0.06 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-base">{CATEGORY_ICONS[cat]}</span>
              <h2 className="text-sm font-semibold text-[var(--text-secondary)]">{getCategoryLabel(cat)}</h2>
              <Badge variant="muted">{catGoals.length}</Badge>
            </div>
            <div className="space-y-3">
              {catGoals.map(goal => <GoalCard key={goal.id} goal={goal} />)}
            </div>
          </motion.div>
        ))}

        {goals.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-base font-medium text-[var(--text-primary)] mb-2">Defina suas metas</h3>
            <p className="text-sm text-[var(--text-tertiary)] mb-6 max-w-xs mx-auto">
              Transforme sonhos em objetivos claros com marcos e prazo definidos.
            </p>
            <Button variant="primary" onClick={() => setModalOpen(true)}>
              <Plus size={14} /> Criar primeira meta
            </Button>
          </motion.div>
        )}
      </div>

      <AddGoalModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  )
}
